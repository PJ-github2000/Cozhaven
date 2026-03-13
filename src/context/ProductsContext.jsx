import React, { createContext, useContext, useState, useEffect } from 'react';

const ProductsContext = createContext();

export function useProducts() {
  return useContext(ProductsContext);
}

export function ProductsProvider({ children }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch('http://localhost:8000/api/products')
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch products');
        return res.json();
      })
      .then(data => {
        // Map backend products to match frontend component expectations
        const mappedProducts = data.map(p => {
          let imgs = p.images && p.images.length > 0 ? p.images : ["https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&q=80"];
          return {
            ...p,
            id: Number(p.id),
            image: imgs[0],
            images: imgs,
            colors: p.id === 1 ? ["#C9B8A8","#2A2622","#8B9D83"] : ["#F4EDE3","#C9B8A8","#A67C52"], // Frontend fallbacks
            sizes: ["Standard", "Large"],
            rating: 4.8,
            reviews: 124,
            badge: p.id === 1 || p.id === 3 ? "new" : p.id === 2 ? "sale" : null,
            salePercent: p.id === 2 ? 15 : null,
            subcategory: p.category.replace('-', ' '),
            specs: {
              dimensions: '84"W × 38"D × 34"H',
              weight: '145 lbs',
              material: 'Premium linen blend',
              frame: 'Kiln-dried hardwood',
              cushions: 'High-resilience foam'
            }
          };
        });
        setProducts(mappedProducts);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching products:', err);
        setError(err.message);
        setLoading(false);
      });
  }, []);

  return (
    <ProductsContext.Provider value={{ products, loading, error }}>
      {children}
    </ProductsContext.Provider>
  );
}
