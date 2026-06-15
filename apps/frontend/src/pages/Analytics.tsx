import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';
import api from '../api/axios';
import { useTheme } from '../contexts/ThemeContext';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

const fetchAnalytics = async (endpoint: string) => {
  const { data } = await api.get(`/analytics/${endpoint}`);
  return data.data;
};

const Analytics: React.FC = () => {
  const { theme } = useTheme();
  const labelColor = theme === 'dark' ? '#94a3b8' : '#4b5563';
  const tickColor = theme === 'dark' ? '#64748b' : '#6b7280';
  const gridColor = theme === 'dark' ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.06)';

  const chartBaseOptions = {
    maintainAspectRatio: false,
    plugins: {
      legend: { labels: { color: labelColor, font: { family: 'Inter', size: 12 } } },
    },
  };
  const { data: tasksData, isLoading: l1 } = useQuery({ queryKey: ['tasksAnalytics'], queryFn: () => fetchAnalytics('tasks') });
  const { data: approvalsData, isLoading: l2 } = useQuery({ queryKey: ['approvalsAnalytics'], queryFn: () => fetchAnalytics('approvals') });
  const { data: deptsData, isLoading: l3 } = useQuery({ queryKey: ['deptsAnalytics'], queryFn: () => fetchAnalytics('departments') });

  if (l1 || l2 || l3) return (
    <div className="page-wrapper"><div className="loading-screen"><div className="spinner" style={{ width: 32, height: 32, borderWidth: 3 }} /><span>Loading analytics...</span></div></div>
  );

  const tasksChartData = {
    labels: tasksData?.labels || [],
    datasets: [{ data: tasksData?.data || [], backgroundColor: ['#f59e0b', '#10b981'], borderColor: 'transparent', hoverOffset: 6 }]
  };

  const approvalsChartData = {
    labels: approvalsData?.labels || [],
    datasets: [{ label: 'Count', data: approvalsData?.data || [], backgroundColor: ['#f59e0b', '#10b981', '#ef4444'], borderRadius: 6, borderWidth: 0 }]
  };

  const deptsChartData = {
    labels: deptsData?.labels || [],
    datasets: [{ label: 'Tasks Created', data: deptsData?.data || [], backgroundColor: ['#38bdf8', '#8b5cf6', '#f59e0b', '#10b981'], borderRadius: 6, borderWidth: 0 }]
  };

  const barOptions = {
    ...chartBaseOptions,
    scales: {
      x: { ticks: { color: tickColor }, grid: { color: gridColor } },
      y: { ticks: { color: tickColor }, grid: { color: gridColor } },
    },
  };

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <div className="page-title">Reporting & Analytics</div>
        <div className="page-subtitle">Task and approval metrics across the organization</div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
        <div className="section-card">
          <div className="section-card-header"><div className="section-card-title">Task Status Distribution</div></div>
          <div className="section-card-body" style={{ height: 280 }}>
            <Doughnut data={tasksChartData} options={chartBaseOptions} />
          </div>
        </div>

        <div className="section-card">
          <div className="section-card-header"><div className="section-card-title">Approval Requests</div></div>
          <div className="section-card-body" style={{ height: 280 }}>
            <Bar data={approvalsChartData} options={barOptions as any} />
          </div>
        </div>

        <div className="section-card">
          <div className="section-card-header"><div className="section-card-title">Department Task Load</div></div>
          <div className="section-card-body" style={{ height: 280 }}>
            <Bar data={deptsChartData} options={barOptions as any} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
