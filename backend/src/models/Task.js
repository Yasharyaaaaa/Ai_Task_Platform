const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  userId:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  title:     { type: String, required: true },
  inputText: { type: String, required: true },
  operation: {
    type: String,
    enum: [
      // Instant string transforms
      'uppercase', 'lowercase', 'reverse', 'wordcount',
      // AI-powered (Claude) operations
      'summarize', 'rewrite', 'translate', 'keywords', 'sentiment', 'explain', 'custom',
    ],
    required: true,
  },
  prompt:    { type: String, default: null },  // user instruction for the 'custom' operation
  model:     { type: String, default: null },  // optional Claude model override for AI operations
  status:    { type: String, enum: ['pending', 'running', 'success', 'failed'], default: 'pending', index: true },
  result:    { type: String, default: null },
  logs:      [{ message: String, timestamp: { type: Date, default: Date.now } }],
}, { timestamps: true });

// Compound index for faster user task queries
taskSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('Task', taskSchema);