import React from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../api/axios';

const fetchMetrics = async () => { const { data } = await api.get('/monitoring/metrics'); return data.data; };
const fetchAlerts = async () => { const { data } = await api.get('/monitoring/alerts'); return data.data; };

interface MetricBarProps { label: string; value: number; color: string; icon: string; }
const MetricBar: React.FC<MetricBarProps> = ({ label, value, color, icon }) => {
  const pct = Math.min(value || 0, 100);
  const isHigh = pct > 85;
  return (
    <div className="section-card" style={{ padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
        <div>
          <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</div>
          <div style={{ fontSize: 2.5 + 'rem', fontWeight: 800, color: isHigh ? 'var(--danger)' : 'var(--text-primary)', letterSpacing: '-0.04em', lineHeight: 1.1, marginTop: 4 }}>{pct.toFixed(1)}%</div>
        </div>
        <div style={{ fontSize: 28, opacity: 0.6 }}>{icon}</div>
      </div>
      <div style={{ height: 8, background: 'var(--border)', borderRadius: 999, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${pct}%`, background: isHigh ? 'var(--danger)' : color, borderRadius: 999, transition: 'width 0.8s ease' }} />
      </div>
      {isHigh && <div style={{ fontSize: 11, color: 'var(--danger)', marginTop: 8, fontWeight: 600 }}>⚠ High usage — check system</div>}
    </div>
  );
};

const Monitoring: React.FC = () => {
  const { data: metrics, isLoading: l1 } = useQuery({ queryKey: ['metrics'], queryFn: fetchMetrics, refetchInterval: 15000 });
  const { data: alerts, isLoading: l2 } = useQuery({ queryKey: ['alerts'], queryFn: fetchAlerts, refetchInterval: 30000 });

  if (l1 || l2) return (
    <div className="page-wrapper"><div className="loading-screen"><div className="spinner" style={{ width: 32, height: 32, borderWidth: 3 }} /><span>Loading metrics...</span></div></div>
  );

  const severityColor = (s: string) => ({ Critical: 'badge-rejected', High: 'badge-pending', Medium: 'badge-info', Low: 'badge-info' }[s] || 'badge-info');

  return (
    <div className="page-wrapper">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div className="page-title">System Monitoring</div>
          <div className="page-subtitle">Live metrics refresh every 15s — Alerts refresh every 30s</div>
        </div>
        <span className="badge-status badge-rejected">Admin Only</span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16, marginBottom: 24 }}>
        <MetricBar label="CPU Usage" value={metrics?.cpuUsage} color="linear-gradient(90deg, var(--accent), var(--purple))" icon="🖥" />
        <MetricBar label="Memory Usage" value={metrics?.memoryUsage} color="linear-gradient(90deg, var(--warning), #f97316)" icon="💾" />
        <MetricBar label="Storage Usage" value={metrics?.storageUsage} color="linear-gradient(90deg, var(--info), #0ea5e9)" icon="📀" />
      </div>

      <div className="section-card">
        <div className="section-card-header">
          <div className="section-card-title">Active & Recent Alerts</div>
          <span className="badge-status badge-rejected">{alerts?.filter((a: any) => a.status === 'Active').length} Active</span>
        </div>
        {!alerts?.length ? (
          <div className="empty-state">
            <div className="empty-state-icon">✅</div>
            <div className="empty-state-text">All systems operational</div>
            <div className="empty-state-sub">No alerts have been recorded.</div>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr><th>Time</th><th>Type</th><th>Severity</th><th>Status</th></tr>
              </thead>
              <tbody>
                {alerts?.map((alert: any) => (
                  <tr key={alert.id}>
                    <td style={{ fontSize: 12, whiteSpace: 'nowrap' }}>{new Date(alert.timestamp).toLocaleString()}</td>
                    <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{alert.alert_type}</td>
                    <td><span className={`badge-status ${severityColor(alert.severity)}`}>{alert.severity}</span></td>
                    <td><span className={`badge-status ${alert.status === 'Active' ? 'badge-rejected' : 'badge-completed'}`}>{alert.status}</span></td>
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

export default Monitoring;
