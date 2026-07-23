import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';
import styles from '../../styles/Organizer.module.css';

export default function OrganizerDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalEvents: 0,
    publishedEvents: 0,
    totalRegistrations: 0,
    totalRevenue: 0,
  });
  const [recentEvents, setRecentEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch organizer's events
    api.get('/organizer/events')
      .then(({ data }) => {
        const published = data.filter(e => e.is_published).length;
        const totalRegs = data.reduce((sum, e) => sum + (e.capacity - e.available_spots), 0);
        
        // Calculate revenue: tickets_sold × ticket_price for each event
        // Free events (ticket_price = 0 or null) don't contribute to revenue
        const revenue = data.reduce((sum, e) => {
          const ticketsSold = e.capacity - e.available_spots;
          const price = Number(e.ticket_price) || 0;
          return sum + (ticketsSold * price);
        }, 0);

        setStats({
          totalEvents: data.length,
          publishedEvents: published,
          totalRegistrations: totalRegs,
          totalRevenue: revenue,
        });

        // Show 3 most recent events
        setRecentEvents(data.slice(0, 3));
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className={styles.status}>Loading dashboard...</div>;
  }

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        {/* Welcome Section */}
        <div className={styles.welcomeSection}>
          <div className={styles.welcomeAvatar}>
            {user?.first_name?.charAt(0).toUpperCase() || 'O'}
          </div>
          <div className={styles.welcomeText}>
            <h1 className={styles.welcomeTitle}>Welcome, {user?.first_name}!</h1>
            <p className={styles.welcomeEmail}>{user?.email}</p>
            <span className={styles.badgeOrganizer}>👤 Organizer</span>
          </div>
        </div>

        {/* Stats Cards */}
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <div className={styles.statIcon} style={{ background: '#3b82f6' }}>📅</div>
            <div className={styles.statContent}>
              <div className={styles.statValue}>{stats.totalEvents}</div>
              <div className={styles.statLabel}>Total Events</div>
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statIcon} style={{ background: '#10b981' }}>✅</div>
            <div className={styles.statContent}>
              <div className={styles.statValue}>{stats.publishedEvents}</div>
              <div className={styles.statLabel}>Published Events</div>
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statIcon} style={{ background: '#f59e0b' }}>🎟</div>
            <div className={styles.statContent}>
              <div className={styles.statValue}>{stats.totalRegistrations}</div>
              <div className={styles.statLabel}>Total Registrations</div>
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statIcon} style={{ background: '#ec4899' }}>💰</div>
            <div className={styles.statContent}>
              <div className={styles.statValue}>Rs. {stats.totalRevenue.toLocaleString()}</div>
              <div className={styles.statLabel}>Total Revenue</div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className={styles.quickActions}>
          <Link to="/home" className={styles.actionCard}>
            <span className={styles.actionIcon}>🎟</span>
            <span className={styles.actionText}>Browse Events</span>
          </Link>

          <Link to="/global-events" className={styles.actionCard}>
            <span className={styles.actionIcon}>🌍</span>
            <span className={styles.actionText}>Global Events</span>
          </Link>

          <Link to="/live-sports" className={styles.actionCard}>
            <span className={styles.actionIcon}>⚽</span>
            <span className={styles.actionText}>Live Sports</span>
          </Link>

          <Link to="/organizer/events" className={styles.actionCard}>
            <span className={styles.actionIcon}>📋</span>
            <span className={styles.actionText}>My Events</span>
          </Link>

          <Link to="/organizer/analytics" className={styles.actionCard}>
            <span className={styles.actionIcon}>📊</span>
            <span className={styles.actionText}>Analytics</span>
          </Link>

          <Link to="/organizer/verifications" className={styles.actionCard}>
            <span className={styles.actionIcon}>⏳</span>
            <span className={styles.actionText}>Verify Payments</span>
          </Link>

          <Link to="/organizer/events/new" className={styles.actionCard}>
            <span className={styles.actionIcon}>➕</span>
            <span className={styles.actionText}>Create Event</span>
          </Link>

          <Link to="/profile" className={styles.actionCard}>
            <span className={styles.actionIcon}>👤</span>
            <span className={styles.actionText}>My Profile</span>
          </Link>
        </div>

        {/* Recent Events */}
        {recentEvents.length > 0 && (
          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>Recent Events</h2>
              <Link to="/organizer/events" className={styles.viewAll}>View All →</Link>
            </div>
            <div className={styles.eventsList}>
              {recentEvents.map((event) => (
                <div key={event.id} className={styles.eventItem}>
                  <div className={styles.eventInfo}>
                    <h3 className={styles.eventTitle}>{event.title}</h3>
                    <p className={styles.eventMeta}>
                      📍 {event.location || event.city} • 🗓 {new Date(event.start_datetime).toLocaleDateString()}
                    </p>
                  </div>
                  <div className={styles.eventStats}>
                    <span className={event.is_published ? styles.badgePublished : styles.badgeDraft}>
                      {event.is_published ? 'Published' : 'Draft'}
                    </span>
                    <span className={styles.eventCapacity}>
                      {event.capacity - event.available_spots}/{event.capacity} sold
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
