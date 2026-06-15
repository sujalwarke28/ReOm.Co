import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { NotificationContext } from '../contexts/NotificationContext';
import api from '../api/axios';

/* ---- What we do cards ---- */
const FEATURES = [
  {
    icon: '📋',
    title: 'Smart Task Workflows',
    desc: 'Assign, track, and complete operational tasks with real-time updates and push notifications — no lag, no missed work.',
  },
  {
    icon: '✅',
    title: 'Hierarchical Approvals',
    desc: 'Route approval requests up or down your org chart. Managers, Executives, and Admins can act in one click.',
  },
  {
    icon: '📊',
    title: 'Live Analytics & KPIs',
    desc: 'See task completion rates, department load, approval trends, and executive-level insights — all in one place.',
  },
];

const Login: React.FC = () => {
  const [view, setView] = useState<'landing' | 'signin'>('landing');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useContext(AuthContext);
  const { showToast } = useContext(NotificationContext);
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const response = await api.post('/auth/login', { email, password });
      if (response.data.success) {
        const userData = response.data.data.user;
        login(response.data.data.token, userData);
        showToast(`Welcome back, ${userData.username}!`, `Logged in as ${userData.role}`, 'success');
        navigate('/dashboard', { replace: true });
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)', display: 'flex', flexDirection: 'column', flex: 1, width: '100%' }}>

      {/* Top bar */}
      <header style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '18px 40px',
        borderBottom: '1px solid var(--border)',
        background: 'var(--bg-surface)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 32, height: 32, background: 'var(--accent)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, fontWeight: 800, color: '#fff' }}>R</div>
          <span style={{ fontSize: 17, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.04em' }}>ReOm.Co</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button onClick={toggleTheme} style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 8, padding: '6px 12px', cursor: 'pointer', color: 'var(--text-secondary)', fontSize: 14, transition: 'all 0.15s' }}>
            {theme === 'dark' ? '☀ Light' : '◑ Dark'}
          </button>
          {view === 'landing' && (
            <button className="btn-primary-custom" onClick={() => setView('signin')}>Sign in</button>
          )}
        </div>
      </header>

      {view === 'landing' ? (
        /* ---- Landing View ---- */
        <main style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '64px 24px 40px', animation: 'fadeSlideUp 0.5s ease both' }}>

          {/* Hero */}
          <div style={{ textAlign: 'center', maxWidth: 680, marginBottom: 64 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'var(--accent-subtle)', border: '1px solid var(--border)', borderRadius: 999, padding: '5px 14px', fontSize: 12, fontWeight: 600, color: 'var(--accent)', marginBottom: 24 }}>
              🚀 Built for modern retail operations
            </div>

            <h1 style={{ fontSize: '3rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.04em', lineHeight: 1.15, marginBottom: 20 }}>
              One Platform to Run<br />
              <span style={{ color: 'var(--accent)' }}>Your Entire Operation</span>
            </h1>

            <p style={{ fontSize: 17, color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 36, maxWidth: 520, margin: '0 auto 36px' }}>
              ReOm.Co is a cloud-native operations platform for retail teams — combining task management, approval workflows, and live analytics under one roof. No spreadsheets. No chaos. Just clear, role-based operations.
            </p>

            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
              <button className="btn-primary-custom" onClick={() => setView('signin')} style={{ padding: '13px 32px', fontSize: 15 }}>
                Get Started →
              </button>
              <Link to="/signup" style={{ display: 'inline-flex', alignItems: 'center', padding: '13px 24px', borderRadius: 10, border: '1px solid var(--border)', color: 'var(--text-secondary)', fontSize: 14, fontWeight: 500, transition: 'all 0.15s', background: 'var(--bg-surface)' }}>
                Create account
              </Link>
            </div>
          </div>

          {/* How it works — 3 cards */}
          <div style={{ width: '100%', maxWidth: 860, marginBottom: 48 }}>
            <div style={{ textAlign: 'center', fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 24 }}>How it works</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
              {FEATURES.map((f, i) => (
                <div key={f.title} style={{
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border)',
                  borderRadius: 14,
                  padding: '24px 22px',
                  transition: 'all 0.2s',
                  cursor: 'default',
                }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-3px)'; (e.currentTarget as HTMLElement).style.boxShadow = 'var(--shadow-md)'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = ''; (e.currentTarget as HTMLElement).style.boxShadow = ''; }}
                >
                  <div style={{ fontSize: 28, marginBottom: 12 }}>{f.icon}</div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>
                    <span style={{ color: 'var(--accent)', marginRight: 6, fontSize: 12, fontWeight: 800 }}>0{i + 1}</span>
                    {f.title}
                  </div>
                  <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.65 }}>{f.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom CTA */}
          <div style={{ textAlign: 'center', padding: '32px', background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 16, maxWidth: 460, width: '100%' }}>
            <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>Ready to get started?</div>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 20 }}>Sign in to your workspace or create a new account.</p>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
              <button className="btn-primary-custom" onClick={() => setView('signin')} style={{ padding: '11px 28px' }}>Sign in</button>
              <Link to="/signup" className="btn-ghost">Create account</Link>
            </div>
          </div>
        </main>

      ) : (
        /* ---- Sign in View ---- */
        <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px', animation: 'fadeSlideUp 0.35s ease both' }}>
          <div style={{ width: '100%', maxWidth: 400, background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 18, padding: 36, boxShadow: 'var(--shadow-lg)' }}>

            <button onClick={() => setView('landing')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: 13, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 4 }}>
              ← Back
            </button>

            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.03em', marginBottom: 6 }}>Welcome back</h2>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 26 }}>Sign in to your ReOm.Co workspace</p>

            {error && <div className="error-banner">{error}</div>}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div className="form-group">
                <label className="form-label">Email address</label>
                <input type="email" className="form-input" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" required />
              </div>
              <div className="form-group">
                <label className="form-label">Password</label>
                <input type="password" className="form-input" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required />
              </div>
              <button type="submit" className="btn-primary-custom" disabled={loading} style={{ marginTop: 4, padding: '12px', fontSize: 15 }}>
                {loading ? <><div className="spinner" /><span>Signing in...</span></> : <span>Sign in →</span>}
              </button>
            </form>

            <div style={{ marginTop: 20, textAlign: 'center', fontSize: 13, color: 'var(--text-muted)' }}>
              Don't have an account?{' '}
              <Link to="/signup" style={{ color: 'var(--accent)', fontWeight: 600 }}>Create one</Link>
            </div>
          </div>
        </main>
      )}

      <footer style={{ textAlign: 'center', padding: '16px', fontSize: 11, color: 'var(--text-muted)', borderTop: '1px solid var(--border)' }}>
        © 2025 ReOm.Co — Operations Cloud Platform
      </footer>
    </div>
  );
};

export default Login;
