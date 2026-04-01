import React, { useState, useEffect } from 'react';
import { 
  FileText, Plus, Search, Filter, Edit, Trash2, 
  Eye, Globe, Lock, MoreVertical, X, Check,
  Settings, Layout, ArrowRight
} from 'lucide-react';
import { cmsApi } from '../../services/cmsApi.js';
import { useToast } from '../../context/ToastContext';
import './ProductManager.css'; // Reusing some table styles
import './ProductManager.css'; 
import '../../styles/AdminPolish.css';
import TranslationEditor from '../../components/admin/TranslationEditor';

export default function PageManager() {
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isTransOpen, setIsTransOpen] = useState(false);
  const [editingPage, setEditingPage] = useState(null);
  const { addToast } = useToast();

  useEffect(() => {
    fetchPages();
  }, []);

  const fetchPages = async () => {
    try {
      setLoading(true);
      const data = await cmsApi.getPages();
      setPages(data);
    } catch (error) {
      addToast('Failed to load pages', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const payload = {
      title: formData.get('title'),
      slug: formData.get('slug'),
      status: formData.get('status'),
      template: formData.get('template'),
      seo: {
        meta_title: formData.get('meta_title'),
        meta_description: formData.get('meta_description')
      }
    };

    try {
      if (editingPage) {
        await cmsApi.updatePage(editingPage.id, payload);
        addToast('Page updated', 'success');
      } else {
        await cmsApi.createPage(payload);
        addToast('Page created', 'success');
      }
      setIsModalOpen(false);
      setEditingPage(null);
      fetchPages();
    } catch (error) {
      addToast(error.message, 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this page permanently?')) return;
    try {
      await cmsApi.deletePage(id);
      addToast('Page deleted', 'success');
      fetchPages();
    } catch (error) {
      addToast('Delete failed', 'error');
    }
  };

  const filteredPages = pages.filter(p => 
    p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.slug.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="admin-page-container">
      <div className="admin-actions-bar">
        <div className="admin-search-wrap">
          <Search size={18} className="search-icon" />
          <input 
            type="text" 
            placeholder="Search pages..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="admin-search-input"
          />
        </div>
        
        <div className="admin-actions-right">
          <button className="admin-btn admin-btn-primary" onClick={() => { setEditingPage(null); setIsModalOpen(true); }}>
            <Plus size={18} />
            <span>Create Page</span>
          </button>
        </div>
      </div>

      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Slug</th>
              <th>Status</th>
              <th>Last Updated</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="5" className="table-loading">Loading pages...</td></tr>
            ) : filteredPages.length === 0 ? (
              <tr><td colSpan="5" className="table-empty">No pages found.</td></tr>
            ) : filteredPages.map(page => (
              <tr key={page.id}>
                <td>
                  <div className="product-cell">
                    <div className="product-cell__icon"><Layout size={20} /></div>
                    <div className="product-cell__info">
                      <span className="name">{page.title}</span>
                      <span className="sku">{page.template} template</span>
                    </div>
                  </div>
                </td>
                <td><code>/{page.slug}</code></td>
                <td>
                  <span className={`status-pill ${page.status}`}>
                    {page.status}
                  </span>
                </td>
                <td>{new Date(page.updated_at).toLocaleDateString()}</td>
                <td>
                  <div className="table-actions">
                    <button className="admin-icon-btn" onClick={() => { setEditingPage(page); setIsTransOpen(true); }} title="Translate"><Globe size={16} /></button>
                    <button className="admin-icon-btn" onClick={() => { setEditingPage(page); setIsModalOpen(true); }}><Edit size={16} /></button>
                    <button className="admin-icon-btn" onClick={() => window.open(`/pages/${page.slug}`, '_blank')}><Eye size={16} /></button>
                    <button className="admin-icon-btn delete" onClick={() => handleDelete(page.id)}><Trash2 size={16} /></button>
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
              <h3>{editingPage ? 'Edit Page' : 'New Page'}</h3>
              <button onClick={() => setIsModalOpen(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleSave}>
              <div className="admin-modal-body tabs-container">
                <div className="form-grid">
                  <div className="form-group full">
                    <label className="admin-label">Page Title</label>
                    <input name="title" className="admin-input" defaultValue={editingPage?.title} required />
                  </div>
                  <div className="form-group half">
                    <label className="admin-label">Slug</label>
                    <input name="slug" className="admin-input" defaultValue={editingPage?.slug} required />
                  </div>
                  <div className="form-group half">
                    <label className="admin-label">Status</label>
                    <select name="status" className="admin-input" defaultValue={editingPage?.status || 'draft'}>
                      <option value="draft">Draft</option>
                      <option value="published">Published</option>
                      <option value="archived">Archived</option>
                    </select>
                  </div>
                  <div className="form-group full">
                    <label className="admin-label">Template</label>
                    <select name="template" className="admin-input" defaultValue={editingPage?.template || 'default'}>
                      <option value="default">Default Content</option>
                      <option value="landing">Landing Page</option>
                      <option value="full-width">Full Width</option>
                    </select>
                  </div>

                  <div className="admin-section-divider">SEO Settings</div>
                  <div className="form-group full">
                    <label className="admin-label">Meta Title</label>
                    <input name="meta_title" className="admin-input" defaultValue={editingPage?.seo?.meta_title} />
                  </div>
                  <div className="form-group full">
                    <label className="admin-label">Meta Description</label>
                    <textarea name="meta_description" className="admin-input" rows="3" defaultValue={editingPage?.seo?.meta_description}></textarea>
                  </div>
                </div>
              </div>
              <div className="admin-modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Page</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isTransOpen && (
        <TranslationEditor 
            entityType="page"
            entityId={editingPage?.id}
            fields={[
                { name: 'title', label: 'Translated Title', type: 'text' },
                { name: 'slug', label: 'Localized Slug', type: 'text' },
                { name: 'content_json', label: 'Localized Content (JSON)', type: 'textarea' }
            ]}
            onClose={() => setIsTransOpen(false)}
        />
      )}
    </div>
  );
}
