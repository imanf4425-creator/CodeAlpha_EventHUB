import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import styles from '../../styles/Admin.module.css';

export default function AdminRegistrations() {
  const [registrations, setRegistrations] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const SIZE = 20;

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/admin/registrations', { params: { page, size: SIZE } });
      setRegistrations(data.registrations);
      setTotal(data.total);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => { fetch(); }, [fetch]);

  const totalPages = Math.ceil(total / SIZE);

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.pageHeader}>
          <div>
            <Link to="/admin" className={styles.backLink}>← Admin</Link>
            <h1 className={styles.heading}>Registrations <span className={styles.totalBadge}>{total}</span></h1>
          </div>
        </div>

        {loading ? (
          <div className={styles.tableSkeleton}>
            {[...Array(10)].map((_, i) => <div key={i} className={styles.rowSkeleton} />)}
          </div>
        ) : (
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>ID</th><th>User</th><th>Event</th><th>Registered At</th><th>Status</th>
                </tr>
              </thead>
              <tbody>
                {registrations.map((r) => (
                  <tr key={r.id}>
                    <td className={styles.idCell}>{r.id}</td>
                    <td>
                      <span className={styles.userName}>{r.user_name}</span><br />
                      <small className={styles.emailCell}>{r.user_email}</small>
                    </td>
                    <td className={styles.titleCell}>{r.event_title}</td>
                    <td className={styles.dateCell}>{new Date(r.registered_at).toLocaleString()}</td>
                    <td>
                      <span className={r.status === 'active' ? styles.badgeOn : styles.badgeDisabled}>
                        {r.status}
                      </span>
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
