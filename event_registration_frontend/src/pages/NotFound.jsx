import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div style={{ textAlign: 'center', padding: '5rem 2rem' }}>
      <h1 style={{ fontSize: '6rem', color: '#4f46e5', margin: 0 }}>404</h1>
      <h2 style={{ margin: '1rem 0', color: '#374151' }}>Page Not Found</h2>
      <p style={{ color: '#6b7280', marginBottom: '2rem' }}>
        The page you're looking for doesn't exist.
      </p>
      <Link
        to="/"
        style={{
          background: '#4f46e5', color: '#fff',
          padding: '10px 24px', borderRadius: '6px',
          fontWeight: 500,
        }}
      >
        Go Home
      </Link>
    </div>
  );
}
