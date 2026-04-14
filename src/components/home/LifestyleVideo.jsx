import { useRef, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import { ArrowRight, Play, Heart } from 'lucide-react';
import AnimatedText from '../AnimatedText';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const jsonSafeParse = (str) => {
  try {
    return JSON.parse(str);
  } catch (e) {
    return null;
  }
};

export default function LifestyleVideo({ lifestyleData }) {
  const [lifestyle, setLifestyle] = useState(null);

  useEffect(() => {
    fetch(`${API_URL}/cms/blocks/homepage-lifestyle`)
      .then(res => res.json())
      .then(data => {
        if (data.content_json) {
          setLifestyle(jsonSafeParse(data.content_json));
        }
      })
      .catch(console.error);
  }, []);

  const defaultLifestyle = {
    subtitle: "Why Buyers Choose Cozhaven",
    title: ["Built For Daily", "Comfort And Longevity"],
    description: "Every Cozhaven piece is designed to become part of your life, not just fill a room. From the first sketch to the final stitch, we obsess over the details so you can simply enjoy the comfort.",
    features: [
      "Sustainably sourced Canadian hardwoods",
      "Hand-finished by master craftspeople",
      "CertiPUR-US certified foams",
      "Eco-friendly, non-toxic finishes"
    ],
    buttonText: "See Materials & Craftsmanship",
    buttonLink: "/about",
    image: "/assets/Others Image 4.jpg",
    trustText: "15,000+ families",
    trustSub: "trust Cozhaven for their homes"
  };

  const data = lifestyleData || lifestyle || defaultLifestyle;
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
            <span className="section-subtitle">{data.subtitle}</span>
            <AnimatedText
              el="h2"
              text={data.title}
            />
            <p>{data.description}</p>
            <div className="lifestyle__features">
              {(data.features || []).map((feat, i) => (
                <div key={i} className="lifestyle__feature">
                  <div className="lifestyle__feature-dot" />
                  <span>{feat}</span>
                </div>
              ))}
            </div>
            <Link to={data.buttonLink} className="btn btn-primary lifestyle__cta">{data.buttonText} <ArrowRight size={16} /></Link>
          </div>
          <div className="lifestyle__visual">
            <div className="lifestyle__video-wrapper">
              <img src={data.image} alt="Cozhaven craftsmanship" loading="lazy" />
              <div className="lifestyle__play-btn">
                <Play size={28} fill="white" />
              </div>
              <div className="lifestyle__glow" />
            </div>
            <div className="lifestyle__float-card">
              <div className="lifestyle__float-card-icon"><Heart size={16} /></div>
              <div>
                <strong>{data.trustText}</strong>
                <span>{data.trustSub}</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
