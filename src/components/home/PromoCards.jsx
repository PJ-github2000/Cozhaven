import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const jsonSafeParse = (str) => {
  try {
    return JSON.parse(str);
  } catch (e) {
    return null;
  }
};

export default function PromoCards({ promoData }) {
  const [promo, setPromo] = useState([]);

  useEffect(() => {
    fetch(`${API_URL}/cms/blocks/homepage-promo`)
      .then(res => res.json())
      .then(data => {
        if (data.content_json) {
          setPromo(jsonSafeParse(data.content_json));
        }
      })
      .catch(console.error);
  }, []);

  const defaultCards = [
    { title: "Best Sellers", image: "/assets/Best seller.webp", link: "/shop?sort=best-selling" },
    { title: "New Arrivals", image: "/assets/Others Image 6.png", link: "/shop?sort=new-arrivals" },
    { title: "Bundle Deals", image: "/assets/Others Image 7.jpg", link: "/shop?bundle=true" }
  ];

  const data = promoData && promoData.length > 0 ? promoData : (promo.length > 0 ? promo : defaultCards);

  return (
    <section className="promo-cards section-padding">
      <div className="container">
        <div className="promo-cards__grid">
          {data.map((card, i) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
            >
              <Link to={card.link} className="promo-card">
                <img src={card.image} alt={card.title} loading="lazy" className="promo-card__img" />
                <div className="promo-card__overlay">
                  <h3 className="promo-card__title">{card.title}</h3>
                  <div className="promo-card__btn">
                    <ArrowRight size={20} />
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
