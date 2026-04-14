import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle2, Briefcase } from 'lucide-react';
import AnimatedText from '../AnimatedText';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const jsonSafeParse = (str) => {
  try {
    return JSON.parse(str);
  } catch (e) {
    return null;
  }
};

export default function TradeProgramPromo() {
  const [trade, setTrade] = useState(null);

  useEffect(() => {
    fetch(`${API_URL}/cms/blocks/homepage-trade`)
      .then(res => res.json())
      .then(data => {
        if (data.content_json) {
          setTrade(jsonSafeParse(data.content_json));
        }
      })
      .catch(console.error);
  }, []);

  const defaultTrade = {
    title: "Cozhaven for Professionals",
    subtitle: "Trade Program",
    description: "Ordering for your client or business? Partner with us to unlock exclusive wholesale benefits tailored for interior designers, architects, contractors, and developers.",
    benefits: [
      { text: "Up to 30% Preferential Pricing" },
      { text: "Dedicated Concierge Support" },
      { text: "Tax Exemption Processing" }
    ],
    image: "/assets/Others Image 5.jpg",
    link: "/trade-program"
  };

  const data = trade || defaultTrade;

  return (
    <section className="trade-promo section-padding">
      <div className="container">
        <div className="trade-promo__grid">
          <motion.div 
            className="trade-promo__content"
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <span className="section-subtitle trade-promo__subtitle">{data.subtitle}</span>
            <AnimatedText el="h2" text={data.title} className="trade-promo__title" />
            <p className="trade-promo__description">
              {data.description}
            </p>
            
            <ul className="trade-promo__benefits">
              {(data.benefits || []).map((benefit, i) => (
                <li key={i} className="trade-promo__benefit">
                  <CheckCircle2 size={18} color="var(--rich-bronze)" /> {benefit.text}
                </li>
              ))}
            </ul>

            <Link to={data.link} className="btn btn-primary trade-promo__cta">
              Apply For Trade Pricing <Briefcase size={16} />
            </Link>
          </motion.div>

          <motion.div 
            className="trade-promo__visual"
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <img src={data.image || "/assets/Others Image 5.jpg"} alt="Trade Program Showcase" loading="lazy" />
            <div className="trade-promo__visual-overlay" />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
