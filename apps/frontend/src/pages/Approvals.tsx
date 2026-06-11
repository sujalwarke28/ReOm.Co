import React from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../api/axios';

const fetchApprovals = async () => {
  const { data } = await api.get('/approvals');
  return data.data;
};

const Approvals: React.FC = () => {
  const { data: approvals, isLoading, error } = useQuery({ queryKey: ['approvals'], queryFn: fetchApprovals });

  if (isLoading) return <div className="p-4 text-center">Loading Approvals...</div>;
  if (error) return <div className="p-4 text-danger text-center">Error loading approvals.</div>;

  return (
    <div className="container-fluid py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Approval Workflow</h2>
        <button className="btn btn-primary">Submit Request</button>
      </div>
      
      <div className="card shadow-sm border-0">
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover mb-0">
              <thead className="table-light">
                <tr>
                  <th>Request Title</th>
                  <th>Status</th>
                  <th>Submitted By</th>
                  <th>Approved By</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {approvals?.map((app: any) => (
                  <tr key={app.id}>
                    <td>{app.request_title}</td>
                    <td>
                      <span className={`badge bg-${app.status === 'Approved' ? 'success' : app.status === 'Rejected' ? 'danger' : 'warning'}`}>
                        {app.status}
                      </span>
                    </td>
                    <td>{app.submitter?.username || 'Unknown'}</td>
                    <td>{app.approver?.username || '-'}</td>
                    <td>{new Date(app.created_at).toLocaleDateString()}</td>
                    <td>
                      {app.status === 'Pending' && (
                        <>
                          <button className="btn btn-sm btn-success me-2">Approve</button>
                          <button className="btn btn-sm btn-danger">Reject</button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
                {approvals?.length === 0 && (
                  <tr>
                    <td colSpan={6} className="text-center py-4 text-muted">No approval requests found.</td>
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

export default Approvals;
