# Flick Admin Panel

Admin dashboard for **Flick**, a Bike / Auto / Cab ride-hailing service operating in Mumbai, Delhi, Bangalore, and Pune.

Built with **React 19 + Vite 5 + React Router 6 + Tailwind CSS 3 + Recharts + Axios**. Dark-themed ops console for monitoring rides, managing customers and riders, tracking earnings/payouts, and resolving disputes.

## Features

- **Auth + protected routes** — email/password login (`POST /user/login`), token persisted in `localStorage` (`admin_token` / `admin_user`), auto-redirect to `/login` on 401. Works offline in **demo mode** (any credentials create a mock session, see `src/pages/Login.jsx`).
- **Dashboard (`/`)** — KPI cards (total/live/cancelled rides, riders, customers, revenue, open disputes), rides-over-time chart with 7d/30d toggle (Recharts), live activity feed, animated SVG live-rides city map, top-5 riders leaderboard.
- **Customers (`/customers`)** — searchable customer table (20 seeded records), wallet/referral detail, block/unblock via `PATCH /admin/update-user-status`.
- **Riders (`/riders`)** — rider roster (15 seeded records: vehicle, rating, earnings, online/offline/blocked), document verification via `PATCH /admin/verify-rider`.
- **Rides (`/rides`)** — ride history (30 seeded records: pickup/drop, fare, platform fee vs. rider earning, distance/duration), filter by Completed / Ongoing / Cancelled.
- **Earnings & Payments (`/payments`)** — gross vs. commission vs. payout chart, per-rider payout table (`Paid` / `Pending`) by pay period.
- **Disputes & Support (`/disputes`)** — dispute queue (overcharged, unsafe driving, lost item, etc.) with Open / Resolved / Escalated workflow via `PATCH /admin/resolve-dispute`.
- **Settings (`/settings`)** — admin profile / platform preferences UI.
- **Shared UI** — collapsible `Sidebar`, `TopBar`, `StatCard`, `StatusBadge`, `DataTable`, `Modal`; CSS Modules + Tailwind `flick` theme (`#FFD700` yellow on `#1A1A1A` black), `Bebas Neue` display + `DM Sans` body fonts.

## Tech Stack

| Layer | Choice |
|---|---|
| UI | React 19, React DOM 19, React Router DOM 6 |
| Build | Vite 5 (`@vitejs/plugin-react` 5) |
| Styling | Tailwind CSS 3, PostCSS, Autoprefixer, CSS Modules |
| Data viz | Recharts 2 |
| HTTP | Axios 1 |
| Icons | Lucide React |
| Fonts | Google Fonts: Bebas Neue + DM Sans |

## Prerequisites

- Node.js 18+ (Vite 5 requirement) and npm

## Getting Started

```bash
# install dependencies
npm install

# start dev server on http://localhost:5174
npm run dev

# production build (outputs to dist/)
npm run build

# preview the production build
npm run preview
```

Dev server port is pinned to `5174` in `package.json` (`vite --port 5174`) and `vite.config.js`.

## Configuration

| Variable | Default | Description |
|---|---|---|
| `VITE_API_URL` | `http://localhost:5000/api/v1` | Base URL for the Flick backend API (see `src/services/api.js`) |

Create a `.env` file to point at a backend:

```bash
VITE_API_URL=https://api.flick.app/api/v1
```

Auth details:

- Request interceptor attaches `x-auth-token: <token>` from `localStorage` on every call.
- Response interceptor clears `admin_token` / `admin_user` and redirects to `/login` on HTTP 401.

## Backend API Contract

Defined in `src/services/admin.service.js`:

| Method | Endpoint | Used for |
|---|---|---|
| `POST` | `/user/login` | Admin sign-in (`{ email, password }` → `{ token, user }`) |
| `GET` | `/admin/stats` | Dashboard KPIs |
| `GET` | `/admin/customers` | Customer list (query `params` supported) |
| `GET` | `/admin/riders` | Rider list |
| `GET` | `/admin/rides` | Ride history |
| `GET` | `/admin/disputes` | Dispute queue |
| `PATCH` | `/admin/update-user-status` | Block/unblock user (`{ user_id, is_active }`) |
| `PATCH` | `/admin/verify-rider` | Verify rider docs (`{ rider_id, is_verified }`) |
| `PATCH` | `/admin/resolve-dispute` | Resolve dispute (`{ dispute_id, status, resolution_note }`) |

If the backend is unreachable or returns an empty list, the app falls back to the seeded data in `src/data/mockData.js` (customers, riders, rides, disputes, chart series, payouts, activity feed) via `src/context/AdminContext.jsx`, so the UI is always demonstrable.

## Project Structure

```
FlickAdminPanel/
├── index.html                  # Entry HTML, fonts, <div id="root">
├── vite.config.js              # Vite + React plugin, dev port 5174
├── tailwind.config.js          # flick palette, fonts, slide-up/fade-in/pulse-ring animations
├── postcss.config.js
├── public/                     # Static assets
├── src/
│   ├── main.jsx                # React root, imports index.css + App
│   ├── App.jsx                 # Router, ProtectedLayout (Sidebar + TopBar), page titles
│   ├── App.module.css
│   ├── index.css               # Tailwind directives, dark base, scrollbar styling
│   ├── context/
│   │   └── AdminContext.jsx    # Global state: user, stats, customers/riders/rides/disputes + actions
│   ├── services/
│   │   ├── api.js              # Axios instance, baseURL, auth interceptors
│   │   └── admin.service.js    # Endpoint wrappers listed above
│   ├── data/
│   │   └── mockData.js         # Demo dataset + chart/activity fixtures
│   ├── components/
│   │   ├── Sidebar.jsx         # Collapsible nav (240px / 64px)
│   │   ├── TopBar.jsx
│   │   ├── StatCard.jsx
│   │   ├── StatusBadge.jsx
│   │   ├── DataTable.jsx
│   │   └── Modal.jsx
│   └── pages/
│       ├── Dashboard.jsx       # KPIs, charts, live map, top riders
│       ├── Customers.jsx
│       ├── Riders.jsx
│       ├── Rides.jsx
│       ├── Payments.jsx
│       ├── Disputes.jsx
│       ├── Settings.jsx
│       └── Login.jsx           # Sign-in form with demo fallback
└── dist/                       # Production build output (generated)
```

## Routing

All app routes except `/login` require a session (`ProtectedLayout` → `<Navigate to="/login" />` when `user` is null):

`/`, `/customers`, `/riders`, `/rides`, `/payments`, `/disputes`, `/settings`, `/login`

## Demo Mode

No backend running? Just open the dev server and sign in with any email/password — `Login.jsx` catches the failed request and creates a local `demo_token` session, and `AdminContext` serves the mock dataset. Ideal for UI review and screenshots.

## Deployment

```bash
npm run build
```

Serve the `dist/` directory from any static host (Nginx, Vercel, Netlify, S3+CloudFront). Remember to set `VITE_API_URL` at build time so the bundle points at the correct backend.

## License

Private project — all rights reserved. Contact the Flick team for usage permission.
