# N'delie's Enterprise - Frontend

Plain HTML/CSS/JavaScript frontend (no build step, no framework) for the
N'delie's Enterprise Management System. Talks to the backend API over `fetch`.

## 1. Point it at your backend

Open `js/config.js` and set `API_BASE_URL` to your deployed backend's URL:

```js
export const API_BASE_URL = 'https://ndelies-backend.onrender.com/api';
```

(While developing locally against a backend running on your machine, leave it as
`http://localhost:5000/api`.)

## 2. Run it locally

This is a static site - any static server works. For example:

```bash
cd frontend
npx serve .
# or
python3 -m http.server 5500
```

Then open the printed URL in your browser. Because the app uses ES modules
(`<script type="module">`), you must serve it over `http://` - opening
`index.html` directly via `file://` will not work.

## 3. Deploying to Vercel

1. Push this `frontend/` folder to a GitHub repository (it can be a subfolder of
   a larger repo, same as the backend).
2. Go to https://vercel.com → **Add New** → **Project** → import your repo.
3. Set the **Root Directory** to `frontend` (if it's a subfolder).
4. Framework Preset: choose **Other** (this is a plain static site - no build
   command needed).
5. Deploy. Vercel will give you a URL like `https://ndelies.vercel.app`.

### Important: update both sides after deploying
- Once you have your Vercel URL, add it to the backend's `FRONTEND_URL`
  environment variable on Render so CORS allows requests from it.
- Once you have your Render backend URL, update `js/config.js`'s
  `API_BASE_URL` to match, commit, and redeploy the frontend (Vercel
  redeploys automatically on every push).

## First login

The system starts completely empty. The only account that exists is the one
default admin created automatically by the backend on its first boot (see the
backend README for how to set/find those credentials). Log in as CEO/Admin,
then:
1. Go to **Settings** and change the default password.
2. Go to **Manage Staff** to add your team.
3. Go to **Inventory** to add your products.
4. You're ready to start recording sales.

## Folder structure

```
frontend/
├── index.html          Landing page, login, and the full app shell (all sections/modals)
├── css/styles.css       All styling, including dark mode
├── js/
│   ├── config.js         <-- set your backend URL here
│   ├── api.js            fetch wrapper (adds auth header, parses errors)
│   ├── state.js           session storage + in-memory data caches
│   ├── auth.js            login / logout / role selection
│   ├── theme.js            dark/light mode toggle
│   ├── ui.js                 shared helpers (currency formatting, toasts, modals)
│   ├── dashboard.js          dashboard metrics
│   ├── inventory.js           inventory CRUD + restock
│   ├── sales.js                 record sales, staff quick-report
│   ├── staff.js                   staff management (CEO only)
│   ├── notifications.js            notification bell + full notifications page
│   ├── reports.js                    daily/weekly/monthly/yearly reports
│   ├── settings.js                    maintenance mode, reset, change password
│   └── app.js                          wires everything together, page navigation
└── assets/
    ├── logo.jpg          the business logo (sidebar, login, favicon)
    └── watermark.jpg     larger version used as the faint background watermark
```
