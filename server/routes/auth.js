const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const Room = require('../models/Room');
const Message = require('../models/Message');

// Get all rooms
router.get('/rooms', async (req, res) => {
  try {
    const rooms = await Room.find().sort({ createdAt: -1 });
    res.json(rooms);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch rooms' });
  }
});

// Create a new room
router.post('/rooms', async (req, res) => {
  const { name, username, password } = req.body;
  if (!name || !username)
    return res.status(400).json({ error: 'Room name and username required' });
  try {
    const existing = await Room.findOne({ name });
    if (existing) return res.status(409).json({ error: 'Room already exists' });

    let hashedPassword = null;
    if (password && password.trim()) {
      hashedPassword = await bcrypt.hash(password.trim(), 10);
    }

    const room = await Room.create({
      name,
      createdBy: username,
      password: hashedPassword,
      hasPassword: !!hashedPassword,
    });
    res.status(201).json(room);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create room' });
  }
});

// Verify room password
router.post('/rooms/verify', async (req, res) => {
  const { name, password } = req.body;
  try {
    const room = await Room.findOne({ name });
    if (!room) return res.status(404).json({ error: 'Room not found' });
    if (!room.hasPassword) return res.json({ success: true });

    const isMatch = await bcrypt.compare(password, room.password);
    if (!isMatch) return res.status(401).json({ error: 'Wrong password' });

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Verification failed' });
  }
});

// Edit a message
router.put('/messages/:id', async (req, res) => {
  const { text, username } = req.body;
  try {
    const message = await Message.findById(req.params.id);
    if (!message) return res.status(404).json({ error: 'Message not found' });
    if (message.username !== username)
      return res.status(403).json({ error: 'Not allowed' });
    message.text = text;
    message.edited = true;
    await message.save();
    res.json(message);
  } catch (err) {
    res.status(500).json({ error: 'Failed to edit message' });
  }
});

// Delete a message
router.delete('/messages/:id', async (req, res) => {
  const { username } = req.body;
  try {
    const message = await Message.findById(req.params.id);
    if (!message) return res.status(404).json({ error: 'Message not found' });
    if (message.username !== username)
      return res.status(403).json({ error: 'Not allowed' });
    await message.deleteOne();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete message' });
  }
});

module.exports = router;