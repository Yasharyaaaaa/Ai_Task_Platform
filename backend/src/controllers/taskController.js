const mongoose = require('mongoose');
const Task = require('../models/Task');
const { getRedisClient } = require('../config/redis');
const { ALLOWED_MODELS } = require('../middleware/validate');

// Push a task id onto the worker queue. Throws if Redis is unavailable so the
// caller can mark the task failed instead of leaving it stuck in 'pending'.
const enqueueTask = async (taskId) => {
  const redis = getRedisClient();
  if (!redis) throw new Error('Redis client not connected');
  await redis.lPush('task_queue', JSON.stringify({ taskId }));
};

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

    try {
      await enqueueTask(task._id.toString());
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
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 10));
    const { status, search } = req.query;

    const filter = { userId: req.userId };
    if (status && status !== 'all') filter.status = status;
    if (search && search.trim()) {
      // Escape regex metacharacters so user input is treated literally.
      const safe = search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const rx = new RegExp(safe, 'i');
      filter.$or = [{ title: rx }, { inputText: rx }];
    }

    const [tasks, total, countsAgg] = await Promise.all([
      Task.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit),
      Task.countDocuments(filter),
      // Counts across ALL of the user's tasks (unfiltered) so the dashboard
      // stat cards stay accurate regardless of the active filter/page.
      Task.aggregate([
        { $match: { userId: new mongoose.Types.ObjectId(req.userId) } },
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
    ]);

    const counts = { total: 0, pending: 0, running: 0, success: 0, failed: 0 };
    for (const c of countsAgg) {
      counts[c._id] = c.count;
      counts.total += c.count;
    }

    res.json({ tasks, page, limit, total, pages: Math.max(1, Math.ceil(total / limit)), counts });
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

// Re-run an existing task: reset it to 'pending', clear the prior result, and
// re-enqueue it for the worker.
exports.reRunTask = async (req, res, next) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, userId: req.userId });
    if (!task) return res.status(404).json({ message: 'Task not found' });

    task.status = 'pending';
    task.result = null;
    task.logs.push({ message: 'Re-run requested' });

    try {
      await enqueueTask(task._id.toString());
    } catch (queueErr) {
      task.status = 'failed';
      task.logs.push({ message: `Failed to enqueue task: ${queueErr.message}` });
      await task.save();
      return res.status(503).json({ message: 'Task queue is temporarily unavailable. Please try again.' });
    }

    await task.save();
    res.json(task);
  } catch (err) {
    next(err);
  }
};

exports.deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findOneAndDelete({ _id: req.params.id, userId: req.userId });
    if (!task) return res.status(404).json({ message: 'Task not found' });
    res.json({ message: 'Task deleted' });
  } catch (err) {
    next(err);
  }
};
