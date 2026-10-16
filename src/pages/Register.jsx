
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Register.css';

const API_URL = 'https://governor-set-element-maximize.trycloudflare.com/api/customers/register';

function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    password: '',
    confirmPassword: '',
    gender: '',
    dateOfBirth: '',
    address: ''
  });

  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const [loading, setLoading] = useState(false);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((previous) => ({ ...previous, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setMessage('');

    if (form.password !== form.confirmPassword) {
      setIsError(true);
      setMessage('Passwords do not match.');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json'
        },
        body: JSON.stringify(form)
      });


      const responseText = await response.text();

      console.log('Registration HTTP status:', response.status);
      console.log('Registration response:', responseText);

      if (!response.ok) {
        throw new Error(
          responseText || `Registration failed (${response.status}).`
        );
      }

      const result = responseText.trim().toLowerCase();

      if (result !== 'customer registered successfully') {
        throw new Error(responseText || 'Registration failed.');
      }

      if (
        responseText.toLowerCase().includes('error') ||
        responseText.toLowerCase().includes('failed')
      ) {
        throw new Error(responseText);
      }

      setIsError(false);
      setMessage('Registration successful! Redirecting to login...');

      setTimeout(() => navigate('/login'), 1500);
    } catch (error) {
      setIsError(true);
      setMessage(
        error.message || 'Unable to register. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="register-page">
      <nav className="register-nav">
        <Link to="/" className="register-brand">
          ✈ Sky<span>Booker</span>
        </Link>

        <div className="register-nav-links">
          <Link to="/search-flights">Search Flights</Link>
          <Link to="/login">Login</Link>
        </div>
      </nav>

      <main className="register-main">
        <section className="register-card">
          <div className="register-icon">✈</div>

          <h1>Create Your Account</h1>
          <p className="register-subtitle">
            Book flights, manage your trips, and explore the world
            with SkyBooker.
          </p>

          {message && (
            <div
              className={`register-message ${
                isError ? 'error' : 'success'
              }`}
              role="status"
            >
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="register-field full-width">
              <label htmlFor="fullName">Full Name *</label>
              <input
                id="fullName"
                name="fullName"
                value={form.fullName}
                onChange={handleChange}
                placeholder="Enter your full name"
                autoComplete="name"
                required
              />
            </div>

            <div className="register-grid">
              <div className="register-field">
                <label htmlFor="email">Email *</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  autoComplete="email"
                  required
                />
              </div>

              <div className="register-field">
                <label htmlFor="phoneNumber">Phone Number *</label>
                <input
                  id="phoneNumber"
                  name="phoneNumber"
                  type="tel"
                  value={form.phoneNumber}
                  onChange={handleChange}
                  placeholder="Enter phone number"
                  autoComplete="tel"
                  required
                />
              </div>

              <div className="register-field">
                <label htmlFor="password">Password *</label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Create a password"
                  autoComplete="new-password"
                  required
                />
              </div>

              <div className="register-field">
                <label htmlFor="confirmPassword">Confirm Password *</label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm your password"
                  autoComplete="new-password"
                  required
                />
              </div>

              <div className="register-field">
                <label htmlFor="gender">Gender</label>
                <select
                  id="gender"
                  name="gender"
                  value={form.gender}
                  onChange={handleChange}
                >
                  <option value="">Select gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="register-field">
                <label htmlFor="dateOfBirth">Date of Birth</label>
                <input
                  id="dateOfBirth"
                  name="dateOfBirth"
                  type="date"
                  value={form.dateOfBirth}
                  onChange={handleChange}
                  autoComplete="bday"
                />
              </div>
            </div>

            <div className="register-field full-width">
              <label htmlFor="address">Address</label>
              <textarea
                id="address"
                name="address"
                value={form.address}
                onChange={handleChange}
                placeholder="Enter your address"
                autoComplete="street-address"
                rows={3}
              />
            </div>

            <button
              className="register-button"
              type="submit"
              disabled={loading}
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          <p className="register-login-link">
            Already have an account? <Link to="/login">Login</Link>
          </p>
        </section>
      </main>
    </div>
  );
}

export default Register;
