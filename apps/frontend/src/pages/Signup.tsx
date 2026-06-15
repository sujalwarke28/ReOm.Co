import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import { NotificationContext } from '../contexts/NotificationContext';

const Signup: React.FC = () => {
  const [form, setForm] = useState({ username: '', email: '', password: '', role: 'OperationalStaff' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [waitingEmail, setWaitingEmail] = useState<string | null>(null);
  const [approvalStatus, setApprovalStatus] = useState<'pending' | 'approved' | 'rejected'>('pending');
  const { showToast } = useContext(NotificationContext);
  const navigate = useNavigate();

  // Listen for admin approval updates via SSE
  useEffect(() => {
    if (!waitingEmail) return;

    const eventSource = new EventSource(`/api/notifications/stream?email=${encodeURIComponent(waitingEmail)}`);

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'PING') return;

        if (data.type === 'REGISTRATION_APPROVED') {
          setApprovalStatus('approved');
          showToast('Approved!', 'Your account has been approved. Redirecting...', 'success');
          setTimeout(() => {
            navigate('/login');
          }, 3000);
        } else if (data.type === 'REGISTRATION_REJECTED') {
          setApprovalStatus('rejected');
          showToast('Rejected', 'Your account registration has been rejected by the admin.', 'error');
        }
      } catch (err) {
        console.error('Error parsing SSE message:', err);
      }
    };

    eventSource.onerror = (err) => {
      console.warn('SSE connection error, attempting automatic retry...', err);
    };

    return () => {
      eventSource.close();
    };
  }, [waitingEmail, navigate, showToast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const response = await api.post('/auth/signup', form);
      if (response.data.success) {
        showToast('Registration Sent', 'Pending Admin approval.', 'info');
        setWaitingEmail(form.email);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create account.');
    } finally {
      setLoading(false);
    }
  };

  // If waiting for admin approval, display the wait screen
  if (waitingEmail) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-base)', padding: 24, flex: 1, width: '100%' }}>
        <div style={{
          width: '100%', maxWidth: 440,
          background: 'var(--bg-surface)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-xl)',
          padding: 40,
          boxShadow: 'var(--shadow-lg)',
          textAlign: 'center',
          animation: 'fadeSlideUp 0.4s ease both',
        }}>
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 32 }}>
            <div style={{ width: 36, height: 36, background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 800, color: '#fff' }}>R</div>
            <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.04em' }}>ReOm.Co</div>
          </div>

          {approvalStatus === 'pending' && (
            <>
              {/* Spinner */}
              <div style={{ width: 44, height: 44, border: '3px solid var(--border)', borderTopColor: 'var(--accent)', borderRadius: '50%', margin: '0 auto 24px', animation: 'spin 1s linear infinite' }} className="spinner" />

              <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em', marginBottom: 12 }}>Waiting for Admin Approval</h2>
              <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 24 }}>
                Your request for <strong style={{ color: 'var(--text-primary)' }}>{waitingEmail}</strong> has been registered. You will be redirected once an Admin approves your account.
              </p>
              <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 12, padding: '12px 16px', fontSize: 13, color: 'var(--text-muted)', display: 'inline-block', width: '100%', boxSizing: 'border-box' }}>
                ⏳ This page updates in real-time.
              </div>
            </>
          )}

          {approvalStatus === 'approved' && (
            <>
              <div style={{ width: 56, height: 56, background: 'var(--success-subtle)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, color: 'var(--success)', margin: '0 auto 20px', border: '1px solid rgba(16,185,129,0.15)' }}>✓</div>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--success)', letterSpacing: '-0.02em', marginBottom: 12 }}>Registration Approved!</h2>
              <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 24 }}>
                Your account is ready. Redirecting you to sign in...
              </p>
              <button className="btn-primary-custom" onClick={() => navigate('/login')} style={{ width: '100%', padding: '12px' }}>
                Sign In Now →
              </button>
            </>
          )}

          {approvalStatus === 'rejected' && (
            <>
              <div style={{ width: 56, height: 56, background: 'var(--danger-subtle)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, color: 'var(--danger)', margin: '0 auto 20px', border: '1px solid rgba(239,68,68,0.15)' }}>✕</div>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--danger)', letterSpacing: '-0.02em', marginBottom: 12 }}>Registration Rejected</h2>
              <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 24 }}>
                Your request was rejected. Please contact an admin for details.
              </p>
              <button className="btn-primary-custom" onClick={() => { setWaitingEmail(null); setApprovalStatus('pending'); }} style={{ width: '100%', padding: '12px', background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}>
                Try Another Account
              </button>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-base)', padding: 24, flex: 1, width: '100%' }}>
      <div style={{
        width: '100%', maxWidth: 440,
        background: 'var(--bg-surface)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-xl)',
        padding: 40,
        boxShadow: 'var(--shadow-lg)',
        animation: 'fadeSlideUp 0.4s ease both',
      }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 28 }}>
          <div style={{ width: 36, height: 36, background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 800, color: '#fff' }}>R</div>
          <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.04em' }}>ReOm.Co</div>
        </div>

        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.03em', marginBottom: 6 }}>Create account</h2>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 24 }}>Fill in the details below to get started</p>

        {error && <div className="error-banner">{error}</div>}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="form-group">
            <label className="form-label">Username</label>
            <input className="form-input" placeholder="e.g. johndoe" value={form.username} onChange={e => setForm({ ...form, username: e.target.value })} required minLength={3} />
          </div>
          <div className="form-group">
            <label className="form-label">Email address</label>
            <input type="email" className="form-input" placeholder="you@example.com" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input type="password" className="form-input" placeholder="Minimum 6 characters" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required minLength={6} />
          </div>
          <div className="form-group">
            <label className="form-label">Role</label>
            <select className="form-input form-select" value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}>
              <option value="OperationalStaff">Operational Staff</option>
              <option value="Manager">Manager</option>
              <option value="Executive">Executive</option>
              <option value="Admin">Admin</option>
            </select>
          </div>
          <button type="submit" className="btn-primary-custom" disabled={loading} style={{ marginTop: 4, padding: '12px', fontSize: 14 }}>
            {loading ? <><div className="spinner" /><span>Creating account...</span></> : <span>Create account →</span>}
          </button>
        </form>

        <div style={{ marginTop: 20, textAlign: 'center', fontSize: 13, color: 'var(--text-muted)' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'var(--accent)', fontWeight: 600 }}>Sign in</Link>
        </div>
      </div>
    </div>
  );
};

export default Signup;
