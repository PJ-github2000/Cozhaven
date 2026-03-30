import { useEffect, useState } from 'react';
import { Plus, RefreshCw, Tag, Trash2 } from 'lucide-react';
import { adminApi } from '../../services/adminApi';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import '../../styles/AdminPolish.css';
import './PromotionsManager.css';

const emptyForm = {
  code: '',
  type: 'percent',
  value: '',
  description: '',
  is_active: true,
  expires_at: ''
};

export default function PromotionsManager() {
  const [promotions, setPromotions] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [auditLoading, setAuditLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingPromoId, setEditingPromoId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { user } = useAuth();
  const { addToast } = useToast();
  const canEdit = user?.role === 'admin' || user?.role === 'manager';

  useEffect(() => {
    fetchPageData();
  }, []);

  const fetchAuditLogs = async () => {
    try {
      setAuditLoading(true);
      const data = await adminApi.getAuditLogs({ entity_types: 'promotion,pricing_schedule', limit: 12 });
      setAuditLogs(data.items || []);
    } catch (error) {
      addToast(error.message || 'Failed to load activity history', 'error');
    } finally {
      setAuditLoading(false);
    }
  };

  const fetchPageData = async () => {
    try {
      setLoading(true);
      setAuditLoading(true);
      const [promotionData, auditData] = await Promise.all([
        adminApi.getPromotions(),
        adminApi.getAuditLogs({ entity_types: 'promotion,pricing_schedule', limit: 12 })
      ]);
      setPromotions(promotionData || []);
      setAuditLogs(auditData.items || []);
    } catch (error) {
      addToast(error.message || 'Failed to load promotions', 'error');
    } finally {
      setLoading(false);
      setAuditLoading(false);
      setIsRefreshing(false);
    }
  };

  const resetForm = () => {
    setForm(emptyForm);
    setEditingPromoId(null);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!form.code.trim() || !form.value) {
      addToast('Code and value are required', 'error');
      return;
    }

    try {
      setSaving(true);
      const payload = {
        code: form.code.trim().toUpperCase(),
        type: form.type,
        value: parseFloat(form.value),
        description: form.description.trim() || null,
        is_active: form.is_active,
        expires_at: form.expires_at ? new Date(form.expires_at).toISOString() : null
      };

      const result = editingPromoId
        ? await adminApi.updatePromotion(editingPromoId, payload)
        : await adminApi.createPromotion(payload);

      if (result?.status === 'pending_approval') {
        window.dispatchEvent(new CustomEvent('admin-notifications-refresh'));
        addToast(result.message || 'Promotion submitted for approval', 'success');
        resetForm();
        return;
      }

      setPromotions(prev => (
        editingPromoId
          ? prev.map(promo => (promo.id === editingPromoId ? result : promo))
          : [result, ...prev]
      ));
      await fetchAuditLogs();
      addToast(editingPromoId ? 'Promotion updated' : 'Promotion created', 'success');
      resetForm();
    } catch (error) {
      addToast(error.message || 'Failed to save promotion', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (promo) => {
    setEditingPromoId(promo.id);
    setForm({
      code: promo.code || '',
      type: promo.type || 'percent',
      value: `${promo.value ?? ''}`,
      description: promo.description || '',
      is_active: promo.is_active ?? true,
      expires_at: (promo.expires_at || '').slice(0, 16)
    });
  };

  const handleDelete = async (promoId) => {
    if (!window.confirm('Delete this promo code?')) return;
    try {
      const result = await adminApi.deletePromotion(promoId);
      if (result?.status === 'pending_approval') {
        window.dispatchEvent(new CustomEvent('admin-notifications-refresh'));
        addToast(result.message || 'Promotion deletion submitted for approval', 'success');
        if (editingPromoId === promoId) resetForm();
        return;
      }
      setPromotions(prev => prev.filter(promo => promo.id !== promoId));
      if (editingPromoId === promoId) resetForm();
      await fetchAuditLogs();
      addToast('Promotion deleted', 'success');
    } catch (error) {
      addToast(error.message || 'Failed to delete promotion', 'error');
    }
  };

  return (
    <div className="admin-page-container promotions-manager">
      <div className="inv-stats">
        <div className="order-stat-mini">
          <div className="mini-icon blue"><Tag size={20} /></div>
          <div className="mini-info">
            <span className="label">Promo Codes</span>
            <span className="value">{promotions.length}</span>
          </div>
        </div>
        <div className="order-stat-mini">
          <div className="mini-icon green"><Tag size={20} /></div>
          <div className="mini-info">
            <span className="label">Active</span>
            <span className="value">{promotions.filter(promo => promo.is_active).length}</span>
          </div>
        </div>
        <div className="order-stat-mini">
          <div className="mini-icon orange"><Tag size={20} /></div>
          <div className="mini-info">
            <span className="label">Expiring</span>
            <span className="value">{promotions.filter(promo => promo.expires_at).length}</span>
          </div>
        </div>
      </div>

      <div className="promotions-layout">
        <section className="admin-section-card">
          <div className="section-head">
            <h2>{editingPromoId ? 'Edit Promotion' : 'Create Promotion'}</h2>
            <button className="text-btn" onClick={resetForm}>Clear</button>
          </div>
          <form className="promotions-form" onSubmit={handleSubmit}>
            <div className="form-pair-grid">
              <div className="form-group">
                <label className="admin-label">Code</label>
                <input className="admin-input" value={form.code} onChange={event => setForm(prev => ({ ...prev, code: event.target.value.toUpperCase() }))} placeholder="WELCOME10" />
              </div>
              <div className="form-group">
                <label className="admin-label">Type</label>
                <select className="admin-input" value={form.type} onChange={event => setForm(prev => ({ ...prev, type: event.target.value }))}>
                  <option value="percent">Percent</option>
                  <option value="fixed">Fixed Amount</option>
                  <option value="shipping">Free Shipping</option>
                </select>
              </div>
            </div>
            <div className="form-pair-grid">
              <div className="form-group">
                <label className="admin-label">Value</label>
                <input className="admin-input" type="number" step="0.01" value={form.value} onChange={event => setForm(prev => ({ ...prev, value: event.target.value }))} />
              </div>
              <div className="form-group">
                <label className="admin-label">Expires At</label>
                <input className="admin-input" type="datetime-local" value={form.expires_at} onChange={event => setForm(prev => ({ ...prev, expires_at: event.target.value }))} />
              </div>
            </div>
            <div className="form-group">
              <label className="admin-label">Description</label>
              <textarea className="admin-input" rows="3" value={form.description} onChange={event => setForm(prev => ({ ...prev, description: event.target.value }))} />
            </div>
            <div className="form-pair-grid promotions-form__footer">
              <label className="promotions-toggle">
                <input type="checkbox" checked={form.is_active} onChange={event => setForm(prev => ({ ...prev, is_active: event.target.checked }))} />
                <span>Active</span>
              </label>
              <button type="submit" className="btn-admin btn-admin-primary" disabled={!canEdit || saving}>
                <Plus size={16} />
                {saving ? 'Saving...' : editingPromoId ? 'Update Promotion' : 'Create Promotion'}
              </button>
            </div>
          </form>
        </section>

        <section className="admin-section-card">
          <div className="section-head">
            <h2>Promotion Rules</h2>
            <button className="admin-icon-btn" onClick={() => { setIsRefreshing(true); fetchPageData(); }}>
              <RefreshCw size={18} className={isRefreshing ? 'spinning' : ''} />
            </button>
          </div>
          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Type</th>
                  <th>Value</th>
                  <th>Expires</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="6" className="table-loading">Loading promotions...</td></tr>
                ) : promotions.length === 0 ? (
                  <tr><td colSpan="6" className="table-empty">No promo codes configured yet.</td></tr>
                ) : promotions.map(promo => (
                  <tr key={promo.id}>
                    <td>
                      <div className="promotions-code-cell">
                        <strong>{promo.code}</strong>
                        {promo.description && <span className="meta">{promo.description}</span>}
                      </div>
                    </td>
                    <td>{promo.type}</td>
                    <td>{promo.type === 'percent' ? `${promo.value}%` : promo.type === 'fixed' ? `$${promo.value}` : 'Free Shipping'}</td>
                    <td>{promo.expires_at ? new Date(promo.expires_at).toLocaleString() : 'No expiry'}</td>
                    <td><span className={`status-pill ${promo.is_active ? 'active' : 'draft'}`}>{promo.is_active ? 'Active' : 'Inactive'}</span></td>
                    <td>
                      <div className="table-actions">
                        <button className="btn btn-secondary btn-small" onClick={() => handleEdit(promo)}>Edit</button>
                        <button className="admin-icon-btn delete" onClick={() => handleDelete(promo.id)} disabled={!canEdit}><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="admin-section-card promotions-layout__wide">
          <div className="section-head">
            <h2>Recent Pricing & Promotion Activity</h2>
            <span className="section-meta">{auditLogs.length} recent events</span>
          </div>
          <div className="promotions-audit-list">
            {auditLoading ? (
              <div className="table-loading">Loading activity...</div>
            ) : auditLogs.length === 0 ? (
              <div className="table-empty">No audit events recorded yet.</div>
            ) : auditLogs.map(log => (
              <article key={log.id} className="promotions-audit-item">
                <div className="promotions-audit-item__top">
                  <strong>{log.summary}</strong>
                  <span className={`status-pill ${log.entity_type === 'promotion' ? 'active' : 'draft'}`}>
                    {log.entity_type === 'promotion' ? 'Promotion' : 'Pricing'}
                  </span>
                </div>
                <div className="promotions-audit-item__meta">
                  <span>{log.entity_label || `#${log.entity_id}`}</span>
                  <span>{log.action}</span>
                  <span>{log.performed_by_name || 'System'}</span>
                  <span>{log.created_at ? new Date(log.created_at).toLocaleString() : 'Just now'}</span>
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
