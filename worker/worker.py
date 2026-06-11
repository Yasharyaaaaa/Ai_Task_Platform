import os, json, time
import redis
import structlog
from pymongo import MongoClient
from bson import ObjectId
from datetime import datetime
from operations import process_operation
from retry import (
    should_retry, backoff_seconds, MAX_ATTEMPTS, TASK_QUEUE, DEAD_LETTER_QUEUE,
)
from dotenv import load_dotenv

load_dotenv()

# Structured JSON logging
structlog.configure(
    processors=[
        structlog.processors.add_log_level,
        structlog.processors.TimeStamper(fmt="iso"),
        structlog.processors.JSONRenderer(),
    ]
)
log = structlog.get_logger()

# Connect to Redis & MongoDB
redis_client = redis.Redis.from_url(os.getenv("REDIS_URL", "redis://localhost:6379"))
mongo_client = MongoClient(os.getenv("MONGO_URI"))
db = mongo_client.get_default_database()
tasks_col = db["tasks"]


def add_log(task_id, message):
    tasks_col.update_one(
        {"_id": ObjectId(task_id)},
        {"$push": {"logs": {"message": message, "timestamp": datetime.utcnow()}}}
    )


def run_task(task_id: str):
    """Process a task. Raises on failure (the caller decides retry vs dead-letter)."""
    log.info("task_started", task_id=task_id)
    tasks_col.update_one({"_id": ObjectId(task_id)}, {"$set": {"status": "running"}})
    add_log(task_id, "Task started")

    task = tasks_col.find_one({"_id": ObjectId(task_id)})
    if not task:
        raise Exception("Task not found in DB")

    outcome = process_operation(
        task["inputText"],
        task["operation"],
        prompt=task.get("prompt"),
        model=task.get("model"),
    )

    # Persist any operation logs (e.g. model + token usage for AI ops)
    for log_message in outcome.get("logs", []):
        add_log(task_id, log_message)

    tasks_col.update_one(
        {"_id": ObjectId(task_id)},
        {"$set": {"status": "success", "result": outcome["result"]}}
    )
    add_log(task_id, "Task completed successfully.")
    log.info("task_succeeded", task_id=task_id)


def handle_failure(task_id: str, attempts: int, error: Exception):
    """Retry with backoff, or send to the dead-letter queue when exhausted."""
    if should_retry(error, attempts):
        delay = backoff_seconds(attempts)
        log.warning("task_retry", task_id=task_id, attempt=attempts, error=str(error), delay=delay)
        add_log(task_id, f"Attempt {attempts} failed: {error}. Retrying in {delay}s.")
        tasks_col.update_one({"_id": ObjectId(task_id)}, {"$set": {"status": "pending"}})
        time.sleep(delay)
        redis_client.lpush(TASK_QUEUE, json.dumps({"taskId": task_id, "attempts": attempts + 1}))
        return

    reason = "permanent error" if isinstance(error, ValueError) else f"exhausted {MAX_ATTEMPTS} attempts"
    log.error("task_dead_letter", task_id=task_id, attempts=attempts, error=str(error), reason=reason)
    tasks_col.update_one({"_id": ObjectId(task_id)}, {"$set": {"status": "failed"}})
    add_log(task_id, f"Task failed ({reason}): {error}")
    redis_client.lpush(
        DEAD_LETTER_QUEUE,
        json.dumps({"taskId": task_id, "attempts": attempts, "error": str(error)}),
    )


def main():
    log.info("worker_started", queue=TASK_QUEUE, max_attempts=MAX_ATTEMPTS)
    while True:
        try:
            # Block and wait for a job (timeout 5s then loop)
            item = redis_client.brpop(TASK_QUEUE, timeout=5)
            if not item:
                continue
            _, payload = item
            data = json.loads(payload)
            task_id = data["taskId"]
            attempts = data.get("attempts", 1)
            try:
                run_task(task_id)
            except Exception as e:
                handle_failure(task_id, attempts, e)
        except Exception as e:
            log.error("worker_loop_error", error=str(e))
            time.sleep(2)


if __name__ == "__main__":
    main()
