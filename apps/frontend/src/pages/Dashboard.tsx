import React from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../api/axios';

interface KPIData {
  users: { total: number };
  tasks: { total: number; pending: number; completed: number };
  approvals: { total: number; pending: number; approved: number };
}

const fetchKPIs = async (): Promise<KPIData> => {
  const { data } = await api.get('/dashboard/kpis');
  return data.data;
};

const Dashboard: React.FC = () => {
  const { data, isLoading, error } = useQuery<KPIData>({
    queryKey: ['kpis'],
    queryFn: fetchKPIs,
    // Mocking the token since we haven't built the login UI yet
    retry: false
  });

  // Temporarily set a dummy token for development testing if not present
  React.useEffect(() => {
    if (!localStorage.getItem('token')) {
      localStorage.setItem('token', 'dummy-token-for-dev');
    }
  }, []);

  if (isLoading) return <div className="p-4 text-center">Loading KPIs...</div>;
  if (error) return <div className="p-4 text-danger text-center">Error loading dashboard data. Have you started the backend server?</div>;

  return (
    <div className="container-fluid py-4">
      <h2 className="mb-4">Centralized Operational Dashboard</h2>
      
      <div className="row g-4 mb-4">
        <div className="col-md-3">
          <div className="card kpi-card h-100">
            <div className="card-body">
              <h5 className="card-title">Total Users</h5>
              <p className="card-text text-primary">{data?.users.total || 0}</p>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card kpi-card h-100">
            <div className="card-body">
              <h5 className="card-title">Total Tasks</h5>
              <p className="card-text text-info">{data?.tasks.total || 0}</p>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card kpi-card h-100">
            <div className="card-body">
              <h5 className="card-title">Pending Tasks</h5>
              <p className="card-text text-warning">{data?.tasks.pending || 0}</p>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card kpi-card h-100">
            <div className="card-body">
              <h5 className="card-title">Completed Tasks</h5>
              <p className="card-text text-success">{data?.tasks.completed || 0}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="row g-4">
        <div className="col-md-4">
          <div className="card kpi-card h-100">
            <div className="card-body">
              <h5 className="card-title">Total Approvals</h5>
              <p className="card-text text-secondary">{data?.approvals.total || 0}</p>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card kpi-card h-100">
            <div className="card-body">
              <h5 className="card-title">Pending Approvals</h5>
              <p className="card-text text-warning">{data?.approvals.pending || 0}</p>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card kpi-card h-100">
            <div className="card-body">
              <h5 className="card-title">Approved Requests</h5>
              <p className="card-text text-success">{data?.approvals.approved || 0}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
