import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import styles from '../styles/Navbar.module.css';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  function handleLogout() {
    logout();
    navigate('/select-role');
    setMenuOpen(false);
  }

  function isActive(path) {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  }

  // Admin sees completely different navbar
  if (user?.is_staff) {
    return (
      <nav className={styles.navbar}>
        <div className={styles.container}>
          <Link to="/admin" className={styles.brand}>⚙️ EventHub Admin</Link>
          <div className={styles.navLinks}>
            <Link to="/admin" className={`${styles.link} ${isActive('/admin') && location.pathname === '/admin' ? styles.active : ''}`}>Dashboard</Link>
            <Link to="/admin/pending-events" className={`${styles.link} ${isActive('/admin/pending-events') ? styles.active : ''}`}>Pending</Link>
            <Link to="/home" className={`${styles.link} ${location.pathname === '/home' ? styles.active : ''}`}>Events</Link>
            <Link to="/global-events" className={`${styles.link} ${isActive('/global-events') ? styles.active : ''}`}>🌍 Global</Link>
            <Link to="/live-sports" className={`${styles.link} ${isActive('/live-sports') ? styles.active : ''}`}>⚽ Sports</Link>
            <span className={styles.divider} />
            <Link to="/admin/users" className={`${styles.link} ${isActive('/admin/users') ? styles.active : ''}`}>Users</Link>
            <Link to="/admin/profile" className={`${styles.link} ${isActive('/admin/profile') ? styles.active : ''}`}>Profile</Link>
            <button onClick={handleLogout} className={styles.btnLogout}>Logout</button>
          </div>
          <button className={styles.hamburger} onClick={() => setMenuOpen(v => !v)}>{menuOpen ? '✕' : '☰'}</button>
        </div>
        {menuOpen && (
          <div className={styles.mobileMenu}>
            <Link to="/admin" className={styles.mobileLink} onClick={() => setMenuOpen(false)}>Dashboard</Link>
            <Link to="/admin/pending-events" className={styles.mobileLink} onClick={() => setMenuOpen(false)}>Pending</Link>
            <Link to="/home" className={styles.mobileLink} onClick={() => setMenuOpen(false)}>Events</Link>
            <Link to="/global-events" className={styles.mobileLink} onClick={() => setMenuOpen(false)}>🌍 Global Events</Link>
            <Link to="/live-sports" className={styles.mobileLink} onClick={() => setMenuOpen(false)}>⚽ Live Sports</Link>
            <Link to="/sports-calendar" className={styles.mobileLink} onClick={() => setMenuOpen(false)}>📅 Calendar</Link>
            <Link to="/admin/users" className={styles.mobileLink} onClick={() => setMenuOpen(false)}>Users</Link>
            <Link to="/admin/events" className={styles.mobileLink} onClick={() => setMenuOpen(false)}>All Events</Link>
            <Link to="/admin/registrations" className={styles.mobileLink} onClick={() => setMenuOpen(false)}>Registrations</Link>
            <Link to="/admin/profile" className={styles.mobileLink} onClick={() => setMenuOpen(false)}>Profile</Link>
            <button onClick={handleLogout} className={styles.mobileLogout}>Logout</button>
          </div>
        )}
      </nav>
    );
  }

  // Regular user / organizer navbar
  return (
    <nav className={styles.navbar}>
      <div className={styles.container}>
        <Link to="/" className={styles.brand}>🎟 EventHub</Link>
        <div className={styles.navLinks}>
          {/* Only show navigation when user is logged in */}
          {user && (
            <>
              {/* Show browse events only for non-organizers */}
              {!user.is_organizer && (
                <>
                  <Link to="/home" className={`${styles.link} ${location.pathname === '/home' ? styles.active : ''}`}>Events</Link>
                  <Link to="/global-events" className={`${styles.link} ${isActive('/global-events') ? styles.active : ''}`}>🌍 Global</Link>
                  <Link to="/live-sports" className={`${styles.link} ${isActive('/live-sports') ? styles.active : ''}`}>⚽ Sports</Link>
                  <Link to="/sports-calendar" className={`${styles.link} ${isActive('/sports-calendar') ? styles.active : ''}`}>📅 Calendar</Link>
                  <span className={styles.divider} />
                </>
              )}
              
              {/* Organizer-only links */}
              {user.is_organizer && (
                <>
                  <Link to="/organizer" className={`${styles.link} ${isActive('/organizer') && location.pathname === '/organizer' ? styles.active : ''}`}>Dashboard</Link>
                  <Link to="/organizer/events" className={`${styles.link} ${isActive('/organizer/events') ? styles.active : ''}`}>My Events</Link>
                  <Link to="/organizer/analytics" className={`${styles.link} ${isActive('/organizer/analytics') ? styles.active : ''}`}>Analytics</Link>
                  <Link to="/organizer/verifications" className={`${styles.link} ${isActive('/organizer/verifications') ? styles.active : ''}`}>Verify</Link>
                  <span className={styles.divider} />
                </>
              )}
              
              {/* Common links for all users */}
              {!user.is_organizer && (
                <Link to="/dashboard" className={`${styles.link} ${isActive('/dashboard') ? styles.active : ''}`}>My Dashboard</Link>
              )}
              <Link to="/profile" className={`${styles.link} ${isActive('/profile') ? styles.active : ''}`}>{user.first_name}</Link>
              <button onClick={handleLogout} className={styles.btnLogout}>Logout</button>
            </>
          )}
        </div>
        <button className={styles.hamburger} onClick={() => setMenuOpen(v => !v)}>{menuOpen ? '✕' : '☰'}</button>
      </div>
      {menuOpen && user && (
        <div className={styles.mobileMenu}>
          {!user.is_organizer && (
            <>
              <Link to="/home" className={styles.mobileLink} onClick={() => setMenuOpen(false)}>Events</Link>
              <Link to="/global-events" className={styles.mobileLink} onClick={() => setMenuOpen(false)}>🌍 Global Events</Link>
              <Link to="/live-sports" className={styles.mobileLink} onClick={() => setMenuOpen(false)}>⚽ Live Sports</Link>
              <Link to="/sports-calendar" className={styles.mobileLink} onClick={() => setMenuOpen(false)}>📅 Calendar</Link>
              <Link to="/dashboard" className={styles.mobileLink} onClick={() => setMenuOpen(false)}>My Dashboard</Link>
            </>
          )}
          {user.is_organizer && (
            <>
              <Link to="/organizer" className={styles.mobileLink} onClick={() => setMenuOpen(false)}>Dashboard</Link>
              <Link to="/organizer/events" className={styles.mobileLink} onClick={() => setMenuOpen(false)}>My Events</Link>
              <Link to="/organizer/analytics" className={styles.mobileLink} onClick={() => setMenuOpen(false)}>Analytics</Link>
              <Link to="/organizer/verifications" className={styles.mobileLink} onClick={() => setMenuOpen(false)}>Verify</Link>
            </>
          )}
          <Link to="/profile" className={styles.mobileLink} onClick={() => setMenuOpen(false)}>Profile</Link>
          <button onClick={handleLogout} className={styles.mobileLogout}>Logout</button>
        </div>
      )}
    </nav>
  );
}
