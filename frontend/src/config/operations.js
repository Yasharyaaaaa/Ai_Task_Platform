// Single source of truth for operation + status metadata shared across the
// task UI (form, list, card, detail). Keep operation keys in sync with the
// backend Task model enum and worker/operations.py.

export const STRING_OPS = ['uppercase', 'lowercase', 'reverse', 'wordcount'];
export const AI_OPS = ['summarize', 'rewrite', 'translate', 'keywords', 'sentiment', 'explain', 'custom'];

export const OP_META = {
  uppercase: { icon: '🔠', label: 'Uppercase',  desc: 'Convert all text to UPPERCASE' },
  lowercase: { icon: '🔡', label: 'Lowercase',  desc: 'Convert all text to lowercase' },
  reverse:   { icon: '🔃', label: 'Reverse',    desc: 'Reverse the entire string' },
  wordcount: { icon: '🔢', label: 'Word Count', desc: 'Count words in the text' },
  summarize: { icon: '📝', label: 'Summarize',  desc: 'AI summary of the text' },
  rewrite:   { icon: '✍️', label: 'Rewrite',    desc: 'AI rewrite for clarity & grammar' },
  translate: { icon: '🌐', label: 'Translate',  desc: 'AI translate the text' },
  keywords:  { icon: '🏷️', label: 'Keywords',   desc: 'Extract key terms with AI' },
  sentiment: { icon: '😊', label: 'Sentiment',  desc: 'AI sentiment analysis' },
  explain:   { icon: '💡', label: 'Explain',    desc: 'Explain in simple terms with AI' },
  custom:    { icon: '⚡', label: 'Custom',     desc: 'Run your own AI instruction' },
};

// Convenience map: operation key → icon.
export const OP_ICON = Object.fromEntries(
  Object.entries(OP_META).map(([key, meta]) => [key, meta.icon])
);

export const MODELS = [
  { value: 'claude-haiku-4-5',  label: 'Haiku — fast' },
  { value: 'claude-sonnet-4-6', label: 'Sonnet — balanced' },
  { value: 'claude-opus-4-8',   label: 'Opus — best quality' },
];

export const isAiOp = (op) => AI_OPS.includes(op);

export const STATUS_CONFIG = {
  pending: { color: '#f59e0b', bg: 'rgba(245,158,11,0.12)',  border: 'rgba(245,158,11,0.3)',  icon: '⏳', label: 'Pending' },
  running: { color: '#60a5fa', bg: 'rgba(96,165,250,0.12)', border: 'rgba(96,165,250,0.3)', icon: '⚙️', label: 'Running' },
  success: { color: '#4ade80', bg: 'rgba(74,222,128,0.12)', border: 'rgba(74,222,128,0.3)', icon: '✅', label: 'Success' },
  failed:  { color: '#f87171', bg: 'rgba(248,113,113,0.12)',border: 'rgba(248,113,113,0.3)',icon: '❌', label: 'Failed' },
};

export const STATUS_FILTERS = ['all', 'pending', 'running', 'success', 'failed'];
