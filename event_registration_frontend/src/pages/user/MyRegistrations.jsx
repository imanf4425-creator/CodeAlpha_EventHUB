import { useState, useEffect } from 'react';
import api from '../../api/axios';
import styles from '../../styles/MyRegistrations.module.css';

function formatDate(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
}

const PAGE_SIZE = 10;

export default function MyRegistrations() {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cancellingId, setCancellingId] = useState(null);
  const [page, setPage] = useState(0);

  useEffect(() => {
    api.get('/registrations')
      .then(({ data }) => setRegistrations(data))
      .catch(() => setError('Failed to load registrations.'))
      .finally(() => setLoading(false));
  }, []);

  async function handleCancel(id) {
    if (!window.confirm('Are you sure you want to cancel this registration?')) return;
    setCancellingId(id);
    try {
      const { data } = await api.patch(`/registrations/${id}/cancel`);
      setRegistrations((prev) =>
        prev.map((r) => r.id === id ? { ...r, status: data.status } : r)
      );
    } catch (err) {
      const msg = err.response?.data?.detail || 'Failed to cancel registration.';
      alert(msg);
    } finally {
      setCancellingId(null);
    }
  }

  if (loading) return <div className={styles.status}>Loading...</div>;
  if (error) return <div className={styles.status}>{error}</div>;

  const active = registrations.filter((r) => r.status === 'active');
  const cancelled = registrations.filter((r) => r.status === 'cancelled');
  const totalPages = Math.ceil(active.length / PAGE_SIZE);
  const paginated = active.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.heading}>
          <h1>My Registrations</h1>
          <span className={styles.countBadge}>{active.length} active · {cancelled.length} cancelled</span>
        </div>

        {registrations.length === 0 ? (
          <div className={styles.empty}><p>You have no registrations yet.</p></div>
        ) : (
          <>
            {active.length > 0 && (
              <>
                <h2 className={styles.sectionTitle}>Active ({active.length})</h2>
                <div className={styles.list}>
                  {paginated.map((reg) => (
                    <div key={reg.id} className={styles.card}>
                      <div className={styles.cardLeft}>
                        <h3 className={styles.eventTitle}>{reg.event.title}</h3>
                        <p className={styles.location}>📍 {reg.event.location}</p>
                        <p className={styles.date}>🗓 {formatDate(reg.event.start_datetime)}</p>
                        <p className={styles.registered}>Registered: {formatDate(reg.registered_at)}</p>
                      </div>
                      <div className={styles.cardRight}>
                        <span className={styles.badgeActive}>active</span>
                        <button
                          onClick={() => handleCancel(reg.id)}
                          disabled={cancellingId === reg.id}
                          className={styles.btnCancel}
                        >
                          {cancellingId === reg.id ? 'Cancelling...' : 'Cancel'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                {totalPages > 1 && (
                  <div className={styles.pagination}>
                    <button onClick={() => setPage((p) => Math.max(0, p - 1))} disabled={page === 0} className={styles.pageBtn}>← Prev</button>
                    <span>Page {page + 1} / {totalPages}</span>
                    <button onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1} className={styles.pageBtn}>Next →</button>
                  </div>
                )}
              </>
            )}

            {cancelled.length > 0 && (
              <>
                <h2 className={styles.sectionTitle} style={{ marginTop: '2rem' }}>Cancelled ({cancelled.length})</h2>
                <div className={styles.list}>
                  {cancelled.map((reg) => (
                    <div key={reg.id} className={`${styles.card} ${styles.cardCancelled}`}>
                      <div className={styles.cardLeft}>
                        <h3 className={styles.eventTitle}>{reg.event.title}</h3>
                        <p className={styles.location}>📍 {reg.event.location}</p>
                        <p className={styles.date}>🗓 {formatDate(reg.event.start_datetime)}</p>
                      </div>
                      <div className={styles.cardRight}>
                        <span className={styles.badgeCancelled}>cancelled</span>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
