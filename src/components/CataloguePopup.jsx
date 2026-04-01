import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, BookOpen, ShieldCheck, Sparkles } from 'lucide-react';
import './CataloguePopup.css';

export default function CataloguePopup() {
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        // Check if user has already seen the popup in this session
        const hasSeenPopup = sessionStorage.getItem('cozhaven_catalogue_seen');

        if (!hasSeenPopup) {
            // Show popup after 6 seconds of browsing
            const timer = setTimeout(() => {
                setIsOpen(true);
            }, 6000);
            return () => clearTimeout(timer);
        }
    }, []);

    const handleClose = () => {
        setIsOpen(false);
        sessionStorage.setItem('cozhaven_catalogue_seen', 'true');
    };

    const handleDownload = () => {
        // Standard download logic
        const link = document.createElement('a');
        link.href = '/Cozhaven_2026_Catalog.pdf';
        link.download = 'Cozhaven_2026_Catalog.pdf';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        handleClose();
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="catalogue-overlay">
                    <motion.div
                        className="catalogue-modal"
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                    >
                        <button className="catalogue-close" onClick={handleClose} aria-label="Close popup">
                            <X size={20} />
                        </button>

                        <div className="catalogue-content">
                            <div className="catalogue-visual">
                                <div className="catalogue-cover">
                                    <div className="catalogue-glow" />
                                    <div className="catalogue-brand">Cozhaven</div>
                                    <div className="catalogue-year">2026</div>
                                    <BookOpen size={64} className="catalogue-icon" />
                                    <div className="catalogue-label">Curated Collection</div>
                                </div>
                            </div>

                            <div className="catalogue-text">
                                <div className="catalogue-badge">
                                    <Sparkles size={14} />
                                    Exclusive Entry
                                </div>
                                <h3>Download Our 2026 Designer Catalogue</h3>
                                <p>Unlock our complete collection of curated furniture, architectural designs, and wholesale pricing guide in one elegant PDF.</p>

                                <ul className="catalogue-features">
                                    <li><ShieldCheck size={16} /> 380+ Unique Designer Pieces</li>
                                    <li><ShieldCheck size={16} /> Full Specification Sheets</li>
                                    <li><ShieldCheck size={16} /> Direct Warehouse Pricing</li>
                                </ul>

                                <button className="catalogue-btn" onClick={handleDownload}>
                                    <Download size={18} />
                                    Download Now
                                </button>

                                <p className="catalogue-footer">No sign-up required. Direct download.</p>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
