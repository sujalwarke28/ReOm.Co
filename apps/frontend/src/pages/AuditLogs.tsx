import React from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../api/axios';

const fetchAuditLogs = async () => {
  const { data } = await api.get('/audit');
  return data.data;
};

const AuditLogs: React.FC = () => {
  const { data: logs, isLoading, error } = useQuery({ queryKey: ['auditLogs'], queryFn: fetchAuditLogs });

  if (isLoading) return <div className="p-4 text-center">Loading Audit Logs...</div>;
  if (error) return <div className="p-4 text-danger text-center">Access Denied. Only Admins can view audit logs.</div>;

  return (
    <div className="container-fluid py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Operational Records & Audit Log</h2>
        <span className="badge bg-secondary fs-6">Compliance Viewer</span>
      </div>
      
      <div className="card shadow-sm border-0">
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover table-striped mb-0">
              <thead className="table-dark">
                <tr>
                  <th>Timestamp</th>
                  <th>Actor (Username)</th>
                  <th>Role</th>
                  <th>Action Detail</th>
                </tr>
              </thead>
              <tbody>
                {logs?.map((log: any) => (
                  <tr key={log.id}>
                    <td className="text-muted" style={{ whiteSpace: 'nowrap' }}>
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="fw-bold">{log.actor?.username || 'Unknown'}</td>
                    <td>
                      <span className={`badge bg-${log.actor?.role === 'Admin' ? 'danger' : 'primary'}`}>
                        {log.actor?.role || 'N/A'}
                      </span>
                    </td>
                    <td>{log.action}</td>
                  </tr>
                ))}
                {logs?.length === 0 && (
                  <tr>
                    <td colSpan={4} className="text-center py-4 text-muted">No operational records found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuditLogs;
