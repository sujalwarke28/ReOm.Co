import React from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../api/axios';

const fetchTasks = async () => {
  const { data } = await api.get('/tasks');
  return data.data;
};

const Tasks: React.FC = () => {
  const { data: tasks, isLoading, error } = useQuery({ queryKey: ['tasks'], queryFn: fetchTasks });

  if (isLoading) return <div className="p-4 text-center">Loading Tasks...</div>;
  if (error) return <div className="p-4 text-danger text-center">Error loading tasks.</div>;

  return (
    <div className="container-fluid py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Task Assignment System</h2>
        <button className="btn btn-primary">Create Task</button>
      </div>
      
      <div className="card shadow-sm border-0">
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover mb-0">
              <thead className="table-light">
                <tr>
                  <th>Title</th>
                  <th>Description</th>
                  <th>Status</th>
                  <th>Assigned To</th>
                  <th>Created By</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {tasks?.map((task: any) => (
                  <tr key={task.id}>
                    <td>{task.title}</td>
                    <td>{task.description}</td>
                    <td>
                      <span className={`badge bg-${task.status === 'Completed' ? 'success' : 'warning'}`}>
                        {task.status}
                      </span>
                    </td>
                    <td>{task.assignee?.username || 'Unassigned'}</td>
                    <td>{task.creator?.username || 'Unknown'}</td>
                    <td>
                      <button className="btn btn-sm btn-outline-success me-2">Complete</button>
                      <button className="btn btn-sm btn-outline-secondary">Edit</button>
                    </td>
                  </tr>
                ))}
                {tasks?.length === 0 && (
                  <tr>
                    <td colSpan={6} className="text-center py-4 text-muted">No tasks found.</td>
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

export default Tasks;
