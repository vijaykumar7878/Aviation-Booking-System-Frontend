
import { useNavigate } from 'react-router-dom';
import './AdminHome.css';

const adminOptions = [
  {
    title: 'Create Airport',
    description: 'Add new airports and manage airport details.',
    icon: '✈',
    color: 'blue',
    path: '/admin/create-airport',
  },
  {
    title: 'Create Flight',
    description: 'Add new flights and update flight details.',
    icon: '🛫',
    color: 'teal',
    path: '/admin/create-flight',
  },
  {
    title: 'Customer Details',
    description: 'View customer information and customer IDs.',
    icon: '♟',
    color: 'purple',
    path: '/admin/customers',
  },
  {
    title: 'Cancel Flight',
    description: 'Manage flight cancellations and status.',
    icon: '⊘',
    color: 'red',
    path: '/admin/cancel-flight',
  },
  {
    title: 'View Bookings',
    description: 'Check bookings, PNRs and booking status.',
    icon: '▤',
    color: 'orange',
    path: '/admin/bookings',
  },
  {
    title: 'Reports',
    description: 'View flight and booking statistics.',
    icon: '▥',
    color: 'blue',
    path: '/admin/reports',
  },
];

function AdminHome() {
  const navigate = useNavigate();

  const handleLogout = () => {
    navigate('/admin-login');
  };

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="admin-brand">
          <span className="brand-plane">✈</span>
          <div>
            <h2>Sky<span>Booker</span></h2>
            <p>Admin Panel</p>
          </div>
        </div>

        <nav className="admin-navigation">
          <button className="admin-nav-item active"
            onClick={() => navigate('/admin-home')}>
            <span>⌂</span> Dashboard
          </button>

          <button className="admin-nav-item"
            onClick={() => navigate('/admin/create-airport')}>
            <span>✈</span> Create Airport
          </button>

          <button className="admin-nav-item"
            onClick={() => navigate('/admin/create-flight')}>
            <span>🛫</span> Create Flight
          </button>

          <button className="admin-nav-item"
            onClick={() => navigate('/admin/manage-flights')}>
            <span>☷</span> Manage Flights
          </button>

          <button className="admin-nav-item"
            onClick={() => navigate('/admin/customers')}>
            <span>♟</span> Customer Details
          </button>

          <button className="admin-nav-item"
            onClick={() => navigate('/admin/cancel-flight')}>
            <span>⊗</span> Cancel Flight
          </button>

          <button className="admin-nav-item"
            onClick={() => navigate('/admin/bookings')}>
            <span>▤</span> View Bookings
          </button>

          <button className="admin-nav-item"
            onClick={() => navigate('/admin/reports')}>
            <span>▥</span> Reports
          </button>

          <button className="admin-nav-item logout-item"
            onClick={handleLogout}>
            <span>⇥</span> Logout
          </button>
        </nav>
      </aside>

      <main className="admin-main">
        <header className="admin-topbar">
          <span>Flight Management System</span>
          <div className="admin-user">
            <span className="admin-avatar">👤</span>
            <strong>Admin</strong>
            <span>⌄</span>
          </div>
        </header>

        <section className="admin-hero">
          <div className="admin-hero-content">
            <p className="admin-eyebrow">
              SKYBOOKER ADMIN PANEL
            </p>
            <h1>Welcome, Admin!</h1>
            <p className="admin-intro">
              Manage flights, airports, customers and bookings —
              <br className="desktop-break" />
              all from one place.
            </p>
          </div>
        </section>

        <section className="admin-content">
          <div className="admin-section-heading">
            <div>
              <h2>Quick Actions</h2>
              <p>Choose an option to manage your airline system.</p>
            </div>
          </div>

          <div className="admin-card-grid">
            {adminOptions.map((option) => (
              <button
                className="admin-action-card"
                key={option.title}
                onClick={() => navigate(option.path)}
              >
                <span className={`admin-card-icon ${option.color}`}>
                  {option.icon}
                </span>

                <h3>{option.title}</h3>
                <p>{option.description}</p>

                <span className="admin-card-arrow">→</span>
              </button>
            ))}
          </div>

          <footer className="admin-footer">
            SkyBooker <span>•</span> Flight Management System
          </footer>
        </section>
      </main>
    </div>
  );
}

export default AdminHome;
