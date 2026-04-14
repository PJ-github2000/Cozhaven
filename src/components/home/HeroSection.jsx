import { useRef, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, Truck, Heart } from 'lucide-react';
import Magnetic from '../Magnetic';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const jsonSafeParse = (str) => {
  try {
    return JSON.parse(str);
  } catch (e) {
    console.error("JSON Parse Error:", e, str);
    return null;
  }
};

export default function HeroSection({ heroData }) {
  const videoRef = useRef(null);
  const [hero, setHero] = useState(null);

  useEffect(() => {
    fetch(`${API_URL}/cms/blocks/homepage-hero`)
      .then(res => res.json())
      .then(data => {
        if (data.content_json) {
          setHero(jsonSafeParse(data.content_json));
        }
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.defaultMuted = true;
      videoRef.current.muted = true;
      videoRef.current.play().catch(error => {
        console.error("Hero video autoplay failed:", error);
      });
    }
  }, [heroData?.videoUrl]);

  const defaultHero = {
    badge: "Made in Canada | Premium Comfort",
    title: "Find The Right Sofa,\nWithout The Guesswork",
    description: "Shop curated best sellers, compare real materials, and bring home designer-level comfort with trusted delivery and warranty support.",
    videoUrl: "https://storage.googleapis.com/cozhaven/assets/hero_background.mp4",
    posterUrl: "/assets/Others Image 5.jpg",
    actions: [
      { label: "Shop Best Sellers", link: "/shop?sort=best-selling", primary: true },
      { label: "Book Showroom Visit", link: "/contact", primary: false }
    ],
    trustItems: [
      { icon: "Shield", label: "5-Year Warranty" },
      { icon: "Truck", label: "White-Glove Delivery" },
      { icon: "Heart", label: "4.9/5 Rated by Buyers" }
    ]
  };

  const data = heroData || hero || defaultHero;

  return (
    <section className="hero-carousel">
      <div className="hero-carousel__bg">
        <video
          key={data.videoUrl}
          ref={videoRef}
          autoPlay
          muted
          loop
          playsInline
          className="hero-carousel__video"
          poster={data.posterUrl || "/assets/Others Image 5.jpg"}
          src={data.videoUrl || "https://atunusfurniture.com/wp-content/uploads/2025/08/121_Sectional_Sofas_Set_Video.mp4"}
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
            <span className="hero-carousel__badge">{data.badge}</span>
            <h1 className="hero-carousel__title">
              {data.title.split('\n').map((line, i) => (
                <span key={i}>{line}<br /></span>
              ))}
            </h1>
            <p className="hero-carousel__desc">
              {data.description}
            </p>

            <div className="hero-carousel__actions">
              {(data.actions || []).map((action, i) => (
                <Magnetic key={i}>
                  <Link to={action.link} className={`btn btn-large ${action.primary ? 'btn-primary' : 'btn-secondary'}`}>
                    {action.label}
                  </Link>
                </Magnetic>
              ))}
            </div>
          </motion.div>
        </div>

        <div className="hero-carousel__bottom">
          <div className="hero-carousel__scroll-hint">
            <div className="mouse">
              <div className="wheel"></div>
            </div>
            <span>Scroll to explore</span>
          </div>

          <div className="hero-carousel__trust">
            {(data.trustItems || []).map((item, i) => {
              const Icon = item.icon === 'Shield' ? Shield : item.icon === 'Truck' ? Truck : Heart;
              return (
                <div key={i} className="hero-carousel__trust-item">
                  <Icon size={14} />
                  <span>{item.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
