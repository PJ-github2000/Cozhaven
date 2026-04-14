import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import { useProductsQuery } from '../../context/ProductsContext';
import ProductCard from '../ProductCard';
import ProductSkeleton from '../ProductSkeleton';

import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

export default function CollectionSlider() {
  const swiperRef = useRef(null);
  const { data, isLoading } = useProductsQuery({ is_canadian_made: true, limit: 12 });
  const products = data?.items || [];

  if (isLoading && products.length === 0) {
    return (
      <section className="collection-slider">
        <div className="collection-slider__container">
          <div className="section-header">
            <h2 className="section-title">Canadian Made Series</h2>
          </div>
          <div className="collection-slider__wrapper">
            <div className="featured__grid">
              {Array.from({ length: 4 }).map((_, i) => (
                <ProductSkeleton key={i} index={i} />
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="collection-slider">
      <div className="collection-slider__container">
        <div className="section-header section-header--split collection-slider__header">
          <h2 className="collection-slider__title">Canadian Made Series</h2>
          <Link to="/shop?cat=canadian" className="collection-slider__link">
            Shop Canadian Made <ArrowRight size={16} />
          </Link>
        </div>

        <div className="collection-slider__wrapper">
          <Swiper
            ref={swiperRef}
            modules={[Navigation, Pagination, Autoplay]}
            spaceBetween={20}
            slidesPerView={1.15}
            grabCursor={true}
            loop={true}
            autoplay={{ delay: 4500, disableOnInteraction: true, pauseOnMouseEnter: true }}
            pagination={{ clickable: true, el: '.collection-slider__pagination' }}
            navigation={{
              prevEl: '.collection-slider__arrow--left',
              nextEl: '.collection-slider__arrow--right',
            }}
            breakpoints={{
              480: { slidesPerView: 1.5, spaceBetween: 16 },
              768: { slidesPerView: 2.5, spaceBetween: 20 },
              1024: { slidesPerView: 3.5, spaceBetween: 24 },
              1280: { slidesPerView: 4, spaceBetween: 24 },
            }}
          >
            {products.map((p, i) => (
              <SwiperSlide key={p.id}>
                <ProductCard product={p} index={i} />
              </SwiperSlide>
            ))}
          </Swiper>

          <button className="collection-slider__arrow collection-slider__arrow--left" aria-label="Previous">
            <ChevronLeft size={24} />
          </button>
          <button className="collection-slider__arrow collection-slider__arrow--right" aria-label="Next">
            <ChevronRight size={24} />
          </button>
          <div className="collection-slider__pagination"></div>
        </div>
      </div>
    </section>
  );
}
