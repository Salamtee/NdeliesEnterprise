// Run manually with: npm run seed
// Useful if you ever need to (re)seed the default admin without starting the full server.
require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const seedAdmin = require('../utils/seedAdmin');

connectDB()
  .then(() => seedAdmin())
  .then(() => mongoose.disconnect())
  .then(() => {
    console.log('Done.');
    process.exit(0);
  })
  .catch(err => {
    console.error('Seeding failed:', err.message);
    process.exit(1);
  });
