import { useState, useEffect, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../../api/axios';
import styles from '../../styles/Admin.module.css';

export default function AdminUsers() {
  const [searchParams] = useSearchParams();
  const filterParam = searchParams.get('filter') || 'all';
  
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState(filterParam); // all, organizers, admins, users
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null); // id being updated

  const SIZE = 15;
  
  // Update roleFilter when URL parameter changes
  useEffect(() => {
    setRoleFilter(filterParam);
  }, [filterParam]);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/admin/users', {
        params: { search: search || undefined, page, size: SIZE },
      });
      
      // Apply client-side role filtering
      let filteredUsers = data.users;
      if (roleFilter === 'organizers') {
        filteredUsers = data.users.filter(u => u.is_organizer);
      } else if (roleFilter === 'admins') {
        filteredUsers = data.users.filter(u => u.is_staff);
      } else if (roleFilter === 'users') {
        filteredUsers = data.users.filter(u => !u.is_organizer && !u.is_staff);
      }
      
      setUsers(filteredUsers);
      setTotal(roleFilter === 'all' ? data.total : filteredUsers.length);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [search, page, roleFilter]);

  useEffect(() => {
    const t = setTimeout(fetch, 350);
    return () => clearTimeout(t);
  }, [fetch]);

  async function toggleField(user, field) {
    setUpdating(user.id);
    try {
      const { data } = await api.patch(`/admin/users/${user.id}`, {
        [field]: !user[field],
      });
      setUsers((prev) => prev.map((u) => u.id === user.id ? { ...u, ...data } : u));
    } catch (err) {
      alert(err.response?.data?.detail || 'Update failed.');
    } finally {
      setUpdating(null);
    }
  }

  const totalPages = Math.ceil(total / SIZE);
  
  // Dynamic title based on filter
  const getTitle = () => {
    if (roleFilter === 'organizers') return 'Organizers';
    if (roleFilter === 'admins') return 'Admins';
    if (roleFilter === 'users') return 'Regular Users';
    return 'Users';
  };

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.pageHeader}>
          <div>
            <Link to="/admin" className={styles.backLink}>← Admin</Link>
            <h1 className={styles.heading}>{getTitle()} <span className={styles.totalBadge}>{total}</span></h1>
          </div>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <select
              value={roleFilter}
              onChange={(e) => { setRoleFilter(e.target.value); setPage(0); }}
              style={{
                padding: '0.5rem 1rem',
                borderRadius: '8px',
                border: '1px solid #334155',
                background: '#1e293b',
                color: '#e2e8f0',
                cursor: 'pointer'
              }}
            >
              <option value="all">All Users</option>
              <option value="organizers">Organizers Only</option>
              <option value="admins">Admins Only</option>
              <option value="users">Regular Users</option>
            </select>
            <input
              className={styles.searchInput}
              type="text"
              placeholder="Search by email or name..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(0); }}
            />
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
                  <th>ID</th><th>Email</th><th>Name</th><th>Joined</th>
                  <th>Organizer</th><th>Admin</th><th>Active</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className={!u.is_active ? styles.inactiveRow : ''}>
                    <td className={styles.idCell}>{u.id}</td>
                    <td>{u.email}</td>
                    <td>{u.first_name} {u.last_name}</td>
                    <td className={styles.dateCell}>
                      {new Date(u.created_at).toLocaleDateString()}
                    </td>
                    <td>
                      <button
                        onClick={() => toggleField(u, 'is_organizer')}
                        disabled={updating === u.id}
                        className={u.is_organizer ? styles.badgeOn : styles.badgeOff}
                      >
                        {u.is_organizer ? '✓ Yes' : '✗ No'}
                      </button>
                    </td>
                    <td>
                      <button
                        onClick={() => toggleField(u, 'is_staff')}
                        disabled={updating === u.id}
                        className={u.is_staff ? styles.badgeAdmin : styles.badgeOff}
                      >
                        {u.is_staff ? '✓ Admin' : '✗ No'}
                      </button>
                    </td>
                    <td>
                      <button
                        onClick={() => toggleField(u, 'is_active')}
                        disabled={updating === u.id}
                        className={u.is_active ? styles.badgeOn : styles.badgeDisabled}
                      >
                        {u.is_active ? 'Active' : 'Disabled'}
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
