import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import styles from '../../styles/Admin.module.css';

function formatDate(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('en-PK', {
    weekday: 'short', day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
  });
}

export default function PendingEvents() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');

  useEffect(() => {
    fetchPendingEvents();
  }, []);

  async function fetchPendingEvents() {
    try {
      const { data } = await api.get('/admin/pending-events');
      setEvents(data);
    } catch (err) {
      console.error('Failed to fetch pending events:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleApprove(eventId) {
    if (!window.confirm('Approve this event? It will become visible to all users.')) {
      return;
    }

    setProcessing(eventId);
    try {
      await api.patch(`/admin/events/${eventId}/approve`);
      setEvents(prev => prev.filter(e => e.id !== eventId));
      alert('Event approved successfully!');
    } catch (err) {
      alert('Failed to approve event');
      console.error(err);
    } finally {
      setProcessing(null);
    }
  }

  async function handleReject(eventId) {
    setSelectedEvent(eventId);
  }

  async function submitRejection() {
    if (!rejectionReason.trim()) {
      alert('Please provide a rejection reason');
      return;
    }

    setProcessing(selectedEvent);
    try {
      await api.patch(`/admin/events/${selectedEvent}/reject`, {
        rejection_reason: rejectionReason
      });
      setEvents(prev => prev.filter(e => e.id !== selectedEvent));
      alert('Event rejected successfully!');
      setSelectedEvent(null);
      setRejectionReason('');
    } catch (err) {
      alert('Failed to reject event');
      console.error(err);
    } finally {
      setProcessing(null);
    }
  }

  if (loading) {
    return <div className={styles.status}>Loading pending events...</div>;
  }

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.header}>
          <div>
            <Link to="/admin" className={styles.backLink}>← Back to Dashboard</Link>
            <h1 className={styles.heading}>⏳ Pending Event Approvals</h1>
          </div>
        </div>

        {events.length === 0 ? (
          <div className={styles.empty}>
            <p>No pending events at the moment. All events have been reviewed!</p>
          </div>
        ) : (
          <div className={styles.pendingGrid}>
            {events.map((event) => (
              <div key={event.id} className={styles.pendingCard}>
                <div className={styles.pendingHeader}>
                  <h3 className={styles.pendingTitle}>{event.title}</h3>
                  <span className={styles.badgePending}>Pending</span>
                </div>

                <div className={styles.pendingDetails}>
                  <p><strong>Organizer:</strong> {event.organizer_name}</p>
                  <p><strong>Email:</strong> {event.organizer_email}</p>
                  <p><strong>Location:</strong> {event.location}, {event.city}</p>
                  <p><strong>Date:</strong> {formatDate(event.start_datetime)}</p>
                  <p><strong>Capacity:</strong> {event.capacity} attendees</p>
                  <p><strong>Price:</strong> {event.is_free ? 'Free' : `PKR ${event.ticket_price}`}</p>
                  {event.category_name && <p><strong>Category:</strong> {event.category_name}</p>}
                  <p><strong>Created:</strong> {formatDate(event.created_at)}</p>
                </div>

                {event.description && (
                  <div className={styles.pendingDescription}>
                    <p><strong>Description:</strong></p>
                    <p>{event.description}</p>
                  </div>
                )}

                <div className={styles.pendingActions}>
                  <button
                    onClick={() => handleReject(event.id)}
                    disabled={processing === event.id}
                    className={styles.btnReject}
                  >
                    {processing === event.id ? '...' : '❌ Reject'}
                  </button>
                  <button
                    onClick={() => handleApprove(event.id)}
                    disabled={processing === event.id}
                    className={styles.btnApprove}
                  >
                    {processing === event.id ? '...' : '✅ Approve'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Rejection Modal */}
        {selectedEvent && (
          <div className={styles.modal} onClick={() => setSelectedEvent(null)}>
            <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
              <h2 className={styles.modalTitle}>Reject Event</h2>
              <p className={styles.modalText}>Please provide a reason for rejecting this event:</p>
              <textarea
                className={styles.modalTextarea}
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="e.g., Event does not meet community guidelines, Incomplete information, etc."
                rows={4}
                autoFocus
              />
              <div className={styles.modalActions}>
                <button 
                  onClick={() => { setSelectedEvent(null); setRejectionReason(''); }}
                  className={styles.btnCancel}
                  disabled={processing}
                >
                  Cancel
                </button>
                <button 
                  onClick={submitRejection}
                  className={styles.btnReject}
                  disabled={processing}
                >
                  {processing ? '...' : 'Reject Event'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
