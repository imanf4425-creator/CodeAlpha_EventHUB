import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import styles from '../../styles/Organizer.module.css';

export default function OrganizerAnalytics() {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [regLoading, setRegLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Fetch organizer's events
    api.get('/organizer/events')
      .then(({ data }) => {
        setEvents(data);
        if (data.length > 0) {
          setSelectedEvent(data[0].id);
        }
      })
      .catch((err) => {
        console.error('Error fetching events:', err);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!selectedEvent) return;
    
    setRegLoading(true);
    setError('');
    
    // Fetch registrations for selected event
    api.get(`/organizer/events/${selectedEvent}/registrations`)
      .then(({ data }) => {
        setRegistrations(data);
      })
      .catch((err) => {
        console.error('Error fetching registrations:', err);
        setError('Failed to load registrations.');
      })
      .finally(() => setRegLoading(false));
  }, [selectedEvent]);

  if (loading) {
    return <div className={styles.status}>Loading your events...</div>;
  }

  if (events.length === 0) {
    return (
      <div className={styles.page}>
        <div className={styles.container}>
          <Link to="/organizer" className={styles.backLink}>← Back to My Events</Link>
          <div className={styles.empty}>
            <p>You haven't created any events yet.</p>
            <Link to="/organizer/events/new" className={styles.btnCreate}>
              Create your first event
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const selectedEventData = events.find(e => e.id === selectedEvent);
  const ticketsSold = selectedEventData ? selectedEventData.capacity - selectedEventData.available_spots : 0;
  const ticketsRemaining = selectedEventData?.available_spots || 0;
  const totalCapacity = selectedEventData?.capacity || 0;
  const sellPercentage = totalCapacity > 0 ? ((ticketsSold / totalCapacity) * 100).toFixed(1) : 0;

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.dashHeader}>
          <div>
            <Link to="/organizer" className={styles.backLink}>← Back to My Events</Link>
            <h1 className={styles.heading}>📊 Analytics & Registrations</h1>
          </div>
        </div>

        {/* Event Selector */}
        <div className={styles.section}>
          <label htmlFor="eventSelect" className={styles.label}>Select Event:</label>
          <select
            id="eventSelect"
            value={selectedEvent || ''}
            onChange={(e) => setSelectedEvent(Number(e.target.value))}
            className={styles.select}
          >
            {events.map((event) => (
              <option key={event.id} value={event.id}>
                {event.title} ({event.is_published ? 'Published' : 'Draft'})
              </option>
            ))}
          </select>
        </div>

        {/* Analytics Cards */}
        {selectedEventData && (
          <div className={styles.analyticsGrid}>
            <div className={styles.analyticsCard}>
              <div className={styles.analyticsIcon} style={{ background: '#10b981' }}>🎟</div>
              <div className={styles.analyticsContent}>
                <div className={styles.analyticsValue}>{ticketsSold}</div>
                <div className={styles.analyticsLabel}>Tickets Sold</div>
              </div>
            </div>

            <div className={styles.analyticsCard}>
              <div className={styles.analyticsIcon} style={{ background: '#f59e0b' }}>📦</div>
              <div className={styles.analyticsContent}>
                <div className={styles.analyticsValue}>{ticketsRemaining}</div>
                <div className={styles.analyticsLabel}>Tickets Remaining</div>
              </div>
            </div>

            <div className={styles.analyticsCard}>
              <div className={styles.analyticsIcon} style={{ background: '#6366f1' }}>👥</div>
              <div className={styles.analyticsContent}>
                <div className={styles.analyticsValue}>{totalCapacity}</div>
                <div className={styles.analyticsLabel}>Total Capacity</div>
              </div>
            </div>

            <div className={styles.analyticsCard}>
              <div className={styles.analyticsIcon} style={{ background: '#ec4899' }}>📈</div>
              <div className={styles.analyticsContent}>
                <div className={styles.analyticsValue}>{sellPercentage}%</div>
                <div className={styles.analyticsLabel}>Sold Percentage</div>
              </div>
            </div>
          </div>
        )}

        {/* Progress Bar */}
        {selectedEventData && (
          <div className={styles.progressSection}>
            <div className={styles.progressBar}>
              <div 
                className={styles.progressFill} 
                style={{ width: `${sellPercentage}%`, background: sellPercentage > 80 ? '#10b981' : sellPercentage > 50 ? '#f59e0b' : '#6366f1' }}
              />
            </div>
            <p className={styles.progressText}>
              {ticketsSold} of {totalCapacity} tickets sold
            </p>
          </div>
        )}

        {/* Registrations List */}
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>
            Registered Users ({registrations.length})
          </h2>
          
          {error && (
            <div style={{ 
              background: 'rgba(220,38,38,0.1)', 
              border: '1px solid rgba(220,38,38,0.3)', 
              color: '#f87171', 
              padding: '1rem', 
              borderRadius: '8px', 
              marginBottom: '1rem' 
            }}>
              {error}
            </div>
          )}
          
          {regLoading ? (
            <div className={styles.status}>Loading registrations...</div>
          ) : registrations.length === 0 ? (
            <p className={styles.emptyText}>No registrations yet for this event.</p>
          ) : (
            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Ticket Code</th>
                    <th>User Name</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Registered On</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {registrations.map((reg) => (
                    <tr key={reg.id}>
                      <td className={styles.ticketCode}>{reg.ticket_code}</td>
                      <td>{reg.user?.first_name} {reg.user?.last_name}</td>
                      <td>{reg.user?.email}</td>
                      <td>{reg.user?.phone || 'N/A'}</td>
                      <td>{new Date(reg.registered_at).toLocaleDateString()}</td>
                      <td>
                        <span className={reg.is_cancelled ? styles.badgeCancelled : styles.badgeActive}>
                          {reg.is_cancelled ? 'Cancelled' : 'Active'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
