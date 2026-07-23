import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/axios';
import socket from '../socket';
import { useAuth } from '../context/AuthContext';
import styles from '../styles/EventDetail.module.css';

function formatDate(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleString('en-PK', {
    weekday: 'long', day: 'numeric', month: 'long',
    year: 'numeric', hour: '2-digit', minute: '2-digit',
  });
}

function extractError(err) {
  const d = err.response?.data;
  if (!d) return 'Something went wrong.';
  if (d.detail) return d.detail;
  if (Array.isArray(d.errors)) return d.errors.join(' ');
  return 'Something went wrong.';
}

export default function EventDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);
  const [registered, setRegistered] = useState(false);
  const [error, setError] = useState('');
  const [regError, setRegError] = useState('');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentProof, setPaymentProof] = useState(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    api.get(`/events/${id}`)
      .then(({ data }) => setEvent(data))
      .catch(() => setError('Event not found.'))
      .finally(() => setLoading(false));
  }, [id]);

  // Real-time: update spots when someone else registers/cancels
  useEffect(() => {
    function onSpotsUpdated({ id: eid, available_spots, is_full }) {
      if (Number(eid) === Number(id)) {
        setEvent((prev) => prev ? { ...prev, available_spots, is_full } : prev);
      }
    }
    function onEventUpdated(updated) {
      if (Number(updated.id) === Number(id)) {
        setEvent((prev) => prev ? { ...prev, ...updated } : prev);
      }
    }
    socket.on('event:spots_updated', onSpotsUpdated);
    socket.on('event:updated', onEventUpdated);
    return () => {
      socket.off('event:spots_updated', onSpotsUpdated);
      socket.off('event:updated', onEventUpdated);
    };
  }, [id]);

  async function handleRegister() {
    const isFree = !event.ticket_price || Number(event.ticket_price) === 0;
    
    // If paid event, show payment modal first
    if (!isFree) {
      setShowPaymentModal(true);
      return;
    }
    
    // Free event - register directly
    setRegistering(true);
    setRegError('');
    try {
      await api.post('/registrations', { event_id: Number(id) });
      setRegistered(true);
      setEvent((prev) => prev ? {
        ...prev,
        available_spots: Math.max(0, Number(prev.available_spots) - 1),
        is_full: Number(prev.available_spots) - 1 <= 0,
      } : prev);
    } catch (err) {
      setRegError(extractError(err));
    } finally {
      setRegistering(false);
    }
  }

  async function handlePaymentSubmit() {
    if (!paymentProof) {
      setRegError('Please upload payment proof screenshot');
      return;
    }

    setUploading(true);
    setRegError('');
    
    try {
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('event_id', id);
      formData.append('payment_proof', paymentProof);

      await api.post('/registrations', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      setRegistered(true);
      setShowPaymentModal(false);
      setEvent((prev) => prev ? {
        ...prev,
        available_spots: Math.max(0, Number(prev.available_spots) - 1),
        is_full: Number(prev.available_spots) - 1 <= 0,
      } : prev);
    } catch (err) {
      setRegError(extractError(err));
    } finally {
      setUploading(false);
    }
  }

  function handleFileChange(e) {
    const file = e.target.files[0];
    if (file) {
      // Validate file type and size
      if (!file.type.startsWith('image/')) {
        setRegError('Please upload an image file');
        return;
      }
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setRegError('File size must be less than 5MB');
        return;
      }
      setPaymentProof(file);
      setRegError('');
    }
  }

  if (loading) return <div className={styles.status}>Loading...</div>;
  if (error) return <div className={styles.status}>{error}</div>;
  if (!event) return null;

  const spotsLeft = Number(event.available_spots);

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <Link to="/home" className={styles.back}>← Back to Events</Link>

        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h1 className={styles.title}>{event.title}</h1>
            {event.is_full
              ? <span className={styles.badgeFull}>Fully Booked</span>
              : spotsLeft <= 5
                ? <span className={styles.badgeUrgent}>Only {spotsLeft} spots left!</span>
                : <span className={styles.badgeOpen}>{spotsLeft} spots available</span>
            }
          </div>

          <div className={styles.meta}>
            <div className={styles.metaItem}>
              <span className={styles.metaLabel}>📍 Location</span>
              <span>{event.location}</span>
            </div>
            <div className={styles.metaItem}>
              <span className={styles.metaLabel}>💳 Ticket Price</span>
              <span style={{ fontWeight: 600, color: event.ticket_price > 0 ? '#f59e0b' : '#10b981' }}>
                {event.ticket_price > 0 ? `Rs. ${Number(event.ticket_price).toLocaleString()}` : 'FREE'}
              </span>
            </div>
            <div className={styles.metaItem}>
              <span className={styles.metaLabel}>🗓 Starts</span>
              <span>{formatDate(event.start_datetime)}</span>
            </div>
            <div className={styles.metaItem}>
              <span className={styles.metaLabel}>🏁 Ends</span>
              <span>{formatDate(event.end_datetime)}</span>
            </div>
            <div className={styles.metaItem}>
              <span className={styles.metaLabel}>👥 Capacity</span>
              <span>{event.capacity} total · {spotsLeft} remaining</span>
            </div>
            <div className={styles.metaItem}>
              <span className={styles.metaLabel}>🎙 Organizer</span>
              <span>{event.organizer?.name}</span>
            </div>
            <div className={styles.metaItem}>
              <span className={styles.metaLabel}>✉ Contact</span>
              <span>{event.organizer?.email}</span>
            </div>
          </div>

          {/* Capacity bar */}
          <div className={styles.capacityBar}>
            <div className={styles.capacityFill}
              style={{ width: `${Math.min(100, ((event.capacity - spotsLeft) / event.capacity) * 100)}%` }}
            />
          </div>
          <p className={styles.capacityText}>
            {event.capacity - spotsLeft} / {event.capacity} registered
          </p>

          {event.description && (
            <div className={styles.description}>
              <h3>About this event</h3>
              <p>{event.description}</p>
            </div>
          )}

          <div className={styles.actions}>
            {!user && (
              <p className={styles.hint}>
                <Link to="/login">Log in</Link> to register for this event.
              </p>
            )}
            {user && registered && (
              <p className={styles.success}>✅ You are registered for this event!</p>
            )}
            {user && !registered && !event.is_full && (
              <button onClick={handleRegister} disabled={registering} className={styles.btnRegister}>
                {registering ? 'Registering...' : '🎟 Register for this Event'}
              </button>
            )}
            {user && !registered && event.is_full && (
              <p className={styles.fullMsg}>❌ This event is fully booked.</p>
            )}
            {regError && <p className={styles.regError}>{regError}</p>}
          </div>
        </div>

        {/* Payment Modal */}
        {showPaymentModal && event.ticket_price > 0 && (
          <div className={styles.modalOverlay} onClick={() => setShowPaymentModal(false)}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
              <div className={styles.modalHeader}>
                <h2>💳 Payment Details</h2>
                <button onClick={() => setShowPaymentModal(false)} className={styles.modalClose}>✕</button>
              </div>

              <div className={styles.modalBody}>
                <div className={styles.priceBox}>
                  <span>Ticket Price:</span>
                  <strong>Rs. {Number(event.ticket_price).toLocaleString()}</strong>
                </div>

                {event.payment_details && (
                  <div className={styles.paymentInfo}>
                    <h3>Transfer payment to:</h3>
                    
                    {(event.payment_method === 'bank_transfer' || event.payment_method === 'both') && 
                     event.payment_details.bank_name && (
                      <div className={styles.paymentMethod}>
                        <h4>🏦 Bank Transfer</h4>
                        <p><strong>Bank:</strong> {event.payment_details.bank_name}</p>
                        <p><strong>Account Number:</strong> {event.payment_details.account_number}</p>
                        <p><strong>Account Title:</strong> {event.payment_details.account_title}</p>
                      </div>
                    )}

                    {(event.payment_method === 'mobile_wallet' || event.payment_method === 'both') && 
                     event.payment_details.mobile_wallet && (
                      <div className={styles.paymentMethod}>
                        <h4>📱 Mobile Wallet</h4>
                        <p><strong>Wallet:</strong> {event.payment_details.mobile_wallet}</p>
                        <p><strong>Number:</strong> {event.payment_details.wallet_number}</p>
                      </div>
                    )}
                  </div>
                )}

                <div className={styles.uploadSection}>
                  <h3>Upload Payment Proof</h3>
                  <p style={{ fontSize: '14px', color: '#94a3b8', marginBottom: '1rem' }}>
                    Take a screenshot of your payment receipt and upload it here
                  </p>
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleFileChange}
                    className={styles.fileInput}
                  />
                  {paymentProof && (
                    <p className={styles.fileName}>✅ {paymentProof.name}</p>
                  )}
                </div>

                {regError && (
                  <div className={styles.modalError}>{regError}</div>
                )}
              </div>

              <div className={styles.modalFooter}>
                <button onClick={() => setShowPaymentModal(false)} className={styles.btnCancel}>
                  Cancel
                </button>
                <button 
                  onClick={handlePaymentSubmit} 
                  disabled={uploading || !paymentProof}
                  className={styles.btnSubmit}
                >
                  {uploading ? 'Uploading...' : 'Submit & Register'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
