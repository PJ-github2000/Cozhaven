import { useState } from 'react';
import { Star, ThumbsUp, Filter, Image as ImageIcon, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import './ReviewsSection.css';

const MOCK_REVIEWS = [
  {
    id: 1,
    userName: 'Sarah M.',
    rating: 5,
    title: 'Best sofa ever!',
    text: 'Absolutely love this purchase. The quality is outstanding and the comfort level is unmatched. Delivery was smooth and the white-glove service was worth every penny.',
    date: '2025-02-15',
    verified: true,
    helpful: 24,
    photos: ['https://atunus.com/wp-content/uploads/2025/04/Bubble-Sectional-Sofa-Comfort-3D-Knitted-Loveseats-2-3-Seater-Atunus-1.webp']
  },
  {
    id: 2,
    userName: 'Michael Chen',
    rating: 5,
    title: 'Worth the investment',
    text: 'We researched sofas for months before deciding on the Cordelle. The Canadian craftsmanship really shows - every stitch is perfect. Highly recommend!',
    date: '2025-02-10',
    verified: true,
    helpful: 18,
    photos: []
  },
  {
    id: 3,
    userName: 'Jessica Thompson',
    rating: 4,
    title: 'Beautiful but firm',
    text: 'Gorgeous sofa and excellent quality. Just be aware it\'s firmer than expected. Still very comfortable for sitting, just not as sink-in soft as I imagined.',
    date: '2025-02-05',
    verified: true,
    helpful: 12,
    photos: ['https://atunus.com/wp-content/uploads/2025/04/Sky-Cloud-Deluxe-Adjustable-Sectional-Sofa-Comfort-Relaxation-125-Inch-Velvet-Corner-Sectionals-2-Seaters-Atunus-1.webp', 'https://atunus.com/wp-content/uploads/2025/04/Sky-Cloud-Deluxe-Adjustable-Sectional-Sofa-Adjustable-Cozy-Velvet-L-Shaped-Sectionals-4-Seaters-Atunus-10.webp']
  },
  {
    id: 4,
    userName: 'David Park',
    rating: 5,
    title: 'Exceeded expectations',
    text: 'The photos don\'t do it justice. The fabric is luxurious and the color is even better in person. Assembly was easy too.',
    date: '2025-01-28',
    verified: true,
    helpful: 9,
    photos: []
  },
];

export default function ReviewsSection({ productId }) {
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('helpful');
  const [showPhotosOnly, setShowPhotosOnly] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [showForm, setShowForm] = useState(false);

  // Filter reviews
  const filteredReviews = MOCK_REVIEWS.filter(review => {
    if (showPhotosOnly && review.photos.length === 0) return false;
    if (filter !== 'all' && review.rating !== parseInt(filter)) return false;
    return true;
  });

  // Sort reviews
  const sortedReviews = [...filteredReviews].sort((a, b) => {
    if (sortBy === 'helpful') return b.helpful - a.helpful;
    if (sortBy === 'recent') return new Date(b.date) - new Date(a.date);
    return 0;
  });

  // Calculate average rating
  const avgRating = (MOCK_REVIEWS.reduce((sum, r) => sum + r.rating, 0) / MOCK_REVIEWS.length).toFixed(1);
  const ratingDistribution = [5, 4, 3, 2, 1].map(stars => ({
    stars,
    count: MOCK_REVIEWS.filter(r => r.rating === stars).length,
    percentage: (MOCK_REVIEWS.filter(r => r.rating === stars).length / MOCK_REVIEWS.length) * 100
  }));

  return (
    <section className="pdp-reviews" id="reviews">
      <div className="container">
        {/* Header */}
        <div className="reviews-header">
          <h2>Customer Reviews</h2>
          
          <div className="reviews-summary">
            <div className="rating-overview">
              <div className="rating-number">{avgRating}</div>
              <div className="rating-stars">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star 
                    key={i} 
                    size={20} 
                    fill={i < Math.round(avgRating) ? 'currentColor' : 'none'}
                    className={i < Math.round(avgRating) ? 'star' : 'star-empty'}
                  />
                ))}
              </div>
              <span>{MOCK_REVIEWS.length} reviews</span>
            </div>

            <div className="rating-distribution">
              {ratingDistribution.map(({ stars, count, percentage }) => (
                <div key={stars} className="rating-bar">
                  <span className="rating-bar-label">{stars} stars</span>
                  <div className="rating-bar-track">
                    <div 
                      className="rating-bar-fill" 
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="rating-bar-count">{count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="reviews-filters">
          <div className="filters-left">
            <select 
              value={filter} 
              onChange={e => setFilter(e.target.value)}
              className="filter-select"
              aria-label="Filter by rating"
            >
              <option value="all">All Ratings</option>
              <option value="5">5 Stars</option>
              <option value="4">4 Stars</option>
              <option value="3">3 Stars</option>
              <option value="2">2 Stars</option>
              <option value="1">1 Star</option>
            </select>

            <select 
              value={sortBy} 
              onChange={e => setSortBy(e.target.value)}
              className="filter-select"
              aria-label="Sort reviews"
            >
              <option value="helpful">Most Helpful</option>
              <option value="recent">Most Recent</option>
            </select>
          </div>

          <button 
            className={`photo-filter-btn ${showPhotosOnly ? 'active' : ''}`}
            onClick={() => setShowPhotosOnly(!showPhotosOnly)}
            aria-pressed={showPhotosOnly}
          >
            <ImageIcon size={16} />
            Photos Only
          </button>
        </div>

        {/* Reviews List */}
        <div className="reviews-list">
          {sortedReviews.map((review, index) => (
            <motion.div
              key={review.id}
              className="review-card"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <div className="review-header-row">
                <div className="reviewer-info">
                  <strong className="reviewer-name">{review.userName}</strong>
                  {review.verified && (
                    <span className="verified-badge" title="Verified Purchase">
                      ✓ Verified Buyer
                    </span>
                  )}
                </div>
                <time className="review-date" dateTime={review.date}>
                  {new Date(review.date).toLocaleDateString('en-CA', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </time>
              </div>

              <div className="review-rating-display">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star 
                    key={i} 
                    size={14} 
                    fill={i < review.rating ? 'currentColor' : 'none'}
                    className={i < review.rating ? 'star' : 'star-empty'}
                  />
                ))}
              </div>

              <h4 className="review-title">{review.title}</h4>
              <p className="review-text">{review.text}</p>

              {review.photos && review.photos.length > 0 && (
                <div className="review-photos-grid">
                  {review.photos.map((photo, idx) => (
                    <button
                      key={idx}
                      className="review-photo-thumb"
                      onClick={() => setSelectedPhoto(photo)}
                      aria-label="View customer photo"
                    >
                      <img src={photo} alt={`Customer photo ${idx + 1}`} loading="lazy" />
                    </button>
                  ))}
                </div>
              )}

              <div className="review-footer">
                <button className="helpful-button" aria-label="Mark review as helpful">
                  <ThumbsUp size={14} />
                  <span>Helpful ({review.helpful})</span>
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Write Review CTA */}
        <div className="reviews-cta">
          <button 
            className="btn btn-primary btn-large"
            onClick={() => setShowForm(!showForm)}
          >
            Write a Review
          </button>
          
          {showForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="review-form-placeholder"
            >
              <h3>Share Your Experience</h3>
              <p>Review form would open here with rating, title, text, and photo upload fields.</p>
              <button className="btn btn-secondary" onClick={() => setShowForm(false)}>Close</button>
            </motion.div>
          )}
        </div>
      </div>

      {/* Photo Lightbox */}
      <AnimatePresence>
        {selectedPhoto && (
          <motion.div
            className="photo-lightbox"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedPhoto(null)}
          >
            <button className="lightbox-close" aria-label="Close photo">
              <X size={32} />
            </button>
            <img src={selectedPhoto} alt="Customer photo full size" />
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
