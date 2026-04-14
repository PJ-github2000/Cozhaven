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

export default function CategoriesSection({ categoriesData }) {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    fetch(`${API_URL}/cms/blocks/homepage-categories`)
      .then(res => res.json())
      .then(data => {
        if (data.content_json) {
          setCategories(jsonSafeParse(data.content_json));
        }
      })
      .catch(console.error);
  }, []);

  const defaultCategories = [
    { id: "modular", name: "Modular", image: "/assets/Image 3 category modular.jpg" },
    { id: "sectionals", name: "Sectional Sofas", image: "/assets/Image 4 sectional.jpg" },
    { id: "chairs", name: "Accent Chairs", image: "/assets/Image 8 Accent chair.png" },
    { id: "dining", name: "Dining", image: "/assets/Image 6 dining.webp" },
    { id: "bedroom", name: "Bedroom", image: "/assets/Image 5 Bed category.webp" },
    { id: "coffee-tables", name: "Coffee Tables", image: "/assets/Image 7 coffee table.jpg" },
    { id: "living", name: "Living Room", image: "/assets/Living room Image 9.jpg" },
    { id: "vanity", name: "Vanity Dressers", image: "/assets/Others Image 3.jpg" },
  ];

  const data = categoriesData && categoriesData.length > 0 ? categoriesData : (categories.length > 0 ? categories : defaultCategories);

  return (
    <section className="categories section-padding">
      <div className="container">
        <div className="categories__grid">
          {data.map((cat, i) => (
            <motion.div
              key={cat.id || cat.name || i}
              className={`category-card ${cat.hasBg ? 'category-card--bg' : ''}`}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05, duration: 0.5 }}
            >
              <Link to={`/shop?cat=${cat.id || cat.name?.toLowerCase().replace(/\s+/g, '-') || 'all'}`}>
                <div className="category-card__image">
                  <img src={cat.image} alt={cat.name} loading="lazy" />
                </div>
                <div className="btn btn-outline category-card__btn">
                  {cat.name} <ArrowRight size={16} />
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
