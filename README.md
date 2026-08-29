# N'delie's Enterprise Management System

A full-stack inventory, sales and staff management system for N'delie's Enterprise
(26, Regent Road Hill Station, Freetown).

- **Frontend:** plain HTML/CSS/JavaScript (no framework, no build step) → deploy to **Vercel**
- **Backend:** Node.js + Express + MongoDB (Mongoose) → deploy to **Render**
- **Database:** MongoDB (MongoDB Atlas free tier recommended)

The system starts **completely empty**. The only thing seeded automatically is
**one default admin (CEO) login** - no fake staff, inventory, or sales data.
Everything else is created by you through the app after logging in.

## Project layout

```
ndelies-system/
├── backend/     Node.js/Express API + MongoDB models  → see backend/README.md
└── frontend/    Static HTML/CSS/JS client              → see frontend/README.md
```

## Quick start (local development)

**1. Backend**
```bash
cd backend
npm install
cp .env.example .env
# edit .env: set MONGODB_URI, JWT_SECRET, ADMIN_USERNAME, ADMIN_PASSWORD
npm run dev
```
Watch the console on first start - it prints your default admin username/password.

**2. Frontend**
```bash
cd frontend
# js/config.js already points at http://localhost:5000/api by default
npx serve .
```
Open the printed URL, click "Login to System", choose CEO/Admin, and log in
with the credentials printed by the backend.

## Deploying to production

1. **Database:** create a free MongoDB Atlas cluster (see `backend/README.md`).
2. **Backend → Render:** deploy the `backend/` folder as a Web Service, set the
   environment variables (`MONGODB_URI`, `JWT_SECRET`, `FRONTEND_URL`,
   `ADMIN_USERNAME`, `ADMIN_PASSWORD`). Full steps in `backend/README.md`.
3. **Frontend → Vercel:** deploy the `frontend/` folder, after setting
   `js/config.js`'s `API_BASE_URL` to your Render URL. Full steps in
   `frontend/README.md`.
4. Go back to Render and set `FRONTEND_URL` to your real Vercel URL so CORS
   allows the deployed frontend to talk to the API.

## Security notes

- Change the default admin password immediately after your first login
  (Settings → Change Password).
- `JWT_SECRET` should be a long random string in production, not the example
  value.
- Passwords are hashed with bcrypt before being stored - the database never
  contains plain-text passwords.
- Only the CEO role can add/edit inventory, manage staff, and access system
  settings. Staff accounts can view inventory, record sales, and restock
  items.

## What's included

- Role-based login (CEO/Admin and Staff, single unified login form)
- Inventory management with categories, SKUs, stock levels and restocking
- Sales recording with automatic stock deduction
- Notification bell + full notifications page for new items, sales, restocks
  and low-stock alerts
- Detailed reports (daily/weekly/monthly/yearly, by category, by staff, top
  products, inventory health) computed from real data
- Dark/light theme toggle
- Currency displayed in NLe (Sierra Leone New Leone)
- Maintenance mode toggle and a "clear system for new year" reset (CEO only)
