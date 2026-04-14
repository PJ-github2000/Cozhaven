import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import AnimatedText from '../AnimatedText';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const jsonSafeParse = (str) => {
  try {
    return JSON.parse(str);
  } catch (e) {
    return null;
  }
};

export default function JournalPreview() {
  const [posts, setPosts] = useState([]);
  const [config, setConfig] = useState(null);

  useEffect(() => {
    fetch(`${API_URL}/cms/blog`)
      .then(res => res.json())
      .then(data => setPosts(data))
      .catch(console.error);

    fetch(`${API_URL}/cms/blocks/homepage-journal`)
      .then(res => res.json())
      .then(data => {
        if (data.content_json) {
          setConfig(jsonSafeParse(data.content_json));
        }
      })
      .catch(console.error);
  }, []);

  const data = config || { title: "Design Inspiration", subtitle: "The Journal", linkText: "Read Buying Guides", link: "/blog" };

  return (
    <section className="journal-preview section-padding">
      <div className="container">
        <div className="section-header section-header--split">
          <div>
            <span className="section-subtitle">{data.subtitle}</span>
            <AnimatedText
              el="h2"
              text={data.title}
              className="section-title"
            />
          </div>
          <Link to={data.link} className="btn btn-ghost">{data.linkText} <ArrowRight size={16} /></Link>
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
                <span className="journal-card__meta">{new Date(post.published_at).toLocaleDateString()} | {post.read_time}</span>
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
