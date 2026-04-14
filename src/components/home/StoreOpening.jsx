import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, Clock } from 'lucide-react';
import AnimatedText from '../AnimatedText';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const jsonSafeParse = (str) => {
  try {
    return JSON.parse(str);
  } catch (e) {
    return null;
  }
};

export default function StoreOpening() {
  const [showroom, setShowroom] = useState(null);

  useEffect(() => {
    fetch(`${API_URL}/cms/blocks/homepage-showroom`)
      .then(res => res.json())
      .then(data => {
        if (data.content_json) {
          setShowroom(jsonSafeParse(data.content_json));
        }
      })
      .catch(console.error);
  }, []);

  const defaultShowroom = {
    title: "Visit Our Mississauga Showroom",
    subtitle: "Flagship Location",
    description: "Try depth, firmness, and fabric finishes in person before you buy.",
    address: "6435 Dixie Rd, Unit 4, Mississauga, ON L5T 1X4",
    hours: ["Mon-Fri 12pm-8pm | Sat-Sun 12pm-9pm"],
    phone: "1-800-COZHAVEN",
    image: "/assets/Others image 8.jpg",
    link: "/contact"
  };

  const data = showroom || defaultShowroom;

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
            <img src={data.image} alt={data.title} />
            <div className="store-opening__overlay" />
          </div>
          <div className="store-opening__content">
            <span className="section-subtitle">{data.subtitle}</span>
            <AnimatedText el="h2" text={data.title} />
            <p className="store-opening__tagline">{data.description}</p>
            <div className="store-opening__info">
              <div className="store-opening__info-item">
                <MapPin size={18} />
                <span>{data.address}</span>
              </div>
              <div className="store-opening__info-item">
                <Clock size={18} />
                <div className="store-opening__hours">
                  {(data.hours || []).map((h, i) => <span key={i}>{h}</span>)}
                </div>
              </div>
            </div>
            <div className="store-opening__actions">
              <Link to={data.link} className="btn btn-primary">Plan Your Visit</Link>
              <a href={`tel:${data.phone}`} className="btn btn-secondary">Call Concierge</a>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
