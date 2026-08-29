const bcrypt = require('bcryptjs');
const User = require('../models/User');

/**
 * Creates a single default CEO/admin account if no CEO account exists yet.
 * Safe to call on every server start - it only ever creates the account once.
 */
async function seedAdmin() {
  const existingCeo = await User.findOne({ role: 'ceo' });
  if (existingCeo) {
    return;
  }

  const username = (process.env.ADMIN_USERNAME || 'admin').toLowerCase().trim();
  const password = process.env.ADMIN_PASSWORD || 'admin123';
  const passwordHash = await bcrypt.hash(password, 10);

  await User.create({
    name: 'Admin',
    username,
    passwordHash,
    role: 'ceo',
    status: 'Active'
  });

  console.log('======================================================');
  console.log(' Default admin account created');
  console.log(` Username: ${username}`);
  console.log(` Password: ${password}`);
  console.log(' Please log in and change this password immediately.');
  console.log('======================================================');
}

module.exports = seedAdmin;
