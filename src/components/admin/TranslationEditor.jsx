import React, { useState, useEffect } from 'react';
import { adminApi } from '../../services/adminApi.js';
import { useToast } from '../../context/ToastContext.jsx';
import { Globe, Save, X, RefreshCw } from 'lucide-react';

/**
 * A generic translation editor component for any entity.
 * @param {string} entityType - 'product', 'page', or 'blog'
 * @param {number} entityId - The ID of the item being translated
 * @param {Array} fields - Definition of fields to translate { name, label, type }
 * @param {function} onClose - Callback to close the editor
 */
export default function TranslationEditor({ entityType, entityId, fields, onClose }) {
  const [locale, setLocale] = useState('fr');
  const [translations, setTranslations] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { addToast } = useToast();

  const locales = [
    { code: 'fr', name: 'French' },
    { code: 'es', name: 'Spanish' },
    { code: 'de', name: 'German' },
    { code: 'it', name: 'Italian' }
  ];

  useEffect(() => {
    fetchTranslations();
  }, [entityId, locale]);

  const fetchTranslations = async () => {
    try {
      setLoading(true);
      // Construct endpoint manually or add to adminApi
      const res = await fetch(`/api/admin/translations/${entityType}/${entityId}`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await res.json();
      
      const current = data.find(t => t.locale === locale) || {};
      setTranslations(current);
    } catch (error) {
      addToast('Failed to load translations', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const payload = {
          ...translations,
          [entityType === 'blog' ? 'post_id' : `${entityType}_id`]: entityId,
          locale
      };

      const res = await fetch(`/api/admin/translations/${entityType}`, {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error('Update failed');
      
      addToast('Translation saved successfully', 'success');
      onClose();
    } catch (error) {
      addToast(error.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="admin-modal-overlay">
      <div className="admin-modal" style={{ maxWidth: '700px' }}>
        <div className="admin-modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
             <Globe size={20} />
             <h3>Manage Translations</h3>
          </div>
          <button onClick={onClose}><X size={20} /></button>
        </div>

        <div className="admin-modal-body">
            <div className="form-group" style={{ marginBottom: '20px' }}>
                <label className="admin-label">Target Language</label>
                <select 
                    className="admin-input" 
                    value={locale} 
                    onChange={(e) => setLocale(e.target.value)}
                >
                    {locales.map(l => <option key={l.code} value={l.code}>{l.name} ({l.code})</option>)}
                </select>
            </div>

            {loading ? (
                <div style={{ padding: '40px', textAlign: 'center' }}>
                    <RefreshCw className="spinning" />
                    <p>Loading translations...</p>
                </div>
            ) : (
                <form id="trans-form" onSubmit={handleSave} className="form-grid">
                    {fields.map(field => (
                        <div key={field.name} className="form-group full">
                            <label className="admin-label">{field.label}</label>
                            {field.type === 'textarea' ? (
                                <textarea 
                                    className="admin-input" 
                                    rows={5}
                                    value={translations[field.name] || ''}
                                    onChange={(e) => setTranslations(prev => ({ ...prev, [field.name]: e.target.value }))}
                                />
                            ) : (
                                <input 
                                    className="admin-input" 
                                    type="text"
                                    value={translations[field.name] || ''}
                                    onChange={(e) => setTranslations(prev => ({ ...prev, [field.name]: e.target.value }))}
                                />
                            )}
                        </div>
                    ))}
                </form>
            )}
        </div>

        <div className="admin-modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button 
            type="submit" 
            form="trans-form" 
            className="btn btn-primary" 
            disabled={saving || loading}
          >
            {saving ? 'Saving...' : 'Save Translation'}
          </button>
        </div>
      </div>
    </div>
  );
}
