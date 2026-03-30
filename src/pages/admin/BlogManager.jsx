import React, { useState, useEffect } from 'react';
import { 
  BookOpen, Plus, Search, Filter, Edit, Trash2, 
  Eye, Globe, Lock, MoreVertical, X, Check,
  Image, User, Calendar, Tag
} from 'lucide-react';
import { cmsApi } from '../../services/cmsApi';
import { useToast } from '../../context/ToastContext';
import './ProductManager.css'; // Reusing some table styles
import './ProductManager.css'; 
import '../../styles/AdminPolish.css';
import TranslationEditor from '../../components/admin/TranslationEditor';

export default function BlogManager() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isTransOpen, setIsTransOpen] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const { addToast } = useToast();

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const data = await cmsApi.getBlogPosts();
      setPosts(data);
    } catch (error) {
      addToast('Failed to load blog posts', 'error');
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
      excerpt: formData.get('excerpt'),
      body: formData.get('body'),
      featured_image: formData.get('featured_image'),
      category: formData.get('category'),
      read_time: formData.get('read_time'),
      status: formData.get('status'),
      published_at: formData.get('published_at') || null,
      seo: {
        meta_title: formData.get('meta_title'),
        meta_description: formData.get('meta_description')
      }
    };

    try {
      if (editingPost) {
        await cmsApi.updateBlogPost(editingPost.id, payload);
        addToast('Blog post updated', 'success');
      } else {
        await cmsApi.createBlogPost(payload);
        addToast('Blog post created', 'success');
      }
      setIsModalOpen(false);
      setEditingPost(null);
      fetchPosts();
    } catch (error) {
      addToast(error.message, 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this blog post?')) return;
    try {
      await cmsApi.deleteBlogPost(id);
      addToast('Blog post deleted', 'success');
      fetchPosts();
    } catch (error) {
      addToast('Delete failed', 'error');
    }
  };

  const filteredPosts = posts.filter(p => 
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
            placeholder="Search blog posts..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="admin-search-input"
          />
        </div>
        
        <div className="admin-actions-right">
          <button className="admin-btn admin-btn-primary" onClick={() => { setEditingPost(null); setIsModalOpen(true); }}>
            <Plus size={18} />
            <span>Create Post</span>
          </button>
        </div>
      </div>

      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Article</th>
              <th>Category</th>
              <th>Status</th>
              <th>Date</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="5" className="table-loading">Loading blog...</td></tr>
            ) : filteredPosts.length === 0 ? (
              <tr><td colSpan="5" className="table-empty">No blog posts found.</td></tr>
            ) : filteredPosts.map(post => (
              <tr key={post.id}>
                <td>
                  <div className="product-cell">
                    <div className="product-cell__img">
                      {post.featured_image ? <img src={post.featured_image} alt="" /> : <BookOpen size={20} />}
                    </div>
                    <div className="product-cell__info">
                      <span className="name">{post.title}</span>
                      <span className="sku">{post.read_time} read</span>
                    </div>
                  </div>
                </td>
                <td><span className="category-tag">{post.category}</span></td>
                <td>
                  <span className={`status-pill ${post.status}`}>
                    {post.status}
                  </span>
                </td>
                <td>{new Date(post.published_at || post.created_at).toLocaleDateString()}</td>
                <td>
                  <div className="table-actions">
                    <button className="admin-icon-btn" onClick={() => { setEditingPost(post); setIsTransOpen(true); }} title="Translate"><Globe size={16} /></button>
                    <button className="admin-icon-btn" onClick={() => { setEditingPost(post); setIsModalOpen(true); }}><Edit size={16} /></button>
                    <button className="admin-icon-btn" onClick={() => window.open(`/blog/${post.slug}`, '_blank')}><Eye size={16} /></button>
                    <button className="admin-icon-btn delete" onClick={() => handleDelete(post.id)}><Trash2 size={16} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="admin-modal-overlay">
          <div className="admin-modal" style={{ maxWidth: '800px' }}>
            <div className="admin-modal-header">
              <h3>{editingPost ? 'Edit Blog Post' : 'New Blog Post'}</h3>
              <button onClick={() => setIsModalOpen(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleSave}>
              <div className="admin-modal-body tabs-container">
                <div className="form-grid">
                  <div className="form-group full">
                    <label className="admin-label">Blog Title</label>
                    <input name="title" className="admin-input" defaultValue={editingPost?.title} required />
                  </div>
                  <div className="form-group half">
                    <label className="admin-label">Slug</label>
                    <input name="slug" className="admin-input" defaultValue={editingPost?.slug} required />
                  </div>
                  <div className="form-group half">
                    <label className="admin-label">Status</label>
                    <select name="status" className="admin-input" defaultValue={editingPost?.status || 'draft'}>
                      <option value="draft">Draft</option>
                      <option value="published">Published</option>
                      <option value="archived">Archived</option>
                    </select>
                  </div>
                  <div className="form-group half">
                    <label className="admin-label">Category</label>
                    <input name="category" className="admin-input" defaultValue={editingPost?.category} placeholder="e.g. Design, Tips, Interior" />
                  </div>
                  <div className="form-group half">
                    <label className="admin-label">Read Time</label>
                    <input name="read_time" className="admin-input" defaultValue={editingPost?.read_time} placeholder="e.g. 5 min" />
                  </div>
                  <div className="form-group full">
                    <label className="admin-label">Featured Image URL</label>
                    <input name="featured_image" className="admin-input" defaultValue={editingPost?.featured_image} />
                  </div>
                  <div className="form-group full">
                    <label className="admin-label">Excerpt</label>
                    <textarea name="excerpt" className="admin-input" rows="2" defaultValue={editingPost?.excerpt}></textarea>
                  </div>
                  <div className="form-group full">
                    <label className="admin-label">Post Body (Markdown/HTML Support)</label>
                    <textarea name="body" className="admin-input" rows="10" defaultValue={editingPost?.body}></textarea>
                  </div>

                  <div className="admin-section-divider">SEO Settings</div>
                  <div className="form-group full">
                    <label className="admin-label">Meta Title</label>
                    <input name="meta_title" className="admin-input" defaultValue={editingPost?.seo?.meta_title} />
                  </div>
                  <div className="form-group full">
                    <label className="admin-label">Meta Description</label>
                    <textarea name="meta_description" className="admin-input" rows="3" defaultValue={editingPost?.seo?.meta_description}></textarea>
                  </div>
                </div>
              </div>
              <div className="admin-modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Post</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isTransOpen && (
        <TranslationEditor 
            entityType="blog"
            entityId={editingPost?.id}
            fields={[
                { name: 'title', label: 'Translated Title', type: 'text' },
                { name: 'slug', label: 'Localized Slug', type: 'text' },
                { name: 'excerpt', label: 'Localized Excerpt', type: 'textarea' },
                { name: 'body', label: 'Localized Body Content', type: 'textarea' }
            ]}
            onClose={() => setIsTransOpen(false)}
        />
      )}
    </div>
  );
}
