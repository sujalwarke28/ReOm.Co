import React from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../api/axios';

const fetchAuditLogs = async () => { const { data } = await api.get('/audit'); return data.data; };

const AuditLogs: React.FC = () => {
  const { data: logs, isLoading, error } = useQuery({ queryKey: ['auditLogs'], queryFn: fetchAuditLogs });

  if (isLoading) return (
    <div className="page-wrapper"><div className="loading-screen"><div className="spinner" style={{ width: 32, height: 32, borderWidth: 3 }} /><span>Loading audit logs...</span></div></div>
  );
  if (error) return <div className="page-wrapper"><div className="error-banner">Access denied. Only Admins can view audit logs.</div></div>;

  return (
    <div className="page-wrapper">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div className="page-title">Operational Records & Audit Log</div>
          <div className="page-subtitle">Compliance-grade activity trail for all platform actions</div>
        </div>
        <span className="badge-status badge-info">Compliance Viewer</span>
      </div>

      <div className="section-card">
        <div className="section-card-header">
          <div className="section-card-title">Activity Log</div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{logs?.length} records</div>
        </div>
        {!logs?.length ? (
          <div className="empty-state">
            <div className="empty-state-icon">📁</div>
            <div className="empty-state-text">No audit records found</div>
            <div className="empty-state-sub">Actions will be logged here as users interact with the platform.</div>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr><th>Timestamp</th><th>Actor</th><th>Role</th><th>Action Detail</th></tr>
              </thead>
              <tbody>
                {logs?.map((log: any) => (
                  <tr key={log.id}>
                    <td style={{ fontSize: 12, whiteSpace: 'nowrap', color: 'var(--text-muted)' }}>{new Date(log.timestamp).toLocaleString()}</td>
                    <td style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: 13 }}>{log.actor?.username || 'Unknown'}</td>
                    <td><span className={`role-badge role-${log.actor?.role || 'OperationalStaff'}`}>{log.actor?.role || 'N/A'}</span></td>
                    <td style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{log.action}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuditLogs;
