import retry
from retry import should_retry, backoff_seconds, MAX_ATTEMPTS


def test_value_error_is_permanent():
    assert should_retry(ValueError("bad operation"), attempts=1) is False


def test_transient_error_retries_until_max():
    assert should_retry(RuntimeError("network blip"), attempts=1) is True
    assert should_retry(RuntimeError("network blip"), attempts=MAX_ATTEMPTS) is False


def test_backoff_is_exponential_and_capped():
    assert backoff_seconds(1) == 2
    assert backoff_seconds(2) == 4
    assert backoff_seconds(100) == retry.BACKOFF_CAP_SECONDS
