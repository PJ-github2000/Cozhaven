import { useRef, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion, useScroll, useTransform, useInView, AnimatePresence } from 'framer-motion';
import { ArrowRight, ArrowDown, Star, ChevronLeft, ChevronRight, MapPin, Clock, Truck, Shield, Heart, Sparkles, Award, Users, Play, Pause, Quote, Briefcase, CheckCircle2 } from 'lucide-react';
import { CATEGORIES } from '../data/products';
import { useProductsQuery } from '../context/ProductsContext';
import ProductCard from '../components/ProductCard';
import ProductSkeleton from '../components/ProductSkeleton';
import AnimatedText from '../components/AnimatedText';
import FeaturedCollections from '../components/FeaturedCollections';
import Magnetic from '../components/Magnetic';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation as SwiperNavigation, Pagination as SwiperPagination, Autoplay as SwiperAutoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import './Home.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

export default function Home() {
  const showroomJsonLd = {
    "@context": "https://schema.org",
    "@type": "FurnitureStore",
    "name": "Cozhaven Mississauga Showroom",
    "image": "https://cozhaven.com/assets/showroom-bg.png",
    "@id": "https://cozhaven.com/#showroom",
    "url": "https://cozhaven.com",
    "telephone": "1-800-COZHAVEN",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "6435 Dixie Rd, Unit 4",
      "addressLocality": "Mississauga",
      "addressRegion": "ON",
      "postalCode": "L5T 1X4",
      "addressCountry": "CA"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": 43.652,
      "longitude": -79.678
    },
    "openingHoursSpecification": [
      {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        "opens": "12:00",
        "closes": "20:00"
      },
      {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": ["Saturday", "Sunday"],
        "opens": "12:00",
        "closes": "21:00"
      }
    ]
  };

  const organizationJsonLd = {
    "@context": "https://schema.org",
    "@type": "FurnitureStore",
    "name": "Cozhaven",
    "url": "https://cozhaven.com",
    "logo": "https://cozhaven.com/assets/logo-full.png",
    "sameAs": [
      "https://www.facebook.com/cozhaven",
      "https://www.instagram.com/cozhaven",
      "https://pinterest.com/cozhaven"
    ],
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": "1-800-COZHAVEN",
      "contactType": "customer service",
      "areaServed": "CA",
      "availableLanguage": "English"
    }
  };

  const websiteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "url": "https://cozhaven.com",
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": "https://cozhaven.com/shop?q={search_term_string}"
      },
      "query-input": "required name=search_term_string"
    }
  };

  return (
    <main id="main-content">
      <Helmet>
        <title>Cozhaven | Premium Canadian-Made Modern Furniture</title>
        <meta name="description" content="Discover Cozhaven's collection of handcrafted, sustainable Canadian furniture. Premium sofas, bedroom sets, and dining collections designed for modern living." />
        <link rel="canonical" href="https://cozhaven.com" />
        <script type="application/ld+json">
          {JSON.stringify(showroomJsonLd)}
        </script>
        <script type="application/ld+json">
          {JSON.stringify(organizationJsonLd)}
        </script>
        <script type="application/ld+json">
          {JSON.stringify(websiteJsonLd)}
        </script>
      </Helmet>
      <HeroSection />
      <TrustBar />
      <CollectionSlider />
      <CategoriesSection />
      <PromoCards />
      <DesignerShowcase />
      <ImportedCollection />
      <LocalCollection />
      <LifestyleVideo />
      <ReviewsSection />
      <StoreOpening />
      <TradeProgramPromo />
      <InstagramFeed />
      <JournalPreview />
    </main>
  );
}

/* ═══ HERO SECTION ═══ */
function HeroSection() {
  const videoRef = useRef(null);

  useEffect(() => {
    if (videoRef.current) {
      // Force muted and call play explicitly for better browser compatibility
      videoRef.current.defaultMuted = true;
      videoRef.current.muted = true;
      videoRef.current.play().catch(error => {
        console.error("Hero video autoplay failed:", error);
      });
    }
  }, []);

  return (
    <section className="hero-carousel">
      <div className="hero-carousel__bg">
        <video
          ref={videoRef}
          autoPlay
          muted
          loop
          playsInline
          className="hero-carousel__video"
          poster="/assets/Others Image 5.jpg"
          src="https://atunusfurniture.com/wp-content/uploads/2025/08/121_Sectional_Sofas_Set_Video.mp4"
        />
        <div className="hero-carousel__gradient" />
      </div>

      <div className="hero-carousel__beams">
        <div className="hero-carousel__beam hero-carousel__beam--1" />
        <div className="hero-carousel__beam hero-carousel__beam--2" />
        <div className="hero-carousel__beam hero-carousel__beam--3" />
      </div>

      <div className="hero-carousel__content container">
        <div className="hero-carousel__main">
          <motion.div
            className="hero-carousel__text-wrapper"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <span className="hero-carousel__badge">Handcrafted in Canada</span>
            <h1 className="hero-carousel__title">
              Elevate Your Space,<br />
              Elevate Your Life
            </h1>
            <p className="hero-carousel__desc">
              Discover premium furniture that blends Canadian craftsmanship with contemporary design. 
              Every piece tells a story of quality, comfort, and conscious creation.
            </p>

            <div className="hero-carousel__actions" style={{ justifyContent: 'flex-start' }}>
              <Magnetic>
                <Link to="/shop" className="btn btn-primary btn-large">
                  Shop Collection
                </Link>
              </Magnetic>
              <Magnetic>
                <Link to="/about" className="btn btn-secondary btn-large">
                  Our Story
                </Link>
              </Magnetic>
            </div>
          </motion.div>
        </div>

        <div className="hero-carousel__bottom">
          <div className="hero-carousel__trust">
            <div className="hero-carousel__trust-item">
              <Shield size={16} />
              <span>5-Year Warranty</span>
            </div>
            <div className="hero-carousel__trust-item">
              <Truck size={16} />
              <span>Free Shipping</span>
            </div>
            <div className="hero-carousel__trust-item">
              <Heart size={16} />
              <span>10K+ Families</span>
            </div>
          </div>
        </div>
      </div>
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

/* ═══ PROMO CARDS ═══ */
function PromoCards() {
  const cards = [
    { title: "Best Sellers", image: "/assets/Best seller.webp", link: "/shop?sort=best-selling" },
    { title: "New Arrivals", image: "/assets/Others Image 1.jpg", link: "/shop?sort=new-arrivals" },
    { title: "Bundle & Save", image: "/assets/Others Image 2.jpg", link: "/shop?bundle=true" }
  ];

  /* Let's fallback to existing images if cozey links break, but these match perfectly to the screenshot. 
     Using some placeholder aesthetic images to match. */
  const backupCards = [
    { title: "Best Sellers", image: "/assets/Best seller.webp", link: "/shop?sort=best-selling" },
    { title: "New Arrivals", image: "/assets/Others Image 6.png", link: "/shop?sort=new-arrivals" },
    { title: "Bundle & Save", image: "/assets/Others Image 7.jpg", link: "/shop?bundle=true" }
  ];

  return (
    <section className="promo-cards" style={{ background: 'var(--soft-cream)', paddingBottom: 'var(--space-8)' }}>
      <div className="container">
        <div className="promo-cards__grid">
          {backupCards.map((card, i) => (
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

/* ═══ CATEGORIES ═══ */
function CategoriesSection() {
  const cozeyCategories = [
    { id: "modular", name: "Modular", image: "/assets/Image 3 category modular.jpg" },
    { id: "sectionals", name: "Sectional Sofas", image: "/assets/Image 4 sectional.jpg" },
    { id: "chairs", name: "Accent Chairs", image: "/assets/Image 8 Accent chair.png" },
    { id: "dining", name: "Dining", image: "/assets/Image 6 dining.webp" },
    { id: "bedroom", name: "Bedroom", image: "/assets/Image 5 Bed category.webp" },
    { id: "coffee-tables", name: "Coffee Tables", image: "/assets/Image 7 coffee table.jpg" },
    { id: "living", name: "Living Room", image: "/assets/Living room Image 9.jpg" },
    { id: "vanity", name: "Vanity Dressers", image: "/assets/Others Image 3.jpg" },
  ];

  return (
    <section className="categories section-padding" style={{ background: 'var(--warm-white)' }}>
      <div className="container">
        <div className="categories__grid">
          {cozeyCategories.map((cat, i) => (
            <motion.div
              key={cat.id}
              className={`category-card ${cat.hasBg ? 'category-card--bg' : ''}`}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05, duration: 0.5 }}
            >
              <Link to={`/shop?cat=${cat.id}`}>
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

/* ═══ COLLECTION SLIDER ═══ */
function CollectionSlider() {
  const swiperRef = useRef(null);

  const canadianMadeProducts = [
    {
      id: "hamilton",
      name: "Hamilton Series Sectional",
      price: 4200,
      image: "/assets/hamilton-refined.png",
      isCanadianMade: true,
      rating: 4.9,
      reviews: 128,
      description: "Our signature Canadian-made modular sectional, blending timeless comfort with modern aesthetics."
    },
    {
      id: "paris",
      name: "Paris Series Sofa",
      price: 2800,
      image: "/assets/Canadian made sofa type 2.jpeg",
      isCanadianMade: true,
      rating: 4.8,
      reviews: 86,
      description: "Elegant and sophisticated, the Paris series brings refined Parisian style to your living space."
    },
    {
      id: "eglington",
      name: "Eglington Series Sectional",
      price: 3500,
      image: "/assets/Canadian made type 3 sectional.jpeg",
      isCanadianMade: true,
      rating: 4.9,
      reviews: 94,
      description: "A versatile, clean-lined sectional designed for modern urban living and ultimate comfort."
    },
    {
      id: "alberta",
      name: "Alberta Series (Bellini Type)",
      price: 4800,
      image: "/assets/alberta-refined.png",
      isCanadianMade: true,
      rating: 5.0,
      reviews: 42,
      description: "Inspired by iconic Italian design, handcrafted in Canada with premium pebbled boucle fabric."
    },
    {
      id: "ottawa",
      name: "Ottawa Series Minimalist",
      price: 2500,
      image: "/assets/ottawa-refined.png",
      isCanadianMade: true,
      rating: 4.8,
      reviews: 112,
      description: "Understated elegance with a slim profile and beautiful light oak accents."
    },
  ];

  return (
    <section className="collection-slider">
      <div className="collection-slider__container">
        <div className="section-header section-header--split" style={{ marginBottom: 'var(--space-6)', alignItems: 'center' }}>
          <h2
            style={{ 
              fontFamily: 'var(--font-display)', 
              fontSize: 'clamp(2.5rem, 4vw, 3.5rem)', 
              fontWeight: 800, 
              letterSpacing: '-0.02em', 
              color: 'var(--deep-charcoal)',
              margin: 0
            }}
          >
            Canadian Made Series
          </h2>
          <Link 
            to="/shop?cat=canadian" 
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '6px', 
              fontFamily: 'var(--font-accent)',
              fontSize: '0.8rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              color: 'var(--deep-charcoal)',
              textDecoration: 'none'
            }}
          >
            View All <ArrowRight size={16} />
          </Link>
        </div>

        <div className="collection-slider__wrapper">
          <Swiper
            ref={swiperRef}
            modules={[SwiperNavigation, SwiperPagination, SwiperAutoplay]}
            spaceBetween={20}
            slidesPerView={1.15}
            grabCursor={true}
            loop={true}
            autoplay={{ delay: 4500, disableOnInteraction: true, pauseOnMouseEnter: true }}
            pagination={{ clickable: true, el: '.collection-slider__pagination' }}
            navigation={{
              prevEl: '.collection-slider__arrow--left',
              nextEl: '.collection-slider__arrow--right',
            }}
            breakpoints={{
              480: { slidesPerView: 1.5, spaceBetween: 16 },
              768: { slidesPerView: 2.5, spaceBetween: 20 },
              1024: { slidesPerView: 3.5, spaceBetween: 24 },
              1280: { slidesPerView: 4, spaceBetween: 24 },
            }}
          >
            {canadianMadeProducts.map((p, i) => (
              <SwiperSlide key={p.id}>
                <ProductCard product={p} index={i} />
              </SwiperSlide>
            ))}
          </Swiper>

          <button className="collection-slider__arrow collection-slider__arrow--left" aria-label="Previous">
            <ChevronLeft size={24} />
          </button>
          <button className="collection-slider__arrow collection-slider__arrow--right" aria-label="Next">
            <ChevronRight size={24} />
          </button>
          <div className="collection-slider__pagination"></div>
        </div>
      </div>
    </section>
  );
}

/* ═══ FEATURED PRODUCTS ═══ */
function FeaturedProducts() {
  const { data, isLoading: loading } = useProductsQuery({ limit: 4, sort: 'newest' });
  const featured = data?.items || [];

  // Loading state is handled in the grid

  return (
    <section className="featured section-padding" style={{ background: 'var(--soft-cream)' }}>
      <div className="container">
        <div className="section-header section-header--split">
          <div>
            <span className="section-subtitle">Curated Selection</span>
            <AnimatedText
              el="h2"
              text="Latest Collections"
              className="section-title"
              style={{ marginBottom: 0 }}
            />
          </div>
          <Link to="/shop" className="btn btn-ghost">
            View All <ArrowRight size={16} />
          </Link>
        </div>
        <div className="featured__grid">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <ProductSkeleton key={i} index={i} />
            ))
          ) : (
            featured.map((product, i) => (
              <ProductCard key={product.id} product={product} index={i} />
            ))
          )}
        </div>
      </div>
    </section>
  );
}

import importedData from '../../imported_collection.json';
import localData from '../../local_collection.json';

/* ═══ DESIGNER SHOWCASE ═══ */
function DesignerShowcase() {
  const { data, isLoading } = useProductsQuery({ badge: 'designer', limit: 4 });
  const featured = data?.items || [];

  return (
    <section className="designer-showcase section-padding" style={{ background: 'var(--deep-charcoal)', color: 'white', paddingBottom: 'var(--space-20)' }}>
      <div className="container">
        <div className="section-header section-header--split">
          <div>
            <span className="section-subtitle" style={{ color: 'var(--rich-bronze-light)' }}>International Style</span>
            <h2 className="section-title" style={{ color: 'white', marginBottom: 0 }}>Designer Series</h2>
            <p style={{ marginTop: 15, opacity: 0.8, maxWidth: 450 }}>Discover premium, modular furniture inspired by global architectural designs and luxury comfort.</p>
          </div>
          <Link to="/designer-series" className="btn btn-ghost" style={{ color: 'white', borderColor: 'rgba(255,255,255,0.2)' }}>
            View Full Series <ArrowRight size={16} />
          </Link>
        </div>

        <div className="featured__grid">
          {featured.map((product, i) => (
            <motion.div
              key={product.id || i}
              className="product-card"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <Link to="/designer-series">
                <div className="product-card__image">
                  <img src={product.image} alt={product.product_name} loading="lazy" />
                  <div className="product-card__badge">Designer</div>
                </div>
                <div className="product-card__content">
                  <h3 className="product-card__title" style={{ color: 'white' }}>{product.product_name}</h3>
                  <div className="product-card__price-wrapper">
                    <p className="product-card__price" style={{ color: 'var(--rich-bronze-light)' }}>
                      {product.price && product.price !== "0" ? `CAD $${Number(product.price).toLocaleString()}` : 'Inquire for Price'}
                    </p>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
      <div className="designer-showcase__glow" style={{ position: 'absolute', bottom: 0, right: 0, width: '40%', height: '40%', background: 'radial-gradient(circle, rgba(201, 184, 168, 0.05) 0%, transparent 70%)', pointerEvents: 'none' }} />
    </section>
  );
}

/* ═══ IMPORTED COLLECTION ═══ */
function ImportedCollection() {
  const imported = importedData
    .filter(p => Number(p.sale_price) > 0)
    .slice(0, 4);

  const getDisplayName = (product) => {
    // If name looks like a SKU (e.g. "AF-SF009"), build a friendly name
    if (/^[A-Z]{2}-[A-Z]{2,}\d+/.test(product.name)) {
      const cat = product.category || 'Furniture';
      const color = product.color ? product.color.split(' ')[0] : '';
      return `${color ? color.charAt(0).toUpperCase() + color.slice(1) + ' ' : ''}${cat.replace('Sofas & Sectionals', 'Modular Sofa')}`;
    }
    return product.name;
  };

  return (
    <section className="featured section-padding" style={{ background: 'var(--soft-cream)', borderTop: '1px solid rgba(201, 184, 168, 0.1)' }}>
      <div className="container">
        <div className="section-header section-header--split">
          <div>
            <span className="section-subtitle">Global Designs</span>
            <AnimatedText
              el="h2"
              text="Imported Collection"
              className="section-title"
              style={{ marginBottom: 0 }}
            />
          </div>
          <Link to="/imported-collection" className="btn btn-ghost">
            View All <ArrowRight size={16} />
          </Link>
        </div>
        <div className="featured__grid">
          {imported.map((product, i) => (
            <div key={i} className="product-card">
              <Link to="/imported-collection">
                <div className="product-card__image">
                  <img src={product.image} alt={getDisplayName(product)} loading="lazy" />
                  <div className="product-card__badge">Imported</div>
                </div>
                <div className="product-card__content">
                  <h3 className="product-card__title">{getDisplayName(product)}</h3>
                  <p className="product-card__price">CAD ${Number(product.sale_price).toLocaleString()}</p>
                </div>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ═══ LOCAL COLLECTION ═══ */
function LocalCollection() {
  const localItems = localData.slice(0, 4);

  return (
    <section className="featured section-padding" style={{ background: 'var(--soft-cream)', borderTop: '1px solid rgba(201, 184, 168, 0.2)' }}>
      <div className="container">
        <div className="section-header section-header--split">
          <div>
            <span className="section-subtitle">Local Value</span>
            <AnimatedText
              el="h2"
              text="Local Warehouse Deals"
              className="section-title"
              style={{ marginBottom: 0 }}
            />
          </div>
          <Link to="/local-collection" className="btn btn-ghost">
            View All <ArrowRight size={16} />
          </Link>
        </div>
        <div className="featured__grid">
          {localItems.map((product, i) => (
            <div key={i} className="product-card">
              <Link to="/local-collection">
                <div className="product-card__image">
                  <img src={product.image} alt={product.name} loading="lazy" />
                  <div className="product-card__badge" style={{ background: 'var(--rich-bronze)' }}>Warehouse</div>
                </div>
                <div className="product-card__content">
                  <h3 className="product-card__title">{product.name}</h3>
                  <div className="product-card__price-wrapper">
                    <p className="product-card__price">CAD ${Number(product.sale_price).toLocaleString()}</p>
                    <span className="value-label">Direct Value</span>
                  </div>
                </div>
              </Link>
            </div>
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
              text={["Furniture That", "Tells Your Story"]}
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
              <img src="/assets/Others Image 4.jpg" alt="Cozhaven craftsmanship" loading="lazy" />
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
  const [reviews, setReviews] = useState([]);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  useEffect(() => {
    fetch(`${API_URL}/cms/blocks/homepage-reviews`)
      .then(res => res.json())
      .then(data => {
        if (data.content_json) {
          setReviews(JSON.parse(data.content_json));
        }
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (reviews.length === 0) return;
    const timer = setInterval(() => {
      setActive(prev => (prev + 1) % reviews.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [reviews]);

  if (reviews.length === 0) return null;

  const review = reviews[active];

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
                text={["Real Stories,", "Real Comfort"]}
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
            {reviews.slice(0, 4).map((r, i) => (
              <motion.div
                key={i}
                className={`reviews-v2__mini ${active === i ? 'reviews-v2__mini--active' : ''}`}
                onClick={() => setActive(i)}
                whileHover={{ x: 4 }}
                transition={{ duration: 0.2 }}
              >
                <div className="reviews-v2__mini-avatar">{r.avatar || r.name.substring(0,2).toUpperCase()}</div>
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
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <div className="store-opening__image">
            <img src="/assets/Others image 8.jpg" alt="Cozhaven Mississauga Showroom" />
            <div className="store-opening__overlay" />
          </div>
          <div className="store-opening__content">
            <span className="section-subtitle">Flagship Location</span>
            <AnimatedText el="h2" text="Visit Our Mississauga Showroom" />
            <p className="store-opening__tagline">Experience comfort in person.</p>
            <div className="store-opening__info">
              <div className="store-opening__info-item">
                <MapPin size={18} />
                <span>6435 Dixie Rd, Unit 4, Mississauga, ON L5T 1X4</span>
              </div>
              <div className="store-opening__info-item">
                <Clock size={18} />
                <span>Mon-Fri 12pm-8pm | Sat-Sun 12pm-9pm</span>
              </div>
            </div>
            <div className="store-opening__actions">
              <Link to="/contact" className="btn btn-primary">Get Directions</Link>
              <a href="tel:1-800-COZHAVEN" className="btn btn-secondary">Call Concierge</a>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

/* ═══ TRADE PROGRAM PROMO ═══ */
function TradeProgramPromo() {
  return (
    <section className="trade-promo section-padding" style={{ background: 'var(--deep-charcoal)', color: 'white' }}>
      <div className="container">
        <div className="trade-promo__grid" style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: 'var(--space-8)', alignItems: 'center' }}>
          
          <motion.div 
            className="trade-promo__content"
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <span className="section-subtitle" style={{ color: 'var(--rich-bronze)' }}>For Industry Professionals</span>
            <AnimatedText el="h2" text="Cozhaven Trade Program" style={{ color: 'white', marginBottom: 'var(--space-4)' }} />
            <p style={{ fontSize: '1.1rem', lineHeight: 1.6, opacity: 0.9, marginBottom: 'var(--space-6)', maxWidth: 500 }}>
              Ordering for your client or business? Partner with us to unlock exclusive wholesale benefits tailored for interior designers, architects, contractors, and developers.
            </p>
            
            <ul style={{ listStyle: 'none', padding: 0, marginBottom: 'var(--space-6)' }}>
              <li style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12, fontSize: '1.05rem' }}>
                <CheckCircle2 size={18} color="var(--rich-bronze)" /> Up to 30% Preferential Pricing
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12, fontSize: '1.05rem' }}>
                <CheckCircle2 size={18} color="var(--rich-bronze)" /> Dedicated Concierge Support
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12, fontSize: '1.05rem' }}>
                <CheckCircle2 size={18} color="var(--rich-bronze)" /> Tax Exemption Processing
              </li>
            </ul>

            <Link to="/trade-program" className="btn btn-primary" style={{ background: 'white', color: 'var(--deep-charcoal)', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
              Apply Now <Briefcase size={16} />
            </Link>
          </motion.div>

          <motion.div 
            className="trade-promo__visual"
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            style={{ position: 'relative', borderRadius: 'var(--radius-lg)', overflow: 'hidden',aspectRatio: '4/3' }}
          >
            <img src="/assets/Others Image 5.jpg" alt="Trade Program Showcase" style={{ width: '100%', height: '100%', objectFit: 'cover' }} loading="lazy" />
            <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(20, 18, 16, 0.2)' }} />
          </motion.div>

        </div>
      </div>
    </section>
  );
}

/* ═══ INSTAGRAM FEED ═══ */
function InstagramFeed() {
  const images = [
    '/assets/instagram/ig-1.png',
    '/assets/instagram/ig-2.png',
    '/assets/instagram/ig-3.png',
    '/assets/instagram/ig-4.png',
    '/assets/instagram/ig-5.png',
    '/assets/instagram/ig-6.png',
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
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    fetch(`${API_URL}/cms/blog`)
      .then(res => res.json())
      .then(data => setPosts(data))
      .catch(console.error);
  }, []);

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
          {posts.slice(0, 3).map((post, i) => (
            <motion.article
              key={post.id}
              className="journal-card"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
            >
              <div className="journal-card__image">
                <img src={post.featured_image} alt={post.title} loading="lazy" />
                <span className="journal-card__cat">{post.category}</span>
              </div>
              <div className="journal-card__body">
                <span className="journal-card__meta">{new Date(post.published_at).toLocaleDateString()} · {post.read_time}</span>
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
