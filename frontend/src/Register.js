// src/Register.js
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Auth.css';

function Register() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');

    if (password !== confirmPassword) {
      setMessage('Passwords do not match!');
      setIsSuccess(false);
      return;
    }

    try {
      // IMPORTANT: Ensure this URL matches your Flask backend's URL
      const response = await fetch('http://localhost:5000/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      setMessage(data.message);
      setIsSuccess(response.ok);

      if (response.ok) {
        setUsername('');
        setPassword('');
        setConfirmPassword('');
      }

    } catch (err) {
      console.error('Error during registration:', err);
      setMessage('An error occurred during registration. Please try again.');
      setIsSuccess(false);
    }
  };

  return (
    <div className="auth-container">
      <h2>Register</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="username">Username:</label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">Password:</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="confirmPassword">Confirm Password:</label>
          <input
            type="password"
            id="confirmPassword"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit" className="auth-button">Register</button>
      </form>
      {message && <p className={isSuccess ? 'success-message' : 'error-message'}>{message}</p>}
      <p>Already have an account? <Link to="/login">Login here</Link></p>
    </div>
  );
}

export default Register;