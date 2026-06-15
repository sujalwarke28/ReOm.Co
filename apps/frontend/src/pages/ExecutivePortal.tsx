import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import { Line } from 'react-chartjs-2';
import api from '../api/axios';
import { useTheme } from '../contexts/ThemeContext';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const fetchExecutiveSummary = async () => { const { data } = await api.get('/executive/summary'); return data.data; };

const ExecutivePortal: React.FC = () => {
  const { theme } = useTheme();
  const labelColor = theme === 'dark' ? '#94a3b8' : '#4b5563';
  const tickColor = theme === 'dark' ? '#64748b' : '#6b7280';
  const gridColor = theme === 'dark' ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.06)';

  const { data, isLoading, error } = useQuery<any>({ queryKey: ['executiveSummary'], queryFn: fetchExecutiveSummary, retry: false });

  if (isLoading) return (
    <div className="page-wrapper"><div className="loading-screen"><div className="spinner" style={{ width: 32, height: 32, borderWidth: 3 }} /><span>Loading executive data...</span></div></div>
  );
  if (error) return <div className="page-wrapper"><div className="error-banner">Access denied. This portal is restricted to Executive & Admin roles.</div></div>;

  const trendChartData = {
    labels: data?.trends.labels || [],
    datasets: [{
      label: 'Organizational Growth (Week over Week)',
      data: data?.trends.growth || [],
      borderColor: '#6366f1',
      backgroundColor: 'rgba(99,102,241,0.15)',
      fill: true,
      tension: 0.4,
      pointBackgroundColor: '#6366f1',
      pointRadius: 4,
    }]
  };

  const chartOptions = {
    maintainAspectRatio: false,
    plugins: {
      legend: { labels: { color: labelColor, font: { family: 'Inter', size: 12 } } },
    },
    scales: {
      x: { ticks: { color: tickColor }, grid: { color: gridColor } },
      y: { ticks: { color: tickColor }, grid: { color: gridColor } },
    },
  };

  return (
    <div className="page-wrapper">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div className="page-title">Executive Reporting Portal</div>
          <div className="page-subtitle">High-level KPIs, trends, and organizational insights</div>
        </div>
        <span className="badge-status badge-rejected" style={{ letterSpacing: '0.1em' }}>CONFIDENTIAL</span>
      </div>

      {/* Top KPIs */}
      <div className="kpi-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}>
        <div className="kpi-card">
          <div className="kpi-icon" style={{ background: 'rgba(99,102,241,0.15)', color: 'var(--accent-light)' }}>👥</div>
          <div className="kpi-value">{data?.organization.totalUsers}</div>
          <div className="kpi-label">Total Users</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-icon" style={{ background: 'rgba(16,185,129,0.15)', color: 'var(--success)' }}>🏢</div>
          <div className="kpi-value">{data?.organization.activeDepartments}</div>
          <div className="kpi-label">Active Departments</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-icon" style={{ background: 'rgba(16,185,129,0.15)', color: 'var(--success)' }}>✅</div>
          <div className="kpi-value">{data?.kpis.taskCompletionRate?.toFixed(1) || 0}%</div>
          <div className="kpi-label">Task Completion Rate</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-icon" style={{ background: 'var(--warning-subtle)', color: 'var(--warning)' }}>⏳</div>
          <div className="kpi-value">{data?.kpis.activeTasks}</div>
          <div className="kpi-label">Active Tasks</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-icon" style={{ background: 'rgba(139,92,246,0.15)', color: 'var(--purple)' }}>📨</div>
          <div className="kpi-value">{data?.kpis.totalApprovals}</div>
          <div className="kpi-label">Total Approvals</div>
        </div>
      </div>

      {/* Insights + Chart */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 20 }}>
        <div className="section-card">
          <div className="section-card-header"><div className="section-card-title">Operational Insights</div></div>
          <div className="section-card-body">
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>System Health</div>
              <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--success)' }}>{data?.insights.systemHealth}</div>
            </div>
            <div className="divider" />
            <div>
              <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>Recent Activity Volume</div>
              <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--accent-light)' }}>{data?.insights.recentActivityVolume} logs</div>
            </div>
          </div>
        </div>

        <div className="section-card">
          <div className="section-card-header"><div className="section-card-title">Growth Trend Analysis</div></div>
          <div className="section-card-body" style={{ height: 260 }}>
            <Line data={trendChartData} options={chartOptions as any} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExecutivePortal;
