
import { useRef, useState, useEffect } from 'react';
import './Home.css';
import { useNavigate } from 'react-router-dom';


function Home() {
  const navigate = useNavigate();

  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(
    localStorage.getItem('skybookerLogin') === 'true'
  );
  const [userEmail, setUserEmail] = useState(
    localStorage.getItem('skybookerEmail') || ''
  );

  const menuTimer = useRef(null);

  // Refresh login status when returning to the Home page.
  useEffect(() => {
    const updateLoginStatus = () => {
      setIsLoggedIn(localStorage.getItem('skybookerLogin') === 'true');
      setUserEmail(localStorage.getItem('skybookerEmail') || '');
    };

    window.addEventListener('storage', updateLoginStatus);
    window.addEventListener('focus', updateLoginStatus);

    return () => {
      window.removeEventListener('storage', updateLoginStatus);
      window.removeEventListener('focus', updateLoginStatus);
      clearTimeout(menuTimer.current);
    };
  }, []);

  const handleMenuEnter = () => {
    clearTimeout(menuTimer.current);
    setMenuOpen(true);
  };

  const handleMenuLeave = () => {
    menuTimer.current = setTimeout(() => {
      setMenuOpen(false);
    }, 290);
  };

  const handleLogout = () => {
    localStorage.removeItem('skybookerLogin');
    localStorage.removeItem('skybookerEmail');
    localStorage.removeItem('skybookerCustomer');

    setIsLoggedIn(false);
    setUserEmail('');
    setProfileOpen(false);
    setMenuOpen(false);

    navigate('/');
  };

  return (
    <div className="home">
      <div className="home-overlay"></div>

      {/* Navbar */}
      <nav className="navbar">
        <div className="logo">
          <span className="logo-icon">✈</span>
          <span>Sky</span>Booker
        </div>

        <div className="home-nav-actions">
          {/* Main menu */}
          <div
            className="menu-container"
            onMouseEnter={handleMenuEnter}
            onMouseLeave={handleMenuLeave}
          >
            <button
              className="menu-button"
              onClick={() => setMenuOpen((open) => !open)}
              aria-label="Open navigation menu"
              aria-expanded={menuOpen}
            >
              ☰
            </button>

            {menuOpen && (
              <div className="dropdown-menu">
                <button
                  className="search-button"
                  onClick={() => navigate('/search-flights')}
                >
                  <span>✈</span>
                  Search Flights
                </button>

                {!isLoggedIn && (
                  <>
                    <button onClick={() => navigate('/login')}>
                      <span>→</span>
                      Login
                    </button>

                    <button onClick={() => navigate('/register')}>
                      <span>+</span>
                      Register
                    </button>
                  </>
                )}

                <button onClick={() => navigate('/admin-login')}>
                  <span>⚙</span>
                  Admin Login
                </button>
              </div>
            )}
          </div>

          {/* Profile menu: only visible after login */}
          {isLoggedIn && (
            <div className="profile-container">
              <button
                className="profile-button"
                onClick={() => setProfileOpen((open) => !open)}
                aria-label="Open account profile"
                aria-expanded={profileOpen}
              >
                <span className="profile-avatar">👤</span>
                <span className="profile-button-text"></span>
                <span></span>
              </button>

              {profileOpen && (
                <div className="profile-dropdown">
                  <div className="profile-heading">
                    <div className="profile-avatar profile-avatar-large">
                      👤
                    </div>
                    <div className="profile-heading-text">
                      <strong>My Account</strong>
                      <span>Welcome to SkyBooker</span>
                    </div>
                  </div>

                  <div className="profile-details">
                    <small>EMAIL OR PHONE</small>
                    <p>{userEmail || 'Not available'}</p>
                  </div>

                  <button
                    className="profile-menu-item"
                    onClick={() => {
                      setProfileOpen(false);
                      navigate('/search-flights');
                    }}
                  >
                    ✈ &nbsp; Search Flights
                  </button>
                                    
                  <button
                    className="profile-menu-item"
                    onClick={() => {
                      setProfileOpen(false);
                      navigate('/my-tickets');
                    }}
                  >
                    🎫 &nbsp; My Bookings
                  </button>

                  <button
                    className="profile-menu-item logout-button"
                    onClick={handleLogout}
                  >
                    ↪ &nbsp; Logout
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </nav>

      {/* Hero Content */}
      <main className="hero">
        <div className="hero-content">
          <div className="small-title">
            ✦ YOUR JOURNEY STARTS HERE
          </div>

          <h1>
            Book Your
            <br />
            <span>Next Flight</span>
          </h1>

          <p>
            Explore the world with ease.
            <br />
            Find the perfect flight and start your next adventure.
          </p>

          <button
            className="search-button"
            onClick={() => navigate('/search-flights')}
          >
            Search Flights
            <span>→</span>
          </button>
        </div>
      </main>

      {/* Bottom features */}
      <div className="features">
        <div className="feature">
          <span>✦</span>
          <div>
            <strong>Best Prices</strong>
            <small>Great deals on flights</small>
          </div>
        </div>

        <div className="feature">
          <span>✓</span>
          <div>
            <strong>Safe & Secure</strong>
            <small>Your booking is protected</small>
          </div>
        </div>

        <div className="feature">
          <span>◷</span>
          <div>
            <strong>24/7 Support</strong>
            <small>We're here when you need us</small>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;
