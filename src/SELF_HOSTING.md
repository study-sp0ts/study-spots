# Self-Hosting StudySpot Munich — Developer Guide

This guide explains how to clone the app, run it locally with VS Code, and connect it to your own SQLite database and domain.

---

## 1. Prerequisites

- [Node.js](https://nodejs.org/) v18 or later
- [VS Code](https://code.visualstudio.com/)
- [Git](https://git-scm.com/)

---

## 2. Clone the Repository

If you've exported or synced this project to GitHub via Base44's GitHub sync feature:

```bash
git clone https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
cd YOUR_REPO_NAME
npm install
```

---

## 3. Project Structure

```
src/
  pages/          # Page components (Home, Profile, StudyGroups, etc.)
  components/     # Reusable UI components (Navbar, Map, LocationDetail, etc.)
  entities/       # JSON schemas for data models
  lib/            # Auth context, language context, utilities
  api/            # Base44 SDK client
index.css         # Design tokens / CSS variables
tailwind.config.js
```

---

## 4. Running Locally (with Base44 backend)

The app uses **Base44's backend-as-a-service** by default (database, auth, file storage). To run locally against the live Base44 backend:

```bash
npm run dev
```

Open `http://localhost:5173` in your browser.

> The `src/api/base44Client.js` file is pre-configured with your app's ID and token. These point to Base44's hosted backend.

---

## 5. Replacing Base44 with Your Own SQLite Backend

To self-host with SQLite you need to replace the Base44 SDK calls with your own API.

### 5a. Set up a local API server

Create a simple REST API (e.g. with Express.js + better-sqlite3):

```bash
npm install express better-sqlite3 cors
```

Example `server.js`:

```js
const express = require("express");
const Database = require("better-sqlite3");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

const db = new Database("studyspots.db");

// Create tables matching your entity schemas
db.exec(`
  CREATE TABLE IF NOT EXISTS StudyLocation (
    id TEXT PRIMARY KEY,
    name TEXT,
    description TEXT,
    address TEXT,
    category TEXT,
    latitude REAL,
    longitude REAL,
    has_wifi INTEGER DEFAULT 0,
    has_outlets INTEGER DEFAULT 0,
    has_outside_seating INTEGER DEFAULT 0,
    has_beverages INTEGER DEFAULT 0,
    has_food INTEGER DEFAULT 0,
    inside_seats TEXT,
    outside_seats TEXT,
    noise_level TEXT,
    hours TEXT,
    image_url TEXT,
    rating REAL,
    created_date TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS StudyGroup (
    id TEXT PRIMARY KEY,
    title TEXT,
    description TEXT,
    subject TEXT,
    date_time TEXT,
    end_time TEXT,
    location_id TEXT,
    location_name TEXT,
    host_email TEXT,
    host_name TEXT,
    join_type TEXT DEFAULT 'open',
    max_size INTEGER,
    status TEXT DEFAULT 'upcoming',
    enable_chat INTEGER DEFAULT 0,
    created_date TEXT DEFAULT (datetime('now'))
  );

  -- Add more tables for: StudyGroupMember, Favorite, LocationReview, etc.
`);

// Example endpoint
app.get("/api/StudyLocation", (req, res) => {
  const rows = db.prepare("SELECT * FROM StudyLocation").all();
  res.json(rows);
});

app.post("/api/StudyLocation", (req, res) => {
  const { name, category, latitude, longitude, ...rest } = req.body;
  const id = crypto.randomUUID();
  db.prepare(`INSERT INTO StudyLocation (id, name, category, latitude, longitude) VALUES (?, ?, ?, ?, ?)`)
    .run(id, name, category, latitude, longitude);
  res.json({ id, name, category, latitude, longitude });
});

app.listen(3001, () => console.log("API running on http://localhost:3001"));
```

### 5b. Replace Base44 SDK calls in the frontend

In each page/component, replace:

```js
// Before (Base44)
import { base44 } from "@/api/base44Client";
const locations = await base44.entities.StudyLocation.list();
```

With:

```js
// After (your API)
const res = await fetch("http://localhost:3001/api/StudyLocation");
const locations = await res.json();
```

Or create a wrapper in `src/api/localClient.js` that mirrors the Base44 API shape:

```js
const BASE_URL = "http://localhost:3001/api";

export const localClient = {
  entities: {
    StudyLocation: {
      list: () => fetch(`${BASE_URL}/StudyLocation`).then(r => r.json()),
      filter: (query) => fetch(`${BASE_URL}/StudyLocation?${new URLSearchParams(query)}`).then(r => r.json()),
      create: (data) => fetch(`${BASE_URL}/StudyLocation`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }).then(r => r.json()),
      update: (id, data) => fetch(`${BASE_URL}/StudyLocation/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }).then(r => r.json()),
      delete: (id) => fetch(`${BASE_URL}/StudyLocation/${id}`, { method: "DELETE" }).then(r => r.json()),
    },
    // Add all other entities the same way...
  }
};
```

Then swap `import { base44 }` → `import { localClient as base44 }` in each file.

### 5c. Authentication

Base44 handles auth automatically. For self-hosting, replace with [Clerk](https://clerk.com/), [Auth.js](https://authjs.dev/), or a simple JWT setup. Update `src/lib/AuthContext.jsx` to use your auth provider.

---

## 6. Entity Schemas (Database Tables)

The `src/entities/` folder contains JSON schemas for all data models. Use them as reference to create your SQLite tables:

| Entity | File |
|--------|------|
| Study locations | `entities/StudyLocation.json` |
| Study groups | `entities/StudyGroup.json` |
| Group members | `entities/StudyGroupMember.json` |
| Favorites | `entities/Favorite.json` |
| Reviews | `entities/LocationReview.json` |
| Friend requests | `entities/FriendRequest.json` |
| Group bookmarks | `entities/StudyGroupBookmark.json` |
| Recommendations | `entities/LocationRecommendation.json` |

---

## 7. Environment Variables

Create a `.env` file in the root:

```env
VITE_API_URL=http://localhost:3001/api
VITE_MAP_TILE_URL=https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png
```

Reference in code: `import.meta.env.VITE_API_URL`

---

## 8. Deploying to Your Own Domain

### Option A: Static hosting (Vercel / Netlify)

```bash
npm run build
# Upload the dist/ folder to Vercel or Netlify
```

Set your custom domain in the Vercel/Netlify dashboard.

### Option B: VPS (e.g. Hetzner, DigitalOcean)

```bash
npm run build
# Copy dist/ to your server
# Serve with nginx:
```

Example `nginx.conf`:

```nginx
server {
  listen 80;
  server_name yourdomain.com;

  root /var/www/studyspot/dist;
  index index.html;

  location / {
    try_files $uri $uri/ /index.html;
  }

  location /api {
    proxy_pass http://localhost:3001;
  }
}
```

Enable HTTPS with Let's Encrypt:

```bash
sudo certbot --nginx -d yourdomain.com
```

---

## 9. Map Tiles

The app uses **OpenStreetMap** via `react-leaflet` — free and open source, no API key needed. The default tile URL is:

```
https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png
```

To use a custom tile provider (e.g. Mapbox), update `src/components/map/MapView.jsx`:

```jsx
<TileLayer
  url="https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}"
  accessToken="YOUR_MAPBOX_TOKEN"
  id="mapbox/streets-v11"
/>
```

---

## 10. Customizing for Another City

1. **Change the city name** in `src/components/nav/Navbar.jsx` (the `<span>Munich</span>` part)
2. **Update the map center** in `src/components/map/MapView.jsx` (the `center` prop, currently `[48.1351, 11.5820]`)
3. **Replace sample data** — delete existing study locations via the Base44 admin panel (or your own DB) and add your city's spots
4. **Update `About` page** (`src/pages/About.jsx`) with your own legal/contact info

---

## 11. Key Files to Edit

| What to change | File |
|----------------|------|
| Color theme & fonts | `src/index.css` + `tailwind.config.js` |
| App name & logo | `src/components/nav/Navbar.jsx` |
| Map center & zoom | `src/components/map/MapView.jsx` |
| Navigation routes | `src/App.jsx` |
| Translations (DE/EN) | `src/lib/LanguageContext.jsx` |
| API connection | `src/api/base44Client.js` |
| Page content | `src/pages/` |

---

## Questions?

Open an issue on GitHub or reach out via the contact info in the About page.