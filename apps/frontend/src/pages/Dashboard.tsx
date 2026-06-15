import React, { useContext } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import api from '../api/axios';
import { AuthContext } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

ChartJS.register(ArcElement, Tooltip, Legend);

interface KPIData {
  users: { total: number };
  tasks: { total: number; pending: number; completed: number };
  approvals: { total: number; pending: number; approved: number };
  recentTasks: any[];
  recentApprovals: any[];
}

const fetchKPIs = async (): Promise<KPIData> => { const { data } = await api.get('/dashboard/kpis'); return data.data; };

interface KPICardProps { icon: string; label: string; value: number; iconBg: string; iconColor: string; sub?: string; }
const KPICard: React.FC<KPICardProps> = ({ icon, label, value, iconBg, iconColor, sub }) => (
  <div className="kpi-card">
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
      <div className="kpi-icon" style={{ background: iconBg, color: iconColor }}>{icon}</div>
    </div>
    <div className="kpi-value">{value.toLocaleString()}</div>
    <div className="kpi-label">{label}</div>
    {sub && <div className="kpi-sub">{sub}</div>}
  </div>
);

const Dashboard: React.FC = () => {
  const { user } = useContext(AuthContext);
  const { data, isLoading, error } = useQuery<KPIData>({ queryKey: ['kpis'], queryFn: fetchKPIs, retry: false });

  if (isLoading) return (
    <div className="page-wrapper">
      <div className="loading-screen"><div className="spinner" style={{ width: 28, height: 28, borderWidth: 3 }} /><span>Loading dashboard...</span></div>
    </div>
  );

  if (error) return <div className="page-wrapper"><div className="error-banner">Failed to load dashboard.</div></div>;

  const roleColor: Record<string, string> = { Admin: '#dc2626', Executive: '#d97706', Manager: '#0077cc', OperationalStaff: '#16a34a' };

  const { theme } = useTheme();
  const textColor = theme === 'dark' ? '#a3a3a3' : '#4b5563';
  const warningColor = theme === 'dark' ? '#f59e0b' : '#d97706';
  const successColor = theme === 'dark' ? '#22c55e' : '#16a34a';

  const doughnutData = {
    labels: ['Pending', 'Completed'],
    datasets: [{
      data: [data?.tasks.pending || 0, data?.tasks.completed || 0],
      backgroundColor: [warningColor, successColor],
      borderColor: 'transparent',
      hoverOffset: 4,
    }]
  };
  const approvalsDonut = {
    labels: ['Pending', 'Approved'],
    datasets: [{
      data: [data?.approvals.pending || 0, data?.approvals.approved || 0],
      backgroundColor: [warningColor, successColor],
      borderColor: 'transparent',
      hoverOffset: 4,
    }]
  };
  const chartOptions = { maintainAspectRatio: false, plugins: { legend: { labels: { color: textColor, font: { family: 'Inter', size: 11 } } } } };

  return (
    <div className="page-wrapper">
      {/* Header */}
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 46, height: 46, borderRadius: 14, background: roleColor[user?.role || ''] || 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, color: '#fff', fontWeight: 800, flexShrink: 0 }}>
            {user?.username?.slice(0, 1).toUpperCase()}
          </div>
          <div>
            <div className="page-title">Good {getTimeOfDay()}, {user?.username} 👋</div>
            <div className="page-subtitle">
              Signed in as <span style={{ color: roleColor[user?.role || ''] || 'var(--accent)', fontWeight: 600 }}>{user?.role}</span> · Here's your overview
            </div>
          </div>
        </div>
      </div>

      {/* KPI Metrics Row */}
      {['Admin', 'Manager', 'OperationalStaff'].includes(user?.role || '') && (
        <div className="kpi-grid">
          {user?.role === 'Admin' && (
            <KPICard icon="👥" label="Total Users" value={data?.users.total || 0} iconBg="var(--accent-subtle)" iconColor="var(--accent)" sub="Platform members" />
          )}
          <KPICard icon="📋" label="Total Tasks" value={data?.tasks.total || 0} iconBg="var(--info-subtle)" iconColor="var(--info)" sub="All time" />
          <KPICard icon="⏳" label="Pending Tasks" value={data?.tasks.pending || 0} iconBg="var(--warning-subtle)" iconColor="var(--warning)" sub="Needs attention" />
          <KPICard icon="✅" label="Completed" value={data?.tasks.completed || 0} iconBg="var(--success-subtle)" iconColor="var(--success)" sub="Well done!" />
          <KPICard icon="📨" label="Pending Approvals" value={data?.approvals.pending || 0} iconBg="var(--purple-glow)" iconColor="var(--purple)" sub="Awaiting action" />
        </div>
      )}

      {/* Executive welcome */}
      {user?.role === 'Executive' && (
        <div style={{ background: 'var(--accent-subtle)', border: '1px solid var(--border)', borderRadius: 14, padding: '20px 24px', display: 'flex', alignItems: 'center', gap: 14, marginBottom: 24 }}>
          <div style={{ fontSize: 32 }}>💼</div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>Executive Dashboard</div>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Head to the <Link to="/executive" style={{ color: 'var(--accent)', fontWeight: 600 }}>Executive Portal</Link> for KPIs, trends, and org-level insights.</div>
          </div>
        </div>
      )}

      {/* Recent Tasks + Recent Approvals */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>

        {/* Recent Tasks */}
        <div className="section-card">
          <div className="section-card-header">
            <div className="section-card-title">Recent Tasks</div>
            <Link to="/tasks" style={{ fontSize: 12, color: 'var(--accent)', fontWeight: 600 }}>View all →</Link>
          </div>
          {!data?.recentTasks?.length ? (
            <div className="empty-state" style={{ padding: '32px 24px' }}>
              <div className="empty-state-icon" style={{ fontSize: 32 }}>📋</div>
              <div className="empty-state-text">No tasks yet</div>
            </div>
          ) : (
            <div>
              {data.recentTasks.map((task: any) => (
                <div key={task.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 22px', borderBottom: '1px solid var(--border)' }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{task.title}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                      {task.assignee ? `→ ${task.assignee.username}` : 'Unassigned'}
                      {' · '}{new Date(task.created_at).toLocaleDateString()}
                    </div>
                  </div>
                  <span className={`badge-status ${task.status === 'Completed' ? 'badge-completed' : 'badge-pending'}`}>
                    {task.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Approvals */}
        <div className="section-card">
          <div className="section-card-header">
            <div className="section-card-title">Recent Approvals</div>
            <Link to="/approvals" style={{ fontSize: 12, color: 'var(--accent)', fontWeight: 600 }}>View all →</Link>
          </div>
          {!data?.recentApprovals?.length ? (
            <div className="empty-state" style={{ padding: '32px 24px' }}>
              <div className="empty-state-icon" style={{ fontSize: 32 }}>📄</div>
              <div className="empty-state-text">No approvals yet</div>
            </div>
          ) : (
            <div>
              {data.recentApprovals.map((app: any) => (
                <div key={app.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 22px', borderBottom: '1px solid var(--border)' }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{app.request_title}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                      By {app.submitter?.username || '?'}
                      {' · '}{new Date(app.created_at).toLocaleDateString()}
                    </div>
                  </div>
                  <span className={`badge-status ${app.status === 'Approved' ? 'badge-approved' : app.status === 'Rejected' ? 'badge-rejected' : 'badge-pending'}`}>
                    {app.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Analytics Overview Row */}
      {['Admin', 'Manager', 'Executive'].includes(user?.role || '') && (
        <div className="section-card">
          <div className="section-card-header">
            <div className="section-card-title">Analytics Overview</div>
            <Link to="/analytics" style={{ fontSize: 12, color: 'var(--accent)', fontWeight: 600 }}>Full report →</Link>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 0 }}>
            {/* Task donut */}
            <div style={{ padding: '24px', borderRight: '1px solid var(--border)', textAlign: 'center' }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 16 }}>Task Distribution</div>
              <div style={{ height: 140 }}>
                <Doughnut data={doughnutData} options={chartOptions as any} />
              </div>
            </div>

            {/* Approvals donut */}
            <div style={{ padding: '24px', borderRight: '1px solid var(--border)', textAlign: 'center' }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 16 }}>Approval Distribution</div>
              <div style={{ height: 140 }}>
                <Doughnut data={approvalsDonut} options={chartOptions as any} />
              </div>
            </div>

            {/* Quick stats */}
            <div style={{ padding: '24px' }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 20 }}>Quick Stats</div>
              {[
                { label: 'Task Completion', value: data?.tasks.total ? `${((data.tasks.completed / data.tasks.total) * 100).toFixed(0)}%` : '0%', color: 'var(--success)' },
                { label: 'Approval Rate', value: data?.approvals.total ? `${((data.approvals.approved / data.approvals.total) * 100).toFixed(0)}%` : '0%', color: 'var(--accent)' },
                { label: 'Total Records', value: (data?.tasks.total || 0) + (data?.approvals.total || 0), color: 'var(--purple)' },
              ].map(s => (
                <div key={s.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                  <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{s.label}</div>
                  <div style={{ fontSize: 18, fontWeight: 800, color: s.color }}>{s.value}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

function getTimeOfDay() {
  const h = new Date().getHours();
  if (h < 12) return 'morning';
  if (h < 17) return 'afternoon';
  return 'evening';
}

export default Dashboard;
