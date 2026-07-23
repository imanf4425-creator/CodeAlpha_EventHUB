import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import styles from '../../styles/Profile.module.css';

export default function OrganizerProfile() {
  const { user } = useAuth();

  if (!user) {
    return <div className={styles.status}>Loading...</div>;
  }

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <Link to="/organizer" className={styles.backLink}>← Back to Dashboard</Link>
        
        <div className={styles.profileCard}>
          <div className={styles.avatarSection}>
            <div className={styles.avatar}>
              {user.first_name?.charAt(0).toUpperCase() || 'O'}
            </div>
            <h1 className={styles.name}>{user.first_name} {user.last_name}</h1>
            <p className={styles.email}>{user.email}</p>
            <div className={styles.badges}>
              <span className={styles.badgeOrganizer}>👤 Organizer</span>
            </div>
          </div>

          <div className={styles.infoSection}>
            <h2 className={styles.sectionTitle}>Personal Information</h2>
            <div className={styles.infoGrid}>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>First Name</span>
                <span className={styles.infoValue}>{user.first_name || 'N/A'}</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Last Name</span>
                <span className={styles.infoValue}>{user.last_name || 'N/A'}</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Email</span>
                <span className={styles.infoValue}>{user.email}</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Phone</span>
                <span className={styles.infoValue}>{user.phone || 'Not provided'}</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Account Type</span>
                <span className={styles.infoValue}>Event Organizer</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Member Since</span>
                <span className={styles.infoValue}>
                  {user.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
                </span>
              </div>
            </div>
          </div>

          <div className={styles.actionsSection}>
            <Link to="/organizer/events" className={styles.btnPrimary}>
              📋 View My Events
            </Link>
            <Link to="/organizer/analytics" className={styles.btnSecondary}>
              📊 View Analytics
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
