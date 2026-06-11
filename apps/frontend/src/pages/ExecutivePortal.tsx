import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import { Line } from 'react-chartjs-2';
import api from '../api/axios';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const fetchExecutiveSummary = async () => {
  const { data } = await api.get('/executive/summary');
  return data.data;
};

const ExecutivePortal: React.FC = () => {
  const { data, isLoading, error } = useQuery({ queryKey: ['executiveSummary'], queryKeyFn: () => null, queryFn: fetchExecutiveSummary, retry: false });

  if (isLoading) return <div className="p-4 text-center">Loading Executive Portal...</div>;
  if (error) return <div className="p-4 text-danger text-center">Access Denied or Error loading data. This portal is restricted to Executive role.</div>;

  const trendChartData = {
    labels: data?.trends.labels || [],
    datasets: [{
      label: 'Organizational Growth (Week over Week)',
      data: data?.trends.growth || [],
      borderColor: '#0d6efd',
      backgroundColor: 'rgba(13, 110, 253, 0.5)',
      tension: 0.3,
    }]
  };

  return (
    <div className="container-fluid py-4 bg-light" style={{ minHeight: '100vh' }}>
      <div className="d-flex justify-content-between align-items-center mb-4 pb-2 border-bottom">
        <h2 className="text-primary fw-bold">Executive Reporting Portal</h2>
        <span className="badge bg-dark fs-6">CONFIDENTIAL</span>
      </div>
      
      <div className="row g-4 mb-4">
        {/* Organization Summary */}
        <div className="col-md-6">
          <div className="card shadow border-primary h-100">
            <div className="card-header bg-primary text-white fw-bold">Organization Summary</div>
            <div className="card-body">
              <p className="fs-5">Total Users: <strong className="text-primary">{data?.organization.totalUsers}</strong></p>
              <p className="fs-5">Active Departments: <strong className="text-primary">{data?.organization.activeDepartments}</strong></p>
            </div>
          </div>
        </div>

        {/* Operational Insights */}
        <div className="col-md-6">
          <div className="card shadow border-info h-100">
            <div className="card-header bg-info text-dark fw-bold">Operational Insights</div>
            <div className="card-body">
              <p className="fs-5">System Health: <strong className="text-success">{data?.insights.systemHealth}</strong></p>
              <p className="fs-5">Recent Activity Volume (Logs): <strong className="text-info">{data?.insights.recentActivityVolume}</strong></p>
            </div>
          </div>
        </div>
      </div>

      <div className="row g-4 mb-4">
        {/* KPI Summary */}
        <div className="col-12">
          <div className="card shadow border-success">
            <div className="card-header bg-success text-white fw-bold">KPI Summary</div>
            <div className="card-body d-flex justify-content-around text-center">
              <div>
                <h4 className="text-muted">Task Completion Rate</h4>
                <h2 className="text-success">{data?.kpis.taskCompletionRate?.toFixed(1) || 0}%</h2>
              </div>
              <div>
                <h4 className="text-muted">Active Tasks</h4>
                <h2 className="text-warning">{data?.kpis.activeTasks}</h2>
              </div>
              <div>
                <h4 className="text-muted">Total Approvals</h4>
                <h2 className="text-primary">{data?.kpis.totalApprovals}</h2>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="row g-4">
        {/* Trend Analysis */}
        <div className="col-12">
          <div className="card shadow border-dark">
            <div className="card-header bg-dark text-white fw-bold">Trend Analysis</div>
            <div className="card-body">
              <div style={{ height: '350px' }}>
                <Line data={trendChartData} options={{ maintainAspectRatio: false }} />
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default ExecutivePortal;
