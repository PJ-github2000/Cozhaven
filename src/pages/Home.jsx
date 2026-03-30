import { useRef, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion, useScroll, useTransform, useInView, AnimatePresence } from 'framer-motion';
import { ArrowRight, ArrowDown, Star, ChevronLeft, ChevronRight, MapPin, Clock, Truck, Shield, Heart, Sparkles, Award, Users, Play, Pause, Quote } from 'lucide-react';
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
      <InstagramFeed />
      <JournalPreview />
    </main>
  );
}

/* ═══ HERO CAROUSEL ═══ */
function HeroSection() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const ref = useRef(null);

  const slides = [
    {
      id: 1,
      image: "https://atunus.com/wp-content/uploads/2025/04/Sky-Cloud-Deluxe-Adjustable-Sectional-Sofa-Comfort-Relaxation-125-Inch-Velvet-Corner-Sectionals-2-Seaters-Atunus-1.webp",
      title: "Elevate Your Space, Elevate Your Life",
      desc: "Discover premium furniture that blends Canadian craftsmanship with contemporary design. Every piece tells a story of quality, comfort, and conscious creation.",
      badge: "Handcrafted in Canada"
    },
    {
      id: 2,
      image: "https://atunus.com/wp-content/uploads/2025/04/Bubble-Sectional-Sofa-Comfort-3D-Knitted-Loveseats-2-3-Seater-Atunus-1.webp",
      title: "Modern Elegance, Timeless Comfort",
      desc: "Experience our new collection designed for the modern home. Sustainable materials meeting unparalleled aesthetics.",
      badge: "New Arrival"
    },
    {
      id: 3,
      image: "https://atunus.com/wp-content/uploads/2025/04/Pixel-Classic-Modular-Sofa-Adaptable-Comfort-Linen-Sofa-Sets-4-Seaters-Atunus-1.webp",
      title: "Designed for Living, Built to Last",
      desc: "Invest in pieces that grow with you. Our solid wood construction ensures durability for generations.",
      badge: "Built to Last"
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % slides.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);

  return (
    <section className="hero-carousel" ref={ref}>
      <AnimatePresence initial={false}>
        <motion.div
          key={currentSlide}
          className="hero-carousel__bg"
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.2, ease: "easeInOut" }}
        >
          <img src={slides[currentSlide].image} alt="Cozhaven luxury furniture" />
          <div className="hero-carousel__gradient" />
        </motion.div>
      </AnimatePresence>

      <div className="hero-carousel__beams">
        <div className="hero-carousel__beam hero-carousel__beam--1" />
        <div className="hero-carousel__beam hero-carousel__beam--2" />
        <div className="hero-carousel__beam hero-carousel__beam--3" />
      </div>

      <div className="hero-carousel__content container">
        <div className="hero-carousel__main">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              className="hero-carousel__text-wrapper"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <h1 className="hero-carousel__title">
                {slides[currentSlide].title.split(', ').map((text, i) => (
                  <span key={i}>{text}{i === 0 ? ',' : ''}<br /></span>
                ))}
              </h1>

              <div className="hero-carousel__actions" style={{ justifyContent: 'flex-start' }}>
                <Magnetic>
                  <Link to="/shop" className="btn btn-primary btn-large">
                    Shop Collection
                  </Link>
                </Magnetic>
              </div>
            </motion.div>
          </AnimatePresence>
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

          <div className="hero-carousel__controls">
            <button className="hero-carousel__nav-btn" onClick={prevSlide} aria-label="Previous slide">
              <ChevronLeft size={24} />
            </button>

            <div className="hero-carousel__indicators">
              {slides.map((_, index) => (
                <button
                  key={index}
                  className={`hero-carousel__dot ${index === currentSlide ? 'active' : ''}`}
                  onClick={() => setCurrentSlide(index)}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>

            <button className="hero-carousel__nav-btn" onClick={nextSlide} aria-label="Next slide">
              <ChevronRight size={24} />
            </button>
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
    { title: "Best Sellers", image: "https://shopcozey.com/cdn/shop/files/Best_Sellers_HP_Tile-Bckg_ENG.png?v=1711656860", link: "/shop?sort=best-selling" },
    { title: "New Arrivals", image: "https://shopcozey.com/cdn/shop/files/New_Arrivals_HP_Tile-Bckg_ENG.png?v=1711656859", link: "/shop?sort=new-arrivals" },
    { title: "Bundle & Save", image: "https://shopcozey.com/cdn/shop/files/Bundle___Save_HP_Tile-Bckg_ENG.png?v=1711656860", link: "/shop?bundle=true" }
  ];

  /* Let's fallback to existing images if cozey links break, but these match perfectly to the screenshot. 
     Using some placeholder aesthetic images to match. */
  const backupCards = [
    { title: "Best Sellers", image: "https://atunus.com/wp-content/uploads/2025/04/Sky-Cloud-Deluxe-Adjustable-Sectional-Sofa-Comfort-Versatility-102-Inch-Velvet-Chaise-Sectionals-3-Seaters-Atunus-10.webp", link: "/shop?sort=best-selling" },
    { title: "New Arrivals", image: "https://atunus.com/wp-content/uploads/2025/04/Pixel-Classic-Modular-Sofa-Love-Seater-Black-Modular-Sofa-With-Armrests-Atunus-1.webp", link: "/shop?sort=new-arrivals" },
    { title: "Bundle & Save", image: "https://atunus.com/wp-content/uploads/2025/04/Sky-Cloud-Deluxe-Adjustable-Sectional-Sofa-Adjustable-Cozy-Velvet-L-Shaped-Sectionals-4-Seaters-Atunus-10.webp", link: "/shop?bundle=true" }
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
    { id: "modular", name: "Modular", image: "https://atunus.com/wp-content/uploads/2025/04/Pixel-Classic-Modular-Sofa-Modular-Comfort-104-Inch-Linen-Chaise-Sectionals-3-Seaters-Atunus-1.webp" },
    { id: "sectionals", name: "Sectional Sofas", image: "https://atunus.com/wp-content/uploads/2025/04/Sky-Cloud-Deluxe-Adjustable-Sectional-Sofa-Adjustable-Comfort-Velvet-L-Shaped-Sectionals-5-Seaters-Atunus-10.webp" },
    { id: "chairs", name: "Accent Chairs", image: "https://atunus.com/wp-content/uploads/2025/04/Caterpillar-Modern-Lazy-Sofa-Compact-Cozy-34-Inch-Teddy-Velvet-Single-Seat-1-Seaters-Atunus-10.webp" },
    { id: "dining", name: "Dining", image: "https://atunus.com/wp-content/uploads/2025/06/71-Inch-Modern-Dining-Table-1-1750239726.webp" },
    { id: "bedroom", name: "Bedroom", image: "https://atunus.com/wp-content/uploads/2025/06/Deluxe-Wooden-Bed-Frame-with-Headboard-1-1750241739.webp" },
    { id: "coffee-tables", name: "Coffee Tables", image: "https://atunus.com/wp-content/uploads/2025/06/Round-Coffee-Table-Outdoor-with-Metal-Frame-1-1750301532.webp" },
    { id: "living", name: "Living Room", image: "https://atunus.com/wp-content/uploads/2025/04/Bubble-Sectional-Sofa-Comfort-3D-Knitted-Loveseats-2-3-Seater-Atunus-1.webp" },
    { id: "vanity", name: "Vanity Dressers", image: "https://atunus.com/wp-content/uploads/2025/06/White-Fluted-Bedside-Table-with-2-Drawers-1-1750242405.webp" },
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
                <h3>{cat.name}</h3>
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

  const stantonProducts = [
    {
      id: "s1",
      name: "Stanton II Arm Chaise (Custom)",
      price: 1700,
      image: "https://atunus.com/wp-content/uploads/2025/04/Sky-Cloud-Deluxe-Adjustable-Sectional-Sofa-Comfort-Adjustable-102-Inch-Velvet-Loveseats-2-Seaters-Atunus-10.webp",
      isCanadianMade: true
    },
    {
      id: "s2",
      name: "Stanton II 2 x 2 Sectional (Custom)",
      price: 4700,
      image: "https://atunus.com/wp-content/uploads/2025/04/Sky-Cloud-Deluxe-Adjustable-Sectional-Sofa-Comfort-Versatility-102-Inch-Velvet-Chaise-Sectionals-3-Seaters-Atunus-10.webp",
      isCanadianMade: true
    },
    {
      id: "s3",
      name: "Stanton II 2 x 3 Sectional (Custom)",
      price: 5070,
      image: "https://atunus.com/wp-content/uploads/2025/04/Sky-Cloud-Deluxe-Adjustable-Sectional-Sofa-Adjustable-Cozy-Velvet-L-Shaped-Sectionals-4-Seaters-Atunus-10.webp",
      isCanadianMade: true
    },
    {
      id: "s4",
      name: "Stanton II XL Sectional (Custom)",
      price: 6240,
      image: "https://atunus.com/wp-content/uploads/2025/04/Sky-Cloud-Deluxe-Adjustable-Sectional-Sofa-Adjustable-Comfort-Velvet-L-Shaped-Sectionals-5-Seaters-Atunus-10.webp",
      isCanadianMade: true
    },
    {
      id: "s5",
      name: "Stanton II Corner Sectional (Custom)",
      price: 5400,
      image: "https://atunus.com/wp-content/uploads/2025/04/Sky-Cloud-Deluxe-Adjustable-Sectional-Sofa-Comfortable-Relaxation-Velvet-Sleepers-4-Seaters-Atunus-10.webp",
      isCanadianMade: true
    },
  ];

  return (
    <section className="collection-slider">
      <div className="collection-slider__container">
        <div className="section-header section-header--split" style={{ marginBottom: 'var(--space-6)' }}>
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
            {stantonProducts.map((p) => (
              <SwiperSlide key={p.id}>
                <div className="collection-slider__item">
                  <div className="collection-slider__image-container">
                    <img src={p.image} alt={p.name} loading="lazy" />
                    {p.isCanadianMade && (
                      <span className="collection-slider__badge">🇨🇦 Canadian Made</span>
                    )}
                  </div>
                  <div className="collection-slider__info">
                    <h3>{p.name}</h3>
                    <p>From ${p.price.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
                  </div>
                </div>
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
              <img src="https://atunus.com/wp-content/uploads/2025/06/Finding-Beauty-in-Simplicity-Wabi-Sabi-Design-for-Reflective-Business-Settings-01-1749607323.webp" alt="Cozhaven craftsmanship" loading="lazy" />
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
            <img src="/assets/showroom-bg.png" alt="Cozhaven Mississauga Showroom" />
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
