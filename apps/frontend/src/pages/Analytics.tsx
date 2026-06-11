import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';
import api from '../api/axios';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

const fetchAnalytics = async (endpoint: string) => {
  const { data } = await api.get(`/analytics/${endpoint}`);
  return data.data;
};

const Analytics: React.FC = () => {
  const { data: tasksData, isLoading: loadingTasks } = useQuery({ queryKey: ['tasksAnalytics'], queryFn: () => fetchAnalytics('tasks') });
  const { data: approvalsData, isLoading: loadingApprovals } = useQuery({ queryKey: ['approvalsAnalytics'], queryFn: () => fetchAnalytics('approvals') });
  const { data: deptsData, isLoading: loadingDepts } = useQuery({ queryKey: ['deptsAnalytics'], queryFn: () => fetchAnalytics('departments') });

  if (loadingTasks || loadingApprovals || loadingDepts) {
    return <div className="p-4 text-center">Loading Analytics...</div>;
  }

  const tasksChartData = {
    labels: tasksData?.labels || [],
    datasets: [{
      data: tasksData?.data || [],
      backgroundColor: ['#ffc107', '#198754'],
    }]
  };

  const approvalsChartData = {
    labels: approvalsData?.labels || [],
    datasets: [{
      label: 'Approvals by Status',
      data: approvalsData?.data || [],
      backgroundColor: ['#ffc107', '#198754', '#dc3545'],
    }]
  };

  const deptsChartData = {
    labels: deptsData?.labels || [],
    datasets: [{
      label: 'Tasks Created by Role',
      data: deptsData?.data || [],
      backgroundColor: ['#0dcaf0', '#6f42c1', '#fd7e14', '#20c997'],
    }]
  };

  return (
    <div className="container-fluid py-4">
      <h2 className="mb-4">Reporting & Analytics</h2>
      
      <div className="row g-4">
        <div className="col-md-4">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-body">
              <h5 className="card-title text-center mb-4">Task Status Distribution</h5>
              <div style={{ height: '300px', display: 'flex', justifyContent: 'center' }}>
                <Doughnut data={tasksChartData} options={{ maintainAspectRatio: false }} />
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-body">
              <h5 className="card-title text-center mb-4">Approval Requests</h5>
              <div style={{ height: '300px' }}>
                <Bar data={approvalsChartData} options={{ maintainAspectRatio: false }} />
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-body">
              <h5 className="card-title text-center mb-4">Department Load (Tasks)</h5>
              <div style={{ height: '300px' }}>
                <Bar data={deptsChartData} options={{ maintainAspectRatio: false }} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
