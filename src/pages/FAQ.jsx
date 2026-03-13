import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, HelpCircle, Package, Truck, CreditCard, RotateCcw, Shield, Phone, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';
import './FAQ.css';

const FAQ_CATEGORIES = [
  { id: 'all', label: 'All Topics' },
  { id: 'shipping', label: 'Shipping & Delivery' },
  { id: 'returns', label: 'Returns & Refunds' },
  { id: 'products', label: 'Products & Care' },
  { id: 'payment', label: 'Payment & Pricing' },
];

const FAQ_DATA = [
  // Shipping & Delivery
  {
    category: 'shipping',
    question: 'How long does shipping take?',
    answer: 'Standard shipping takes 5-7 business days. Express shipping (2-3 business days) and White-Glove delivery (scheduled appointment) are also available at checkout.',
    icon: <Truck size={20} />
  },
  {
    category: 'shipping',
    question: 'Do you ship across Canada?',
    answer: 'Yes! We ship to all provinces and territories across Canada. Free standard shipping is available on orders over $999.',
    icon: <Package size={20} />
  },
  {
    category: 'shipping',
    question: 'Can I track my order?',
    answer: 'Absolutely! Once your order ships, you\'ll receive a tracking number via email. You can use this to monitor your delivery in real-time through our carrier\'s website.',
    icon: <Shield size={20} />
  },
  {
    category: 'shipping',
    question: 'What is White-Glove Delivery?',
    answer: 'White-Glove delivery includes scheduled appointment, room of choice placement, unpacking service, and packaging removal. It\'s our premium full-service delivery option.',
    icon: <Truck size={20} />
  },
  
  // Returns & Refunds
  {
    category: 'returns',
    question: 'What is your return policy?',
    answer: 'We offer a 30-day return window from the date of delivery. Items must be in original condition with tags attached. We provide free return pickup for all eligible returns.',
    icon: <RotateCcw size={20} />
  },
  {
    category: 'returns',
    question: 'How do I return an item?',
    answer: 'Simply email hello@cozhaven.ca or call us within 30 days of delivery. We\'ll arrange free pickup at your convenience. Pack the item securely (original packaging preferred) and we\'ll handle the rest.',
    icon: <Package size={20} />
  },
  {
    category: 'returns',
    question: 'When will I receive my refund?',
    answer: 'Refunds are processed within 5-7 business days after we receive and inspect your return. The credit will appear on your original payment method within 3-5 additional business days.',
    icon: <CreditCard size={20} />
  },
  {
    category: 'returns',
    question: 'Are there any non-returnable items?',
    answer: 'Custom or made-to-order items, final sale items, used or assembled furniture, personalized items, and gift cards cannot be returned. All other items in original condition are eligible.',
    icon: <Shield size={20} />
  },
  
  // Products & Care
  {
    category: 'products',
    question: 'Are Cozhaven products made in Canada?',
    answer: 'Yes! All our furniture is proudly designed and manufactured in Canada using high-quality materials and craftsmanship.',
    icon: <Shield size={20} />
  },
  {
    category: 'products',
    question: 'How do I care for my furniture?',
    answer: 'Care instructions vary by material. Generally, we recommend dusting regularly with a soft cloth, avoiding direct sunlight, and cleaning spills immediately. Detailed care instructions come with each piece.',
    icon: <HelpCircle size={20} />
  },
  {
    category: 'products',
    question: 'Do you offer warranties?',
    answer: 'Yes, all Cozhaven furniture comes with a manufacturer\'s warranty covering defects in materials and workmanship. Warranty periods vary by product - check individual product pages for details.',
    icon: <Shield size={20} />
  },
  {
    category: 'products',
    question: 'Can I request fabric swatches?',
    answer: 'Absolutely! Email us at hello@cozhaven.ca with your address and which fabrics you\'re interested in. We\'ll send swatches to help you make the perfect choice.',
    icon: <Mail size={20} />
  },
  
  // Payment & Pricing
  {
    category: 'payment',
    question: 'What payment methods do you accept?',
    answer: 'We accept all major credit cards (Visa, MasterCard, American Express), debit cards, and PayPal. All transactions are secured with industry-standard encryption.',
    icon: <CreditCard size={20} />
  },
  {
    category: 'payment',
    question: 'Is shipping really free?',
    answer: 'Yes! Standard shipping is free on all orders over $999. For orders under $999, standard shipping rates apply. Express and White-Glove delivery have additional fees.',
    icon: <Truck size={20} />
  },
  {
    category: 'payment',
    question: 'Do you offer financing?',
    answer: 'We\'re currently working on financing options. Please sign up for our newsletter to be notified when we launch our financing program.',
    icon: <HelpCircle size={20} />
  },
  {
    category: 'payment',
    question: 'What if my item arrives damaged?',
    answer: 'Contact us within 48 hours of delivery at hello@cozhaven.ca or call (647) 555-COZY. We\'ll arrange immediate replacement or full refund at no cost to you.',
    icon: <Phone size={20} />
  },
];

export default function FAQ() {
  const [activeCategory, setActiveCategory] = useState('all');
  const [openIndex, setOpenIndex] = useState(null);

  const filteredFAQs = activeCategory === 'all' 
    ? FAQ_DATA 
    : FAQ_DATA.filter(faq => faq.category === activeCategory);

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <main className="faq-page">
      <div className="container">
        {/* Hero */}
        <motion.div 
          className="faq-hero"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <span className="section-subtitle">Help Center</span>
          <h1>Frequently Asked Questions</h1>
          <p>Find answers to common questions about shipping, returns, products, and more.</p>
        </motion.div>

        {/* Category Filter */}
        <div className="faq-filters">
          {FAQ_CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`filter-btn ${activeCategory === cat.id ? 'active' : ''}`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* FAQ List */}
        <div className="faq-list">
          <AnimatePresence mode="wait">
            {filteredFAQs.map((faq, index) => (
              <motion.div
                key={`${activeCategory}-${index}`}
                className="faq-item"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.05 }}
              >
                <button
                  className="faq-question"
                  onClick={() => toggleFAQ(index)}
                  aria-expanded={openIndex === index}
                >
                  <div className="faq-icon">{faq.icon}</div>
                  <span>{faq.question}</span>
                  <ChevronDown 
                    size={20} 
                    className={`chevron ${openIndex === index ? 'rotated' : ''}`} 
                  />
                </button>
                
                <AnimatePresence>
                  {openIndex === index && (
                    <motion.div
                      className="faq-answer"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <p>{faq.answer}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Still Need Help? */}
        <motion.div 
          className="faq-help-cta"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2>Still have questions?</h2>
          <p>Our customer care team is here to help Monday - Saturday, 10 AM - 8 PM EST</p>
          <div className="help-actions">
            <a href="mailto:hello@cozhaven.ca" className="btn btn-primary">
              <Mail size={18} />
              Email Us
            </a>
            <a href="tel:+16475559269" className="btn btn-secondary">
              <Phone size={18} />
              Call (647) 555-COZY
            </a>
            <Link to="/contact" className="btn btn-outline">
              Contact Form
            </Link>
          </div>
        </motion.div>
      </div>
    </main>
  );
}
