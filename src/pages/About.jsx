import { motion } from 'framer-motion';
import { Heart, Shield, Leaf, Users } from 'lucide-react';
import './About.css';

const fadeIn = { initial: { opacity: 0, y: 30 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true }, transition: { duration: 0.5 } };

export default function About() {
  return (
    <main className="about-page">
      {/* Hero */}
      <section className="about-hero">
        <img src="https://atunus.com/wp-content/uploads/2025/06/Crafting-Serene-and-Mindful-Workspaces-in-the-Modern-Business-World-01-1749606998.webp" alt="Cozhaven showroom" />
 showcase the premium furniture in a real setting.
        <div className="about-hero__overlay" />
        <motion.div className="about-hero__content container" {...fadeIn}>
          <span className="section-subtitle" style={{ color: 'var(--rich-bronze)' }}>Our Story</span>
          <h1>Crafting Comfort<br />Since 2023</h1>
          <p>We believe that great furniture does more than fill a room — it transforms how you live, work, and recharge.</p>
        </motion.div>
      </section>

      {/* Mission */}
      <section className="about-mission section-padding">
        <div className="container">
          <motion.div className="about-mission__content" {...fadeIn}>
            <span className="section-subtitle">Our Mission</span>
            <h2>Making Premium Furniture Accessible to Every Canadian Home</h2>
            <p>Born from a passion for quality and a frustration with overpriced, underwhelming furniture, Cozhaven set out to bridge the gap between luxury design and attainable pricing. Every piece in our collection is thoughtfully designed, sustainably sourced, and built to last generations — not just trends.</p>
          </motion.div>
        </div>
      </section>

      {/* Values */}
      <section className="about-values section-padding" style={{ background: 'var(--soft-cream)' }}>
        <div className="container">
          <div className="section-header">
            <span className="section-subtitle">What We Stand For</span>
            <h2 className="section-title">Our Values</h2>
          </div>
          <div className="about-values__grid">
            {[
              { icon: <Heart size={28} />, title: 'Quality First', desc: 'Every joint, stitch, and finish meets our uncompromising standards. We use premium materials and time-tested construction techniques.' },
              { icon: <Users size={28} />, title: 'Customer-Obsessed', desc: 'From browsing to delivery and beyond, your experience matters. Our design consultants are here to help you create your dream space.' },
              { icon: <Leaf size={28} />, title: 'Sustainability', desc: 'We partner with responsible manufacturers and prioritize sustainable materials. Your beautiful home shouldn\'t come at the earth\'s expense.' },
              { icon: <Shield size={28} />, title: 'Community', desc: 'As a Canadian company, we\'re committed to investing in our communities. 1% of every sale supports local housing initiatives.' },
            ].map((v, i) => (
              <motion.div key={i} className="value-card" initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1, duration: 0.5 }}>
                <div className="value-card__icon">{v.icon}</div>
                <h3>{v.title}</h3>
                <p>{v.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="about-timeline section-padding">
        <div className="container">
          <div className="section-header">
            <span className="section-subtitle">Our Journey</span>
            <h2 className="section-title">The Cozhaven Story</h2>
          </div>
          <div className="timeline">
            {[
              { year: '2023', title: 'The Beginning', text: 'Founded with a vision to make premium furniture accessible. Started as an online-only brand with curated collections.' },
              { year: '2024', title: 'Growing Strong', text: 'Expanded to over 200 products. Reached 10,000 happy customers across Canada. Launched our signature Cordelle and Cloud Cozy collections.' },
              { year: '2025', title: 'New Chapter', text: 'Opening our flagship showroom in the Greater Toronto Area. Introducing exclusive Canadian-made collections and a trade program for designers.' },
            ].map((item, i) => (
              <motion.div key={i} className="timeline__item" initial={{ opacity: 0, x: i % 2 ? 30 : -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: 0.1, duration: 0.5 }}>
                <div className="timeline__year">{item.year}</div>
                <div className="timeline__content">
                  <h3>{item.title}</h3>
                  <p>{item.text}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
