import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useProducts } from '../context/ProductsContext';
import './SearchModal.css';

export default function SearchModal({ isOpen, onClose }) {
  const [query, setQuery] = useState('');
  const { products } = useProducts();
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const inputRef = useRef();
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
      setQuery('');
      setDebouncedQuery('');
    }
  }, [isOpen]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  const { data: results = [], isLoading } = useQuery({
    queryKey: ['products', 'search', debouncedQuery],
    queryFn: async () => {
      if (!debouncedQuery.trim() || debouncedQuery.trim().length <= 1) return [];
      const response = await fetch(`/api/products/search?q=${encodeURIComponent(debouncedQuery)}&limit=6`);
      if (!response.ok) throw new Error('Search failed');
      return response.json();
    },
    enabled: debouncedQuery.trim().length > 1,
    staleTime: 1000 * 60 * 5, // 5 mins
  });


  const goToProduct = (product) => {
    navigate(`/products/${product.slug || product.id}`);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div className="overlay" onClick={onClose} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} />
          <motion.div
            className="search-modal"
            initial={{ opacity: 0, y: -40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -40 }}
            transition={{ duration: 0.3 }}
          >
            <div className="search-modal__input-wrap">
              <Search size={20} className="search-modal__icon" />
              <input
                ref={inputRef}
                type="text"
                placeholder="Search furniture..."
                value={query}
                onChange={e => setQuery(e.target.value)}
                className="search-modal__input"
              />
              <button onClick={onClose} className="search-modal__close"><X size={20} /></button>
            </div>
            {isLoading && (
              <p className="search-modal__empty">Searching...</p>
            )}
            {!isLoading && results.length > 0 && (
              <div className="search-modal__results">
                {results.map(p => (
                  <button key={p.id} className="search-result" onClick={() => goToProduct(p)}>
                    <img src={p.image} alt={p.name} />
                    <div>
                      <h4>{p.name}</h4>
                      <p>${p.price.toLocaleString()}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
            {!isLoading && query.length > 1 && results.length === 0 && (
              <p className="search-modal__empty">No results found for "{query}"</p>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
