import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import styles from '../../styles/Admin.module.css';

export default function AdminEvents() {
  const [events, setEvents] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null);
  const SIZE = 15;

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/admin/events', { params: { page, size: SIZE } });
      setEvents(data.events);
      setTotal(data.total);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => { fetch(); }, [fetch]);

  async function handleDelete(id, title) {
    if (!window.confirm(`Delete "${title}"? This cannot be undone.`)) return;
    setDeleting(id);
    try {
      await api.delete(`/admin/events/${id}`);
      setEvents((prev) => prev.filter((e) => e.id !== id));
      setTotal((t) => t - 1);
    } catch (err) {
      alert(err.response?.data?.detail || 'Delete failed.');
    } finally {
      setDeleting(null);
    }
  }

  const totalPages = Math.ceil(total / SIZE);

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.pageHeader}>
          <div>
            <Link to="/admin" className={styles.backLink}>← Admin</Link>
            <h1 className={styles.heading}>Events <span className={styles.totalBadge}>{total}</span></h1>
          </div>
        </div>

        {loading ? (
          <div className={styles.tableSkeleton}>
            {[...Array(8)].map((_, i) => <div key={i} className={styles.rowSkeleton} />)}
          </div>
        ) : (
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>ID</th><th>Title</th><th>Organizer</th><th>Date</th>
                  <th>Capacity</th><th>Spots Left</th><th>Status</th><th>Action</th>
                </tr>
              </thead>
              <tbody>
                {events.map((e) => (
                  <tr key={e.id}>
                    <td className={styles.idCell}>{e.id}</td>
                    <td className={styles.titleCell}>{e.title}</td>
                    <td className={styles.emailCell}>{e.organizer_name}<br /><small>{e.organizer_email}</small></td>
                    <td className={styles.dateCell}>{new Date(e.start_datetime).toLocaleDateString()}</td>
                    <td>{e.capacity}</td>
                    <td>{e.available_spots}</td>
                    <td>
                      <span className={e.is_published ? styles.badgeOn : styles.badgeOff}>
                        {e.is_published ? 'Published' : 'Draft'}
                      </span>
                    </td>
                    <td>
                      <button
                        onClick={() => handleDelete(e.id, e.title)}
                        disabled={deleting === e.id}
                        className={styles.btnDelete}
                      >
                        {deleting === e.id ? '...' : 'Delete'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {totalPages > 1 && (
          <div className={styles.pagination}>
            <button onClick={() => setPage((p) => Math.max(0, p - 1))} disabled={page === 0} className={styles.pageBtn}>← Prev</button>
            <span className={styles.pageInfo}>Page {page + 1} / {totalPages}</span>
            <button onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1} className={styles.pageBtn}>Next →</button>
          </div>
        )}
      </div>
    </div>
  );
}
