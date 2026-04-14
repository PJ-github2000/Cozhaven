import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Award, Shield, Truck, Sparkles } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const jsonSafeParse = (str) => {
  try {
    return JSON.parse(str);
  } catch (e) {
    return null;
  }
};

export default function TrustBar({ statsData }) {
  const [stats, setStats] = useState([]);

  useEffect(() => {
    fetch(`${API_URL}/cms/blocks/homepage-stats`)
      .then(res => res.json())
      .then(data => {
        if (data.content_json) {
          setStats(jsonSafeParse(data.content_json));
        }
      })
      .catch(console.error);
  }, []);

  const defaultStats = [
    { icon: 'Users', number: '15K+', label: 'Homes Furnished' },
    { icon: 'Award', number: '200+', label: 'Curated Pieces' },
    { icon: 'Shield', number: '5 Year', label: 'Warranty' },
    { icon: 'Truck', number: 'Free', label: 'Delivery in GTA' },
    { icon: 'Sparkles', number: '4.9/5', label: 'Verified Rating' },
  ];

  const data = statsData && statsData.length > 0 ? statsData : (stats.length > 0 ? stats : defaultStats);

  const iconMap = {
    Users: <Users size={22} />,
    Award: <Award size={22} />,
    Shield: <Shield size={22} />,
    Truck: <Truck size={22} />,
    Sparkles: <Sparkles size={22} />
  };

  return (
    <section className="trust-bar">
      <div className="container">
        <div className="trust-bar__grid">
          {data.map((stat, i) => (
            <motion.div
              key={i}
              className="trust-bar__item"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.4 }}
            >
              <div className="trust-bar__icon">{iconMap[stat.icon] || stat.icon}</div>
              <div>
                <span className="trust-bar__number">{stat.number}</span>
                <span className="trust-bar__label">{stat.label}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
