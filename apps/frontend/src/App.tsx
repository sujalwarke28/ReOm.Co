import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Tasks from './pages/Tasks';
import Approvals from './pages/Approvals';
import Analytics from './pages/Analytics';
import ExecutivePortal from './pages/ExecutivePortal';
import Monitoring from './pages/Monitoring';
import AuditLogs from './pages/AuditLogs';
import Pricing from './pages/Pricing';

const App: React.FC = () => {
  return (
    <Router>
      <div>
        <nav className="navbar navbar-expand-lg navbar-dark bg-dark mb-4">
          <div className="container-fluid">
            <Link className="navbar-brand" to="/">ReOm.Co</Link>
            <div className="collapse navbar-collapse">
              <ul className="navbar-nav me-auto">
                <li className="nav-item">
                  <Link className="nav-link" to="/dashboard">Dashboard</Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/tasks">Tasks</Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/approvals">Approvals</Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/analytics">Analytics</Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link text-success" to="/pricing">Pricing Strategy</Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link text-danger" to="/monitoring">Monitoring</Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link text-info" to="/audit">Audit Logs</Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link text-warning" to="/executive">Executive Portal</Link>
                </li>
              </ul>
            </div>
          </div>
        </nav>
        
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/tasks" element={<Tasks />} />
          <Route path="/approvals" element={<Approvals />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/executive" element={<ExecutivePortal />} />
          <Route path="/monitoring" element={<Monitoring />} />
          <Route path="/audit" element={<AuditLogs />} />
          <Route path="/pricing" element={<Pricing />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
