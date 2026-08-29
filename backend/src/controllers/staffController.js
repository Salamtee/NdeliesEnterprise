const bcrypt = require('bcryptjs');
const User = require('../models/User');

// GET /api/staff
exports.list = async (req, res) => {
  const staff = await User.find({ role: 'staff' })
    .select('name username status createdAt')
    .sort({ createdAt: 1 });
  res.json(staff);
};

// POST /api/staff
exports.create = async (req, res) => {
  try {
    const { name, username, password } = req.body;
    if (!name || !username || !password) {
      return res.status(400).json({ message: 'Name, username and password are required' });
    }

    const existing = await User.findOne({ username: username.toLowerCase().trim() });
    if (existing) {
      return res.status(409).json({ message: 'That username is already taken' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const staff = await User.create({
      name: name.trim(),
      username: username.toLowerCase().trim(),
      passwordHash,
      role: 'staff',
      status: 'Active'
    });

    res.status(201).json({
      id: staff._id,
      name: staff.name,
      username: staff.username,
      status: staff.status
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// PUT /api/staff/:id
exports.update = async (req, res) => {
  try {
    const staff = await User.findOne({ _id: req.params.id, role: 'staff' });
    if (!staff) {
      return res.status(404).json({ message: 'Staff member not found' });
    }

    const { name, password, status } = req.body;
    if (name) staff.name = name.trim();
    if (status && ['Active', 'Inactive'].includes(status)) staff.status = status;
    if (password) staff.passwordHash = await bcrypt.hash(password, 10);

    await staff.save();
    res.json({
      id: staff._id,
      name: staff.name,
      username: staff.username,
      status: staff.status
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// DELETE /api/staff/:id
exports.remove = async (req, res) => {
  const staff = await User.findOneAndDelete({ _id: req.params.id, role: 'staff' });
  if (!staff) {
    return res.status(404).json({ message: 'Staff member not found' });
  }
  res.json({ message: 'Staff member removed' });
};
