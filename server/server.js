import express from "express";
import Database from "better-sqlite3";
import cors from "cors";
import crypto from "crypto";

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