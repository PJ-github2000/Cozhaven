import { apiFetch } from './apiConfig';

export const merchandisingApi = {
  // Price Lists
  getPriceLists: () => apiFetch('/admin/merchandising/price-lists'),
  createPriceList: (data) => apiFetch('/admin/merchandising/price-lists', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  updatePriceListEntries: (listId, entries) => apiFetch(`/admin/merchandising/price-lists/${listId}/entries`, {
    method: 'POST',
    body: JSON.stringify(entries)
  }),

  // Campaigns
  getCampaigns: () => apiFetch('/admin/merchandising/campaigns'),
  createCampaign: (data) => apiFetch('/admin/merchandising/campaigns', {
    method: 'POST',
    body: JSON.stringify(data)
  }),

  // Segments
  getSegments: () => apiFetch('/admin/merchandising/segments'),
  createSegment: (data) => apiFetch('/admin/merchandising/segments', {
    method: 'POST',
    body: JSON.stringify(data)
  })
};
