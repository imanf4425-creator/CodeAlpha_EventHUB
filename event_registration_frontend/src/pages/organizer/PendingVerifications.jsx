import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import styles from '../../styles/Organizer.module.css';

export default function PendingVerifications() {
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    fetchPending();
  }, []);

  async function fetchPending() {
    try {
      const { data } = await api.get('/organizer/pending-verifications');
      setPending(data);
    } catch (err) {
      console.error('Failed to fetch pending verifications:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleVerify(registrationId, approve) {
    if (!approve && !window.confirm('Are you sure you want to reject this registration?')) {
      return;
    }

    setVerifying(registrationId);
    try {
      await api.patch(`/organizer/registrations/${registrationId}/verify`, {
        approve,
        rejection_reason: approve ? null : 'Payment proof not valid',
      });
      
      // Remove from pending list
      setPending(prev => prev.filter(r => r.id !== registrationId));
      
      alert(approve ? 'Registration approved! User will receive confirmation email.' : 'Registration rejected.');
    } catch (err) {
      alert('Failed to verify registration');
      console.error(err);
    } finally {
      setVerifying(null);
    }
  }

  if (loading) {
    return <div className={styles.status}>Loading...</div>;
  }

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.dashHeader}>
          <div>
            <Link to="/organizer" className={styles.backLink}>← Back to Dashboard</Link>
            <h1 className={styles.heading}>⏳ Pending Verifications</h1>
          </div>
        </div>

        {pending.length === 0 ? (
          <div className={styles.empty}>
            <p>No pending verifications at the moment.</p>
          </div>
        ) : (
          <div className={styles.verificationGrid}>
            {pending.map((reg) => (
              <div key={reg.id} className={styles.verificationCard}>
                <div className={styles.verificationHeader}>
                  <h3 className={styles.verificationEvent}>{reg.event_title}</h3>
                  <span className={styles.badgePending}>Pending</span>
                </div>

                <div className={styles.verificationUser}>
                  <p><strong>User:</strong> {reg.user_name}</p>
                  <p><strong>Email:</strong> {reg.user_email}</p>
                  <p><strong>Registered:</strong> {new Date(reg.registered_at).toLocaleDateString()}</p>
                </div>

                {reg.payment_proof_url && (
                  <div className={styles.paymentProof}>
                    <p style={{ marginBottom: '0.5rem', fontSize: '14px', fontWeight: 600, color: '#cbd5e1' }}>
                      Payment Proof:
                    </p>
                    <img 
                      src={`http://localhost:3000${reg.payment_proof_url}`}
                      alt="Payment Proof"
                      className={styles.proofThumbnail}
                      onClick={() => setSelectedImage(`http://localhost:3000${reg.payment_proof_url}`)}
                    />
                    <p style={{ fontSize: '12px', color: '#64748b', marginTop: '0.25rem' }}>
                      Click to view full size
                    </p>
                  </div>
                )}

                <div className={styles.verificationActions}>
                  <button
                    onClick={() => handleVerify(reg.id, false)}
                    disabled={verifying === reg.id}
                    className={styles.btnReject}
                  >
                    {verifying === reg.id ? '...' : '❌ Reject'}
                  </button>
                  <button
                    onClick={() => handleVerify(reg.id, true)}
                    disabled={verifying === reg.id}
                    className={styles.btnApprove}
                  >
                    {verifying === reg.id ? '...' : '✅ Approve'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Image Modal */}
        {selectedImage && (
          <div className={styles.imageModal} onClick={() => setSelectedImage(null)}>
            <div className={styles.imageModalContent} onClick={e => e.stopPropagation()}>
              <button onClick={() => setSelectedImage(null)} className={styles.imageModalClose}>✕</button>
              <img src={selectedImage} alt="Payment Proof Full Size" className={styles.imageModalImg} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
