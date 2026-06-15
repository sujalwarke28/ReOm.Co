import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, NavLink, useNavigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './contexts/AuthContext';
import { NotificationProvider, NotificationContext } from './contexts/NotificationContext';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import ProtectedRoute from './components/ProtectedRoute';
import './App.css';

import Login from './pages/Login';
import Signup from './pages/Signup';
import Unauthorized from './pages/Unauthorized';
import Dashboard from './pages/Dashboard';
import Tasks from './pages/Tasks';
import Approvals from './pages/Approvals';
import Analytics from './pages/Analytics';
import ExecutivePortal from './pages/ExecutivePortal';
import Monitoring from './pages/Monitoring';
import AuditLogs from './pages/AuditLogs';
import Pricing from './pages/Pricing';
import Users from './pages/Users';
import Profile from './pages/Profile';

const Sidebar: React.FC = () => {
  const { user, logout } = useContext(AuthContext);
  const { unreadTasks, unreadApprovals, showToast } = useContext(NotificationContext);
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  if (!user) return null;

  const initials = user.username.slice(0, 2).toUpperCase();

  const handleLogout = () => {
    const name = user?.username;
    logout();
    showToast('Logged out', `Goodbye, ${name}! See you next time.`, 'info');
    navigate('/login');
  };

  return (
    <aside className="sidebar">
      {/* Logo */}
      <NavLink to="/dashboard" className="sidebar-logo">
        <div className="sidebar-logo-icon">R</div>
        <div>
          <div className="sidebar-logo-text">ReOm.Co</div>
          <div className="sidebar-logo-sub">Operations Cloud</div>
        </div>
      </NavLink>

      {/* Nav */}
      <nav className="sidebar-nav">
        <span className="sidebar-section-label">Main</span>

        <NavLink to="/dashboard" className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}>
          <span className="sidebar-link-icon">⊞</span>
          <span className="sidebar-link-text">Dashboard</span>
        </NavLink>

        <NavLink to="/tasks" className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}>
          <span className="sidebar-link-icon">📋</span>
          <span className="sidebar-link-text">Tasks</span>
          {unreadTasks && <span className="sidebar-link-badge" />}
        </NavLink>

        <NavLink to="/approvals" className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}>
          <span className="sidebar-link-icon">✅</span>
          <span className="sidebar-link-text">Approvals</span>
          {unreadApprovals && <span className="sidebar-link-badge" />}
        </NavLink>

        {['Admin', 'Manager', 'Executive'].includes(user.role) && (
          <NavLink to="/analytics" className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}>
            <span className="sidebar-link-icon">📊</span>
            <span className="sidebar-link-text">Analytics</span>
          </NavLink>
        )}

        {['Admin', 'Executive'].includes(user.role) && (
          <NavLink to="/executive" className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}>
            <span className="sidebar-link-icon">💼</span>
            <span className="sidebar-link-text">Executive Portal</span>
          </NavLink>
        )}

        {user.role === 'Admin' && (
          <>
            <div className="sidebar-divider" />
            <span className="sidebar-section-label">Admin</span>

            <NavLink to="/pricing" className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}>
              <span className="sidebar-link-icon">💲</span>
              <span className="sidebar-link-text">Pricing Strategy</span>
            </NavLink>

            <NavLink to="/monitoring" className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}>
              <span className="sidebar-link-icon">🖥</span>
              <span className="sidebar-link-text">Monitoring</span>
            </NavLink>

            <NavLink to="/audit" className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}>
              <span className="sidebar-link-icon">📁</span>
              <span className="sidebar-link-text">Audit Logs</span>
            </NavLink>

            <NavLink to="/users" className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}>
              <span className="sidebar-link-icon">👥</span>
              <span className="sidebar-link-text">Users</span>
            </NavLink>
          </>
        )}

        <div className="sidebar-divider" />

        <NavLink to="/profile" className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}>
          <span className="sidebar-link-icon">👤</span>
          <span className="sidebar-link-text">Profile</span>
        </NavLink>
      </nav>

      {/* Footer */}
      <div className="sidebar-footer">
        <div className="sidebar-user">
          <div className="sidebar-avatar">{initials}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="sidebar-user-name">{user.username}</div>
            <div className="sidebar-user-role">{user.role}</div>
          </div>
          {/* Theme toggle */}
          <button
            className="sidebar-icon-btn"
            onClick={toggleTheme}
            title={theme === 'dark' ? 'Switch to Light mode' : 'Switch to Dark mode'}
          >
            {theme === 'dark' ? '☀' : '◑'}
          </button>
          {/* Logout */}
          <button className="sidebar-icon-btn logout" onClick={handleLogout} title="Logout">
            ⏻
          </button>
        </div>
      </div>
    </aside>
  );
};

const AppRoutes = () => (
  <>
    <Sidebar />
    <Routes>
      <Route path="/login"        element={<Login />} />
      <Route path="/signup"       element={<Signup />} />
      <Route path="/unauthorized" element={<Unauthorized />} />
      <Route path="/"             element={<Navigate to="/dashboard" replace />} />
      <Route path="/dashboard"    element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/tasks"        element={<ProtectedRoute><Tasks /></ProtectedRoute>} />
      <Route path="/approvals"    element={<ProtectedRoute><Approvals /></ProtectedRoute>} />
      <Route path="/analytics"    element={<ProtectedRoute allowedRoles={['Admin','Manager','Executive']}><Analytics /></ProtectedRoute>} />
      <Route path="/executive"    element={<ProtectedRoute allowedRoles={['Admin','Executive']}><ExecutivePortal /></ProtectedRoute>} />
      <Route path="/monitoring"   element={<ProtectedRoute allowedRoles={['Admin']}><Monitoring /></ProtectedRoute>} />
      <Route path="/audit"        element={<ProtectedRoute allowedRoles={['Admin']}><AuditLogs /></ProtectedRoute>} />
      <Route path="/pricing"      element={<ProtectedRoute allowedRoles={['Admin']}><Pricing /></ProtectedRoute>} />
      <Route path="/users"        element={<ProtectedRoute allowedRoles={['Admin']}><Users /></ProtectedRoute>} />
      <Route path="/profile"      element={<ProtectedRoute><Profile /></ProtectedRoute>} />
    </Routes>
  </>
);

const App: React.FC = () => (
  <ThemeProvider>
    <AuthProvider>
      <NotificationProvider>
        <Router>
          <AppRoutes />
        </Router>
      </NotificationProvider>
    </AuthProvider>
  </ThemeProvider>
);

export default App;
