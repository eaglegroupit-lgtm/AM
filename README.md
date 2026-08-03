# Amutha Surabi Restaurant — QR Digital Menu

A production-ready **QR digital menu** website. Scanning the restaurant's QR
code opens the customer menu directly — there is no homepage, login, cart,
ordering, or payment flow. A separate password-protected Admin Dashboard is
used to manage menu items, categories, availability, restaurant settings,
and the QR code itself.

> The menu is seeded from the restaurant's real printed menu cards
> (Sri / Amutha Surabi, a pure-vegetarian restaurant in Coimbatore). Prices
> were not printed on the source cards, so placeholder prices were set —
> correct them from **Admin → Menu Items**.

---

## Tech Stack

- **Frontend:** React 18 + Vite, Tailwind CSS v4, Framer Motion, React Icons, React Router
- **Backend:** Node.js + Express
- **Database:** SQLite (`better-sqlite3`)
- **Auth:** JWT (username/password admin login, bcrypt-hashed password)
- **Uploads:** Multer (local disk storage, served as static files)
- **QR Generation:** client-side via the `qrcode` package (no external API)

---

## File Structure

```
AMSQR/
├── backend/
│   ├── src/
│   │   ├── db/
│   │   │   ├── db.js            # SQLite connection + schema
│   │   │   └── seed.js          # Seeds categories/items/admin/settings
│   │   ├── middleware/
│   │   │   ├── auth.js          # JWT verification middleware
│   │   │   └── upload.js        # Multer image upload config
│   │   ├── routes/
│   │   │   ├── auth.routes.js
│   │   │   ├── categories.routes.js
│   │   │   ├── items.routes.js
│   │   │   ├── settings.routes.js
│   │   │   └── stats.routes.js
│   │   └── server.js            # Express app entrypoint
│   ├── uploads/                 # Uploaded images (served at /uploads)
│   ├── data/                    # menu.sqlite lives here (gitignored)
│   ├── .env.example
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── customer/        # Header, SearchBar, CategoryTabs, ItemCard,
│   │   │   │                    # FeaturedRow, CategorySection, BottomNav, InfoSheet, Skeleton
│   │   │   └── admin/           # ProtectedRoute, StatCard, ItemFormModal
│   │   ├── context/
│   │   │   └── AuthContext.jsx  # JWT session state
│   │   ├── lib/
│   │   │   ├── api.js           # Typed fetch wrapper for the backend API
│   │   │   └── categoryIcons.jsx
│   │   ├── pages/
│   │   │   ├── Menu.jsx         # THE customer QR landing page
│   │   │   └── admin/
│   │   │       ├── Login.jsx
│   │   │       ├── AdminLayout.jsx
│   │   │       ├── Dashboard.jsx
│   │   │       ├── MenuManagement.jsx
│   │   │       ├── CategoryManagement.jsx
│   │   │       ├── QRManagement.jsx
│   │   │       └── Settings.jsx
│   │   ├── App.jsx              # Routes: "/" = menu, "/admin/*" = dashboard
│   │   ├── main.jsx
│   │   └── index.css            # Tailwind + luxury dark/gold theme tokens
│   ├── index.html
│   ├── vite.config.js           # Dev proxy: /api, /uploads → backend :5000
│   └── package.json
│
└── README.md
```

---

## Getting Started

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env      # already present with working defaults
npm run seed               # creates SQLite DB, seeds menu + admin user
npm run dev                 # starts API on http://localhost:5000
```

Default admin login (from `.env`): **admin / Amutha@123** — change it
immediately from **Admin → Settings → Change Password** after first login,
and change `JWT_SECRET` in `.env` before deploying.

### 2. Frontend

```bash
cd frontend
npm install
npm run dev                 # starts on http://localhost:5173
```

The Vite dev server proxies `/api` and `/uploads` to the backend, so no CORS
configuration is needed locally.

- Customer menu: **http://localhost:5173/**
- Admin dashboard: **http://localhost:5173/admin/login**

### 3. Production Build

```bash
cd frontend && npm run build   # outputs static site to frontend/dist
cd backend  && npm start       # run the API with a process manager (pm2, systemd, etc.)
```

Serve `frontend/dist` behind a static host or reverse proxy (Nginx, Vercel,
Netlify, etc.) and point it at the deployed backend's `/api` and `/uploads`
routes. Update **Admin → QR Code Management** with the final public URL and
regenerate/download the QR code to print.

### 4. Vercel Frontend Deploy

This repository includes a root `vercel.json` for deploying the React menu
from the monorepo root:

- Build command: `cd frontend && npm install && npm run build`
- Output directory: `frontend/dist`
- SPA rewrites are enabled so `/admin/*` routes load correctly.

Set this environment variable in Vercel if the API is hosted separately:

```bash
VITE_API_BASE_URL=https://your-backend-domain.com/api
```

The Express/SQLite backend uses local disk storage for SQLite and uploads, so
deploy it on a persistent Node host rather than Vercel serverless. Configure
the backend `CLIENT_URL` to your Vercel frontend URL.

---

## How the QR Flow Works

1. Admin deploys the site and opens **Admin → QR Code Management**.
2. Enters the live menu URL, picks a QR theme, downloads the PNG, prints it.
3. A customer scans the code with their phone camera → it opens `/` directly
   → the elegant menu loads immediately. No login, no homepage, no cart.

---

## Admin Capabilities

- **Dashboard:** total/available/unavailable items, category count, popular/chef-recommended/new counts, items-per-category chart, recently added items.
- **Menu Items:** add/edit/delete, upload image, set price, toggle availability, move between categories, bulk-select + bulk availability toggle + bulk category move, mark Popular / Chef Recommended / New.
- **Categories:** create/rename/delete, drag-to-reorder (persisted).
- **QR Code:** live preview, 4 themes, PNG download, editable menu URL.
- **Settings:** restaurant name, tagline, logo, banner, address, phone, opening hours, social links, theme colors, change password.

## Notes on the Menu Content

The menu was transcribed from the restaurant's physical menu cards and
auto-organized into 15 categories (Breakfast, Tiffin & Dosa Varieties,
Soups, Veg Starters, Chinese, North Indian Curry, Breads, Biryani & Rice,
Roast Specials, Weekly Specials, House Specials, Health Beverages, and
three ice-cream categories). The restaurant is **pure vegetarian**, so
non-veg/seafood/tandoori-meat categories were intentionally omitted.
Everything — categories, items, prices, images, flags — is fully editable
from the Admin Dashboard; nothing is hardcoded in the frontend.
