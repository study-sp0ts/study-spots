// db.js
import Database from 'better-sqlite3';

// Pfad zu deiner DB-Datei
const db = new Database('./db/base44.db');

export default db;