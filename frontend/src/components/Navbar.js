import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const roleLinks = {
    user: [
      { to: '/search', label: 'Find Parking' },
      { to: '/my-bookings', label: 'Bookings' },
      { to: '/profile', label: 'Profile' }
    ],
    owner: [
      { to: '/owner', label: 'Find Parking' },
      { to: '/owner/profile', label: 'Profile' },
      { to: '/owner/add', label: 'Add Parking' },
      { to: '/owner/requests', label: 'Requests' }
    ],
    admin: [
      { to: '/admin', label: 'Find Parking' },
      { to: '/admin/approve', label: 'Admin' }
    ]
  };

  const links = roleLinks[user?.role] || [];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="app-navbar" style={styles.nav}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');

        @media (max-width: 900px) {
          .app-navbar {
            padding: 12px 16px !important;
            flex-direction: column;
            align-items: flex-start !important;
            gap: 12px;
          }

          .app-navbar-links {
            width: 100%;
            justify-content: flex-start;
          }

          .app-navbar-role {
            margin-left: 0 !important;
            padding-left: 0 !important;
            border-left: none !important;
          }
        }

        @media (max-width: 640px) {
          .app-navbar-links {
            flex-direction: column;
            align-items: stretch;
          }

          .app-navbar-links .nav-link-item,
          .app-navbar-links .logout-btn {
            width: 100%;
            box-sizing: border-box;
          }
        }

        .nav-link-item:hover {
          background: #f5f3ff;
          color: #5b21b6 !important;
        }

        .logout-btn:hover {
          background: #ede9fe;
          border-color: #6d28d9;
          color: #5b21b6;
          transform: translateY(-1px);
        }
      `}</style>

      <div style={styles.brandWrap}>
        <div style={styles.brandIcon}>P</div>
        <span style={styles.logo}>PARKHUB</span>
      </div>

      <div className="app-navbar-links" style={styles.linksWrap}>
        {links.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className="nav-link-item"
            style={({ isActive }) => ({
              ...styles.link,
              color: isActive ? '#4c1d95' : '#4b5563',
              background: isActive ? '#f5f3ff' : 'transparent'
            })}
          >
            {item.label}
          </NavLink>
        ))}

        {user && (
          <>
            <div className="app-navbar-role" style={styles.roleWrap}>
              <span style={styles.roleLabel}>{(user.role || 'user').toUpperCase()}</span>
              <span style={styles.userName}>{user.name || 'User'}</span>
            </div>

            <button onClick={handleLogout} style={styles.logoutBtn} className="logout-btn">
              Logout
            </button>
          </>
        )}
      </div>
    </nav>
  );
};

const styles = {
  nav: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '14px clamp(16px, 2.5vw, 34px)',
    background: '#ffffff',
    borderBottom: '1px solid #e5e7eb',
    color: '#111827',
    boxShadow: '0 8px 24px rgba(15, 23, 42, 0.06)',
    position: 'sticky',
    top: 0,
    zIndex: 30,
    fontFamily: 'Inter, Poppins, Segoe UI, sans-serif'
  },
  brandWrap: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    flexShrink: 0
  },
  brandIcon: {
    width: '36px',
    height: '36px',
    borderRadius: '8px',
    background: 'linear-gradient(135deg, #7c3aed 0%, #8b5cf6 100%)',
    color: '#fff',
    display: 'grid',
    placeItems: 'center',
    fontWeight: '800',
    fontSize: '20px',
    boxShadow: '0 2px 8px rgba(124, 58, 237, 0.3)'
  },
  logo: {
    fontSize: '20px',
    fontWeight: '900',
    letterSpacing: '-0.03em',
    lineHeight: 1,
    color: '#111827'
  },
  linksWrap: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    flexWrap: 'wrap',
    justifyContent: 'flex-end'
  },
  link: {
    textDecoration: 'none',
    fontSize: '16px',
    fontWeight: '700',
    padding: '9px 14px',
    borderRadius: '10px',
    transition: 'all 0.2s'
  },
  roleWrap: {
    marginLeft: '14px',
    paddingLeft: '14px',
    borderLeft: '1px solid #e5e7eb',
    display: 'flex',
    alignItems: 'center',
    gap: '10px'
  },
  roleLabel: {
    fontSize: '10px',
    letterSpacing: '1px',
    color: '#7c3aed',
    fontWeight: '700',
    background: 'rgba(124, 58, 237, 0.1)',
    padding: '4px 10px',
    borderRadius: '6px'
  },
  userName: {
    fontSize: '15px',
    color: '#111827',
    fontWeight: '700'
  },
  logoutBtn: {
    background: '#ffffff',
    color: '#7c3aed',
    border: '1.5px solid #7c3aed',
    padding: '9px 18px',
    borderRadius: '10px',
    cursor: 'pointer',
    marginLeft: '8px',
    fontSize: '14px',
    fontWeight: '700',
    transition: 'all 0.2s'
  }
};

export default Navbar;