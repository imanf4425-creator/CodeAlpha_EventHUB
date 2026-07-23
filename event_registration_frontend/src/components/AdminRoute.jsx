import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function AdminRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>Loading...</div>;
  }

  if (!user) return <Navigate to="/login" replace />;

  if (!user.is_staff) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center' }}>
        <h2 style={{ color: '#ef4444', marginBottom: '1rem' }}>Access Denied</h2>
        <p style={{ color: '#6b7280' }}>Admin access required.</p>
        <p style={{ color: '#9ca3af', fontSize: '13px', marginTop: '0.5rem' }}>
          Please log out and log in with an admin account.
        </p>
      </div>
    );
  }

  return children;
}
