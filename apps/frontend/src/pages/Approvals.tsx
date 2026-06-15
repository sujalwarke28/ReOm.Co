import React, { useContext, useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/axios';
import { AuthContext } from '../contexts/AuthContext';
import { NotificationContext } from '../contexts/NotificationContext';
import { CustomSelect } from '../components/CustomSelect';

interface AssignableUser { id: string; username: string; role: string; }

const fetchApprovals = async () => { const { data } = await api.get('/approvals'); return data.data; };
const fetchAssignableUsers = async (): Promise<AssignableUser[]> => { const { data } = await api.get('/users/assignable'); return data.data; };

const ROLE_LABELS: Record<string, string> = {
  Admin: 'Admin', Manager: 'Manager', OperationalStaff: 'Operational Staff', Executive: 'Executive',
};

const Approvals: React.FC = () => {
  const { user } = useContext(AuthContext);
  const { clearUnread, showToast } = useContext(NotificationContext);
  const queryClient = useQueryClient();

  const { data: approvals, isLoading, error } = useQuery({ queryKey: ['approvals'], queryFn: fetchApprovals });

  useEffect(() => { clearUnread('APPROVAL'); }, [clearUnread]);

  const { data: assignableUsers } = useQuery({ queryKey: ['assignableUsers'], queryFn: fetchAssignableUsers });

  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ request_title: '', requested_from: '' });
  const [formError, setFormError] = useState('');

  const usersByRole = (assignableUsers ?? []).reduce<Record<string, AssignableUser[]>>((acc, u) => {
    if (!acc[u.role]) acc[u.role] = [];
    acc[u.role]!.push(u);
    return acc;
  }, {});

  const getRoleOrder = () => {
    if (user?.role === 'OperationalStaff') return ['Executive', 'Manager'];
    if (user?.role === 'Manager') return ['Executive', 'Admin'];
    if (user?.role === 'Executive') return ['Admin'];
    if (user?.role === 'Admin') return ['Admin', 'Executive', 'Manager', 'OperationalStaff'];
    return [];
  };
  const roleOrder = getRoleOrder();

  const submitRequest = useMutation({
    mutationFn: (data: typeof form) => api.post('/approvals', { request_title: data.request_title, requested_from: data.requested_from || undefined }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['approvals'] });
      setShowModal(false);
      setForm({ request_title: '', requested_from: '' });
      setFormError('');
      showToast('Approval Submitted', 'Your approval request has been sent.', 'approval');
    },
    onError: (err: any) => setFormError(err.response?.data?.error || 'Failed to submit request'),
  });

  const approveRequest = useMutation({
    mutationFn: (id: string) => api.put(`/approvals/${id}/approve`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['approvals'] });
      showToast('Request Approved', 'The approval request has been approved.', 'success');
    },
  });

  const rejectRequest = useMutation({
    mutationFn: (id: string) => api.put(`/approvals/${id}/reject`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['approvals'] });
      showToast('Request Rejected', 'The approval request has been rejected.', 'error');
    },
  });

  const openModal = () => { setForm({ request_title: '', requested_from: '' }); setFormError(''); setShowModal(true); };

  if (isLoading) return (
    <div className="page-wrapper">
      <div className="loading-screen"><div className="spinner" style={{ width: 32, height: 32, borderWidth: 3 }} /><span>Loading approvals...</span></div>
    </div>
  );
  if (error) return <div className="page-wrapper"><div className="error-banner">Error loading approvals. Please refresh.</div></div>;

  return (
    <div className="page-wrapper">
      {/* Header */}
      <div className="page-header" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <div className="page-title">Approval Workflow</div>
          <div className="page-subtitle">
            {user?.role === 'Admin' ? `${approvals?.length ?? 0} total requests` : 'Requests you submitted or need to approve'}
          </div>
        </div>
        <button className="btn-primary-custom" onClick={openModal}>
          <span>＋</span><span>Submit Request</span>
        </button>
      </div>

      {/* Submit Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">Submit Approval Request</div>
              <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>
            {formError && <div className="error-banner">{formError}</div>}

            <div className="form-group">
              <label className="form-label">Request Title <span style={{ color: 'var(--danger)' }}>*</span></label>
              <input className="form-input" value={form.request_title} onChange={e => setForm({ ...form, request_title: e.target.value })} placeholder="e.g. Budget increase for Q3" required />
            </div>

            <div className="form-group">
              <label className="form-label">Request Approval From <span style={{ color: 'var(--danger)' }}>*</span></label>
              <CustomSelect
                value={form.requested_from}
                onChange={val => setForm({ ...form, requested_from: val })}
                optionsByRole={usersByRole}
                roleOrder={roleOrder}
                roleLabels={ROLE_LABELS}
                placeholder="— Select Approver —"
                allowUnassigned={false}
              />
            </div>

            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 8 }}>
              <button className="btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn-primary-custom" disabled={submitRequest.isPending || !form.request_title.trim() || !form.requested_from} onClick={() => submitRequest.mutate(form)}>
                {submitRequest.isPending ? <><div className="spinner" /><span>Submitting...</span></> : <span>Submit Request</span>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="section-card">
        <div className="section-card-header">
          <div className="section-card-title">Approval Requests</div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{approvals?.length ?? 0} records</div>
        </div>

        {approvals?.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📄</div>
            <div className="empty-state-text">No approval requests</div>
            <div className="empty-state-sub">Submit a request to get started.</div>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Request Title</th>
                  <th>Status</th>
                  <th>Requested From</th>
                  <th>Submitted By</th>
                  <th>Approved By</th>
                  <th>Date Assigned</th>
                  <th>Date Approved</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {[...(approvals || [])].sort((a: any, b: any) => {
                  if (a.status === 'Pending' && b.status !== 'Pending') return -1;
                  if (a.status !== 'Pending' && b.status === 'Pending') return 1;
                  return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
                }).map((app: any) => {
                  const canApprove = app.status === 'Pending' && (user?.role === 'Admin' || user?.id === app.requested_from);
                  return (
                    <tr key={app.id}>
                      <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{app.request_title}</td>
                      <td>
                        <span className={`badge-status ${app.status === 'Approved' ? 'badge-approved' : app.status === 'Rejected' ? 'badge-rejected' : 'badge-pending'}`} style={{ whiteSpace: 'nowrap' }}>
                          {app.status === 'Approved' ? '✓' : app.status === 'Rejected' ? '✕' : '●'} {app.status}
                        </span>
                      </td>
                      <td>
                        {app.requestee ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <div style={{ width: 26, height: 26, borderRadius: 8, background: `hsl(${app.requestee.username.charCodeAt(0) * 15 % 360}, 60%, 35%)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: '#fff' }}>
                              {app.requestee.username.charAt(0).toUpperCase()}
                            </div>
                            <span style={{ fontSize: 13, color: 'var(--text-primary)' }}>{app.requestee.username}</span>
                          </div>
                        ) : <span style={{ color: 'var(--text-muted)', fontStyle: 'italic', fontSize: 12 }}>—</span>}
                      </td>
                      <td style={{ fontSize: 13 }}>{app.submitter?.username || 'Unknown'}</td>
                      <td style={{ fontSize: 13, color: 'var(--text-muted)' }}>{app.approver?.username || '—'}</td>
                      <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>{new Date(app.created_at).toLocaleDateString()}</td>
                      <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                        {app.status !== 'Pending' ? new Date(app.updated_at).toLocaleDateString() : '—'}
                      </td>
                      <td>
                        {canApprove && (
                          <div style={{ display: 'flex', gap: 6 }}>
                            <button className="btn-success" onClick={() => approveRequest.mutate(app.id)} disabled={approveRequest.isPending}>Approve</button>
                            <button className="btn-danger" onClick={() => rejectRequest.mutate(app.id)} disabled={rejectRequest.isPending}>Reject</button>
                          </div>
                        )}
                        {!canApprove && app.status === 'Pending' && <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>Awaiting review</span>}
                        {app.status === 'Approved' && <span style={{ color: 'var(--success)', fontSize: 12, fontWeight: 600 }}>✓ Approved</span>}
                        {app.status === 'Rejected' && <span style={{ color: 'var(--danger)', fontSize: 12, fontWeight: 600 }}>✕ Rejected</span>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Approvals;
