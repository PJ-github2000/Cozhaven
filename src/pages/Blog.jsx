import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Clock, ArrowRight } from 'lucide-react';
import './Blog.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

export default function Blog() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_URL}/cms/blog`)
      .then(res => res.json())
      .then(data => {
        setPosts(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch blog posts:", err);
        setLoading(false);
      });
  }, []);

  return (
    <main className="blog-page">
      <section className="blog-hero">
        <div className="container">
          <motion.span className="section-subtitle" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>The Journal</motion.span>
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>Design Inspiration & Living Tips</motion.h1>
        </div>
      </section>

      <section className="container section-padding">
        {loading ? (
          <div style={{ textAlign: 'center', padding: '4rem 0' }}>Loading journal entries...</div>
        ) : (
          <div className="blog-grid">
            {posts.map((post, i) => (
              <motion.article
                key={post.id}
                className={`blog-card ${i === 0 ? 'blog-card--featured' : ''}`}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
              >
                <div className="blog-card__image">
                  <img src={post.featured_image} alt={post.title} loading="lazy" />
                  <span className="blog-card__category">{post.category}</span>
                </div>
                <div className="blog-card__content">
                  <div className="blog-card__meta">
                    <span>{new Date(post.published_at).toLocaleDateString()}</span>
                    <span><Clock size={13} /> {post.read_time}</span>
                  </div>
                  <h2>{post.title}</h2>
                  <p>{post.excerpt}</p>
                  <span className="btn btn-ghost">Read More <ArrowRight size={14} /></span>
                </div>
              </motion.article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
