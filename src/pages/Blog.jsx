import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Clock, ArrowRight } from 'lucide-react';
import { BLOG_POSTS } from '../data/products';
import './Blog.css';

export default function Blog() {
  return (
    <main className="blog-page">
      <section className="blog-hero">
        <div className="container">
          <motion.span className="section-subtitle" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>The Journal</motion.span>
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>Design Inspiration & Living Tips</motion.h1>
        </div>
      </section>

      <section className="container section-padding">
        <div className="blog-grid">
          {BLOG_POSTS.map((post, i) => (
            <motion.article
              key={post.id}
              className={`blog-card ${i === 0 ? 'blog-card--featured' : ''}`}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
            >
              <div className="blog-card__image">
                <img src={post.image} alt={post.title} loading="lazy" />
                <span className="blog-card__category">{post.category}</span>
              </div>
              <div className="blog-card__content">
                <div className="blog-card__meta">
                  <span>{post.date}</span>
                  <span><Clock size={13} /> {post.readTime}</span>
                </div>
                <h2>{post.title}</h2>
                <p>{post.excerpt}</p>
                <span className="btn btn-ghost">Read More <ArrowRight size={14} /></span>
              </div>
            </motion.article>
          ))}
        </div>
      </section>
    </main>
  );
}
