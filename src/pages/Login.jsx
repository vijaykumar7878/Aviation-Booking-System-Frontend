
import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import './Login.css';

const API_URL = 'https://governor-set-element-maximize.trycloudflare.com/api/customers/login';

function Login() {
  const navigate = useNavigate();
  const location = useLocation();

  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (event) => {
    event.preventDefault();
    setError('');

    if (!emailOrPhone.trim() || !password) {
      setError('Please enter your email and password.');
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          emailOrPhone: emailOrPhone.trim(),
          password,
        }),
      });

      const responseText = await response.text();

      let data;

      try {
        data = responseText ? JSON.parse(responseText) : null;
      } catch {
        data = responseText;
      }

      // Handle HTTP errors returned by the backend.
      if (!response.ok) {
        throw new Error(
          typeof data === 'string'
            ? data
            : data?.message || data?.error || 'Login failed.'
        );
      }

      // The backend must return customer details, not only a message.
      if (typeof data === 'string') {
        const message = data.trim().toLowerCase();

        if (
          message.includes('login successful') ||
          message.includes('longin successful')
        ) {
          throw new Error(
            'Login succeeded, but customer details were not returned by the backend.'
          );
        }

        throw new Error(data || 'Invalid email or password.');
      }

      // Check that the customer ID is present.
      if (
        !data ||
        typeof data !== 'object' ||
        Array.isArray(data) ||
        data.id == null
      ) {
        throw new Error(
          'Customer details or customer ID are missing from the response.'
        );
      }

      // Save the logged-in customer's details.
      localStorage.setItem('skybookerLogin', 'true');
      localStorage.setItem(
        'skybookerEmail',
        data.email || emailOrPhone.trim()
      );
      localStorage.setItem(
        'skybookerCustomer',
        JSON.stringify(data)
      );

      // Preserve the original destination and selected flight.
      const destination = location.state?.from || '/search-flights';

      navigate(destination, {
        replace: true,
        state: location.state?.flight
          ? {
              flight: location.state.flight,
              passengers: location.state.passengers,
            }
          : undefined,
      });
    } catch (err) {
      console.error('Login error:', err);

      setError(
        err.message || 'Unable to connect to the server. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <nav className="login-navbar">
        <Link to="/" className="login-logo">
          <span>✈</span> SkyBooker
        </Link>

        <Link to="/search-flights" className="login-back">
          ← Search Flights
        </Link>
      </nav>

      <main className="login-main">
        <section className="login-card">
          <div className="login-icon">✈</div>

          <p className="login-eyebrow">WELCOME BACK</p>

          <h1>Sign in to SkyBooker</h1>

          <p className="login-subtitle">
            Log in to continue your journey.
          </p>

          {location.state?.message && (
            <p className="login-notice" role="status">
              {location.state.message}
            </p>
          )}

          <form onSubmit={handleLogin}>
            <div className="login-field">
              <label htmlFor="emailOrPhone">
                EMAIL ADDRESS
              </label>

              <input
                id="emailOrPhone"
                type="text"
                placeholder="Enter your registered email"
                autoComplete="username"
                value={emailOrPhone}
                onChange={(event) =>
                  setEmailOrPhone(event.target.value)
                }
                required
              />
            </div>

            <div className="login-field">
              <label htmlFor="password">PASSWORD</label>

              <div className="password-input-wrapper">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(event) =>
                    setPassword(event.target.value)
                  }
                  required
                />

                <button
                  type="button"
                  className="toggle-password"
                  onClick={() =>
                    setShowPassword((visible) => !visible)
                  }
                  aria-label={
                    showPassword ? 'Hide password' : 'Show password'
                  }
                  aria-pressed={showPassword}
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            {error && (
              <p className="login-error" role="alert">
                {error}
              </p>
            )}

            <button
              type="submit"
              className="login-submit"
              disabled={loading}
            >
              {loading ? 'Signing in...' : 'Login'}
              {!loading && <span>→</span>}
            </button>
          </form>

          <p className="login-footer">
            Don't have an account?{' '}
            <Link to="/register">Create an account</Link>
          </p>
        </section>
      </main>
    </div>
  );
}

export default Login;

