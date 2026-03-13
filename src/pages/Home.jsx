import { useRef, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform, useInView, AnimatePresence } from 'framer-motion';
import { ArrowRight, ArrowDown, Star, ChevronLeft, ChevronRight, MapPin, Clock, Truck, Shield, Heart, Sparkles, Award, Users, Play, Pause, Quote } from 'lucide-react';
import { CATEGORIES, REVIEWS, BLOG_POSTS } from '../data/products';
import { useProducts } from '../context/ProductsContext';
import ProductCard from '../components/ProductCard';
import AnimatedText from '../components/AnimatedText';
import './Home.css';

export default function Home() {
  return (
    <main id="main-content">
      <HeroSection />
      <TrustBar />
      <CategoriesSection />
      <FeaturedProducts />
      <LifestyleVideo />
      <ReviewsSection />
      <StoreOpening />
      <InstagramFeed />
      <JournalPreview />
    </main>
  );
}

/* ═══ HERO ═══ */
function HeroSection() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], [0, 150]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.05]);

  return (
    <section className="hero" ref={ref}>
      <motion.div className="hero__bg" style={{ y, scale }}>
        <img src="https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=1920&q=80" alt="Luxury modern living room" />
        <div className="hero__gradient" />
      </motion.div>
      
      {/* Animated light beams */}
      <div className="hero__beams">
        <div className="hero__beam hero__beam--1" />
        <div className="hero__beam hero__beam--2" />
        <div className="hero__beam hero__beam--3" />
      </div>
      
      <motion.div className="hero__content container" style={{ opacity }}>
        <motion.div
          className="hero__badge"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          <Sparkles size={16} />
          <span>Handcrafted in Canada</span>
        </motion.div>
        
        <AnimatedText 
          el="h1"
          text={["Elevate Your Space,", "Elevate Your Life"]}
          once={true}
        />
        
        <motion.p
          className="hero__desc"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.8 }}
        >
          Discover premium furniture that blends Canadian craftsmanship with contemporary design. 
          Every piece tells a story of quality, comfort, and conscious creation.
        </motion.p>
        
        <motion.div
          className="hero__stats"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9, duration: 0.8 }}
        >
          <div className="hero__stat">
            <strong>15+</strong>
            <span>Years Experience</span>
          </div>
          <div className="hero__stat-divider" />
          <div className="hero__stat">
            <strong>10K+</strong>
            <span>Happy Customers</span>
          </div>
          <div className="hero__stat-divider" />
          <div className="hero__stat">
            <strong>100%</strong>
            <span>Canadian Made</span>
          </div>
        </motion.div>
        
        <motion.div
          className="hero__actions"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2, duration: 0.6 }}
        >
          <Link to="/shop" className="btn btn-primary btn-large">
            Shop Collection
            <ArrowRight size={20} />
          </Link>
          <Link to="/about" className="btn btn-secondary btn-large">
            Our Story
          </Link>
        </motion.div>
        
        <motion.div
          className="hero__trust"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.6, duration: 0.8 }}
        >
          <div className="hero__trust-item">
            <Shield size={16} />
            <span>5-Year Warranty</span>
          </div>
          <div className="hero__trust-item">
            <Truck size={16} />
            <span>Free Shipping</span>
          </div>
          <div className="hero__trust-item">
            <Heart size={16} />
            <span>Loved by 10K+</span>
          </div>
        </motion.div>
      </motion.div>
      
      <motion.div
        className="hero__scroll"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2, duration: 0.8 }}
      >
        <span>Scroll to explore</span>
        <motion.div animate={{ y: [0, 8, 0] }} transition={{ repeat: Infinity, duration: 1.5 }}>
          <ArrowDown size={18} />
        </motion.div>
      </motion.div>
    </section>
  );
}

/* ═══ TRUST BAR ═══ */
function TrustBar() {
  const stats = [
    { icon: <Users size={22} />, number: '15K+', label: 'Happy Families' },
    { icon: <Award size={22} />, number: '200+', label: 'Curated Pieces' },
    { icon: <Shield size={22} />, number: '5 Year', label: 'Warranty' },
    { icon: <Truck size={22} />, number: 'Free', label: 'White-Glove Delivery' },
    { icon: <Sparkles size={22} />, number: '4.9★', label: 'Average Rating' },
  ];

  return (
    <section className="trust-bar">
      <div className="container">
        <div className="trust-bar__grid">
          {stats.map((stat, i) => (
            <motion.div
              key={i}
              className="trust-bar__item"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.4 }}
            >
              <div className="trust-bar__icon">{stat.icon}</div>
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

/* ═══ CATEGORIES ═══ */
function CategoriesSection() {
  return (
    <section className="categories section-padding">
      <div className="container">
        <div className="section-header">
          <span className="section-subtitle">Curated Collections</span>
          <AnimatedText 
            el="h2"
            text="Shop by Room"
            className="section-title"
          />
        </div>
        <div className="categories__grid">
          {CATEGORIES.slice(0, 4).map((cat, i) => (
            <motion.div
              key={cat.id}
              className={`category-card ${i === 0 ? 'category-card--featured' : ''}`}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
            >
              <Link to={`/shop?cat=${cat.id}`}>
                <img src={cat.image} alt={cat.name} loading="lazy" />
                <div className="category-card__overlay">
                  <h3>{cat.name}</h3>
                  <span>{cat.count} pieces</span>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ═══ FEATURED PRODUCTS ═══ */
function FeaturedProducts() {
  const { products, loading } = useProducts();
  const featured = products.filter(p => [1, 2, 3, 4, 5, 6, 7, 8].includes(p.id));

  if (loading) return null;

  return (
    <section className="featured section-padding" style={{ background: 'var(--soft-cream)' }}>
      <div className="container">
        <div className="section-header" style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', textAlign: 'left' }}>
          <div>
            <span className="section-subtitle">Highest Priority</span>
            <AnimatedText 
              el="h2"
              text="Canadian Made Collection"
              className="section-title"
              style={{ marginBottom: 0 }}
            />
          </div>
          <Link to="/shop" className="btn btn-ghost">
            View All <ArrowRight size={16} />
          </Link>
        </div>
        <div className="featured__grid">
          {featured.map((product, i) => (
            <ProductCard key={product.id} product={product} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

/* ═══ LIFESTYLE VIDEO ═══ */
function LifestyleVideo() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section className="lifestyle section-padding" ref={ref}>
      <div className="container">
        <motion.div
          className="lifestyle__content"
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
        >
          <div className="lifestyle__text">
            <span className="section-subtitle">The Cozhaven Difference</span>
            <AnimatedText 
              el="h2"
              text={["Furniture That","Tells Your Story"]}
            />
            <p>Every Cozhaven piece is designed to become part of your life — not just fill a room. From the first sketch to the final stitch, we obsess over the details so you can simply enjoy the comfort.</p>
            <div className="lifestyle__features">
              <div className="lifestyle__feature">
                <div className="lifestyle__feature-dot" />
                <span>Sustainably sourced Canadian hardwoods</span>
              </div>
              <div className="lifestyle__feature">
                <div className="lifestyle__feature-dot" />
                <span>Hand-finished by master craftspeople</span>
              </div>
              <div className="lifestyle__feature">
                <div className="lifestyle__feature-dot" />
                <span>CertiPUR-US® certified foams</span>
              </div>
              <div className="lifestyle__feature">
                <div className="lifestyle__feature-dot" />
                <span>Eco-friendly, non-toxic finishes</span>
              </div>
            </div>
            <Link to="/about" className="btn btn-primary" style={{ marginTop: 'var(--space-4)' }}>Learn Our Process <ArrowRight size={16} /></Link>
          </div>
          <div className="lifestyle__visual">
            <div className="lifestyle__video-wrapper">
              <img src="https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=900&q=80" alt="Cozhaven craftsmanship" loading="lazy" />
              <div className="lifestyle__play-btn">
                <Play size={28} fill="white" />
              </div>
              <div className="lifestyle__glow" />
            </div>
            <div className="lifestyle__float-card">
              <div className="lifestyle__float-card-icon"><Heart size={16} /></div>
              <div>
                <strong>15,000+ families</strong>
                <span>trust Cozhaven for their homes</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

/* ═══ REVIEWS — COMPLETELY REDESIGNED ═══ */
function ReviewsSection() {
  const [active, setActive] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  useEffect(() => {
    const timer = setInterval(() => {
      setActive(prev => (prev + 1) % REVIEWS.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const review = REVIEWS[active];

  return (
    <section className="reviews-v2 section-padding" ref={ref}>
      <div className="container">
        <div className="reviews-v2__layout">
          {/* Left: Large featured review */}
          <motion.div
            className="reviews-v2__featured"
            initial={{ opacity: 0, x: -40 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6 }}
          >
            <div className="reviews-v2__header">
              <span className="section-subtitle">Customer Love</span>
              <AnimatedText 
                el="h2"
                text={["Real Stories,","Real Comfort"]}
                className="section-title"
                style={{ textAlign: 'left' }}
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
                <p className="reviews-v2__text">{review.text}</p>
                <div className="reviews-v2__author">
                  <div className="reviews-v2__avatar">{review.avatar}</div>
                  <div>
                    <h4>{review.name}</h4>
                    <span>{review.product || 'Verified Buyer'}</span>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Dots */}
            <div className="reviews-v2__dots">
              {REVIEWS.map((_, i) => (
                <button
                  key={i}
                  className={`reviews-v2__dot ${active === i ? 'active' : ''}`}
                  onClick={() => setActive(i)}
                  aria-label={`Review ${i + 1}`}
                />
              ))}
            </div>
          </motion.div>

          {/* Right: Stacked mini reviews */}
          <motion.div
            className="reviews-v2__stack"
            initial={{ opacity: 0, x: 40 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {REVIEWS.slice(0, 4).map((r, i) => (
              <motion.div
                key={r.id}
                className={`reviews-v2__mini ${active === i ? 'reviews-v2__mini--active' : ''}`}
                onClick={() => setActive(i)}
                whileHover={{ x: 4 }}
                transition={{ duration: 0.2 }}
              >
                <div className="reviews-v2__mini-avatar">{r.avatar}</div>
                <div className="reviews-v2__mini-content">
                  <div className="reviews-v2__mini-stars">
                    {Array.from({ length: 5 }).map((_, j) => (
                      <Star key={j} size={10} fill={j < r.rating ? 'currentColor' : 'none'} className={j < r.rating ? 'star' : 'star-empty'} />
                    ))}
                  </div>
                  <p>"{r.text.substring(0, 80)}..."</p>
                  <span>{r.name}</span>
                </div>
              </motion.div>
            ))}
            <div className="reviews-v2__cta">
              <Link to="/contact" className="btn btn-ghost">Read All Reviews <ArrowRight size={14} /></Link>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

/* ═══ STORE OPENING ═══ */
function StoreOpening() {
  return (
    <section className="store-opening section-padding">
      <div className="container">
        <motion.div
          className="store-opening__card"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="store-opening__glow" />
          <span className="section-subtitle">Exciting News</span>
          <AnimatedText el="h2" text="Flagship Store Opening" />
          <p className="store-opening__date">Visit Our Showroom</p>
          <div className="store-opening__info">
            <div><MapPin size={18} /> <span>6435 Dixie Rd, Unit 4, Mississauga, ON L5T 1X4</span></div>
            <div><Clock size={18} /> <span>Mon-Fri 12pm-8pm | Sat-Sun 12pm-9pm</span></div>
          </div>
          <Link to="/contact" className="btn btn-primary">Get Directions</Link>
        </motion.div>
      </div>
    </section>
  );
}

/* ═══ INSTAGRAM FEED ═══ */
function InstagramFeed() {
  const images = [
    'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?w=400&q=80',
    'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=400&q=80',
    'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=400&q=80',
    'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=400&q=80',
    'https://images.unsplash.com/photo-1567016432779-094069958ea5?w=400&q=80',
    'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&q=80',
  ];

  return (
    <section className="instagram">
      <div className="container" style={{ textAlign: 'center', marginBottom: 'var(--space-4)' }}>
        <span className="section-subtitle">@cozhaven</span>
        <AnimatedText el="h2" text="Follow Our Journey" className="section-title" />
      </div>
      <div className="instagram__grid">
        {images.map((img, i) => (
          <motion.a
            key={i}
            href="https://instagram.com"
            target="_blank"
            rel="noopener noreferrer"
            className="instagram__item"
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.05, duration: 0.4 }}
          >
            <img src={img} alt={`Cozhaven Instagram ${i + 1}`} loading="lazy" />
            <div className="instagram__overlay">
              <Heart size={24} />
            </div>
          </motion.a>
        ))}
      </div>
    </section>
  );
}

/* ═══ JOURNAL PREVIEW ═══ */
function JournalPreview() {
  return (
    <section className="journal-preview section-padding" style={{ background: 'var(--soft-cream)' }}>
      <div className="container">
        <div className="section-header" style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', textAlign: 'left' }}>
          <div>
            <span className="section-subtitle">The Journal</span>
            <AnimatedText 
              el="h2"
              text="Design Inspiration"
              className="section-title"
              style={{ marginBottom: 0 }}
            />
          </div>
          <Link to="/blog" className="btn btn-ghost">Read All <ArrowRight size={16} /></Link>
        </div>
        <div className="journal-preview__grid">
          {BLOG_POSTS.slice(0, 3).map((post, i) => (
            <motion.article
              key={post.id}
              className="journal-card"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
            >
              <div className="journal-card__image">
                <img src={post.image} alt={post.title} loading="lazy" />
                <span className="journal-card__cat">{post.category}</span>
              </div>
              <div className="journal-card__body">
                <span className="journal-card__meta">{post.date} · {post.readTime}</span>
                <h3>{post.title}</h3>
                <p>{post.excerpt}</p>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
