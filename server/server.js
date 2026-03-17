import express from "express";
import Database from "better-sqlite3";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

// SQLite öffnen
const db = new Database("./base44.db");

// TEST
app.get("/favorites", (req, res) => {
  const rows = db.prepare("SELECT * FROM Favorite").all();
  res.json(rows);
});

// FAVORITE ERSTELLEN
app.post("/favorites", (req, res) => {
  const { location_id, user_email } = req.body;

  const result = db
    .prepare(
      "INSERT INTO Favorite (location_id, user_email) VALUES (?, ?)"
    )
    .run(location_id, user_email);

  res.json({ id: result.lastInsertRowid });
});

app.listen(3001, () => {
  console.log("Server läuft auf http://localhost:3001");
});