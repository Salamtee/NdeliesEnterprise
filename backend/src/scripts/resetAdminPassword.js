/**
 * Reset the default admin (CEO) password.
 * Run with:  node src/scripts/resetAdminPassword.js
 *
 * After running, log in with:
 *   Username: admin
 *   Password: admin123
 *
 * Then immediately change your password in Settings.
 */

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const connectDB = require('../config/db');
const User = require('../models/User');

const NEW_PASSWORD = 'admin123';

connectDB()
  .then(async () => {
    const ceo = await User.findOne({ role: 'ceo' });

    if (!ceo) {
      console.log('❌  No CEO/admin account found in the database.');
      console.log('    Run: npm run seed   to create one first.');
      process.exit(1);
    }

    ceo.passwordHash = await bcrypt.hash(NEW_PASSWORD, 10);
    await ceo.save();

    console.log('');
    console.log('✅  Admin password has been reset successfully!');
    console.log('');
    console.log('   Username :', ceo.username);
    console.log('   Password :', NEW_PASSWORD);
    console.log('');
    console.log('   ⚠️  Please log in and change your password immediately.');
    console.log('');
  })
  .then(() => mongoose.disconnect())
  .then(() => process.exit(0))
  .catch(err => {
    console.error('❌  Reset failed:', err.message);
    process.exit(1);
  });
