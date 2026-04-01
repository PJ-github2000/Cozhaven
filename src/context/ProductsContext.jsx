import React, { createContext, useContext, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { API_BASE } from '../services/apiConfig.js';

const ProductsContext = createContext();

export function useProducts() {
  const context = useContext(ProductsContext);
  if (!context) {
    throw new Error('useProducts must be used within a ProductsProvider');
  }
  return context;
}

const mapProduct = (p) => {
  const imgs = p.images && p.images.length > 0
    ? (typeof p.images === 'string' ? p.images.split(',') : p.images)
    : ["https://atunus.com/wp-content/uploads/2025/04/Sky-Cloud-Deluxe-Adjustable-Sectional-Sofa-Comfort-Relaxation-125-Inch-Velvet-Corner-Sectionals-2-Seaters-Atunus-1.webp"];
  return {
    ...p,
    id: Number(p.id),
    slug: p.slug || null,
    sku: p.sku || null,
    productType: p.productType || p.product_type || 'simple',
    seo: p.seo || null,
    image: imgs[0],
    images: imgs,
    colors: p.colors && p.colors.length > 0 ? (typeof p.colors === 'string' ? p.colors.split(',') : p.colors) : ["#C9B8A8", "#2A2622"],
    sizes: p.sizes && p.sizes.length > 0 ? (typeof p.sizes === 'string' ? p.sizes.split(',') : p.sizes) : ["Standard"],
    rating: p.rating || 4.5,
    reviews: p.reviews || 0,
    badge: p.badge || null,
    salePercent: p.salePercent || p.sale_percent || null,
    originalPrice: p.originalPrice || p.original_price || null,
    subcategory: p.subcategory || p.category?.replace('-', ' '),
    specs: p.specs || null,
    variants: (p.variants || []).map((variant) => ({
      ...variant,
      compareAtPrice: variant.compareAtPrice || variant.compare_at_price || null
    })),
  };
};

const fetchProducts = async (params = {}) => {
  const query = new URLSearchParams();
  // Include all params, including badge
  Object.entries(params).forEach(([key, val]) => {
    if (val !== undefined && val !== null && val !== '') {
      query.append(key, val);
    }
  });

  const res = await fetch(`${API_BASE}/products?${query.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch products');
  const data = await res.json();

  return {
    items: (data.products || []).map(mapProduct),
    total: data.total || 0,
    pages: data.pages || 1,
    page: data.page || 1
  };
};

export function useProductsQuery(params = {}) {
  return useQuery({
    queryKey: ['products', params],
    queryFn: () => fetchProducts(params),
    staleTime: 1000 * 60 * 5, // 5 mins
    keepPreviousData: true
  });
}

const fetchProduct = async (id) => {
  const res = await fetch(`${API_BASE}/products/${id}`);
  if (!res.ok) {
    if (res.status === 404) return null;
    throw new Error('Failed to fetch product');
  }
  const data = await res.json();
  return mapProduct(data);
};

export function useProduct(id) {
  return useQuery({
    queryKey: ['product', id],
    queryFn: () => fetchProduct(id),
    enabled: !!id,
    staleTime: 1000 * 60 * 15, // 15 mins
    gcTime: 1000 * 60 * 60,    // 1 hour
  });
}

export function ProductsProvider({ children }) {
  // Global preloader removed to fix C12 (Security/Performance risk)
  return (
    <ProductsContext.Provider value={{}}>
      {children}
    </ProductsContext.Provider>
  );
}
