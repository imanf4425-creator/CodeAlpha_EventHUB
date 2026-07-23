import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import styles from '../../styles/Organizer.module.css';

function formatDate(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('en-PK', {
    weekday: 'short', day: 'numeric', month: 'short', year: 'numeric',
  });
}

export default function MyEvents() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deletingId, setDeletingId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/organizer/events')
      .then(({ data }) => setEvents(data))
      .catch(() => setError('Failed to load events.'))
      .finally(() => setLoading(false));
  }, []);

  async function handleDelete(id) {
    if (!window.confirm('Delete this event? This cannot be undone.')) return;
    setDeletingId(id);
    try {
      await api.delete(`/organizer/events/${id}`);
      setEvents((prev) => prev.filter((e) => e.id !== id));
    } catch {
      alert('Failed to delete event.');
    } finally {
      setDeletingId(null);
    }
  }

  if (loading) return <div className={styles.status}>Loading your events...</div>;
  if (error) return <div className={styles.status}>{error}</div>;

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.dashHeader}>
          <div>
            <Link to="/organizer" className={styles.backLink}>← Back to Dashboard</Link>
            <h1 className={styles.heading}>My Events</h1>
          </div>
          <Link to="/organizer/events/new" className={styles.btnCreate}>+ Create New Event</Link>
        </div>

        {events.length === 0 ? (
          <div className={styles.empty}>
            <p style={{ marginBottom: '1rem' }}>You haven't created any events yet.</p>
            <Link to="/organizer/events/new" className={styles.btnCreate}>
              Create your first event
            </Link>
          </div>
        ) : (
          <div className={styles.grid}>
            {events.map((event) => (
              <div key={event.id} className={styles.card}>
                <div className={styles.cardTop}>
                  <h3 className={styles.cardTitle}>{event.title}</h3>
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <span className={event.is_published ? styles.badgePublished : styles.badgeDraft}>
                      {event.is_published ? 'Published' : 'Draft'}
                    </span>
                    {event.approval_status === 'pending' && (
                      <span className={styles.badgePending}>Pending Approval</span>
                    )}
                    {event.approval_status === 'approved' && (
                      <span className={styles.badgeApproved}>Approved</span>
                    )}
                    {event.approval_status === 'rejected' && (
                      <span className={styles.badgeRejected}>Rejected</span>
                    )}
                  </div>
                </div>
                {event.approval_status === 'rejected' && event.rejection_reason && (
                  <div className={styles.rejectionNotice}>
                    <p><strong>❌ Rejection Reason:</strong> {event.rejection_reason}</p>
                  </div>
                )}
                <p className={styles.cardLocation}>📍 {event.location || event.city}</p>
                <p className={styles.cardDate}>🗓 {formatDate(event.start_datetime)}</p>
                <div className={styles.cardStats}>
                  <span>Capacity: {event.capacity}</span>
                  <span style={{ color: Number(event.available_spots) === 0 ? '#f87171' : '#4ade80' }}>
                    {event.available_spots} spots left
                  </span>
                </div>
                <div className={styles.cardActions}>
                  <button
                    onClick={() => navigate(`/organizer/events/${event.id}/edit`)}
                    className={styles.btnEdit}
                  >
                    ✏️ Edit
                  </button>
                  <button
                    onClick={() => handleDelete(event.id)}
                    disabled={deletingId === event.id}
                    className={styles.btnDelete}
                  >
                    {deletingId === event.id ? '...' : '🗑 Delete'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
