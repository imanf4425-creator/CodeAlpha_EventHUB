import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import styles from '../styles/Auth.module.css';

const ROLE_HINTS = {
  admin:     { label: 'Admin Login',     email: 'iman.fatima@eventhub.com', note: 'Admin account. Email is pre-filled.' },
  organizer: { label: 'Organizer Login', email: '',                          note: 'Login with your organizer credentials.' },
  user:      { label: 'User Login',      email: '',                          note: 'Login to access your dashboard.' },
};

function extractErrors(err) {
  const d = err.response?.data;
  if (!d) return ['Something went wrong. Please try again.'];
  if (d.detail) return [d.detail];
  if (Array.isArray(d.errors)) return d.errors;
  return ['Something went wrong.'];
}

export default function Login() {
  const { login, logout } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const role = searchParams.get('role') || 'user';
  const hint = ROLE_HINTS[role] || ROLE_HINTS.user;

  const [form, setForm] = useState({ email: hint.email || '', password: '' });
  const [errors, setErrors] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  // Always clear stale session when login page mounts
  useEffect(() => {
    logout();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleChange(e) {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setErrors([]);
    setSubmitting(true);
    try {
      const user = await login(form.email, form.password);
      
      // Role validation: Check if user has the required role
      if (role === 'organizer' && !user.is_organizer) {
        setErrors([
          `This account is not registered as an Organizer.`,
          `Please register as an Organizer or login with correct credentials.`
        ]);
        logout(); // Clear the session
        setSubmitting(false);
        return;
      }
      
      if (role === 'user' && user.is_staff) {
        // Admin trying to login as user
        setErrors([
          `Admin accounts cannot login here.`,
          `Please use the Admin login page.`
        ]);
        logout();
        setSubmitting(false);
        return;
      }
      
      // Strict role-based redirect
      if (user.is_staff) {
        navigate('/admin', { replace: true });
      } else if (user.is_organizer) {
        navigate('/organizer', { replace: true });
      } else {
        navigate('/dashboard', { replace: true });
      }
    } catch (err) {
      setErrors(extractErrors(err));
    } finally {
      setSubmitting(false);
    }
  }

  const roleIcon = role === 'admin' ? '⚙️' : role === 'organizer' ? '🎙' : '👤';

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <Link to="/" className={styles.backToLanding}>← Back to Home</Link>

        <div className={styles.roleTag}>
          <span>{roleIcon}</span>
          <span style={{ textTransform: 'capitalize' }}>{role}</span>
        </div>

        <h2 className={styles.heading}>{hint.label}</h2>
        <p className={styles.sub}>{hint.note}</p>

        {errors.length > 0 && (
          <div className={styles.errorBox}>
            {errors.map((e, i) => <p key={i}>{e}</p>)}
          </div>
        )}

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.field}>
            <label>Email</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              required
              autoFocus
              readOnly={role === 'admin'}
            />
          </div>
          <div className={styles.field}>
            <label>Password</label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              required
            />
          </div>
          <button type="submit" disabled={submitting} className={styles.btnSubmit}>
            {submitting ? 'Signing in...' : `Sign In as ${role.charAt(0).toUpperCase() + role.slice(1)}`}
          </button>
        </form>

        {role !== 'admin' && (
          <p className={styles.footerText}>
            Don&apos;t have an account?{' '}
            <Link to={`/register?role=${role}`}>Register here</Link>
          </p>
        )}

        <p style={{ textAlign: 'center', marginTop: '0.75rem' }}>
          <Link to="/select-role" style={{ color: '#475569', fontSize: '12px', textDecoration: 'none' }}>
            ← Choose a different role
          </Link>
        </p>
      </div>
    </div>
  );
}
