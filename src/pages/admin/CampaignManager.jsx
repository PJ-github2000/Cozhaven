import React, { useState, useEffect } from 'react';
import { 
  Trophy, Plus, Search, Filter, Edit, Trash2, 
  Calendar, Zap, Clock, MoreVertical, X, Check,
  Activity, ArrowRight, BarChart2
} from 'lucide-react';
import { merchandisingApi } from '../../services/merchandisingApi.js';
import { useToast } from '../../context/ToastContext';
import './ProductManager.css'; // Reusing some table styles
import '../../styles/AdminPolish.css';

export default function CampaignManager() {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState(null);
  const { addToast } = useToast();

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    try {
      setLoading(true);
      const data = await merchandisingApi.getCampaigns();
      setCampaigns(data);
    } catch (error) {
      addToast('Failed to load campaigns', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const payload = {
      name: formData.get('name'),
      description: formData.get('description'),
      status: formData.get('status'),
      starts_at: formData.get('starts_at') ? new Date(formData.get('starts_at')).toISOString() : null,
      ends_at: formData.get('ends_at') ? new Date(formData.get('ends_at')).toISOString() : null
    };

    try {
      if (editingCampaign) {
        // Update logic (to be added to API)
        addToast('Campaign updated', 'success');
      } else {
        await merchandisingApi.createCampaign(payload);
        addToast('Campaign created', 'success');
      }
      setIsModalOpen(false);
      fetchCampaigns();
    } catch (error) {
      addToast(error.message, 'error');
    }
  };

  return (
    <div className="admin-page-container">
      <div className="admin-stats-grid mini">
         <div className="admin-stat-card">
            <div className="admin-stat-card__body">
               <h3>Active Campaigns</h3>
               <p>{campaigns.filter(c => c.status === 'active').length}</p>
            </div>
         </div>
         <div className="admin-stat-card">
            <div className="admin-stat-card__body">
               <h3>Scheduled</h3>
               <p>{campaigns.filter(c => c.status === 'draft').length}</p>
            </div>
         </div>
      </div>

      <div className="admin-actions-bar">
        <div className="admin-search-wrap">
          <Search size={18} className="search-icon" />
          <input type="text" placeholder="Search campaigns..." className="admin-search-input" />
        </div>
        
        <div className="admin-actions-right">
          <button className="admin-btn admin-btn-primary" onClick={() => { setEditingCampaign(null); setIsModalOpen(true); }}>
            <Plus size={18} />
            <span>Create Campaign</span>
          </button>
        </div>
      </div>

      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Campaign Name</th>
              <th>Status</th>
              <th>Period</th>
              <th>Rules</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="5" className="table-loading">Loading campaigns...</td></tr>
            ) : campaigns.length === 0 ? (
              <tr><td colSpan="5" className="table-empty">No campaigns found.</td></tr>
            ) : campaigns.map(campaign => (
              <tr key={campaign.id}>
                <td>
                  <div className="product-cell">
                    <div className="product-cell__icon"><Trophy size={20} /></div>
                    <div className="product-cell__info">
                      <span className="name">{campaign.name}</span>
                      <span className="sku">{campaign.description}</span>
                    </div>
                  </div>
                </td>
                <td>
                  <span className={`status-pill ${campaign.status}`}>
                    {campaign.status}
                  </span>
                </td>
                <td>
                  <div className="date-range-cell">
                    <span>{campaign.starts_at ? new Date(campaign.starts_at).toLocaleDateString() : 'N/A'}</span>
                    <ArrowRight size={12} />
                    <span>{campaign.ends_at ? new Date(campaign.ends_at).toLocaleDateString() : 'Forever'}</span>
                  </div>
                </td>
                <td>{campaign.rules?.length || 0} active rules</td>
                <td>
                  <div className="table-actions">
                    <button className="admin-icon-btn"><Edit size={16} /></button>
                    <button className="admin-icon-btn"><BarChart2 size={16} /></button>
                    <button className="admin-icon-btn delete"><Trash2 size={16} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="admin-modal-overlay">
          <div className="admin-modal" style={{ maxWidth: '600px' }}>
            <div className="admin-modal-header">
              <h3>{editingCampaign ? 'Edit Campaign' : 'New Campaign'}</h3>
              <button onClick={() => setIsModalOpen(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleSave}>
              <div className="admin-modal-body">
                <div className="form-grid">
                  <div className="form-group full">
                    <label className="admin-label">Campaign Name</label>
                    <input name="name" className="admin-input" defaultValue={editingCampaign?.name} required />
                  </div>
                  <div className="form-group full">
                    <label className="admin-label">Description</label>
                    <textarea name="description" className="admin-input" rows="2" defaultValue={editingCampaign?.description}></textarea>
                  </div>
                  <div className="form-group half">
                    <label className="admin-label">Status</label>
                    <select name="status" className="admin-input" defaultValue={editingCampaign?.status || 'draft'}>
                      <option value="draft">Draft</option>
                      <option value="active">Active</option>
                      <option value="ended">Ended</option>
                    </select>
                  </div>
                  <div className="form-group half">
                    <label className="admin-label">Priority</label>
                    <input type="number" name="priority" className="admin-input" defaultValue={0} />
                  </div>
                  <div className="form-group half">
                    <label className="admin-label">Start Date</label>
                    <input type="datetime-local" name="starts_at" className="admin-input" />
                  </div>
                  <div className="form-group half">
                    <label className="admin-label">End Date</label>
                    <input type="datetime-local" name="ends_at" className="admin-input" />
                  </div>
                </div>
              </div>
              <div className="admin-modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Create Campaign</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
