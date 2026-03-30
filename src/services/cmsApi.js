import { apiFetch } from './apiConfig';

export const cmsApi = {
  // Pages
  getPages: () => apiFetch('/admin/cms/pages'),
  getPage: (id) => apiFetch(`/admin/cms/pages/${id}`),
  createPage: (data) => apiFetch('/admin/cms/pages', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  updatePage: (id, data) => apiFetch(`/admin/cms/pages/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  }),
  deletePage: (id) => apiFetch(`/admin/cms/pages/${id}`, {
    method: 'DELETE'
  }),

  // Blog
  getBlogPosts: () => apiFetch('/admin/cms/blog'),
  getBlogPost: (id) => apiFetch(`/admin/cms/blog/${id}`),
  createBlogPost: (data) => apiFetch('/admin/cms/blog', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  updateBlogPost: (id, data) => apiFetch(`/admin/cms/blog/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  }),
  deleteBlogPost: (id) => apiFetch(`/admin/cms/blog/${id}`, {
    method: 'DELETE'
  }),

  // Blocks
  getBlocks: () => apiFetch('/admin/cms/blocks'),
  createBlock: (data) => apiFetch('/admin/cms/blocks', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  updateBlock: (id, data) => apiFetch(`/admin/cms/blocks/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  }),
  deleteBlock: (id) => apiFetch(`/admin/cms/blocks/${id}`, {
    method: 'DELETE'
  }),

  // Public (Storefront)
  getPublicPage: (slug) => apiFetch(`/cms/pages/${slug}`),
  getPublicBlogPosts: () => apiFetch('/cms/blog'),
  getPublicBlogPost: (slug) => apiFetch(`/cms/blog/${slug}`)
};
