import { API_BASE, apiFetch, handleResponse } from './apiConfig';

export const adminApi = {
  // Stats & Analytics
  getStats: () => apiFetch('/admin/stats'),
  getSalesAnalytics: () => apiFetch('/admin/analytics/sales'),

  // Products
  getProducts: (params = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '' && value !== 'all') {
        query.append(key, value);
      }
    });
    const suffix = query.toString() ? `?${query.toString()}` : '';
    return apiFetch(`/admin/products${suffix}`);
  },
  getProduct: (id) => apiFetch(`/admin/products/${id}`),
  getProductInventoryHistory: (id, limit = 25) => apiFetch(`/admin/products/${id}/inventory-history?limit=${limit}`),
  upsertProductPricingSchedule: (id, data) => apiFetch(`/admin/products/${id}/pricing-schedules`, {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  deletePricingSchedule: (id) => apiFetch(`/admin/pricing-schedules/${id}`, {
    method: 'DELETE'
  }),
  createProduct: (data) => apiFetch('/admin/products', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  updateProduct: (id, data) => apiFetch(`/admin/products/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  }),
  adjustProductInventory: (id, data) => apiFetch(`/admin/products/${id}/inventory-adjustments`, {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  deleteProduct: (id) => apiFetch(`/admin/products/${id}`, {
    method: 'DELETE'
  }),
  bulkDeleteProducts: (payload) => apiFetch('/admin/products/bulk-delete', {
    method: 'POST',
    body: JSON.stringify(payload)
  }),
  bulkUpdateStatus: (payload) => apiFetch('/admin/products/bulk-status', {
    method: 'POST',
    body: JSON.stringify(payload)
  }),
  bulkUpdatePrice: (payload) => apiFetch('/admin/products/bulk-price', {
    method: 'POST',
    body: JSON.stringify(payload)
  }),

  // Jobs & Catalog Operations
  getJobs: (params = {}) => {
    const query = new URLSearchParams(params);
    return apiFetch(`/admin/jobs?${query.toString()}`);
  },
  exportCatalog: (filters = {}) => {
    const query = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '' && value !== 'all') {
        query.append(key, value);
      }
    });
    const suffix = query.toString() ? `?${query.toString()}` : '';
    return apiFetch(`/admin/catalog/export${suffix}`, { method: 'POST' });
  },
  importCatalog: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return apiFetch('/admin/catalog/import', { method: 'POST', body: formData });
  },

  // Inventory & Alerts
  getInventoryItems: (params = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '' && value !== 'all') {
        query.append(key, value);
      }
    });
    const suffix = query.toString() ? `?${query.toString()}` : '';
    return apiFetch(`/admin/inventory/items${suffix}`);
  },
  getInventoryAlerts: () => apiFetch('/admin/inventory/alerts'),
  dispatchInventoryAlert: () => apiFetch('/admin/inventory/dispatch-alert', {
    method: 'POST'
  }),
  getAuditLogs: (params = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '' && value !== 'all') {
        query.append(key, value);
      }
    });
    const suffix = query.toString() ? `?${query.toString()}` : '';
    return apiFetch(`/admin/audit-logs${suffix}`);
  },
  getApprovalRequests: (params = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '' && value !== 'all') {
        query.append(key, value);
      }
    });
    const suffix = query.toString() ? `?${query.toString()}` : '';
    return apiFetch(`/admin/approvals${suffix}`);
  },
  getNotificationSummary: () => apiFetch('/admin/notifications/summary'),
  approveApprovalRequest: (id, data = {}) => apiFetch(`/admin/approvals/${id}/approve`, {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  rejectApprovalRequest: (id, data = {}) => apiFetch(`/admin/approvals/${id}/reject`, {
    method: 'POST',
    body: JSON.stringify(data)
  }),

  // Promotions
  getPromotions: () => apiFetch('/admin/promotions'),
  createPromotion: (data) => apiFetch('/admin/promotions', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  updatePromotion: (id, data) => apiFetch(`/admin/promotions/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  }),
  deletePromotion: (id) => apiFetch(`/admin/promotions/${id}`, {
    method: 'DELETE'
  }),

  // Orders
  getOrders: () => apiFetch('/admin/orders'),
  getOrder: (id) => apiFetch(`/admin/orders/${id}`),
  updateOrderStatus: (id, status) => apiFetch(`/admin/orders/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status })
  }),

  // Customers
  getCustomers: () => apiFetch('/admin/customers'),
  getCustomer: (id) => apiFetch(`/admin/customers/${id}`),

  // Users & Permissions
  getUsers: () => apiFetch('/admin/users'),
  updateUserRole: (id, role) => apiFetch(`/admin/users/${id}/role`, {
    method: 'PATCH',
    body: JSON.stringify({ role })
  }),

  // Media
  uploadImage: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return apiFetch('/admin/upload', {
      method: 'POST',
      body: formData
    });
  }
};
