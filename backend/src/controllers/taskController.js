const Task = require('../models/Task');
const { getRedisClient } = require('../config/redis');
const { ALLOWED_MODELS } = require('../middleware/validate');

exports.createTask = async (req, res, next) => {
  try {
    const { title, inputText, operation, prompt, model } = req.body;
    const task = await Task.create({
      userId: req.userId,
      title,
      inputText,
      operation,
      prompt: operation === 'custom' ? prompt : null,
      model: ALLOWED_MODELS.includes(model) ? model : null,
    });

    // Enqueue for the worker. If Redis is unavailable the task would otherwise
    // sit in 'pending' forever — mark it 'failed' with a log instead.
    const redis = getRedisClient();
    try {
      if (!redis) throw new Error('Redis client not connected');
      await redis.lPush('task_queue', JSON.stringify({ taskId: task._id.toString() }));
    } catch (queueErr) {
      task.status = 'failed';
      task.logs.push({ message: `Failed to enqueue task: ${queueErr.message}` });
      await task.save();
      return res.status(503).json({ message: 'Task queue is temporarily unavailable. Please try again.' });
    }

    res.status(201).json(task);
  } catch (err) {
    next(err);
  }
};

exports.getTasks = async (req, res, next) => {
  try {
    const tasks = await Task.find({ userId: req.userId }).sort({ createdAt: -1 });
    res.json(tasks);
  } catch (err) {
    next(err);
  }
};

exports.getTask = async (req, res, next) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, userId: req.userId });
    if (!task) return res.status(404).json({ message: 'Task not found' });
    res.json(task);
  } catch (err) {
    next(err);
  }
};
