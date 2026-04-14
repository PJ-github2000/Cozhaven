import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Heart } from 'lucide-react';
import AnimatedText from '../AnimatedText';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const jsonSafeParse = (str) => {
  try {
    return JSON.parse(str);
  } catch (e) {
    return null;
  }
};

export default function InstagramFeed() {
  const [images, setImages] = useState([]);

  useEffect(() => {
    fetch(`${API_URL}/cms/blocks/homepage-ig`)
      .then(res => res.json())
      .then(data => {
        if (data.content_json) {
          setImages(jsonSafeParse(data.content_json));
        }
      })
      .catch(console.error);
  }, []);

  const defaultImages = [
    '/assets/instagram/ig-1.png',
    '/assets/instagram/ig-2.png',
    '/assets/instagram/ig-3.png',
    '/assets/instagram/ig-4.png',
    '/assets/instagram/ig-5.png',
    '/assets/instagram/ig-6.png',
  ];

  const data = images.length > 0 ? images : defaultImages;

  return (
    <section className="instagram">
      <div className="container instagram__header">
        <span className="section-subtitle">@cozhaven</span>
        <AnimatedText el="h2" text="Follow Our Journey" className="section-title" />
      </div>
      <div className="instagram__grid">
        {data.map((img, i) => (
          <motion.a
            key={i}
            href="https://www.instagram.com/cozhaven"
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
