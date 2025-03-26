const express = require('express');
const cors = require('cors');
const db = require('./db');
const fs = require('fs').promises;
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = 3000;
let MOVIES_DIR = path.join(__dirname, 'movies');

app.use('/movies', express.static(MOVIES_DIR));

async function syncMoviesWithFolder() {
  try {
    await fs.mkdir(MOVIES_DIR, { recursive: true });
    const files = await fs.readdir(MOVIES_DIR);
    const movieFiles = files.filter(file => /\.(mp4|avi|mkv)$/i.test(file));

    const existingMovies = await new Promise((resolve, reject) => {
      db.all('SELECT title, file_path FROM movies', (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });

    const existingTitles = new Set(existingMovies.map(m => m.title));

    for (const file of movieFiles) {
      const title = path.basename(file, path.extname(file));
      const filePath = `/movies/${file}`;

      if (!existingTitles.has(title)) {
        await new Promise((resolve, reject) => {
          db.run(
            'INSERT INTO movies (title, file_path) VALUES (?, ?)',
            [title, filePath],
            (err) => (err ? reject(err) : resolve())
          );
        });
        console.log(`Added movie: ${title}`);
      }
    }

    for (const movie of existingMovies) {
      const fileName = path.basename(movie.file_path);
      if (!movieFiles.includes(fileName)) {
        await new Promise((resolve, reject) => {
          db.run('DELETE FROM movies WHERE title = ?', [movie.title], (err) => {
            if (err) reject(err);
            else resolve();
          });
        });
        console.log(`Removed movie: ${movie.title}`);
      }
    }

    console.log('Movies database synchronized with folder.');
  } catch (err) {
    console.error('Error syncing movies:', err);
  }
}

// Login endpoint
app.post('/api/login', (req, res) => {
  const { email, password } = req.body;
  db.get(
    'SELECT * FROM users WHERE email = ? AND password = ?',
    [email, password],
    (err, row) => {
      if (err) return res.status(500).json({ error: err.message });
      if (!row) return res.status(401).json({ error: 'Invalid credentials' });
      res.json({ message: 'Login successful', userId: row.id, email: row.email });
    }
  );
});

// Signup endpoint
app.post('/api/signup', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  db.run(
    'INSERT INTO users (email, password) VALUES (?, ?)',
    [email, password],
    function (err) {
      if (err) {
        if (err.message.includes('UNIQUE constraint')) {
          return res.status(400).json({ error: 'Email already exists' });
        }
        return res.status(500).json({ error: err.message });
      }
      res.json({ message: 'User registered successfully', userId: this.lastID });
    }
  );
});

// Movies endpoint
app.get('/api/movies', (req, res) => {
  const { search } = req.query;
  let query = 'SELECT * FROM movies';
  let params = [];

  if (search) {
    query += ' WHERE title LIKE ?';
    params.push(`%${search}%`);
  }

  db.all(query, params, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// Download endpoint - Send file as attachment
app.get('/api/movies/download/:id', (req, res) => {
  db.get('SELECT title, file_path FROM movies WHERE id = ?', [req.params.id], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row) return res.status(404).json({ error: 'Movie not found' });

    const filePath = path.join(MOVIES_DIR, path.basename(row.file_path));
    const fileName = `${row.title}${path.extname(row.file_path)}`;

    res.download(filePath, fileName, (err) => {
      if (err) {
        console.error('Download error:', err);
        res.status(500).json({ error: 'Failed to download file' });
      }
    });
  });
});

// Endpoint to update movies folder path (admin only)
app.post('/api/admin/configure', (req, res) => {
  const { email, newPath } = req.body;
  if (email !== 'admin@spidermovies.com') {
    return res.status(403).json({ error: 'Unauthorized' });
  }
  MOVIES_DIR = path.resolve(newPath);
  app.use('/movies', express.static(MOVIES_DIR));
  syncMoviesWithFolder().then(() => {
    res.json({ message: 'Movies folder path updated and synced' });
  }).catch(err => {
    res.status(500).json({ error: err.message });
  });
});

// Endpoint to refresh movies (admin only)
app.post('/api/admin/refresh', (req, res) => {
  const { email } = req.body;
  if (email !== 'admin@spidermovies.com') {
    return res.status(403).json({ error: 'Unauthorized' });
  }
  syncMoviesWithFolder().then(() => {
    res.json({ message: 'Movies refreshed successfully' });
  }).catch(err => {
    res.status(500).json({ error: err.message });
  });
});

// Start server with initial sync
app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);
  await syncMoviesWithFolder();
});