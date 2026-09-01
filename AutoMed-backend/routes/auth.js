const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();

function generateToken(user) {
  return jwt.sign(
    { id: user._id, role: user.role, name: user.name },
    process.env.JWT_SECRET || 'devsecret',
    { expiresIn: '7d' }
  );
}

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role, phone } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required' });
    }
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: 'Email already registered' });

    const user = await User.create({ name, email, password, role, phone });
    res.status(201).json({
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
      token: generateToken(user)
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    res.json({
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
      token: generateToken(user)
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
