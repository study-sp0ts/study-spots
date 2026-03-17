import Database from "better-sqlite3";

const db = new Database("server/studyspots.db");

// Insert sample locations
const insertLocation = db.prepare(`
  INSERT INTO StudyLocation (id, name, category, latitude, longitude, address, description)
  VALUES (?, ?, ?, ?, ?, ?, ?)
`);

const locations = [
  {
    id: '1',
    name: 'Central Library',
    category: 'Library',
    latitude: 48.137154,
    longitude: 11.576124,
    address: 'Ludwigstraße 16, 80539 München',
    description: 'A quiet place to study with lots of books.'
  },
  {
    id: '2',
    name: 'Café Einstein',
    category: 'Café',
    latitude: 48.139126,
    longitude: 11.580186,
    address: 'Einsteinstraße 42, 81675 München',
    description: 'Cozy café with good coffee and wifi.'
  },
  {
    id: '3',
    name: 'TU München Campus',
    category: 'University',
    latitude: 48.1497,
    longitude: 11.5678,
    address: 'Arcisstraße 21, 80333 München',
    description: 'Technical University campus with study areas.'
  }
];

for (const loc of locations) {
  insertLocation.run(loc.id, loc.name, loc.category, loc.latitude, loc.longitude, loc.address, loc.description);
}

console.log('Sample data inserted');