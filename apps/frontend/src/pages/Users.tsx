import React, { useContext, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/axios';
import { NotificationContext } from '../contexts/NotificationContext';

const fetchUsers = async () => { const { data } = await api.get('/users'); return data.data; };

const Users: React.FC = () => {
  const { showToast } = useContext(NotificationContext);
  const queryClient = useQueryClient();
  const { data: users, isLoading, error } = useQuery({ queryKey: ['users'], queryFn: fetchUsers });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState('');

  const changeRole = useMutation({
    mutationFn: ({ id, role }: { id: string; role: string }) => api.put(`/users/${id}/role`, { role }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setEditingId(null);
      showToast('Role Updated', 'User role has been changed successfully.', 'success');
    },
  });

  const approveUser = useMutation({
    mutationFn: (id: string) => api.put(`/users/${id}/approve`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      showToast('User Approved', 'User registration request approved.', 'success');
    },
  });

  const rejectUser = useMutation({
    mutationFn: (id: string) => api.put(`/users/${id}/reject`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      showToast('User Rejected', 'User access has been rejected.', 'warning');
    },
  });

  const deleteUser = useMutation({
    mutationFn: (id: string) => api.delete(`/users/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      showToast('User Removed', 'The user has been deleted from the platform.', 'warning');
    },
  });

  if (isLoading) return (
    <div className="page-wrapper"><div className="loading-screen"><div className="spinner" style={{ width: 32, height: 32, borderWidth: 3 }} /><span>Loading users...</span></div></div>
  );
  if (error) return <div className="page-wrapper"><div className="error-banner">Error loading users.</div></div>;

  const pendingUsers = users?.filter((u: any) => u.status === 'Pending') || [];
  const regularUsers = users?.filter((u: any) => u.status !== 'Pending') || [];

  return (
    <div className="page-wrapper">
      <div className="page-header" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <div className="page-title">User Management</div>
          <div className="page-subtitle">Manage accounts and permissions — {users?.length} total</div>
        </div>
        <span className="badge-status badge-rejected">Admin Only</span>
      </div>

      {/* Pending Approvals Section */}
      {pendingUsers.length > 0 && (
        <div className="section-card" style={{ marginBottom: 24, border: '1px solid var(--warning)' }}>
          <div className="section-card-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div className="section-card-title" style={{ color: 'var(--warning)', display: 'flex', alignItems: 'center', gap: 8 }}>
                <span>⏳</span> Pending Registrations
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>These users require approval before they can sign in</div>
            </div>
            <span className="badge-status badge-pending" style={{ padding: '4px 10px' }}>{pendingUsers.length} Pending</span>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>User</th><th>Email</th><th>Requested Role</th><th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {pendingUsers.map((user: any) => (
                  <tr key={user.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 32, height: 32, borderRadius: 10, background: `hsl(${user.username.charCodeAt(0) * 15 % 360}, 55%, 35%)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: '#fff' }}>
                          {user.username.charAt(0).toUpperCase()}
                        </div>
                        <span style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: 13 }}>{user.username}</span>
                      </div>
                    </td>
                    <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>{user.email}</td>
                    <td>
                      <span className={`role-badge role-${user.role}`}>{user.role === 'OperationalStaff' ? 'Ops Staff' : user.role}</span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button className="btn-success" onClick={() => approveUser.mutate(user.id)} disabled={approveUser.isPending}>Approve</button>
                        <button className="btn-danger" onClick={() => rejectUser.mutate(user.id)} disabled={rejectUser.isPending}>Reject</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Main Members Section */}
      <div className="section-card">
        <div className="section-card-header">
          <div className="section-card-title">Platform Members</div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{regularUsers.length} active/rejected members</div>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>#</th><th>User</th><th>Email</th><th>Role</th><th>Status</th>
                <th style={{ textAlign: 'center' }}>Tasks Assigned</th>
                <th style={{ textAlign: 'center' }}>Tasks Created</th>
                <th>Onboarded</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {regularUsers.map((user: any, index: number) => (
                <tr key={user.id}>
                  <td style={{ color: 'var(--text-muted)', fontSize: 12 }}>{index + 1}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 32, height: 32, borderRadius: 10, background: `hsl(${user.username.charCodeAt(0) * 15 % 360}, 55%, 35%)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: '#fff' }}>
                        {user.username.charAt(0).toUpperCase()}
                      </div>
                      <span style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: 13 }}>{user.username}</span>
                    </div>
                  </td>
                  <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>{user.email}</td>
                  <td>
                    {editingId === user.id ? (
                      <select className="form-input form-select" value={selectedRole} onChange={e => setSelectedRole(e.target.value)} style={{ width: 170 }}>
                        <option value="Admin">Admin</option>
                        <option value="Manager">Manager</option>
                        <option value="OperationalStaff">Operational Staff</option>
                        <option value="Executive">Executive</option>
                      </select>
                    ) : (
                      <span className={`role-badge role-${user.role}`}>{user.role === 'OperationalStaff' ? 'Ops Staff' : user.role}</span>
                    )}
                  </td>
                  <td>
                    <span className={`badge-status badge-${user.status.toLowerCase()}`}>{user.status}</span>
                  </td>
                  <td style={{ textAlign: 'center', fontSize: 13 }}>{user._count?.tasks_assigned ?? 0}</td>
                  <td style={{ textAlign: 'center', fontSize: 13 }}>{user._count?.tasks_created ?? 0}</td>
                  <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>{new Date(user.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                  <td>
                    {editingId === user.id ? (
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button className="btn-success" onClick={() => changeRole.mutate({ id: user.id, role: selectedRole })} disabled={changeRole.isPending}>Save</button>
                        <button className="btn-ghost" onClick={() => setEditingId(null)}>Cancel</button>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button className="btn-ghost" onClick={() => { setEditingId(user.id); setSelectedRole(user.role); }}>Change Role</button>
                        {user.status === 'Rejected' && (
                          <button className="btn-success" onClick={() => approveUser.mutate(user.id)} disabled={approveUser.isPending}>Approve</button>
                        )}
                        <button className="btn-danger" onClick={() => { if (window.confirm(`Remove ${user.username}?`)) deleteUser.mutate(user.id); }} disabled={deleteUser.isPending}>Remove</button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Users;
