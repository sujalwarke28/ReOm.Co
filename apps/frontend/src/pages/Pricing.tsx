import React, { useContext, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/axios';
import { NotificationContext } from '../contexts/NotificationContext';

const fetchPricing = async () => { const { data } = await api.get('/pricing'); return data.data; };

const Pricing: React.FC = () => {
  const { showToast } = useContext(NotificationContext);
  const queryClient = useQueryClient();
  const { data: pricingRules, isLoading, error } = useQuery({ queryKey: ['pricing'], queryFn: fetchPricing });
  const [activeTab, setActiveTab] = useState<'omnichannel' | 'infrastructure'>('omnichannel');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newPrice, setNewPrice] = useState<string>('');

  // Modal State for new rule
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ product_name: '', channel: 'Online', price: '', region: 'Global' });
  const [formError, setFormError] = useState('');

  const createRuleMutation = useMutation({
    mutationFn: async (data: typeof form) => {
      const { data: resp } = await api.post('/pricing', data);
      return resp;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pricing'] });
      setShowModal(false);
      setForm({ product_name: '', channel: 'Online', price: '', region: 'Global' });
      setFormError('');
      showToast('Rule Created', 'Omnichannel pricing rule created successfully.', 'success');
    },
    onError: (err: any) => setFormError(err.response?.data?.error || 'Failed to create rule'),
  });

  const updatePriceMutation = useMutation({
    mutationFn: async ({ id, price }: { id: string, price: string }) => {
      const { data } = await api.put(`/pricing/${id}`, { price });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pricing'] });
      setEditingId(null);
      setNewPrice('');
      showToast('Price Updated', 'Pricing rule has been updated successfully.', 'success');
    },
  });

  const toggleStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { data } = await api.put(`/pricing/${id}`, { status });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pricing'] });
      showToast('Status Updated', 'Pricing rule status updated.', 'success');
    },
  });

  const deleteRuleMutation = useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.delete(`/pricing/${id}`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pricing'] });
      showToast('Rule Deleted', 'Pricing rule has been removed.', 'warning');
    },
  });

  if (isLoading) return (
    <div className="page-wrapper"><div className="loading-screen"><div className="spinner" style={{ width: 32, height: 32, borderWidth: 3 }} /><span>Loading pricing...</span></div></div>
  );
  if (error) return <div className="page-wrapper"><div className="error-banner">Error loading pricing data.</div></div>;

  return (
    <div className="page-wrapper">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
        <div>
          <div className="page-title">Pricing Strategy</div>
          <div className="page-subtitle">Omnichannel pricing rules and AWS cloud infrastructure estimations</div>
        </div>
        <div style={{ display: 'flex', gap: 8, background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 10, padding: 4 }}>
          <button
            onClick={() => setActiveTab('omnichannel')}
            style={{
              padding: '6px 14px',
              border: 'none',
              borderRadius: 8,
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
              background: activeTab === 'omnichannel' ? 'var(--accent)' : 'transparent',
              color: activeTab === 'omnichannel' ? '#fff' : 'var(--text-secondary)',
              transition: 'all 0.15s',
            }}
          >
            Omnichannel Rules
          </button>
          <button
            onClick={() => setActiveTab('infrastructure')}
            style={{
              padding: '6px 14px',
              border: 'none',
              borderRadius: 8,
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
              background: activeTab === 'infrastructure' ? 'var(--accent)' : 'transparent',
              color: activeTab === 'infrastructure' ? '#fff' : 'var(--text-secondary)',
              transition: 'all 0.15s',
            }}
          >
            AWS Infrastructure Estimates
          </button>
        </div>
      </div>

      {activeTab === 'omnichannel' ? (
        /* ==================== Omnichannel Pricing Rules Tab ==================== */
        <div className="section-card">
          <div className="section-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div className="section-card-title">Omnichannel Pricing Rules</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{pricingRules?.length} rules active</div>
            </div>
            <button className="btn-primary-custom" onClick={() => { setForm({ product_name: '', channel: 'Online', price: '', region: 'Global' }); setFormError(''); setShowModal(true); }}>
              ＋ Create Rule
            </button>
          </div>
          {!pricingRules?.length ? (
            <div className="empty-state">
              <div className="empty-state-icon">💲</div>
              <div className="empty-state-text">No pricing rules configured</div>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table className="data-table">
                <thead>
                  <tr><th>Product Name</th><th>Channel</th><th>Region</th><th>Current Price ($)</th><th>Status</th><th>Last Updated</th><th>Actions</th></tr>
                </thead>
                <tbody>
                  {pricingRules?.map((rule: any) => (
                    <tr key={rule.id}>
                      <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{rule.product_name}</td>
                      <td>
                        <span className={`badge-status ${rule.channel === 'Online' ? 'badge-info' : 'badge-pending'}`}>{rule.channel}</span>
                      </td>
                      <td>
                        <span className={`badge-status ${
                          rule.region === 'Global' ? 'badge-info' :
                          rule.region.startsWith('India') ? 'badge-completed' :
                          rule.region.startsWith('Singapore') ? 'badge-pending' :
                          rule.region.startsWith('US East') ? 'badge-rejected' : 'badge-approved'
                        }`} style={{ textTransform: 'none' }}>
                          {rule.region}
                        </span>
                      </td>
                      <td style={{ fontWeight: 600, color: 'var(--success)', fontSize: 14 }}>
                        {editingId === rule.id ? (
                          <input type="number" step="0.01" className="form-input" value={newPrice} onChange={e => setNewPrice(e.target.value)} style={{ width: 120, padding: '6px 10px', fontSize: 13 }} />
                        ) : `$${rule.price.toFixed(2)}`}
                      </td>
                      <td>
                        <span className={`badge-status ${rule.status === 'Active' ? 'badge-completed' : 'badge-rejected'}`}>{rule.status}</span>
                      </td>
                      <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>{new Date(rule.updated_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                      <td>
                        {editingId === rule.id ? (
                          <div style={{ display: 'flex', gap: 6 }}>
                            <button className="btn-success" onClick={() => updatePriceMutation.mutate({ id: rule.id, price: newPrice })} disabled={updatePriceMutation.isPending}>Save</button>
                            <button className="btn-ghost" onClick={() => setEditingId(null)}>Cancel</button>
                          </div>
                        ) : (
                          <div style={{ display: 'flex', gap: 6 }}>
                            <button className="btn-ghost" onClick={() => { setEditingId(rule.id); setNewPrice(rule.price.toString()); }}>Adjust Price</button>
                            <button
                              className="btn-ghost"
                              style={{
                                border: `1px solid ${rule.status === 'Active' ? 'var(--warning)' : 'var(--success)'}`,
                                color: rule.status === 'Active' ? 'var(--warning)' : 'var(--success)',
                              }}
                              onClick={() => toggleStatusMutation.mutate({ id: rule.id, status: rule.status === 'Active' ? 'Inactive' : 'Active' })}
                              disabled={toggleStatusMutation.isPending}
                            >
                              {rule.status === 'Active' ? 'Deactivate' : 'Activate'}
                            </button>
                            <button className="btn-danger" onClick={() => { if (window.confirm(`Delete rule for ${rule.product_name}?`)) deleteRuleMutation.mutate(rule.id); }} disabled={deleteRuleMutation.isPending}>
                              Delete
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : (
        /* ==================== AWS Infrastructure Estimates Tab ==================== */
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Tier Overview Cards */}
          <div className="kpi-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
            <div className="kpi-card" style={{ borderLeft: '3px solid var(--info)' }}>
              <div className="kpi-label">Dev / Test Tier</div>
              <div className="kpi-value" style={{ fontSize: '1.75rem', margin: '4px 0' }}>$48.50 <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>/ mo</span></div>
              <div className="kpi-sub">t3.micro compute · Single RDS · 10 GB S3</div>
            </div>
            <div className="kpi-card" style={{ borderLeft: '3px solid var(--accent)' }}>
              <div className="kpi-label">Production Tier</div>
              <div className="kpi-value" style={{ fontSize: '1.75rem', margin: '4px 0' }}>$286.00 <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>/ mo</span></div>
              <div className="kpi-sub">t3.medium cluster · Multi-AZ RDS · 100 GB S3</div>
            </div>
            <div className="kpi-card" style={{ borderLeft: '3px solid var(--purple)' }}>
              <div className="kpi-label">Multi-Region Disaster Recovery</div>
              <div className="kpi-value" style={{ fontSize: '1.75rem', margin: '4px 0' }}>$612.80 <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>/ mo</span></div>
              <div className="kpi-sub">Active-Passive cross-region sync · Multi-Region ALB</div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20 }}>
            {/* Cost Breakdown Table */}
            <div className="section-card">
              <div className="section-card-header">
                <div className="section-card-title">Production Tier Cost Breakdown</div>
              </div>
              <div style={{ overflowX: 'auto' }}>
                <table className="data-table">
                  <thead>
                    <tr><th>AWS Resource</th><th>Details</th><th>Unit Cost</th><th>Monthly Estimate</th></tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Compute (EC2)</td>
                      <td>2x `t3.medium` instances (Cluster Mode app host)</td>
                      <td>$0.0416/hr</td>
                      <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>$59.90</td>
                    </tr>
                    <tr>
                      <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Database (RDS MySQL)</td>
                      <td>`db.t3.medium` Multi-AZ instance (High Availability)</td>
                      <td>$0.136/hr</td>
                      <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>$97.92</td>
                    </tr>
                    <tr>
                      <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Storage (S3 + EBS)</td>
                      <td>100 GB S3 Backup Storage + 60 GB EBS General Purpose (gp3) Volumes</td>
                      <td>Standard AWS tier</td>
                      <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>$16.50</td>
                    </tr>
                    <tr>
                      <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Network & Gateway</td>
                      <td>NAT Gateway (private subnet egress) + 50 GB Data Transfer Out</td>
                      <td>$0.045/hr + egress</td>
                      <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>$48.50</td>
                    </tr>
                    <tr>
                      <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Elastic Load Balancer</td>
                      <td>Application Load Balancer (ALB) for SSL & request routing</td>
                      <td>$0.0225/hr</td>
                      <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>$22.25</td>
                    </tr>
                    <tr>
                      <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Monitoring (CloudWatch)</td>
                      <td>Memory/Disk metrics + 3 custom dashboard logs + custom alarms</td>
                      <td>SLA Standard Tier</td>
                      <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>$40.93</td>
                    </tr>
                    <tr style={{ background: 'var(--bg-elevated)' }}>
                      <td style={{ fontWeight: 800, color: 'var(--text-primary)' }}>Total Production Cost</td>
                      <td><strong>Fully Managed Infrastructure</strong></td>
                      <td>-</td>
                      <td style={{ fontWeight: 800, color: 'var(--accent)' }}>$286.00 / mo</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* SLA Monitoring & Backup details */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div className="section-card">
                <div className="section-card-header"><div className="section-card-title">SLA-Based Monitoring Tiers</div></div>
                <div className="section-card-body" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>Basic Tier (99.0% SLA) · Free</div>
                    <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>5-minute metric resolution, standard dashboard.</div>
                  </div>
                  <div className="divider" style={{ margin: '8px 0' }} />
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>Standard Tier (99.9% SLA) · $40.93/mo</div>
                    <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>1-minute metric resolution, disk/memory logs, SMS/email alarms.</div>
                  </div>
                  <div className="divider" style={{ margin: '8px 0' }} />
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>Enterprise Tier (99.99% SLA) · $120.00/mo</div>
                    <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Real-time sub-minute granularity, automated rollback alerts.</div>
                  </div>
                </div>
              </div>

              <div className="section-card">
                <div className="section-card-header"><div className="section-card-title">Backup & DR RPO / RTO Alignment</div></div>
                <div className="section-card-body" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Recovery Point Objective (RPO)</span>
                    <strong style={{ color: 'var(--text-primary)' }}>24 Hours</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Recovery Time Objective (RTO)</span>
                    <strong style={{ color: 'var(--text-primary)' }}>2 Hours</strong>
                  </div>
                  <div className="divider" style={{ margin: '8px 0' }} />
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                    Daily backups compressed via `mysqldump` & `gzip` and pushed offsite to S3. Restores performed via automated schema mapping and psql import.
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Optimization & Multi-region recommendations */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            <div className="section-card">
              <div className="section-card-header"><div className="section-card-title">Multi-Region Redundancy Options</div></div>
              <div className="section-card-body">
                <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 12 }}>
                  To support future geographic and omnichannel growth, ReOm.Co supports cross-region deployments:
                </p>
                <ul style={{ paddingLeft: 18, fontSize: 12, color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <li><strong>Active-Passive DR</strong>: Primary host in Mumbai (`ap-south-1`) with cross-region read replica in Singapore (`ap-southeast-1`). S3 cross-region replication handles backups.</li>
                  <li><strong>Active-Active Global routing</strong>: Multi-Region ALB paired with Route 53 latency routing to route store requests to the closest geographic cluster.</li>
                </ul>
              </div>
            </div>

            <div className="section-card" style={{ border: '1px solid var(--accent)' }}>
              <div className="section-card-header"><div className="section-card-title" style={{ color: 'var(--accent)' }}>TCO Optimization Recommendations</div></div>
              <div className="section-card-body">
                <ul style={{ paddingLeft: 18, fontSize: 12, color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <li><strong>Reserved Instances (RI)</strong>: Committing to a 1-year or 3-year term for application EC2 hosts reduces compute charges by up to <strong>35%</strong>.</li>
                  <li><strong>S3 Lifecycle Rules</strong>: Automatically transition daily backups to S3 Glacier Deep Archive after 14 days, cutting storage cost to $0.00099 per GB.</li>
                  <li><strong>Auto Scaling</strong>: Dev/Test hosts scheduler automatically shuts off compute between 10:00 PM and 7:00 AM, avoiding 37% of testing environment resource costs.</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Rule Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">Create Pricing Rule</div>
              <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>
            {formError && <div className="error-banner">{formError}</div>}

            <div className="form-group">
              <label className="form-label">Product Name <span style={{ color: 'var(--danger)' }}>*</span></label>
              <input className="form-input" placeholder="e.g. Wool Coat" value={form.product_name} onChange={e => setForm({ ...form, product_name: e.target.value })} required />
            </div>

            <div className="form-group">
              <label className="form-label">Channel <span style={{ color: 'var(--danger)' }}>*</span></label>
              <select className="form-input form-select" value={form.channel} onChange={e => setForm({ ...form, channel: e.target.value })}>
                <option value="Online">Online</option>
                <option value="Retail">Retail</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Region <span style={{ color: 'var(--danger)' }}>*</span></label>
              <select className="form-input form-select" value={form.region} onChange={e => setForm({ ...form, region: e.target.value })}>
                <option value="Global">Global</option>
                <option value="India (ap-south-1)">India (ap-south-1)</option>
                <option value="Singapore (ap-southeast-1)">Singapore (ap-southeast-1)</option>
                <option value="US East (us-east-1)">US East (us-east-1)</option>
                <option value="Europe (eu-west-1)">Europe (eu-west-1)</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Price ($) <span style={{ color: 'var(--danger)' }}>*</span></label>
              <input type="number" step="0.01" className="form-input" placeholder="e.g. 89.99" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} required />
            </div>

            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 12 }}>
              <button className="btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn-primary-custom" disabled={createRuleMutation.isPending || !form.product_name.trim() || !form.price.trim()} onClick={() => createRuleMutation.mutate(form)}>
                {createRuleMutation.isPending ? <><div className="spinner" /><span>Creating...</span></> : <span>Create Rule</span>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Pricing;
