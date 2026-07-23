import { useNavigate, Link } from 'react-router-dom';
import { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import styles from '../styles/Landing.module.css';

export default function Landing() {
  const navigate = useNavigate();
  const { logout } = useAuth();

  // Auto logout when landing page loads
  useEffect(() => {
    logout();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function goToRoles() { navigate('/select-role'); }

  return (
    <div className={styles.page}>

      {/* ── TOP NAVBAR ─────────────────────────────────────── */}
      <nav className={styles.topNav}>
        <div className={styles.navLogo}>🎟 EventHub</div>
        <div className={styles.navBtns}>
        
          <button onClick={goToRoles} className={styles.navRegister}>Get Started</button>
        </div>
      </nav>

      {/* ── HERO ────────────────────────────────────────────── */}
      <section className={styles.hero}>
        <div className={styles.heroLeft}>
          <span className={styles.heroBadge}>🌍 Pakistan's #1 Event Platform</span>
          <h1 className={styles.heroTitle}>
            Discover, Create &<br />
            <span className={styles.heroHighlight}>Join Amazing Events</span>
          </h1>
          <p className={styles.heroDesc}>
            EventHub connects event organizers with thousands of attendees.
            From tech conferences to music concerts — find your next experience
            or create one for the world to join.
          </p>
          <div className={styles.heroStats}>
            <div className={styles.stat}><span className={styles.statNum}>500+</span><span className={styles.statLbl}>Events</span></div>
            <div className={styles.statDivider} />
            <div className={styles.stat}><span className={styles.statNum}>12K+</span><span className={styles.statLbl}>Attendees</span></div>
            <div className={styles.statDivider} />
            <div className={styles.stat}><span className={styles.statNum}>50+</span><span className={styles.statLbl}>Organizers</span></div>
          </div>
          <div className={styles.heroCtas}>
            <button onClick={goToRoles} className={styles.ctaPrimary}>
             Get Started — It's Free
            </button>
         
          </div>
        </div>

        <div className={styles.heroRight}>
          <div className={styles.imgCollage}>
            <div className={styles.imgMain}>
              <img src="https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600&q=80" alt="Event crowd" className={styles.img} />
            </div>
            <div className={styles.imgFloat1}>
              <img src="https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=300&q=80" alt="Concert" className={styles.img} />
            </div>
            <div className={styles.imgFloat2}>
              <img src="https://images.unsplash.com/photo-1511578314322-379afb476865?w=300&q=80" alt="Conference" className={styles.img} />
            </div>
            <div className={styles.floatBadge}>
              <span>🔴 Live Events</span>
              <span className={styles.floatCount}>14 happening now</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ────────────────────────────────────── */}
      <section className={styles.howSection}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>How EventHub Works</h2>
          <p className={styles.sectionSub}>Three simple steps to your next great experience</p>
        </div>
        <div className={styles.stepsGrid}>
          <div className={styles.stepCard}>
            <div className={styles.stepNum} style={{ color: '#f59e0b', borderColor: '#f59e0b' }}>01</div>
            <div className={styles.stepIcon} style={{ background: 'rgba(245,158,11,0.1)' }}>💡</div>
            <h3 className={styles.stepTitle}>Discover Events</h3>
            <p className={styles.stepDesc}>Browse hundreds of local and international events — tech meetups, concerts, workshops and marathons. Filter by city, category or date.</p>
          </div>
          <div className={styles.stepCard}>
            <div className={styles.stepNum} style={{ color: '#ef4444', borderColor: '#ef4444' }}>02</div>
            <div className={styles.stepIcon} style={{ background: 'rgba(239,68,68,0.1)' }}>⚙️</div>
            <h3 className={styles.stepTitle}>Register Instantly</h3>
            <p className={styles.stepDesc}>Create your account in seconds, choose your event and confirm your spot. Get your unique ticket code instantly.</p>
          </div>
          <div className={styles.stepCard}>
            <div className={styles.stepNum} style={{ color: '#0891b2', borderColor: '#0891b2' }}>03</div>
            <div className={styles.stepIcon} style={{ background: 'rgba(8,145,178,0.1)' }}>🕐</div>
            <h3 className={styles.stepTitle}>Attend & Enjoy</h3>
            <p className={styles.stepDesc}>Show up, connect with people, and create memories. Organizers can track attendance and grow their community.</p>
          </div>
        </div>
      </section>

      {/* ── ROLES ───────────────────────────────────────────── */}
      <section className={styles.rolesSection}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Choose Your Role</h2>
          <p className={styles.sectionSub}>EventHub works for everyone</p>
        </div>
        <div className={styles.rolesGrid}>
          <div className={styles.roleBannerCard} style={{ borderTop: '4px solid #f59e0b' }}>
            <span className={styles.roleBannerIcon}>⚙️</span>
            <h3>Admin</h3>
            <p>Full platform control. Manage all users, events and registrations from a powerful dashboard.</p>
            <button onClick={() => navigate('/login?role=admin')} className={styles.roleBannerBtn} style={{ background: '#f59e0b' }}>Admin Login</button>
          </div>
          <div className={styles.roleBannerCard} style={{ borderTop: '4px solid #7c3aed' }}>
            <span className={styles.roleBannerIcon}>🎙</span>
            <h3>Organizer</h3>
            <p>Create and publish events, manage registrations, and grow your audience across Pakistan.</p>
            <button onClick={() => navigate('/select-role')} className={styles.roleBannerBtn} style={{ background: '#7c3aed' }}>Start Organizing</button>
          </div>
          <div className={styles.roleBannerCard} style={{ borderTop: '4px solid #4f46e5' }}>
            <span className={styles.roleBannerIcon}>👤</span>
            <h3>Attendee</h3>
            <p>Find events you love, register in one click, and manage all your tickets from your dashboard.</p>
            <button onClick={() => navigate('/select-role')} className={styles.roleBannerBtn} style={{ background: '#4f46e5' }}>Join Now</button>
          </div>
        </div>
      </section>

      {/* ── FOOTER ──────────────────────────────────────────── */}
      <footer className={styles.footer}>
        <div className={styles.footerContent}>
          <span className={styles.footerLogo}>🎟 EventHub</span>
          <span className={styles.footerText}>© 2025 EventHub Pakistan. All rights reserved.</span>
          <div className={styles.footerLinks}>
          </div>
        </div>
      </footer>
    </div>
  );
}
