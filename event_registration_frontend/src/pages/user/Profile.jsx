import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';
import styles from '../../styles/Profile.module.css';

function extractErrors(err) {
  const d = err.response?.data;
  if (!d) return ['Something went wrong.'];
  if (d.detail) return [d.detail];
  if (Array.isArray(d.errors)) return d.errors;
  return ['Something went wrong.'];
}

export default function Profile() {
  const { user, updateUser } = useAuth();

  const [profile, setProfile] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    phone: user?.phone || '',
  });
  const [profileErrors, setProfileErrors] = useState([]);
  const [profileSuccess, setProfileSuccess] = useState('');
  const [profileLoading, setProfileLoading] = useState(false);

  const [pwForm, setPwForm] = useState({
    old_password: '', new_password: '', new_password_confirm: '',
  });
  const [pwErrors, setPwErrors] = useState([]);
  const [pwSuccess, setPwSuccess] = useState('');
  const [pwLoading, setPwLoading] = useState(false);

  async function handleProfileSubmit(e) {
    e.preventDefault();
    setProfileErrors([]);
    setProfileSuccess('');
    setProfileLoading(true);
    try {
      const { data } = await api.patch('/auth/profile', profile);
      updateUser(data);
      setProfileSuccess('Profile updated successfully.');
    } catch (err) {
      setProfileErrors(extractErrors(err));
    } finally {
      setProfileLoading(false);
    }
  }

  async function handlePasswordSubmit(e) {
    e.preventDefault();
    setPwErrors([]);
    setPwSuccess('');
    if (pwForm.new_password !== pwForm.new_password_confirm) {
      setPwErrors(['New passwords do not match.']);
      return;
    }
    setPwLoading(true);
    try {
      await api.post('/auth/change-password', pwForm);
      setPwSuccess('Password changed successfully.');
      setPwForm({ old_password: '', new_password: '', new_password_confirm: '' });
    } catch (err) {
      setPwErrors(extractErrors(err));
    } finally {
      setPwLoading(false);
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.userInfo}>
          <h1 className={styles.name}>{user?.first_name} {user?.last_name}</h1>
          <p className={styles.email}>{user?.email}</p>
          {user?.is_staff && <span className={styles.badge}>Admin</span>}
          {user?.is_organizer && !user?.is_staff && <span className={styles.badge}>Organizer</span>}
        </div>

        {/* Edit Profile */}
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Edit Profile</h2>
          {profileSuccess && <p className={styles.success}>{profileSuccess}</p>}
          {profileErrors.length > 0 && (
            <div className={styles.errorBox}>
              {profileErrors.map((e, i) => <p key={i}>{e}</p>)}
            </div>
          )}
          <form onSubmit={handleProfileSubmit} className={styles.form}>
            <div className={styles.row}>
              <div className={styles.field}>
                <label>First Name</label>
                <input
                  type="text"
                  value={profile.first_name}
                  onChange={(e) => setProfile((p) => ({ ...p, first_name: e.target.value }))}
                  required
                />
              </div>
              <div className={styles.field}>
                <label>Last Name</label>
                <input
                  type="text"
                  value={profile.last_name}
                  onChange={(e) => setProfile((p) => ({ ...p, last_name: e.target.value }))}
                  required
                />
              </div>
            </div>
            <div className={styles.field}>
              <label>Phone</label>
              <input
                type="tel"
                value={profile.phone}
                onChange={(e) => setProfile((p) => ({ ...p, phone: e.target.value }))}
              />
            </div>
            <button type="submit" disabled={profileLoading} className={styles.btnSubmit}>
              {profileLoading ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        </div>

        {/* Change Password */}
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Change Password</h2>
          {pwSuccess && <p className={styles.success}>{pwSuccess}</p>}
          {pwErrors.length > 0 && (
            <div className={styles.errorBox}>
              {pwErrors.map((e, i) => <p key={i}>{e}</p>)}
            </div>
          )}
          <form onSubmit={handlePasswordSubmit} className={styles.form}>
            <div className={styles.field}>
              <label>Current Password</label>
              <input
                type="password"
                value={pwForm.old_password}
                onChange={(e) => setPwForm((p) => ({ ...p, old_password: e.target.value }))}
                required
              />
            </div>
            <div className={styles.field}>
              <label>New Password</label>
              <input
                type="password"
                value={pwForm.new_password}
                onChange={(e) => setPwForm((p) => ({ ...p, new_password: e.target.value }))}
                required
              />
            </div>
            <div className={styles.field}>
              <label>Confirm New Password</label>
              <input
                type="password"
                value={pwForm.new_password_confirm}
                onChange={(e) => setPwForm((p) => ({ ...p, new_password_confirm: e.target.value }))}
                required
              />
            </div>
            <button type="submit" disabled={pwLoading} className={styles.btnSubmit}>
              {pwLoading ? 'Changing...' : 'Change Password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
