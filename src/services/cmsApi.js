import { apiFetch } from './apiConfig.js';

export const cmsApi = {
  // Public (Storefront)
  getPublicPage: (slug) => apiFetch(`/cms/pages/${slug}`),
  getPublicBlogPosts: () => apiFetch('/cms/blog'),
  getPublicBlogPost: (slug) => apiFetch(`/cms/blog/${slug}`)
};
