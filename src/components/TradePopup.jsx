import { useState, useEffect } from 'react';
import { X, Briefcase } from 'lucide-react';
import { Link } from 'react-router-dom';
import './TradePopup.css';

export default function TradePopup() {
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        // Show after 4 seconds
        const hasSeenPopup = sessionStorage.getItem('cozhaven_trade_seen');
        if (!hasSeenPopup) {
            const timer = setTimeout(() => {
                setIsOpen(true);
            }, 4000);
            return () => clearTimeout(timer);
        }
    }, []);

    const handleClose = () => {
        setIsOpen(false);
        sessionStorage.setItem('cozhaven_trade_seen', 'true');
    };

    if (!isOpen) return null;

    return (
        <div className="trade-popup-overlay">
            <div 
                className="trade-popup-modal"
                role="dialog"
                aria-modal="true"
                aria-labelledby="trade-popup-title"
            >
                <button className="trade-popup-close" onClick={handleClose} aria-label="Close popup">
                    <X size={24} />
                </button>

                <div className="trade-popup-content">
                    <div className="trade-popup-visual">
                        <div className="trade-popup-cover">
                            <div className="trade-popup-glow" />
                            <div className="trade-popup-brand">Cozhaven</div>
                            <Briefcase size={64} className="trade-popup-icon" />
                            <div className="trade-popup-label">Professional Hub</div>
                        </div>
                    </div>

                    <div className="trade-popup-text">
                        <div className="trade-popup-badge">
                            FOR INDUSTRY PROFESSIONALS
                        </div>
                        <h3 id="trade-popup-title">Create Meaningful Spaces With Us</h3>
                        <p>Ordering for your client or business? Partner with Cozhaven to unlock exclusive B2B wholesale pricing and preferred support.</p>
                        
                        <ul className="trade-popup-features">
                            <li>✓ Up to 30% Trade Pricing</li>
                            <li>✓ Dedicated Concierge Support</li>
                            <li>✓ Early Access product drops</li>
                        </ul>

                        <Link to="/trade-program" className="trade-popup-btn" onClick={handleClose}>
                            Apply for Trade Program
                        </Link>
                        <p className="trade-popup-footer">Fast track approval within 1-2 business days.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
