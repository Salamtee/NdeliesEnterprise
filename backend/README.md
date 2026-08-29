# N'delie's Enterprise - Backend API

Node.js + Express + MongoDB (Mongoose) API for the N'delie's Enterprise Management System.

The system starts **completely empty** - no staff, no inventory, no sales, no notifications.
The only thing that exists on first boot is **one default admin account**, created automatically.

## 1. Local setup

```bash
cd backend
npm install
cp .env.example .env
```

Edit `.env` and fill in:
- `MONGODB_URI` - your MongoDB connection string (see below)
- `JWT_SECRET` - any long random string
- `FRONTEND_URL` - the URL(s) your frontend will run on
- `ADMIN_USERNAME` / `ADMIN_PASSWORD` - the default admin login (change the password after first login!)

Run it:

```bash
npm run dev      # with auto-reload (nodemon)
# or
npm start        # plain node
```

On first start you'll see something like this in the logs:

```
======================================================
 Default admin account created
 Username: admin
 Password: ChangeMe123!
 Please log in and change this password immediately.
======================================================
```

That's your one seeded login. Everything else (staff, inventory, sales) is created by you through the app.

## 2. Setting up MongoDB (Atlas - free tier works fine)

1. Go to https://www.mongodb.com/cloud/atlas and create a free account/cluster.
2. Create a database user (Database Access) with a username/password.
3. Under Network Access, add `0.0.0.0/0` (allow access from anywhere) so Render can connect.
4. Click "Connect" on your cluster → "Drivers" → copy the connection string. It looks like:
   ```
   mongodb+srv://<username>:<password>@<cluster>.mongodb.net/?retryWrites=true&w=majority
   ```
5. Add a database name to the path, e.g. `.../ndelies?retryWrites=true...`, and paste the whole thing into `MONGODB_URI`.

## 3. Deploying to Render

1. Push this `backend/` folder to a GitHub repository (it can be a subfolder of a larger repo).
2. On https://render.com, click **New +** → **Web Service**, and connect your repo.
3. Configure the service:
   - **Root Directory:** `backend` (if this folder lives inside a bigger repo)
   - **Environment:** Node
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
4. Under **Environment Variables**, add everything from `.env.example` with your real values:
   - `MONGODB_URI`
   - `JWT_SECRET`
   - `FRONTEND_URL` (your Vercel URL, e.g. `https://ndelies.vercel.app` - you can update this after deploying the frontend)
   - `ADMIN_USERNAME`
   - `ADMIN_PASSWORD`
   - `NODE_ENV` = `production`
5. Deploy. Render will give you a URL like `https://ndelies-backend.onrender.com`.
6. Test it: visit `https://ndelies-backend.onrender.com/api/health` - you should see `{"status":"ok", ...}`.

> Render's free tier spins the service down after inactivity, so the first request after a while
> can take 30-60 seconds to wake up. That's normal.

### Updating FRONTEND_URL later
Once your frontend is live on Vercel, go back to your Render service → Environment → update
`FRONTEND_URL` to your real Vercel URL, then trigger a redeploy (or it may auto-restart).
You can list multiple allowed origins separated by commas.

## API overview

| Method | Route                          | Access        | Description                          |
|--------|---------------------------------|---------------|--------------------------------------|
| POST   | /api/auth/login                 | Public        | Log in (CEO or staff)                |
| GET    | /api/auth/staff-list             | Public        | Names for the staff login dropdown   |
| GET    | /api/auth/me                     | Authenticated | Current logged-in user               |
| POST   | /api/auth/change-password         | Authenticated | Change your own password             |
| GET    | /api/staff                       | CEO           | List staff                           |
| POST   | /api/staff                       | CEO           | Add staff member                     |
| PUT    | /api/staff/:id                   | CEO           | Edit staff member                    |
| DELETE | /api/staff/:id                   | CEO           | Remove staff member                  |
| GET    | /api/inventory                   | Authenticated | List inventory                       |
| GET    | /api/inventory/categories         | Authenticated | Fixed list of product categories     |
| POST   | /api/inventory                   | CEO           | Add inventory item                   |
| PUT    | /api/inventory/:id                | CEO           | Edit inventory item                  |
| POST   | /api/inventory/:id/restock          | Authenticated | Restock an item                      |
| GET    | /api/sales                       | Authenticated | List all sales                       |
| POST   | /api/sales                       | Authenticated | Record a sale                        |
| GET    | /api/notifications                | Authenticated | List notifications                   |
| PATCH  | /api/notifications/mark-all-read     | Authenticated | Mark all notifications read          |
| DELETE | /api/notifications                | Authenticated | Clear all notifications              |
| GET    | /api/settings                    | Authenticated | Get maintenance mode status          |
| PUT    | /api/settings                    | CEO           | Toggle maintenance mode              |
| POST   | /api/settings/reset                | CEO           | Clear sales & notifications (new year)|

Reports (daily/weekly/monthly/yearly, category breakdowns, top products, staff performance)
are computed on the **frontend** from the raw `/api/inventory` and `/api/sales` data, so there's
no separate reports endpoint to maintain.
