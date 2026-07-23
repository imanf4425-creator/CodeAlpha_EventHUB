import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import styles from '../styles/Auth.module.css';

function extractErrors(err) {
  const d = err.response?.data;
  if (!d) return ['Something went wrong. Please try again.'];
  if (d.detail) return [d.detail];
  if (Array.isArray(d.errors)) return d.errors;
  return ['Something went wrong. Please try again.'];
}

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const role = searchParams.get('role') || 'user';

  const [form, setForm] = useState({
    email: '', first_name: '', last_name: '', phone: '',
    password: '', password_confirm: '',
  });
  const [errors, setErrors] = useState([]);
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setErrors([]);
    if (form.password !== form.password_confirm) {
      setErrors(['Passwords do not match.']);
      return;
    }
    setLoading(true);
    try {
      await register(form);
      navigate('/');
    } catch (err) {
      setErrors(extractErrors(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <h2 className={styles.heading}>Create Account</h2>
        <p className={styles.sub}>Join EventHub today</p>

        {errors.length > 0 && (
          <div className={styles.errorBox}>
            {errors.map((e, i) => <p key={i}>{e}</p>)}
          </div>
        )}

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.row}>
            <div className={styles.field}>
              <label>First Name</label>
              <input type="text" name="first_name" value={form.first_name} onChange={handleChange} required />
            </div>
            <div className={styles.field}>
              <label>Last Name</label>
              <input type="text" name="last_name" value={form.last_name} onChange={handleChange} required />
            </div>
          </div>
          <div className={styles.field}>
            <label>Email</label>
            <input type="email" name="email" value={form.email} onChange={handleChange} required />
          </div>
          <div className={styles.field}>
            <label>Phone <span className={styles.optional}>(optional)</span></label>
            <input type="tel" name="phone" value={form.phone} onChange={handleChange} />
          </div>
          <div className={styles.field}>
            <label>Password</label>
            <input type="password" name="password" value={form.password} onChange={handleChange} required />
          </div>
          <div className={styles.field}>
            <label>Confirm Password</label>
            <input type="password" name="password_confirm" value={form.password_confirm} onChange={handleChange} required />
          </div>
          <button type="submit" disabled={loading} className={styles.btnSubmit}>
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p className={styles.footerText}>
          Already have an account? <Link to={`/login?role=${role}`}>Login here</Link>
        </p>
      </div>
    </div>
  );
}
