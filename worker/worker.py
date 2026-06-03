import os, json, time
import redis
from pymongo import MongoClient
from bson import ObjectId
from datetime import datetime
from operations import process_operation
from dotenv import load_dotenv

load_dotenv()

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

def process_task(task_id: str):
    print(f"Processing task: {task_id}")

    # Set status to running
    tasks_col.update_one({"_id": ObjectId(task_id)}, {"$set": {"status": "running"}})
    add_log(task_id, "Task started")

    try:
        task = tasks_col.find_one({"_id": ObjectId(task_id)})
        if not task:
            raise Exception("Task not found in DB")

        outcome = process_operation(
            task["inputText"],
            task["operation"],
            prompt=task.get("prompt"),
            model=task.get("model"),
        )
        result = outcome["result"]

        # Persist any operation logs (e.g. model + token usage for AI ops)
        for log_message in outcome.get("logs", []):
            add_log(task_id, log_message)

        tasks_col.update_one(
            {"_id": ObjectId(task_id)},
            {"$set": {"status": "success", "result": result}}
        )
        add_log(task_id, "Task completed successfully.")
        print(f"Task {task_id} succeeded")

    except Exception as e:
        tasks_col.update_one(
            {"_id": ObjectId(task_id)},
            {"$set": {"status": "failed"}}
        )
        add_log(task_id, f"Task failed: {str(e)}")
        print(f"Task {task_id} failed: {e}")

def main():
    print("Worker started, waiting for tasks...")
    while True:
        try:
            # Block and wait for a job (timeout 5s then loop)
            item = redis_client.brpop("task_queue", timeout=5)
            if item:
                _, payload = item
                data = json.loads(payload)
                process_task(data["taskId"])
        except Exception as e:
            print(f"Worker error: {e}")
            time.sleep(2)

if __name__ == "__main__":
    main()