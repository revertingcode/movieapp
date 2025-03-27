import { useState } from 'react';
import axios from 'axios';

function Login({ onLogin }) {
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('/api/login', { email, password });
      if (response.data.message === 'Login successful') {
        onLogin(response.data.email); // Pass email to App
      }
    } catch (err) {
      setError('Invalid credentials');
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('/api/signup', { email, password });
      if (response.data.message === 'User registered successfully') {
        setError('Signup successful! Please login.');
        setIsLoginMode(true);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Signup failed');
    }
  };

  const toggleMode = () => {
    setIsLoginMode(!isLoginMode);
    setError('');
    setEmail('');
    setPassword('');
  };

  return (
    <div className="login-container">
      <h1>Spider Movies</h1>
      <h3>The Spider's Movie Archive</h3>
      <form onSubmit={isLoginMode ? handleLogin : handleSignup} className="login-form">
        <h2>{isLoginMode ? 'Login' : 'Sign Up'}</h2>
        {error && <p className="error">{error}</p>}
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="submit">{isLoginMode ? 'Login' : 'Sign Up'}</button>
       </form>
    </div>
  );
}

export default Login;