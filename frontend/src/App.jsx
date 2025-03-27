import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Login from './components/Login';
import MovieList from './components/MovieList';
import Settings from './components/Settings';
import './styles.css';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userEmail, setUserEmail] = useState('');

  const handleLogin = (email) => {
    setIsLoggedIn(true);
    setUserEmail(email);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserEmail('');
  };

  return (
    <Router>
      <div className="app">
        {isLoggedIn && userEmail === 'admin@spi.com' && (
          <Link to="/settings" className="settings-icon">⚙️</Link>
        )}
        <Routes>
          <Route path="/" element={
            isLoggedIn ? (
              <MovieList onLogout={handleLogout} userEmail={userEmail} />
            ) : (
              <Login onLogin={handleLogin} />
            )
          } />
          <Route path="/settings" element={
            isLoggedIn && userEmail === 'admin@spi.com' ? (
              <Settings userEmail={userEmail} />
            ) : (
              <Login onLogin={handleLogin} />
            )
          } />
        </Routes>
      </div>
    </Router>
  );
}

export default App;