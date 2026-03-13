import { Shield, Truck, RotateCcw, Award, Leaf, CheckCircle } from 'lucide-react';
import './TrustBadges.css';

export default function TrustBadges() {
  const badges = [
    {
      icon: <Shield size={24} />,
      title: 'Made in Canada',
      description: 'Proudly crafted locally'
    },
    {
      icon: <Truck size={24} />,
      title: 'Free Shipping',
      description: 'On orders over $999'
    },
    {
      icon: <RotateCcw size={24} />,
      title: '30-Day Returns',
      description: 'Hassle-free returns'
    },
    {
      icon: <Award size={24} />,
      title: 'Premium Quality',
      description: 'Handcrafted excellence'
    },
    {
      icon: <Leaf size={24} />,
      title: 'Eco-Friendly',
      description: 'Sustainable materials'
    },
    {
      icon: <CheckCircle size={24} />,
      title: 'Secure Checkout',
      description: 'Protected payments'
    }
  ];

  return (
    <div className="trust-badges-container">
      {badges.map((badge, index) => (
        <div key={index} className="trust-badge-item">
          <div className="trust-badge-icon">{badge.icon}</div>
          <div className="trust-badge-text">
            <h4>{badge.title}</h4>
            <p>{badge.description}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
