import { useState, useEffect } from 'react';
import axios from 'axios';

function MovieList({ onLogout, userEmail }) {
  const [movies, setMovies] = useState([]);
  const [search, setSearch] = useState('');
  const [downloading, setDownloading] = useState({});

  useEffect(() => {
    fetchMovies();
  }, [search]);

  const fetchMovies = async () => {
    try {
      const response = await axios.get('/api/movies', {
        params: { search }
      });
      setMovies(response.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDownload = async (id) => {
    setDownloading(prev => ({ ...prev, [id]: true }));
    try {
      const response = await axios.get(`/api/movies/download/${id}`, {
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;

      const contentDisposition = response.headers['content-disposition'];
      const fileName = contentDisposition
        ? contentDisposition.split('filename=')[1]?.replace(/"/g, '')
        : `movie_${id}.mp4`;

      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Download failed:', err);
    } finally {
      setDownloading(prev => ({ ...prev, [id]: false }));
    }
  };

  const handleRefresh = async () => {
    try {
      await axios.post('/api/admin/refresh', { email: userEmail });
      fetchMovies();
    } catch (err) {
      console.error('Refresh failed:', err);
    }
  };

  return (
    <div className="movie-container">
      <div className="header">
        <h2>Movie List</h2>
        <div>
          {userEmail === 'admin@spidermovies.com' && (
            <button onClick={handleRefresh} className="refresh-btn">Refresh</button>
          )}
          <button onClick={onLogout} className="logout-btn">Logout</button>
        </div>
      </div>
      <input
        type="text"
        placeholder="Search movies..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="search-input"
      />
      <div className="movie-list">
        {movies.map((movie) => (
          <div key={movie.id} className="movie-card">
            <h3 title={movie.title}>{movie.title}</h3> {/* Aggiunto attributo title */}
            <button
              onClick={() => handleDownload(movie.id)}
              className="download-btn"
              disabled={downloading[movie.id]}
            >
              {downloading[movie.id] ? (
                <span className="download-loading">
                  <span className="spinner"></span>
                  Wait for download...
                </span>
              ) : (
                'Download'
              )}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default MovieList;