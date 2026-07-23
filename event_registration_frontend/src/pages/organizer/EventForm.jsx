import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../../api/axios';
import styles from '../../styles/Organizer.module.css';

// Convert ISO string to datetime-local input format (YYYY-MM-DDTHH:MM)
function toLocal(iso) {
  if (!iso) return '';
  return new Date(iso).toISOString().slice(0, 16);
}

function extractErrors(err) {
  const d = err.response?.data;
  if (!d) return ['Something went wrong.'];
  if (d.detail) return [d.detail];
  if (Array.isArray(d.errors)) return d.errors;
  return ['Something went wrong.'];
}

const empty = {
  title: '', description: '', location: '',
  start_datetime: '', end_datetime: '',
  capacity: '', ticket_price: '0', is_published: false,
  payment_method: 'bank_transfer',
  bank_name: '', account_number: '', account_title: '',
  mobile_wallet: '', wallet_number: '',
};

export default function EventForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [form, setForm] = useState(empty);
  const [errors, setErrors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEdit);

  // Fetch existing event in edit mode
  useEffect(() => {
    if (!isEdit) return;
    api.get(`/organizer/events/${id}`)
      .then(({ data }) => {
        const paymentDetails = data.payment_details || {};
        setForm({
          title: data.title || '',
          description: data.description || '',
          location: data.location || '',
          start_datetime: toLocal(data.start_datetime),
          end_datetime: toLocal(data.end_datetime),
          capacity: data.capacity || '',
          ticket_price: data.ticket_price || '0',
          is_published: data.is_published || false,
          payment_method: data.payment_method || 'bank_transfer',
          bank_name: paymentDetails.bank_name || '',
          account_number: paymentDetails.account_number || '',
          account_title: paymentDetails.account_title || '',
          mobile_wallet: paymentDetails.mobile_wallet || '',
          wallet_number: paymentDetails.wallet_number || '',
        });
      })
      .catch(() => setErrors(['Failed to load event.']))
      .finally(() => setFetching(false));
  }, [id, isEdit]);

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    setForm((p) => ({ ...p, [name]: type === 'checkbox' ? checked : value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setErrors([]);

    // Client-side validation
    const errs = [];
    if (!form.title.trim()) errs.push('Title is required.');
    if (!form.location.trim()) errs.push('Location is required.');
    if (!form.start_datetime) errs.push('Start date/time is required.');
    if (!form.end_datetime) errs.push('End date/time is required.');
    if (form.start_datetime && form.end_datetime && new Date(form.end_datetime) <= new Date(form.start_datetime)) {
      errs.push('End date/time must be after start date/time.');
    }
    if (!form.capacity || Number(form.capacity) < 1) errs.push('Capacity must be at least 1.');
    if (errs.length) { setErrors(errs); return; }

    setLoading(true);
    const payload = {
      title: form.title,
      description: form.description,
      location: form.location,
      capacity: Number(form.capacity),
      ticket_price: Number(form.ticket_price),
      is_published: form.is_published,
      start_datetime: new Date(form.start_datetime).toISOString(),
      end_datetime: new Date(form.end_datetime).toISOString(),
      payment_method: form.payment_method,
      payment_details: {
        bank_name: form.bank_name,
        account_number: form.account_number,
        account_title: form.account_title,
        mobile_wallet: form.mobile_wallet,
        wallet_number: form.wallet_number,
      },
    };

    try {
      if (isEdit) {
        await api.patch(`/organizer/events/${id}`, payload);
      } else {
        await api.post('/organizer/events', payload);
      }
      navigate('/organizer');
    } catch (err) {
      setErrors(extractErrors(err));
    } finally {
      setLoading(false);
    }
  }

  if (fetching) return <div className={styles.status}>Loading event...</div>;

  return (
    <div className={styles.page}>
      <div className={styles.formContainer}>
        <div className={styles.formHeader}>
          <h1 className={styles.heading}>{isEdit ? 'Edit Event' : 'Create New Event'}</h1>
          <Link to="/organizer" className={styles.backLink}>← Back to My Events</Link>
        </div>

        {errors.length > 0 && (
          <div className={styles.errorBox}>
            {errors.map((e, i) => <p key={i}>{e}</p>)}
          </div>
        )}

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.field}>
            <label>Title *</label>
            <input type="text" name="title" value={form.title} onChange={handleChange} required />
          </div>

          <div className={styles.field}>
            <label>Description</label>
            <textarea name="description" value={form.description} onChange={handleChange} rows={4} />
          </div>

          <div className={styles.field}>
            <label>Location *</label>
            <input type="text" name="location" value={form.location} onChange={handleChange} required />
          </div>

          <div className={styles.formRow}>
            <div className={styles.field}>
              <label>Start Date &amp; Time *</label>
              <input type="datetime-local" name="start_datetime" value={form.start_datetime} onChange={handleChange} required />
            </div>
            <div className={styles.field}>
              <label>End Date &amp; Time *</label>
              <input type="datetime-local" name="end_datetime" value={form.end_datetime} onChange={handleChange} required />
            </div>
          </div>

          <div className={styles.field}>
            <label>Capacity *</label>
            <input type="number" name="capacity" value={form.capacity} onChange={handleChange} min="1" required />
          </div>

          <div className={styles.field}>
            <label>Ticket Price (Rs.) *</label>
            <input type="number" name="ticket_price" value={form.ticket_price} onChange={handleChange} min="0" step="50" required />
            <small style={{ color: '#64748b', fontSize: '12px', marginTop: '4px' }}>Enter 0 for free events</small>
          </div>

          {/* Payment Information Section */}
          {Number(form.ticket_price) > 0 && (
            <>
              <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1.5rem', marginTop: '1rem' }}>
                <h3 style={{ color: '#f1f5f9', fontSize: '1.1rem', marginBottom: '1rem' }}>💳 Payment Information</h3>
                
                <div className={styles.field}>
                  <label>Payment Method *</label>
                  <select name="payment_method" value={form.payment_method} onChange={handleChange} required>
                    <option value="bank_transfer">Bank Transfer Only</option>
                    <option value="mobile_wallet">Mobile Wallet Only</option>
                    <option value="both">Both (Bank & Wallet)</option>
                  </select>
                </div>

                {(form.payment_method === 'bank_transfer' || form.payment_method === 'both') && (
                  <>
                    <div className={styles.field}>
                      <label>Bank Name *</label>
                      <input type="text" name="bank_name" value={form.bank_name} onChange={handleChange} 
                             placeholder="e.g., Meezan Bank, HBL, UBL" required />
                    </div>
                    <div className={styles.formRow}>
                      <div className={styles.field}>
                        <label>Account Number *</label>
                        <input type="text" name="account_number" value={form.account_number} onChange={handleChange} 
                               placeholder="e.g., 01234567890123" required />
                      </div>
                      <div className={styles.field}>
                        <label>Account Title *</label>
                        <input type="text" name="account_title" value={form.account_title} onChange={handleChange} 
                               placeholder="Your Name" required />
                      </div>
                    </div>
                  </>
                )}

                {(form.payment_method === 'mobile_wallet' || form.payment_method === 'both') && (
                  <>
                    <div className={styles.formRow}>
                      <div className={styles.field}>
                        <label>Mobile Wallet *</label>
                        <select name="mobile_wallet" value={form.mobile_wallet} onChange={handleChange} required>
                          <option value="">Select Wallet</option>
                          <option value="JazzCash">JazzCash</option>
                          <option value="Easypaisa">Easypaisa</option>
                          <option value="SadaPay">SadaPay</option>
                          <option value="NayaPay">NayaPay</option>
                        </select>
                      </div>
                      <div className={styles.field}>
                        <label>Wallet Number *</label>
                        <input type="text" name="wallet_number" value={form.wallet_number} onChange={handleChange} 
                               placeholder="03001234567" required />
                      </div>
                    </div>
                  </>
                )}
              </div>
            </>
          )}

          <div className={styles.checkboxField}>
            <input type="checkbox" id="is_published" name="is_published" checked={form.is_published} onChange={handleChange} />
            <label htmlFor="is_published">Publish this event (make it visible to the public)</label>
          </div>

          <div className={styles.formActions}>
            <Link to="/organizer" className={styles.btnCancel}>Cancel</Link>
            <button type="submit" disabled={loading} className={styles.btnSubmit}>
              {loading ? 'Saving...' : (isEdit ? 'Save Changes' : 'Create Event')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
