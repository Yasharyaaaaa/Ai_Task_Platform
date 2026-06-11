"""Retry policy for task processing.

Kept dependency-free (only stdlib) so it can be imported and unit-tested without
Redis/Mongo/Anthropic installed.
"""

import os

# How many total attempts before a task is sent to the dead-letter queue.
MAX_ATTEMPTS = int(os.getenv("MAX_TASK_ATTEMPTS", "3"))

# Backoff is capped so a single stuck task can't block the worker too long.
BACKOFF_CAP_SECONDS = int(os.getenv("RETRY_BACKOFF_CAP", "30"))

# Redis keys.
TASK_QUEUE = "task_queue"
DEAD_LETTER_QUEUE = "task_dead_letter"


def should_retry(error: Exception, attempts: int) -> bool:
    """Whether a failed task should be retried.

    ValueErrors are treated as permanent (bad input / unknown operation) and are
    never retried. Everything else (network, API, transient) is retried until
    MAX_ATTEMPTS is reached.
    """
    if isinstance(error, ValueError):
        return False
    return attempts < MAX_ATTEMPTS


def backoff_seconds(attempts: int) -> int:
    """Exponential backoff (2^attempts) capped at BACKOFF_CAP_SECONDS."""
    return min(2 ** attempts, BACKOFF_CAP_SECONDS)
