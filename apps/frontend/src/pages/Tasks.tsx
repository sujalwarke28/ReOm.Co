import React, { useContext, useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/axios';
import { AuthContext } from '../contexts/AuthContext';
import { NotificationContext } from '../contexts/NotificationContext';
import { CustomSelect } from '../components/CustomSelect';

interface AssignableUser { id: string; username: string; role: string; }

const fetchTasks = async () => { const { data } = await api.get('/tasks'); return data.data; };
const fetchAssignableUsers = async (): Promise<AssignableUser[]> => { const { data } = await api.get('/users/assignable'); return data.data; };

const ROLE_LABELS: Record<string, string> = {
  Admin: 'Admin', Manager: 'Manager', OperationalStaff: 'Operational Staff', Executive: 'Executive',
};

const Tasks: React.FC = () => {
  const { user } = useContext(AuthContext);
  const { clearUnread, showToast } = useContext(NotificationContext);
  const queryClient = useQueryClient();

  useEffect(() => { clearUnread('TASK'); }, [clearUnread]);

  const { data: tasks, isLoading, error } = useQuery({ queryKey: ['tasks'], queryFn: fetchTasks });

  const canCreate = ['Admin', 'Manager', 'Executive'].includes(user?.role || '');
  const canDelete = user?.role === 'Admin';

  const { data: assignableUsers } = useQuery({
    queryKey: ['assignableUsers'], queryFn: fetchAssignableUsers, enabled: canCreate,
  });

  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', assigned_to: '' });
  const [formError, setFormError] = useState('');

  const usersByRole = (assignableUsers ?? []).reduce<Record<string, AssignableUser[]>>((acc, u) => {
    if (!acc[u.role]) acc[u.role] = [];
    acc[u.role]!.push(u);
    return acc;
  }, {});

  const getRoleOrder = () => {
    if (user?.role === 'Admin') return ['Admin', 'Manager', 'OperationalStaff', 'Executive'];
    if (user?.role === 'Executive') return ['Manager', 'OperationalStaff'];
    if (user?.role === 'Manager') return ['OperationalStaff'];
    return [];
  };
  const roleOrder = getRoleOrder();

  const createTask = useMutation({
    mutationFn: (data: typeof form) => api.post('/tasks', { title: data.title, description: data.description, assigned_to: data.assigned_to || undefined }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      setShowModal(false);
      setForm({ title: '', description: '', assigned_to: '' });
      setFormError('');
      showToast('Task Created', 'Your new task has been created successfully.', 'success');
    },
    onError: (err: any) => setFormError(err.response?.data?.error || 'Failed to create task'),
  });

  const updateStatus = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => api.put(`/tasks/${id}`, { status }),
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      showToast('Task Updated', `Task marked as ${vars.status}.`, vars.status === 'Completed' ? 'success' : 'info');
    },
  });

  const deleteTask = useMutation({
    mutationFn: (id: string) => api.delete(`/tasks/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      showToast('Task Deleted', 'The task has been removed.', 'warning');
    },
  });

  const openModal = () => { setForm({ title: '', description: '', assigned_to: '' }); setFormError(''); setShowModal(true); };

  if (isLoading) return (
    <div className="page-wrapper">
      <div className="loading-screen"><div className="spinner" style={{ width: 32, height: 32, borderWidth: 3 }} /><span>Loading tasks...</span></div>
    </div>
  );
  if (error) return <div className="page-wrapper"><div className="error-banner">Error loading tasks. Please refresh.</div></div>;

  return (
    <div className="page-wrapper">
      {/* Header */}
      <div className="page-header" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <div className="page-title">Task Management</div>
          <div className="page-subtitle">
            {user?.role === 'Admin' ? `${tasks?.length ?? 0} total tasks` : 'Your assigned & created tasks'}
          </div>
        </div>
        {canCreate && (
          <button className="btn-primary-custom" onClick={openModal}>
            <span>＋</span><span>Create Task</span>
          </button>
        )}
      </div>

      {/* Create Task Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">Create New Task</div>
              <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>
            {formError && <div className="error-banner">{formError}</div>}

            <div className="form-group">
              <label className="form-label">Title <span style={{ color: 'var(--danger)' }}>*</span></label>
              <input className="form-input" placeholder="e.g. Q3 Infrastructure Review" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required />
            </div>

            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea className="form-input form-textarea" rows={3} placeholder="Describe what needs to be done..." value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} style={{ resize: 'vertical', minHeight: 80 }} />
            </div>

            <div className="form-group">
              <label className="form-label">Assign To</label>
              <CustomSelect
                value={form.assigned_to}
                onChange={val => setForm({ ...form, assigned_to: val })}
                optionsByRole={usersByRole}
                roleOrder={roleOrder}
                roleLabels={ROLE_LABELS}
                placeholder="— Unassigned —"
              />
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 6 }}>Assigned users will receive a push notification.</div>
            </div>

            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 8 }}>
              <button className="btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn-primary-custom" disabled={createTask.isPending || !form.title.trim()} onClick={() => createTask.mutate(form)}>
                {createTask.isPending ? <><div className="spinner" /><span>Creating...</span></> : <span>Create Task</span>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tasks Table */}
      <div className="section-card">
        <div className="section-card-header">
          <div className="section-card-title">All Tasks</div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{tasks?.length ?? 0} records</div>
        </div>

        {tasks?.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📋</div>
            <div className="empty-state-text">No tasks found</div>
            <div className="empty-state-sub">{canCreate ? 'Click "Create Task" to get started.' : 'No tasks have been assigned to you yet.'}</div>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Description</th>
                  <th>Status</th>
                  <th>Assigned To</th>
                  <th>Created By</th>
                  <th>Date Assigned</th>
                  <th>Date Completed</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {[...(tasks || [])].sort((a: any, b: any) => {
                  if (a.status === 'Pending' && b.status !== 'Pending') return -1;
                  if (a.status !== 'Pending' && b.status === 'Pending') return 1;
                  return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
                }).map((task: any) => (
                  <tr key={task.id}>
                    <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{task.title}</td>
                    <td style={{ maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {task.description || <em style={{ color: 'var(--text-muted)' }}>—</em>}
                    </td>
                    <td>
                      <span className={`badge-status ${task.status === 'Completed' ? 'badge-completed' : 'badge-pending'}`} style={{ whiteSpace: 'nowrap' }}>
                        {task.status === 'Completed' ? '✓' : '●'} {task.status}
                      </span>
                    </td>
                    <td>
                      {task.assignee ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div style={{
                            width: 26, height: 26, borderRadius: 8,
                            background: `hsl(${task.assignee.username.charCodeAt(0) * 15 % 360}, 60%, 35%)`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: 11, fontWeight: 700, color: '#fff',
                          }}>
                            {task.assignee.username.charAt(0).toUpperCase()}
                          </div>
                          <span style={{ fontSize: 13, color: 'var(--text-primary)' }}>{task.assignee.username}</span>
                        </div>
                      ) : (
                        <span style={{ color: 'var(--text-muted)', fontStyle: 'italic', fontSize: 12 }}>Unassigned</span>
                      )}
                    </td>
                    <td style={{ fontSize: 12 }}>{task.creator?.username || 'Unknown'}</td>
                    <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>{new Date(task.created_at).toLocaleDateString()}</td>
                    <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                      {task.status === 'Completed' ? new Date(task.updated_at).toLocaleDateString() : '—'}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        {task.status !== 'Completed' && (
                          <button className="btn-success" onClick={() => updateStatus.mutate({ id: task.id, status: 'Completed' })} disabled={updateStatus.isPending}>
                            ✓ Complete
                          </button>
                        )}
                        {canDelete && (
                          <button className="btn-danger" onClick={() => { if (window.confirm('Delete this task?')) deleteTask.mutate(task.id); }} disabled={deleteTask.isPending}>
                            Delete
                          </button>
                        )}
                        {task.status === 'Completed' && !canDelete && (
                          <span style={{ color: 'var(--success)', fontSize: 12, fontWeight: 600 }}>✓ Done</span>
                        )}
                      </div>
                    </td>
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

export default Tasks;
