import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Settings({ userEmail }) {
  const [moviesPath, setMoviesPath] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleConfigure = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('/api/admin/configure', {
        email: userEmail,
        newPath: moviesPath
      });
      setMessage(response.data.message);
    } catch (err) {
      setMessage(err.response?.data?.error || 'Configuration failed');
    }
  };

  return (
    <div className="settings-container">
      <h2>Settings</h2>
      <form onSubmit={handleConfigure} className="settings-form">
        <label>
          Movies Folder Path:
          <input
            type="text"
            value={moviesPath}
            onChange={(e) => setMoviesPath(e.target.value)}
            placeholder="e.g., /path/to/movies"
          />
        </label>
        <button type="submit">Configure</button>
        {message && <p className={message.includes('failed') ? 'error' : 'success'}>{message}</p>}
      </form>
      <button onClick={() => navigate('/')} className="back-btn">Back</button>
    </div>
  );
}

export default Settings;