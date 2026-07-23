import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';
import styles from '../../styles/UserDashboard.module.css';

function formatDate(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('en-PK', {
    weekday: 'short', day: 'numeric', month: 'short', year: 'numeric',
  });
}

export default function UserDashboard() {
  const { user } = useAuth();
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState(null);

  useEffect(() => {
    api.get('/registrations')
      .then(({ data }) => setRegistrations(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const active    = registrations.filter((r) => r.status === 'active');
  const cancelled = registrations.filter((r) => r.status === 'cancelled');

  async function handleCancel(id) {
    if (!window.confirm('Cancel this registration?')) return;
    setCancellingId(id);
    try {
      await api.patch(`/registrations/${id}/cancel`);
      setRegistrations((prev) =>
        prev.map((r) => r.id === id ? { ...r, status: 'cancelled' } : r)
      );
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to cancel.');
    } finally {
      setCancellingId(null);
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.container}>

        {/* Welcome header */}
        <div className={styles.welcomeCard}>
          <div className={styles.avatar}>{user?.first_name?.[0]}{user?.last_name?.[0]}</div>
          <div>
            <h1 className={styles.welcomeTitle}>Welcome, {user?.first_name}!</h1>
            <p className={styles.welcomeSub}>{user?.email}</p>
            {user?.is_organizer && <span className={styles.orgBadge}>🎙 Organizer</span>}
          </div>
        </div>

        {/* Stats */}
        <div className={styles.statsRow}>
          <div className={styles.statBox}>
            <span className={styles.statNum}>{active.length}</span>
            <span className={styles.statLabel}>Active Registrations</span>
          </div>
          <div className={styles.statBox}>
            <span className={styles.statNum}>{cancelled.length}</span>
            <span className={styles.statLabel}>Cancelled</span>
          </div>
          <div className={styles.statBox}>
            <span className={styles.statNum}>{registrations.length}</span>
            <span className={styles.statLabel}>Total Events Joined</span>
          </div>
        </div>

        {/* Quick links */}
        <div className={styles.quickLinks}>
          <Link to="/home" className={styles.quickLink}>
            <span>🗓</span><span>Browse Events</span>
          </Link>
          <Link to="/global-events" className={styles.quickLink}>
            <span>🌍</span><span>Global Events</span>
          </Link>
          <Link to="/live-sports" className={styles.quickLink}>
            <span>⚽</span><span>Live Sports</span>
          </Link>
          <Link to="/profile" className={styles.quickLink}>
            <span>👤</span><span>My Profile</span>
          </Link>
          {user?.is_organizer && (
            <Link to="/organizer" className={styles.quickLink}>
              <span>🎙</span><span>My Events</span>
            </Link>
          )}
        </div>

        {/* Active Registrations */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>
            My Active Registrations <span className={styles.count}>{active.length}</span>
          </h2>

          {loading && <p className={styles.msg}>Loading your registrations...</p>}

          {!loading && active.length === 0 && (
            <div className={styles.emptyBox}>
              <p>No active registrations yet.</p>
              <Link to="/home" className={styles.browseBtn}>Browse Events →</Link>
            </div>
          )}

          <div className={styles.cardGrid}>
            {active.map((reg) => (
              <div key={reg.id} className={styles.regCard}>
                <div className={styles.regHeader}>
                  <h3 className={styles.regTitle}>{reg.event.title}</h3>
                  <span className={styles.badgeActive}>Active</span>
                </div>
                <p className={styles.regMeta}>📍 {reg.event.location || reg.event.city}</p>
                <p className={styles.regMeta}>🗓 {formatDate(reg.event.start_datetime)}</p>
                {!reg.event.is_free && (
                  <p className={styles.regMeta}>💰 {reg.event.currency} {Number(reg.event.ticket_price).toLocaleString()}</p>
                )}
                {reg.event.is_free && <p className={styles.regMeta}>🆓 Free Event</p>}
                <p className={styles.regDate}>Registered: {formatDate(reg.registered_at)}</p>
                {reg.notes && <p className={styles.notes}>Note: {reg.notes}</p>}
                <button
                  onClick={() => handleCancel(reg.id)}
                  disabled={cancellingId === reg.id}
                  className={styles.cancelBtn}
                >
                  {cancellingId === reg.id ? 'Cancelling...' : 'Cancel Registration'}
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* Cancelled */}
        {cancelled.length > 0 && (
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>
              Cancelled Registrations <span className={styles.count}>{cancelled.length}</span>
            </h2>
            <div className={styles.cardGrid}>
              {cancelled.map((reg) => (
                <div key={reg.id} className={`${styles.regCard} ${styles.regCardCancelled}`}>
                  <div className={styles.regHeader}>
                    <h3 className={styles.regTitle}>{reg.event.title}</h3>
                    <span className={styles.badgeCancelled}>Cancelled</span>
                  </div>
                  <p className={styles.regMeta}>📍 {reg.event.location || reg.event.city}</p>
                  <p className={styles.regMeta}>🗓 {formatDate(reg.event.start_datetime)}</p>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
