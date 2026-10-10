import React, { useState } from 'react';
import { Package } from 'lucide-react';

export const Login = ({ onLogin, onSwitchToRegister }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await onLogin(email, password);
    
    if (!result.success) {
      setError(result.message || 'Login failed');
    }
    setLoading(false);
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <div className="login-icon">
            <Package size={40} />
          </div>
          <h1 className="login-title">EquipQR</h1>
          <p className="login-subtitle">@thapar.edu users only</p>
        </div>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <input
              type="email"
              placeholder="Email (@thapar.edu)"
              className="input-field"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="input-group">
            <input
              type="password"
              placeholder="Password"
              className="input-field"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="btn-primary"
            disabled={loading}
          >
            {loading ? 'Loading...' : 'Login'}
          </button>

          <button
            type="button"
            onClick={onSwitchToRegister}
            className="btn-secondary"
          >
            Don't have an account? Register
          </button>
        </form>
      </div>
    </div>
  );
};