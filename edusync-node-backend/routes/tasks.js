// edusync-node-backend/routes/tasks.js
const express = require('express');
const router = express.Router();
const Task = require('../models/Task');

// GET /api/tasks — Fetch all tasks, newest first
router.get('/', async (req, res) => {
  try {
    const tasks = await Task.find().sort({ createdAt: -1 });
    res.status(200).json(tasks);
  } catch (err) {
    res.status(500).json({ message: 'Failed to retrieve tasks', error: err.message });
  }
});

// POST /api/tasks — Create a new task
router.post('/', async (req, res) => {
  const { title, subject, status } = req.body;

  if (!title || !subject) {
    return res.status(400).json({ message: 'title and subject are required' });
  }

  try {
    const task = new Task({ title, subject, status: status || 'pending' });
    const saved = await task.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ message: 'Failed to create task', error: err.message });
  }
});

// PUT /api/tasks/:id — Update task status
router.put('/:id', async (req, res) => {
  const { status } = req.body;

  if (!['pending', 'completed'].includes(status)) {
    return res.status(400).json({ message: "status must be 'pending' or 'completed'" });
  }

  try {
    const task = await Task.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    res.status(200).json(task);
  } catch (err) {
    res.status(400).json({ message: 'Failed to update task', error: err.message });
  }
});

// DELETE /api/tasks/:id — Delete a task
router.delete('/:id', async (req, res) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });
    res.status(200).json({ message: 'Task deleted successfully', id: req.params.id });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete task', error: err.message });
  }
});

module.exports = router;