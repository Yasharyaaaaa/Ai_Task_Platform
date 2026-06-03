"""Task operations.

Two families:
  * String ops  — instant, offline, no API key needed.
  * AI ops      — routed through the Anthropic Claude API.

`process_operation` always returns a dict: {"result": str, "logs": [str]} so the
worker can persist the result and append human-readable log lines (model + token
usage for AI ops).
"""

import os

# Instant, offline transforms.
STRING_OPS = {"uppercase", "lowercase", "reverse", "wordcount"}

# AI operations → the instruction handed to Claude. "custom" uses the user's
# own prompt instead of a canned instruction.
AI_INSTRUCTIONS = {
    "summarize": "Summarize the following text concisely, capturing the key points.",
    "rewrite": "Rewrite the following text to improve clarity, grammar, and flow while preserving its meaning.",
    "translate": "Translate the following text into English. If it is already in English, translate it into Spanish instead.",
    "keywords": "Extract the most important keywords and key phrases from the following text. Return them as a comma-separated list.",
    "sentiment": "Analyze the sentiment of the following text. Respond with the overall sentiment (Positive, Negative, or Neutral) followed by a one-sentence explanation.",
    "explain": "Explain the following text in simple, easy-to-understand terms.",
}

DEFAULT_MODEL = os.getenv("ANTHROPIC_MODEL", "claude-haiku-4-5")

SYSTEM_PROMPT = (
    "You are a helpful text-processing assistant. Follow the user's instruction "
    "and return only the processed result with no preamble, commentary, or quotes."
)

# Lazily created so the worker can start (and run string ops) without an API key.
_client = None


def _get_client():
    global _client
    if _client is None:
        from anthropic import Anthropic  # imported lazily so string ops have no hard dep
        _client = Anthropic()  # reads ANTHROPIC_API_KEY from the environment
    return _client


def _string_op(text: str, operation: str) -> str:
    if operation == "uppercase":
        return text.upper()
    if operation == "lowercase":
        return text.lower()
    if operation == "reverse":
        return text[::-1]
    if operation == "wordcount":
        return f"Word count: {len(text.split())}"
    raise ValueError(f"Unknown operation: {operation}")


def _run_ai(text: str, instruction: str, model: str) -> dict:
    if not os.getenv("ANTHROPIC_API_KEY"):
        raise RuntimeError("ANTHROPIC_API_KEY is not set; cannot run AI operation")

    client = _get_client()
    message = client.messages.create(
        model=model,
        max_tokens=1024,
        # cache_control marks the shared system prompt as cacheable; once it is
        # large/frequent enough the API serves it from cache on repeat calls.
        system=[{
            "type": "text",
            "text": SYSTEM_PROMPT,
            "cache_control": {"type": "ephemeral"},
        }],
        messages=[{
            "role": "user",
            "content": f"{instruction}\n\n---\n{text}",
        }],
    )

    result = "".join(block.text for block in message.content if block.type == "text").strip()

    usage = message.usage
    token_log = f"Tokens — input: {usage.input_tokens}, output: {usage.output_tokens}"
    cache_read = getattr(usage, "cache_read_input_tokens", None)
    if cache_read:
        token_log += f", cache_read: {cache_read}"

    return {"result": result, "logs": [f"Model: {model}", token_log]}


def process_operation(text: str, operation: str, prompt: str = None, model: str = None) -> dict:
    """Run an operation and return {"result": str, "logs": [str]}."""
    if operation in STRING_OPS:
        return {"result": _string_op(text, operation), "logs": []}

    if operation == "custom":
        if not prompt or not prompt.strip():
            raise ValueError("Custom operation requires a prompt")
        return _run_ai(text, prompt.strip(), model or DEFAULT_MODEL)

    if operation in AI_INSTRUCTIONS:
        return _run_ai(text, AI_INSTRUCTIONS[operation], model or DEFAULT_MODEL)

    raise ValueError(f"Unknown operation: {operation}")
