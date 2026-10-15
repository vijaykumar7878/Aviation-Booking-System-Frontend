
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './AdminLogin.css';

function AdminLogin() {
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    setError('');

    // TEMPORARY FRONTEND VALIDATION ONLY
    const ADMIN_EMAIL = 'kuruvavijay78@gmail.com';
    const ADMIN_PASSWORD = 'vijay@2004';

    if (
      email.trim().toLowerCase() === ADMIN_EMAIL.toLowerCase() &&
      password === ADMIN_PASSWORD
    ) {
      localStorage.setItem('skybookerAdminLogin', 'true');
      navigate('/admin-home');
    } else {
      setError('Invalid admin email or password.');
    }
  };

  return (
    <div className="admin-login-page">
      <header className="admin-login-nav">
        <Link to="/" className="admin-login-logo">
          Sky<span>Booker</span>
        </Link>

        <Link to="/" className="admin-back-home">
          ← Back to Home
        </Link>
      </header>

      <main className="admin-login-main">
        <section className="admin-login-card">
          <div className="admin-login-icon">✈</div>

          <p className="admin-login-label">RESTRICTED ACCESS</p>
          <h1>Welcome, Admin</h1>

          <p className="admin-login-description">
            Sign in to manage flights, airports, bookings and customers.
          </p>

          <form onSubmit={handleLogin}>
            <label htmlFor="admin-email">Admin Email</label>
            <input
              id="admin-email"
              type="email"
              placeholder="Enter admin email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <label htmlFor="admin-password">Password</label>
            <input
              id="admin-password"
              type="password"
              placeholder="Enter admin password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            {error && (
              <div className="admin-login-error" role="alert">
                {error}
              </div>
            )}

            <button type="submit" className="admin-login-button">
              Sign In to Admin Panel →
            </button>
          </form>

          <div className="admin-login-security">
            🔒 Temporary admin login
          </div>
        </section>
      </main>
    </div>
  );
}

export default AdminLogin;
