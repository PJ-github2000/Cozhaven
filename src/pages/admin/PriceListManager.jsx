import React, { useState, useEffect } from 'react';
import { 
  CreditCard, Plus, Search, Filter, Edit, Trash2, 
  Eye, Globe, Lock, MoreVertical, X, Check,
  List, Package, UserCheck
} from 'lucide-react';
import { merchandisingApi } from '../../services/merchandisingApi.js';
import { useToast } from '../../context/ToastContext';
import './ProductManager.css'; 
import '../../styles/AdminPolish.css';

export default function PriceListManager() {
  const [priceLists, setPriceLists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingList, setEditingList] = useState(null);
  const { addToast } = useToast();

  useEffect(() => {
    fetchPriceLists();
  }, []);

  const fetchPriceLists = async () => {
    try {
      setLoading(true);
      const data = await merchandisingApi.getPriceLists();
      setPriceLists(data);
    } catch (error) {
      addToast('Failed to load price lists', 'error');
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
      is_active: formData.get('is_active') === 'on' ? 1 : 0,
      priority: parseInt(formData.get('priority')) || 0
    };

    try {
      if (editingList) {
        // Update logic (to be added)
        addToast('Price list updated', 'success');
      } else {
        await merchandisingApi.createPriceList(payload);
        addToast('Price list created', 'success');
      }
      setIsModalOpen(false);
      fetchPriceLists();
    } catch (error) {
      addToast(error.message, 'error');
    }
  };

  return (
    <div className="admin-page-container">
      <div className="admin-actions-bar">
        <div className="admin-search-wrap">
          <Search size={18} className="search-icon" />
          <input 
            type="text" 
            placeholder="Search price lists..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="admin-search-input"
          />
        </div>
        
        <div className="admin-actions-right">
          <button className="admin-btn admin-btn-primary" onClick={() => { setEditingList(null); setIsModalOpen(true); }}>
            <Plus size={18} />
            <span>New Price List</span>
          </button>
        </div>
      </div>

      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>List Name</th>
              <th>Description</th>
              <th>Priority</th>
              <th>Status</th>
              <th>Entries</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="6" className="table-loading">Loading price lists...</td></tr>
            ) : priceLists.length === 0 ? (
              <tr><td colSpan="6" className="table-empty">No price lists configured.</td></tr>
            ) : priceLists.map(pl => (
              <tr key={pl.id}>
                <td>
                  <div className="product-cell">
                    <div className="product-cell__icon"><List size={20} /></div>
                    <div className="product-cell__info">
                      <span className="name">{pl.name}</span>
                    </div>
                  </div>
                </td>
                <td>{pl.description}</td>
                <td>{pl.priority}</td>
                <td>
                  <span className={`status-pill ${pl.is_active ? 'active' : 'inactive'}`}>
                    {pl.is_active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td><strong>{pl.entries_count || 0}</strong> variants</td>
                <td>
                  <div className="table-actions">
                    <button className="admin-icon-btn"><Edit size={16} /></button>
                    <button className="admin-icon-btn"><Package size={16} /></button>
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
              <h3>{editingList ? 'Edit Price List' : 'New Price List'}</h3>
              <button onClick={() => setIsModalOpen(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleSave}>
              <div className="admin-modal-body">
                <div className="form-grid">
                  <div className="form-group full">
                    <label className="admin-label">List Name</label>
                    <input name="name" className="admin-input" defaultValue={editingList?.name} required />
                  </div>
                  <div className="form-group full">
                    <label className="admin-label">Description</label>
                    <textarea name="description" className="admin-input" rows="2" defaultValue={editingList?.description}></textarea>
                  </div>
                  <div className="form-group half">
                    <label className="admin-label">Priority (Higher wins)</label>
                    <input type="number" name="priority" className="admin-input" defaultValue={editingList?.priority || 0} />
                  </div>
                  <div className="form-check-group" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 0' }}>
                    <input type="checkbox" name="is_active" defaultChecked={editingList?.is_active !== 0} id="pl_active" />
                    <label htmlFor="pl_active" className="admin-label" style={{ marginBottom: 0 }}>Active</label>
                  </div>
                </div>
              </div>
              <div className="admin-modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Create List</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
