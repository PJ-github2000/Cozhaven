import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import './Home.css';

// Feature-specific components
import HeroSection from '../components/home/HeroSection';
import TrustBar from '../components/home/TrustBar';
import CollectionSlider from '../components/home/CollectionSlider';
import CategoriesSection from '../components/home/CategoriesSection';
import PromoCards from '../components/home/PromoCards';
import DesignerShowcase from '../components/home/DesignerShowcase';
import ImportedCollection from '../components/home/ImportedCollection';
import LocalCollection from '../components/home/LocalCollection';
import LifestyleVideo from '../components/home/LifestyleVideo';
import ReviewsSection from '../components/home/ReviewsSection';
import StoreOpening from '../components/home/StoreOpening';
import TradeProgramPromo from '../components/home/TradeProgramPromo';
import InstagramFeed from '../components/home/InstagramFeed';
import JournalPreview from '../components/home/JournalPreview';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

export default function Home() {
  const [cmsData, setCmsData] = useState({
    hero: null,
    stats: [],
    promo: [],
    categories: [],
    lifestyle: null
  });
  const [cmsLoading, setCmsLoading] = useState(true);

  useEffect(() => {
    const slugs = ['homepage-hero', 'homepage-stats', 'homepage-promo', 'homepage-categories', 'homepage-lifestyle'];
    
    Promise.all(slugs.map(slug => 
      fetch(`${API_URL}/cms/blocks/${slug}`).then(res => res.json())
    ))
    .then(results => {
      const data = {};
      results.forEach(res => {
        if (res && res.slug) {
          const key = res.slug.replace('homepage-', '');
          data[key] = res.content_json ? JSON.parse(res.content_json) : null;
        }
      });
      setCmsData(prev => ({ ...prev, ...data }));
    })
    .catch(err => {
      console.error("CMS Batch Fetch failed:", err);
    })
    .finally(() => setCmsLoading(false));
  }, []);

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
    "logo": "https://cozhaven.com/assets/logo-cozhaven.png",
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
    <main id="main-content" className="home-page">
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
      <HeroSection heroData={cmsData.hero} />
      <TrustBar statsData={cmsData.stats} />
      <CollectionSlider />
      <CategoriesSection categoriesData={cmsData.categories} />
      <PromoCards promoData={cmsData.promo} />
      <DesignerShowcase />
      <ImportedCollection />
      <LocalCollection />
      <LifestyleVideo lifestyleData={cmsData.lifestyle} />
      <ReviewsSection />
      <StoreOpening />
      <TradeProgramPromo />
      <InstagramFeed />
      <JournalPreview />
    </main>
  );
}
