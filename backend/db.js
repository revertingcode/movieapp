const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./movies.db', (err) => {
  if (err) {
    console.error(err.message);
  }
  console.log('Connected to the SQLite database at ./movies.db');
});

db.serialize(() => {
  // Users table
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE,
      password TEXT
    )
  `);

  // Movies table
  db.run(`
    CREATE TABLE IF NOT EXISTS movies (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT UNIQUE,
      file_path TEXT
    )
  `);

  // Inseriamo un utente di default solo se non esiste già
  db.get('SELECT COUNT(*) as count FROM users', (err, row) => {
    if (err) {
      console.error(err.message);
    } else if (row.count === 0) {
      db.run(`INSERT INTO users (email, password) VALUES ('admin@spidermovies.com', 'password123')`);
    }
  });
});

module.exports = db;