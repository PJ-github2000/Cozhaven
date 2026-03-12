import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import PRODUCTS from '../data/products';
import './SearchModal.css';

export default function SearchModal({ isOpen, onClose }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const inputRef = useRef();
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
      setQuery('');
      setResults([]);
    }
  }, [isOpen]);

  useEffect(() => {
    if (query.length > 1) {
      const q = query.toLowerCase();
      setResults(PRODUCTS.filter(p =>
        p.name.toLowerCase().includes(q) || p.category.includes(q) || p.subcategory.toLowerCase().includes(q)
      ).slice(0, 6));
    } else {
      setResults([]);
    }
  }, [query]);

  const goToProduct = (id) => {
    navigate(`/products/${id}`);
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
            {results.length > 0 && (
              <div className="search-modal__results">
                {results.map(p => (
                  <button key={p.id} className="search-result" onClick={() => goToProduct(p.id)}>
                    <img src={p.image} alt={p.name} />
                    <div>
                      <h4>{p.name}</h4>
                      <p>${p.price.toLocaleString()}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
            {query.length > 1 && results.length === 0 && (
              <p className="search-modal__empty">No results found for "{query}"</p>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
