import { useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Phone, Mail, Clock, Send, Instagram, Facebook, Twitter } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import './Contact.css';

export default function Contact() {
  const { addToast } = useToast();
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) {
      addToast('Please fill in all required fields', 'error');
      return;
    }
    addToast('Message sent! We\'ll be in touch soon.', 'success');
    setForm({ name: '', email: '', phone: '', message: '' });
  };

  return (
    <main className="contact-page">
      <section className="contact-hero">
        <div className="container">
          <motion.span className="section-subtitle" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>Get In Touch</motion.span>
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>We'd Love to Hear From You</motion.h1>
        </div>
      </section>

      <section className="container section-padding">
        <div className="contact-layout">
          {/* Form */}
          <motion.form className="contact-form" onSubmit={handleSubmit} initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
            <div className="input-group">
              <label htmlFor="name">Name *</label>
              <input id="name" type="text" className="input-field" placeholder="Your full name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="input-group">
              <label htmlFor="email">Email *</label>
              <input id="email" type="email" className="input-field" placeholder="you@example.com" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
            </div>
            <div className="input-group">
              <label htmlFor="phone">Phone</label>
              <input id="phone" type="tel" className="input-field" placeholder="(Optional)" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
            </div>
            <div className="input-group">
              <label htmlFor="message">Message *</label>
              <textarea id="message" className="input-field" placeholder="How can we help?" value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} />
            </div>
            <button type="submit" className="btn btn-primary btn-large" style={{ width: '100%' }}>
              <Send size={16} /> Send Message
            </button>
          </motion.form>

          {/* Info */}
          <motion.div className="contact-info" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.1 }}>
            <div className="contact-info__card">
              <div className="contact-info__item"><MapPin size={20} /><div><h4>Visit Us</h4><p>Greater Toronto Area, Ontario, Canada</p></div></div>
              <div className="contact-info__item"><Phone size={20} /><div><h4>Call Us</h4><p>(647) 555-COZY</p></div></div>
              <div className="contact-info__item"><Mail size={20} /><div><h4>Email</h4><p>hello@cozhaven.ca</p></div></div>
              <div className="contact-info__item"><Clock size={20} /><div><h4>Hours</h4><p>Mon – Sat: 10AM – 8PM<br />Sun: 11AM – 6PM</p></div></div>
            </div>

            <div className="contact-info__socials">
              <h4>Follow Us</h4>
              <div className="contact-info__social-links">
                <a href="#" aria-label="Instagram"><Instagram size={20} /></a>
                <a href="#" aria-label="Facebook"><Facebook size={20} /></a>
                <a href="#" aria-label="Twitter"><Twitter size={20} /></a>
              </div>
            </div>

            {/* Map placeholder */}
            <div className="contact-map">
              <img src="https://atunus.com/wp-content/uploads/2025/06/Finding-Beauty-in-Simplicity-Wabi-Sabi-Design-for-Reflective-Business-Settings-01-1749607323.webp" alt="Map location" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 'var(--radius-lg)', opacity: 0.8 }} />
              <div className="contact-map__overlay">
                <MapPin size={32} />
                <span>GTA, Ontario</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </main>
  );
}
