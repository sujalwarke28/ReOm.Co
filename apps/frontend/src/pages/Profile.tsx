import React, { useContext, useState } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { NotificationContext } from '../contexts/NotificationContext';
import api from '../api/axios';

const ROLE_COLORS: Record<string, string> = {
  Admin: '#dc2626', Manager: '#0077cc', Executive: '#d97706', OperationalStaff: '#16a34a',
};

const Profile: React.FC = () => {
  const { user, login } = useContext(AuthContext);
  const { showToast } = useContext(NotificationContext);

  const [editing, setEditing] = useState(false);
  const [newName, setNewName] = useState(user?.username || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const initials = (user?.username || 'U').slice(0, 2).toUpperCase();
  const joinedDate = (user as any)?.created_at
    ? new Date((user as any).created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
    : 'N/A';

  const handleSave = async () => {
    if (!newName.trim() || newName.trim().length < 3) {
      setError('Username must be at least 3 characters.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await api.put('/auth/profile', { username: newName.trim() });
      if (res.data.success) {
        // Update the stored token user data
        const token = localStorage.getItem('token') || '';
        login(token, { ...user!, username: res.data.data.username });
        setEditing(false);
        showToast('Profile Updated', `Your display name is now "${res.data.data.username}".`, 'success');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <div className="page-title">My Profile</div>
        <div className="page-subtitle">Manage your account details</div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: 20, alignItems: 'start' }}>
        {/* Avatar card */}
        <div className="section-card" style={{ textAlign: 'center', padding: 32 }}>
          {/* Avatar */}
          <div style={{
            width: 96, height: 96, borderRadius: 28,
            background: ROLE_COLORS[user?.role || ''] || 'var(--accent)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 36, fontWeight: 800, color: '#fff',
            margin: '0 auto 16px',
            boxShadow: `0 8px 24px ${ROLE_COLORS[user?.role || ''] || 'var(--accent)'}44`,
          }}>
            {initials}
          </div>

          <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 6 }}>{user?.username}</div>
          <span className={`role-badge role-${user?.role}`} style={{ fontSize: 12 }}>
            {user?.role === 'OperationalStaff' ? 'Ops Staff' : user?.role}
          </span>

          <div className="divider" />

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, textAlign: 'left' }}>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 2 }}>Member Since</div>
              <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{joinedDate}</div>
            </div>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 2 }}>User ID</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'monospace', wordBreak: 'break-all' }}>{user?.id}</div>
            </div>
          </div>
        </div>

        {/* Details card */}
        <div className="section-card">
          <div className="section-card-header">
            <div className="section-card-title">Account Information</div>
            {!editing && (
              <button className="btn-ghost" onClick={() => { setEditing(true); setNewName(user?.username || ''); }}>
                ✏ Edit Name
              </button>
            )}
          </div>
          <div className="section-card-body">
            {error && <div className="error-banner">{error}</div>}

            {/* Display Name / Username */}
            <div style={{ marginBottom: 20 }}>
              <div className="form-label" style={{ marginBottom: 6 }}>Display Name</div>
              {editing ? (
                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                  <input
                    className="form-input"
                    value={newName}
                    onChange={e => setNewName(e.target.value)}
                    style={{ maxWidth: 300 }}
                    autoFocus
                  />
                  <button className="btn-primary-custom" onClick={handleSave} disabled={loading}>
                    {loading ? <><div className="spinner" /><span>Saving...</span></> : <span>Save</span>}
                  </button>
                  <button className="btn-ghost" onClick={() => { setEditing(false); setError(''); }}>Cancel</button>
                </div>
              ) : (
                <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)' }}>{user?.username}</div>
              )}
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>This is how you appear to others on the platform.</div>
            </div>

            <div className="divider" />

            {/* Read-only fields */}
            {[
              { label: 'Email Address', value: user?.email, note: 'Contact your admin to change your email.' },
              { label: 'Role', value: user?.role === 'OperationalStaff' ? 'Operational Staff' : user?.role, note: 'Roles can only be changed by an Admin.' },
            ].map(field => (
              <div key={field.label} style={{ marginBottom: 20 }}>
                <div className="form-label" style={{ marginBottom: 6 }}>{field.label}</div>
                <div style={{ fontSize: 15, fontWeight: 500, color: 'var(--text-primary)' }}>{field.value}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 3 }}>{field.note}</div>
              </div>
            ))}

            <div className="divider" />

            <div style={{
              background: 'var(--bg-elevated)', border: '1px solid var(--border)',
              borderRadius: 10, padding: '14px 16px',
              display: 'flex', gap: 10, alignItems: 'flex-start',
            }}>
              <div style={{ fontSize: 18 }}>🔒</div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 2 }}>Password & Security</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>To change your password, please contact your administrator or use the sign-up flow with a new account.</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
