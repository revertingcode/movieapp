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

  // Movies table with file_size column (in GB)
  db.run(`
    CREATE TABLE IF NOT EXISTS movies (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT UNIQUE,
      file_path TEXT,
      file_size REAL
    )
  `);
  
  // Add a user
  db.get('SELECT COUNT(*) as count FROM users', (err, row) => {
    if (err) {
      console.error(err.message);
    } else if (row.count === 0) {
      db.run(`INSERT INTO users (email, password) VALUES ('admin@spi.com', 'accendino01')`);
      db.run(`INSERT INTO users (email, password) VALUES ('gae@spi.com', 'fabfilm2024')`);
      db.run(`INSERT INTO users (email, password) VALUES ('dani@spi.com', 'fabfilms')`);
    }
  });
});

module.exports = db;