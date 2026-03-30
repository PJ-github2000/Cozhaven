import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Search, Filter, ShoppingBag, ExternalLink, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useProductsQuery } from '../context/ProductsContext';
import ProductCard from '../components/ProductCard';
import ProductSkeleton from '../components/ProductSkeleton';
import './DesignerSeries.css';

export default function DesignerSeries() {
    const [search, setSearch] = useState('');
    const [category, setCategory] = useState('All');

    const { data, isLoading: loading } = useProductsQuery({
        badge: 'designer',
        search: search,
        category: category === 'All' ? 'all' : category,
        limit: 100
    });

    const products = data?.items || [];
    const categories = ['All', 'living-room', 'sectionals', 'chairs', 'tables', 'dining', 'lighting', 'bedroom'];

    return (
        <div className="designer-series">
            <Helmet>
                <title>Designer Series | International Collection | Cozhaven</title>
                <meta name="description" content="Explore our internationally inspired designer series. Modern, modular, and exceptionally crafted furniture for the contemporary home." />
            </Helmet>

            <div className="designer-hero">
                <div className="container">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <span className="designer-badge">
                            <Sparkles size={14} />
                            Curated International Designs
                        </span>
                        <h1>Designer Series</h1>
                        <p>Architectural forms meet unparalleled comfort. A collection inspired by the world's leading modern aesthetics.</p>
                    </motion.div>
                </div>
                <div className="designer-hero__glow" />
            </div>

            <div className="container">
                <div className="designer-toolbar">
                    <div className="search-wrapper">
                        <Search size={18} />
                        <input
                            type="text"
                            placeholder="Search designer pieces..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <div className="filter-wrapper">
                        <Filter size={18} />
                        <select value={category} onChange={(e) => setCategory(e.target.value)}>
                            {categories.map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                    </div>
                    <div className="designer-results">
                        {products.length} masterpieces found
                    </div>
                </div>

                {loading ? (
                    <div className="designer-grid">
                        {Array.from({ length: 8 }).map((_, i) => (
                            <ProductSkeleton key={i} index={i} />
                        ))}
                    </div>
                ) : (
                    <div className="designer-grid">
                        <AnimatePresence mode="popLayout">
                            {products.map((product, idx) => (
                                <ProductCard key={product.id} product={product} index={idx} />
                            ))}
                        </AnimatePresence>
                    </div>
                )}
            </div>
        </div>
    );
}
