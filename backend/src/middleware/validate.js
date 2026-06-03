// Lightweight, dependency-free request validators. Each forwards a 400 error
// to the global error handler (via next) when input is invalid, so bad requests
// surface as 400s instead of 500s from the database layer.

const isNonEmptyString = (v) => typeof v === 'string' && v.trim().length > 0;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Operations supported by the worker. Keep in sync with worker/operations.py
// and the Task model enum.
const STRING_OPERATIONS = ['uppercase', 'lowercase', 'reverse', 'wordcount'];
const AI_OPERATIONS = ['summarize', 'rewrite', 'translate', 'keywords', 'sentiment', 'explain', 'custom'];
const ALLOWED_OPERATIONS = [...STRING_OPERATIONS, ...AI_OPERATIONS];

// Claude models a user may select for AI operations.
const ALLOWED_MODELS = ['claude-haiku-4-5', 'claude-sonnet-4-6', 'claude-opus-4-8'];

const badRequest = (message) => {
  const err = new Error(message);
  err.status = 400;
  return err;
};

exports.validateRegister = (req, res, next) => {
  const { name, email, password } = req.body || {};
  if (!isNonEmptyString(name)) return next(badRequest('Name is required'));
  if (!isNonEmptyString(email) || !EMAIL_RE.test(email)) return next(badRequest('A valid email is required'));
  if (typeof password !== 'string' || password.length < 6) {
    return next(badRequest('Password must be at least 6 characters'));
  }
  next();
};

exports.validateLogin = (req, res, next) => {
  const { email, password } = req.body || {};
  if (!isNonEmptyString(email)) return next(badRequest('Email is required'));
  if (!isNonEmptyString(password)) return next(badRequest('Password is required'));
  next();
};

exports.validateCreateTask = (req, res, next) => {
  const { title, inputText, operation, prompt, model } = req.body || {};
  if (!isNonEmptyString(title)) return next(badRequest('Title is required'));
  if (!isNonEmptyString(inputText)) return next(badRequest('Input text is required'));
  if (!ALLOWED_OPERATIONS.includes(operation)) return next(badRequest('Invalid operation'));
  if (operation === 'custom' && !isNonEmptyString(prompt)) {
    return next(badRequest('Custom operation requires a prompt'));
  }
  if (model != null && model !== '' && !ALLOWED_MODELS.includes(model)) {
    return next(badRequest('Invalid model'));
  }
  next();
};

exports.STRING_OPERATIONS = STRING_OPERATIONS;
exports.AI_OPERATIONS = AI_OPERATIONS;
exports.ALLOWED_OPERATIONS = ALLOWED_OPERATIONS;
exports.ALLOWED_MODELS = ALLOWED_MODELS;
