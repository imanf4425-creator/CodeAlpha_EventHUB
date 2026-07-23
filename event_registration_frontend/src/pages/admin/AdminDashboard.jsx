import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import styles from '../../styles/Admin.module.css';

export default function AdminDashboard() {
  const { user, refreshUser } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // Force refresh user to get latest is_staff from DB
    if (refreshUser) refreshUser();

    api.get('/admin/stats')
      .then(({ data }) => {
        setStats(data);
        setError('');
      })
      .catch((err) => {
        const status = err.response?.status;
        if (status === 403) {
          setError('Session expired. Please log out and log back in to access admin.');
        } else {
          setError('Failed to load stats. Check that the backend is running.');
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const cards = stats ? [
    { label: 'Total Users',          value: stats.total_users,           icon: '👥', color: '#4f46e5' },
    { label: 'Organizers',           value: stats.organizers,            icon: '🎙', color: '#7c3aed' },
    { label: 'Published Events',     value: stats.published_events,      icon: '🗓', color: '#059669' },
    { label: 'Active Registrations', value: stats.active_registrations,  icon: '🎟', color: '#d97706' },
    { label: 'Pending Approvals',    value: stats.pending_events,        icon: '⏳', color: '#f59e0b' },
  ] : [];

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.heading}>⚙️ Admin Panel</h1>
          <p className={styles.sub}>Logged in as: {user?.email} · Manage users, events & registrations</p>
        </div>

        {error && (
          <div className={styles.errorBox}>
            <p>⚠ {error}</p>
          </div>
        )}

        {loading ? (
          <div className={styles.statsGrid}>
            {[...Array(5)].map((_, i) => <div key={i} className={styles.statSkeleton} />)}
          </div>
        ) : !error && (
          <div className={styles.statsGrid}>
            {cards.map((c) => (
              <div key={c.label} className={styles.statCard} style={{ borderTop: `3px solid ${c.color}` }}>
                <span className={styles.statIcon}>{c.icon}</span>
                <span className={styles.statValue}>{c.value.toLocaleString()}</span>
                <span className={styles.statLabel}>{c.label}</span>
              </div>
            ))}
          </div>
        )}

        <div className={styles.navCards}>
          <Link to="/admin/pending-events" className={styles.navCard}>
            <span className={styles.navIcon}>⏳</span>
            <div><h3>Pending Events</h3><p>Review and approve organizer events</p></div>
            <span className={styles.navArrow}>→</span>
          </Link>
          <Link to="/admin/users" className={styles.navCard}>
            <span className={styles.navIcon}>👥</span>
            <div><h3>Users</h3><p>View, promote organizers, disable accounts</p></div>
            <span className={styles.navArrow}>→</span>
          </Link>
          <Link to="/admin/users?filter=organizers" className={styles.navCard}>
            <span className={styles.navIcon}>🎙</span>
            <div><h3>Organizers</h3><p>View and manage event organizers</p></div>
            <span className={styles.navArrow}>→</span>
          </Link>
          <Link to="/admin/events" className={styles.navCard}>
            <span className={styles.navIcon}>🗓</span>
            <div><h3>Events</h3><p>View and delete any event</p></div>
            <span className={styles.navArrow}>→</span>
          </Link>
          <Link to="/admin/registrations" className={styles.navCard}>
            <span className={styles.navIcon}>🎟</span>
            <div><h3>Registrations</h3><p>View all user registrations</p></div>
            <span className={styles.navArrow}>→</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
