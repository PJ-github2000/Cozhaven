import { API_BASE } from './apiConfig.js';

const DISCOVERY_BASE = `${API_BASE}/discovery`;

export const discoveryApi = {
  /**
   * Get recommended products for a specific item
   */
  getRecommendations: async (productId) => {
    const res = await fetch(`${DISCOVERY_BASE}/recommendations/${productId}`, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    if (!res.ok) throw new Error('Recommendation fetch failed');
    return res.json();
  },

  /**
   * Get global trending products
   */
  getTrending: async (limit = 8) => {
    const res = await fetch(`${DISCOVERY_BASE}/trending?limit=${limit}`, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    if (!res.ok) throw new Error('Trending fetch failed');
    return res.json();
  },

  /**
   * Get user's recent views history
   */
  getRecentViews: async (limit = 10) => {
    const res = await fetch(`${DISCOVERY_BASE}/recent-views?limit=${limit}`, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    if (!res.ok) throw new Error('Recent views fetch failed');
    return res.json();
  },

  /**
   * Record a product view for history
   */
  recordView: async (productId) => {
    const res = await fetch(`${DISCOVERY_BASE}/record-view/${productId}`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    return res.json();
  }
};
