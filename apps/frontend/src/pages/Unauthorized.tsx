import React from 'react';
import { Link } from 'react-router-dom';

const Unauthorized: React.FC = () => {
  return (
    <div style={{
      display: 'flex',
      minHeight: '100vh',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--bg-base)',
      padding: 24,
      flex: 1,
      width: '100%',
    }}>
      <div style={{
        width: '100%',
        maxWidth: 440,
        background: 'var(--bg-surface)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-xl)',
        padding: 40,
        boxShadow: 'var(--shadow-lg)',
        textAlign: 'center',
        animation: 'fadeSlideUp 0.4s ease both',
      }}>
        <div style={{ fontSize: 48, marginBottom: 20 }}>🔒</div>
        <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--danger)', letterSpacing: '-0.03em', marginBottom: 12 }}>Access Denied</h2>
        <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 28 }}>
          You do not have the required permissions to access this page. Please contact your administrator if you believe this is an error.
        </p>
        <Link to="/dashboard" className="btn-primary-custom" style={{ textDecoration: 'none', display: 'inline-flex' }}>
          Return to Dashboard
        </Link>
      </div>
    </div>
  );
};

export default Unauthorized;
