import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/axios';

const fetchPricing = async () => {
  const { data } = await api.get('/pricing');
  return data.data;
};

const Pricing: React.FC = () => {
  const queryClient = useQueryClient();
  const { data: pricingRules, isLoading, error } = useQuery({ queryKey: ['pricing'], queryFn: fetchPricing });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newPrice, setNewPrice] = useState<string>('');

  const updatePriceMutation = useMutation({
    mutationFn: async ({ id, price }: { id: string, price: string }) => {
      const { data } = await api.put(`/pricing/${id}`, { price });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pricing'] });
      setEditingId(null);
      setNewPrice('');
    }
  });

  if (isLoading) return <div className="p-4 text-center">Loading Pricing Strategies...</div>;
  if (error) return <div className="p-4 text-danger text-center">Error loading pricing data.</div>;

  return (
    <div className="container-fluid py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Pricing Strategy Dashboard</h2>
        <span className="badge bg-success fs-6">Omnichannel Ready</span>
      </div>
      
      <div className="card shadow-sm border-0">
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover mb-0">
              <thead className="table-light">
                <tr>
                  <th>Product Name</th>
                  <th>Channel</th>
                  <th>Current Price ($)</th>
                  <th>Status</th>
                  <th>Last Updated</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {pricingRules?.map((rule: any) => (
                  <tr key={rule.id}>
                    <td className="fw-bold">{rule.product_name}</td>
                    <td>
                      <span className={`badge bg-${rule.channel === 'Online' ? 'info' : 'secondary'}`}>
                        {rule.channel}
                      </span>
                    </td>
                    <td>
                      {editingId === rule.id ? (
                        <input 
                          type="number" 
                          className="form-control form-control-sm" 
                          value={newPrice} 
                          onChange={(e) => setNewPrice(e.target.value)} 
                          style={{ width: '100px' }}
                        />
                      ) : (
                        `$${rule.price.toFixed(2)}`
                      )}
                    </td>
                    <td>
                      <span className={`badge bg-${rule.status === 'Active' ? 'success' : 'danger'}`}>
                        {rule.status}
                      </span>
                    </td>
                    <td className="text-muted small">{new Date(rule.updated_at).toLocaleDateString()}</td>
                    <td>
                      {editingId === rule.id ? (
                        <>
                          <button 
                            className="btn btn-sm btn-success me-2" 
                            onClick={() => updatePriceMutation.mutate({ id: rule.id, price: newPrice })}
                            disabled={updatePriceMutation.isPending}
                          >
                            Save
                          </button>
                          <button 
                            className="btn btn-sm btn-outline-secondary" 
                            onClick={() => setEditingId(null)}
                          >
                            Cancel
                          </button>
                        </>
                      ) : (
                        <button 
                          className="btn btn-sm btn-outline-primary" 
                          onClick={() => {
                            setEditingId(rule.id);
                            setNewPrice(rule.price.toString());
                          }}
                        >
                          Adjust Price
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
                {pricingRules?.length === 0 && (
                  <tr>
                    <td colSpan={6} className="text-center py-4 text-muted">No pricing rules configured.</td>
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

export default Pricing;
