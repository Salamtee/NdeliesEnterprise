// Frontend Backend API Configuration
// Automatically detects local environment vs. deployed Vercel production site.

// Replace 'https://ndelies-backend.onrender.com/api' with your actual Render backend URL if different
const PRODUCTION_BACKEND_URL = 'https://ndelies-backend.onrender.com/api';

const isLocal =
  window.location.hostname === 'localhost' ||
  window.location.hostname === '127.0.0.1';

export const API_BASE_URL = isLocal
  ? 'http://localhost:5000/api'
  : PRODUCTION_BACKEND_URL;
