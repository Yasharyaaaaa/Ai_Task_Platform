import pytest

import operations
from operations import process_operation


# ── String operations (offline, no API) ──────────────────────────────────────

def test_uppercase():
    assert process_operation("hello", "uppercase") == {"result": "HELLO", "logs": []}


def test_lowercase():
    assert process_operation("HELLO", "lowercase")["result"] == "hello"


def test_reverse():
    assert process_operation("abc", "reverse")["result"] == "cba"


def test_wordcount():
    assert process_operation("one two three", "wordcount")["result"] == "Word count: 3"


def test_unknown_operation_raises():
    with pytest.raises(ValueError):
        process_operation("x", "does-not-exist")


# ── AI operations (Claude, mocked) ────────────────────────────────────────────

class _FakeBlock:
    type = "text"

    def __init__(self, text):
        self.text = text


class _FakeUsage:
    input_tokens = 12
    output_tokens = 7
    cache_read_input_tokens = 0


class _FakeMessage:
    content = [_FakeBlock("A short summary.")]
    usage = _FakeUsage()


class _FakeClient:
    def __init__(self):
        self.messages = self

    def create(self, **kwargs):  # mimics client.messages.create(...)
        return _FakeMessage()


def test_ai_op_without_api_key_raises(monkeypatch):
    monkeypatch.delenv("ANTHROPIC_API_KEY", raising=False)
    with pytest.raises(RuntimeError):
        process_operation("some text", "summarize")


def test_ai_op_with_mocked_client(monkeypatch):
    monkeypatch.setenv("ANTHROPIC_API_KEY", "test-key")
    monkeypatch.setattr(operations, "_get_client", lambda: _FakeClient())

    out = process_operation("a long paragraph", "summarize", model="claude-haiku-4-5")
    assert out["result"] == "A short summary."
    assert any("claude-haiku-4-5" in line for line in out["logs"])
    assert any("Tokens" in line for line in out["logs"])


def test_custom_without_prompt_raises(monkeypatch):
    monkeypatch.setenv("ANTHROPIC_API_KEY", "test-key")
    with pytest.raises(ValueError):
        process_operation("text", "custom", prompt="")


def test_custom_uses_prompt(monkeypatch):
    monkeypatch.setenv("ANTHROPIC_API_KEY", "test-key")
    captured = {}

    class _CapturingClient(_FakeClient):
        def create(self, **kwargs):
            captured["messages"] = kwargs["messages"]
            return _FakeMessage()

    monkeypatch.setattr(operations, "_get_client", lambda: _CapturingClient())
    process_operation("the text", "custom", prompt="Make it formal")
    assert "Make it formal" in captured["messages"][0]["content"]
