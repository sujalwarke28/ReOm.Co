import React from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../api/axios';

const fetchMetrics = async () => {
  const { data } = await api.get('/monitoring/metrics');
  return data.data;
};

const fetchAlerts = async () => {
  const { data } = await api.get('/monitoring/alerts');
  return data.data;
};

const Monitoring: React.FC = () => {
  // Use polling for live metrics every 15 seconds
  const { data: metrics, isLoading: loadingMetrics } = useQuery({ 
    queryKey: ['metrics'], 
    queryFn: fetchMetrics,
    refetchInterval: 15000 
  });
  
  const { data: alerts, isLoading: loadingAlerts } = useQuery({ 
    queryKey: ['alerts'], 
    queryFn: fetchAlerts,
    refetchInterval: 30000 
  });

  if (loadingMetrics || loadingAlerts) return <div className="p-4 text-center">Loading Monitoring Data...</div>;

  return (
    <div className="container-fluid py-4">
      <div className="d-flex justify-content-between align-items-center mb-4 pb-2 border-bottom">
        <h2 className="text-danger fw-bold">System Monitoring Dashboard</h2>
      </div>
      
      <div className="row g-4 mb-4">
        {/* CPU Usage */}
        <div className="col-md-4">
          <div className="card shadow-sm border-danger h-100">
            <div className="card-body text-center">
              <h5 className="card-title text-muted mb-3">CPU Usage</h5>
              <div className="progress mb-3" style={{ height: '30px' }}>
                <div className={`progress-bar progress-bar-striped progress-bar-animated ${metrics?.cpuUsage > 85 ? 'bg-danger' : 'bg-success'}`} 
                     role="progressbar" 
                     style={{ width: `${metrics?.cpuUsage || 0}%` }}>
                  {metrics?.cpuUsage?.toFixed(1) || 0}%
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Memory Usage */}
        <div className="col-md-4">
          <div className="card shadow-sm border-warning h-100">
            <div className="card-body text-center">
              <h5 className="card-title text-muted mb-3">Memory Usage</h5>
              <div className="progress mb-3" style={{ height: '30px' }}>
                <div className={`progress-bar progress-bar-striped progress-bar-animated ${metrics?.memoryUsage > 90 ? 'bg-danger' : 'bg-warning'}`} 
                     role="progressbar" 
                     style={{ width: `${metrics?.memoryUsage || 0}%` }}>
                  {metrics?.memoryUsage?.toFixed(1) || 0}%
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Storage Usage */}
        <div className="col-md-4">
          <div className="card shadow-sm border-info h-100">
            <div className="card-body text-center">
              <h5 className="card-title text-muted mb-3">Storage Usage</h5>
              <div className="progress mb-3" style={{ height: '30px' }}>
                <div className="progress-bar bg-info" 
                     role="progressbar" 
                     style={{ width: `${metrics?.storageUsage || 0}%` }}>
                  {metrics?.storageUsage?.toFixed(1) || 0}%
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="row g-4">
        {/* Alerts Log */}
        <div className="col-12">
          <div className="card shadow-sm border-0">
            <div className="card-header bg-danger text-white fw-bold">Active & Recent Alerts</div>
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-hover mb-0">
                  <thead className="table-light">
                    <tr>
                      <th>Time</th>
                      <th>Type</th>
                      <th>Severity</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {alerts?.map((alert: any) => (
                      <tr key={alert.id}>
                        <td>{new Date(alert.timestamp).toLocaleString()}</td>
                        <td>{alert.alert_type}</td>
                        <td>
                          <span className={`badge bg-${alert.severity === 'Critical' ? 'danger' : alert.severity === 'High' ? 'warning' : 'secondary'}`}>
                            {alert.severity}
                          </span>
                        </td>
                        <td>
                          <span className={`badge bg-${alert.status === 'Active' ? 'danger' : 'success'}`}>
                            {alert.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                    {alerts?.length === 0 && (
                      <tr>
                        <td colSpan={4} className="text-center py-4 text-muted">No alerts recorded. System is operating normally.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default Monitoring;
