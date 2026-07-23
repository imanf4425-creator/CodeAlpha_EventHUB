import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function OrganizerRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (!user.is_organizer) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center' }}>
        <h2>Access Denied</h2>
        <p style={{ marginTop: '1rem', color: '#6b7280' }}>
          You need organizer permissions to access this page.
        </p>
      </div>
    );
  }
  return children;
}
