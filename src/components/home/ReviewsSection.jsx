import { useRef, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import { Quote, Star, ArrowRight } from 'lucide-react';
import AnimatedText from '../AnimatedText';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const jsonSafeParse = (str) => {
  try {
    return JSON.parse(str);
  } catch (e) {
    return null;
  }
};

export default function ReviewsSection() {
  const [active, setActive] = useState(0);
  const [reviews, setReviews] = useState([]);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  const defaultReviews = [
    {
      id: 1,
      name: "Sarah Montgomery",
      product: "Bubble Sectional Sofa",
      rating: 5,
      text: "The most comfortable sofa I've ever owned. The Canadian craftsmanship is evident in every stitch. It's truly a piece of art that we live on every day.",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah"
    },
    {
      id: 2,
      name: "Marcus Thompson",
      product: "Cloud Modular Set",
      rating: 5,
      text: "Exceptional quality and service. The white-glove delivery in Toronto was flawless. Cozhaven has completely transformed our living room aesthetic.",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Marcus"
    },
    {
      id: 3,
      name: "Elena Richardson",
      product: "Designer Series Vault",
      rating: 5,
      text: "I was hesitant about ordering online, but the quality exceeded my expectations. The modular design is so versatile for our changing needs.",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Elena"
    },
    {
      id: 4,
      name: "David Chen",
      product: "Cordelle Collection",
      rating: 5,
      text: "The attention to detail is mind-blowing. Solid hardwood frames and premium fabrics that actually stand up to kids and pets. Highly recommend!",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=David"
    }
  ];

  const renderAvatar = (avatar, name) => {
    if (avatar && (avatar.startsWith('http') || avatar.startsWith('/'))) {
      return <img src={avatar} alt={name} />;
    }
    return avatar || (name && name.slice(0, 2).toUpperCase()) || 'XX';
  };

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const res = await fetch(`${API_URL}/cms/blocks/homepage-reviews`);
        const data = await res.json();
        if (data && data.content_json) {
          const parsed = jsonSafeParse(data.content_json);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setReviews(parsed);
            return;
          }
        }
        setReviews(defaultReviews);
      } catch (err) {
        console.error("Reviews fetch error:", err);
        setReviews(defaultReviews);
      }
    };
    fetchReviews();
  }, []);

  useEffect(() => {
    const data = reviews.length > 0 ? reviews : defaultReviews;
    const timer = setInterval(() => {
      setActive(prev => (prev + 1) % data.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [reviews]);

  const displayReviews = reviews.length > 0 ? reviews : defaultReviews;
  const review = displayReviews[active % displayReviews.length] || defaultReviews[0];

  return (
    <section className="reviews-v2 section-padding" ref={ref}>
      <div className="container">
        <div className="reviews-v2__layout">
          <motion.div
            className="reviews-v2__featured"
            initial={{ opacity: 0, x: -40 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6 }}
          >
            <div className="reviews-v2__header">
              <span className="section-subtitle">Verified Buyer Feedback</span>
              <AnimatedText
                el="h2"
                text={["Trusted By Families,", "Built For Comfort"]}
                className="section-title reviews-v2__title"
              />
              <div className="reviews-v2__stats">
                <div><strong>4.9</strong><span>/5 avg rating</span></div>
                <div className="reviews-v2__stats-divider" />
                <div><strong>2,400+</strong><span>reviews</span></div>
                <div className="reviews-v2__stats-divider" />
                <div><strong>98%</strong><span>recommend</span></div>
              </div>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={active}
                className="reviews-v2__card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
              >
                <Quote size={40} className="reviews-v2__quote-icon" />
                <div className="reviews-v2__stars">
                  {Array.from({ length: 5 }).map((_, j) => (
                    <Star key={j} size={16} fill={j < review.rating ? 'currentColor' : 'none'} className={j < review.rating ? 'star' : 'star-empty'} />
                  ))}
                </div>
                <p className="reviews-v2__text">{review.text || review.content}</p>
                <div className="reviews-v2__author">
                  <div className="reviews-v2__avatar">
                    {renderAvatar(review.avatar, review.name)}
                  </div>
                  <div>
                    <h4>{review.name}</h4>
                    <span>{review.product || 'Verified Buyer'}</span>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

            <div className="reviews-v2__dots">
              {displayReviews.map((_, i) => (
                <button
                  key={i}
                  className={`reviews-v2__dot ${active === i ? 'active' : ''}`}
                  onClick={() => setActive(i)}
                  aria-label={`Review ${i + 1}`}
                />
              ))}
            </div>
          </motion.div>

          <motion.div
            className="reviews-v2__stack"
            initial={{ opacity: 0, x: 40 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {displayReviews.slice(0, 4).map((r, i) => (
              <motion.button
                key={i}
                type="button"
                className={`reviews-v2__mini ${active === i ? 'reviews-v2__mini--active' : ''}`}
                onClick={() => setActive(i)}
                whileHover={{ x: 4 }}
                transition={{ duration: 0.2 }}
              >
                <div className="reviews-v2__mini-avatar">
                  {renderAvatar(r.avatar, r.name)}
                </div>
                <div className="reviews-v2__mini-content">
                  <div className="reviews-v2__mini-stars">
                    {Array.from({ length: 5 }).map((_, j) => (
                      <Star key={j} size={10} fill={j < r.rating ? 'currentColor' : 'none'} className={j < r.rating ? 'star' : 'star-empty'} />
                    ))}
                  </div>
                  <p>"{(r.text || r.content || '').substring(0, 80)}..."</p>
                  <span>{r.name} {r.verified && 'Verified'}</span>
                </div>
              </motion.button>
            ))}
            <div className="reviews-v2__cta">
              <Link to="/contact" className="btn btn-ghost">Talk To A Product Expert <ArrowRight size={14} /></Link>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
