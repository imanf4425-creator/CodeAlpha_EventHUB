import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import styles from '../styles/SelectRole.module.css';

export default function SelectRole() {
  const navigate = useNavigate();
  const { logout } = useAuth();

  // Auto logout when select role page loads
  useEffect(() => {
    logout();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className={styles.page}>
      {/* Top brand */}
      <div className={styles.topBar}>
        <button onClick={() => navigate('/')} className={styles.brand}>
          🎟 EventHub
        </button>
      </div>

      <div className={styles.center}>
        <div className={styles.card}>
          <h1 className={styles.title}>Select Your Role</h1>
          <p className={styles.sub}>Choose how you want to access EventHub</p>

          <div className={styles.roles}>

            {/* ADMIN */}
            <div className={styles.roleCard}>
              <div className={styles.iconWrap} style={{ background: 'linear-gradient(135deg,#f59e0b,#d97706)' }}>
                ⚙️
              </div>
              <h3 className={styles.roleName}>Admin</h3>
              <p className={styles.roleDesc}>
                Manage users, events and platform settings
              </p>
              <button
                className={styles.btnPrimary}
                style={{ background: '#f59e0b' }}
                onClick={() => navigate('/login?role=admin')}
              >
                Login as Admin
              </button>
              <span className={styles.roleNote}>Admin accounts are pre-configured</span>
            </div>

            {/* ORGANIZER */}
            <div className={styles.roleCard}>
              <div className={styles.iconWrap} style={{ background: 'linear-gradient(135deg,#8b5cf6,#6d28d9)' }}>
                🎙
              </div>
              <h3 className={styles.roleName}>Organizer</h3>
              <p className={styles.roleDesc}>
                Create and manage your own events, track registrations
              </p>
              <div className={styles.btnRow}>
                <button
                  className={styles.btnLogin}
                  onClick={() => navigate('/login?role=organizer')}
                >
                  Login
                </button>
                <button
                  className={styles.btnRegister}
                  onClick={() => navigate('/register?role=organizer')}
                >
                  Register
                </button>
              </div>
            </div>

            {/* USER */}
            <div className={styles.roleCard}>
              <div className={styles.iconWrap} style={{ background: 'linear-gradient(135deg,#4f46e5,#2563eb)' }}>
                👤
              </div>
              <h3 className={styles.roleName}>User</h3>
              <p className={styles.roleDesc}>
                Browse events, register and manage your tickets
              </p>
              <div className={styles.btnRow}>
                <button
                  className={styles.btnLogin}
                  onClick={() => navigate('/login?role=user')}
                >
                  Login
                </button>
                <button
                  className={styles.btnRegister}
                  onClick={() => navigate('/register?role=user')}
                >
                  Register
                </button>
              </div>
            </div>

          </div>

          <button className={styles.backBtn} onClick={() => navigate('/')}>
            ← Back to Home
          </button>
        </div>
      </div>
    </div>
  );
}
