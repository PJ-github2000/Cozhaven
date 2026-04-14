import { useState, useEffect, useRef, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Share2, Ruler, Package, Sparkles } from 'lucide-react';
import { useProduct } from '../context/ProductsContext';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import ReviewsSection from '../components/ReviewsSection';
import Breadcrumbs from '../components/Breadcrumbs';
import RecommendationRow from '../components/RecommendationRow';
import { discoveryApi } from '../services/discoveryApi.js';
import { CATEGORIES } from '../data/products';

// Modular Components
import ProductGallery from '../components/product/ProductGallery';
import ProductConfigurator from '../components/product/ProductConfigurator';
import ProductStory from '../components/product/ProductStory';
import ProductDetailsSidebar from '../components/product/ProductDetailsSidebar';
import { 
  asArray, asObject, titleize, IconToken, getVideoEmbedUrl 
} from '../components/product/utils';

import './ProductDetail.css';

const normalizeImageGroup = (group) => ({
  name: group?.name || group?.label || '',
  swatch: group?.swatch || group?.color || '',
  images: asArray(group?.images),
});

const normalizeImageGroups = (groups) => {
  if (Array.isArray(groups)) {
    return groups.map(normalizeImageGroup);
  }
  const groupObj = asObject(groups);
  if (groupObj) {
    return Object.entries(groupObj).map(([name, images]) => normalizeImageGroup({ name, images }));
  }
  return [];
};

const normalizeColorToken = (value) => String(value || '').trim().toLowerCase();

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: product, isLoading: productLoading, error: productError } = useProduct(id);
  const { addItem } = useCart();
  const { addToast } = useToast();
  const { user } = useAuth();

  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedColor, setSelectedColor] = useState(0);
  const [selectedSize, setSelectedSize] = useState(0);
  const [selectedConfiguration, setSelectedConfiguration] = useState(0);
  const [selectedMaterial, setSelectedMaterial] = useState(0);
  const [visualSelectionPriority, setVisualSelectionPriority] = useState('base');
  const [seatDepth, setSeatDepth] = useState('');
  const [firmness, setFirmness] = useState('');
  const [isCustomDimensions, setIsCustomDimensions] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [isHeaderSticky, setIsHeaderSticky] = useState(false);
  const [showDetailsSidebar, setShowDetailsSidebar] = useState(false);
  const buyBoxRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      if (!buyBoxRef.current) return;
      const buyBoxBottom = buyBoxRef.current.getBoundingClientRect().bottom;
      setIsHeaderSticky(buyBoxBottom < 0);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setSelectedImage(0);
    setSelectedColor(0);
    setSelectedSize(0);
    setSelectedConfiguration(0);
    setSelectedMaterial(0);
    setVisualSelectionPriority('base');
    setSeatDepth('');
    setFirmness('');
    setIsCustomDimensions(false);
    setQuantity(1);
    window.scrollTo(0, 0);
  }, [id]);

  useEffect(() => {
    if (product) {
      if (user) {
        discoveryApi.recordView(product.id).catch(err => console.debug('Discovery record failed:', err));
      }
      const viewed = JSON.parse(localStorage.getItem('recentlyViewed') || '[]');
      const filteredViewed = viewed.filter(vid => vid !== product.id);
      const newViewed = [product.id, ...filteredViewed].slice(0, 10);
      localStorage.setItem('recentlyViewed', JSON.stringify(newViewed));
    }
  }, [id, product, user]);

  const handleAddToCart = () => {
    const stockValue = Number(product?.stock ?? 1);
    if (product?.stock !== null && product?.stock !== undefined && !Number.isNaN(stockValue) && stockValue <= 0) {
      addToast('This item is currently out of stock', 'error');
      return;
    }

    const selectedOptions = {
      color: selectedColor === -1 ? 'Decide Later' : (product.colorNames ? product.colorNames[selectedColor] : product.colors?.[selectedColor]),
      configuration: product.configurations?.[selectedConfiguration],
      material: product.materials?.[selectedMaterial],
      dimensions: isCustomDimensions ? 'Custom' : (product.sizes?.[selectedSize] || product.specs?.dimensions),
      seatDepth,
      firmness
    };

    addItem({
      ...product,
      quantity,
      selectedOptions
    });

    addToast(`${product.name} added to cart`, 'success');
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: product.name, url: window.location.href });
      } catch { /* user cancelled */ }
    } else {
      navigator.clipboard.writeText(window.location.href);
      addToast('Link copied to clipboard', 'info');
    }
  };

  const handleConfigChange = (index, config) => {
    if (config?.slug || config?.id) {
      navigate(`/product/${config.slug || config.id}`);
    } else {
      setSelectedConfiguration(index);
      setVisualSelectionPriority('configuration');
    }
  };

  const baseGallery = useMemo(() => {
    if (Array.isArray(product?.images) && product.images.length) return product.images;
    if (product?.image) return [product.image];
    return [];
  }, [product]);

  const colorImageGroups = useMemo(() => normalizeImageGroups(product?.colorImageGroups ?? product?.color_image_groups), [product]);
  const configurationImageGroups = useMemo(() => normalizeImageGroups(product?.configurationImageGroups ?? product?.configuration_image_groups), [product]);
  const configurationCards = useMemo(() => asArray(product?.configurationCards ?? product?.configuration_cards).map((card, index) => ({
    name: card?.name || product?.configurations?.[index] || `Configuration ${index + 1}`,
    caption: card?.caption || '',
    optionKey: card?.option_key || card?.optionKey || card?.icon_key || card?.iconKey || '',
    previewImage: card?.preview_image || card?.previewImage || configurationImageGroups[index]?.images?.[0] || '',
    gallery: asArray(card?.gallery),
    slug: card?.slug || '',
    id: card?.id || '',
  })), [product, configurationImageGroups]);

  const configurationOptions = useMemo(() => configurationCards.length
    ? configurationCards
    : asArray(product?.configurations).map((name, index) => ({
        name,
        caption: '',
        optionKey: '',
        previewImage: configurationImageGroups[index]?.images?.[0] || '',
        gallery: configurationImageGroups[index]?.images || [],
        slug: '',
        id: '',
      })), [configurationCards, product, configurationImageGroups]);

  const activeConfigurationCard = configurationOptions[selectedConfiguration] || null;
  const selectedColorName = normalizeColorToken(product?.colorNames?.[selectedColor]);
  const selectedColorSwatch = normalizeColorToken(product?.colors?.[selectedColor]);
  
  const activeColorImages = useMemo(() => {
    const matchingColorGroupByName = selectedColorName ? colorImageGroups.find((group) => normalizeColorToken(group.name) === selectedColorName) : null;
    const matchingColorGroupBySwatch = selectedColorSwatch ? colorImageGroups.find((group) => normalizeColorToken(group.swatch) === selectedColorSwatch || normalizeColorToken(group.name) === selectedColorSwatch) : null;
    return (selectedColor >= 0 && colorImageGroups[selectedColor]?.images?.length ? colorImageGroups[selectedColor].images : null) || matchingColorGroupByName?.images || matchingColorGroupBySwatch?.images || [];
  }, [selectedColor, colorImageGroups, selectedColorName, selectedColorSwatch]);

  const activeConfigurationImages = useMemo(() => activeConfigurationCard?.gallery?.length ? activeConfigurationCard.gallery : (configurationImageGroups[selectedConfiguration]?.images || []), [activeConfigurationCard, configurationImageGroups, selectedConfiguration]);

  const galleryImages = useMemo(() => {
    let images = baseGallery;
    if (visualSelectionPriority === 'color') {
      images = activeColorImages.length ? activeColorImages : (activeConfigurationImages.length ? activeConfigurationImages : baseGallery);
    } else if (visualSelectionPriority === 'configuration') {
      images = activeConfigurationImages.length ? activeConfigurationImages : (activeColorImages.length ? activeColorImages : baseGallery);
    }
    return images.length ? images : baseGallery;
  }, [baseGallery, activeColorImages, activeConfigurationImages, visualSelectionPriority]);

  const jsonLd = useMemo(() => ({
    "@context": "https://schema.org/",
    "@type": "Product",
    "name": product?.name,
    "image": product?.images,
    "description": product?.description,
    "sku": product?.sku || `CH-${product?.id}`,
    "brand": { "@type": "Brand", "name": "Cozhaven" },
    "offers": {
      "@type": "Offer",
      "url": window.location.href,
      "priceCurrency": "USD",
      "price": product?.price,
      "availability": product?.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      "itemCondition": "https://schema.org/NewCondition"
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": product?.rating,
      "reviewCount": product?.reviews
    }
  }), [product]);

  const isOutOfStock = Number(product?.stock) <= 0;
  const promoBands = useMemo(() => asObject(product?.promoBands ?? product?.promo_bands), [product]);
  const promoRows = useMemo(() => asArray(promoBands?.rows).filter((row) => row?.spend || row?.save), [promoBands]);
  
  const materialSummaryItems = useMemo(() => {
    const materialSummary = asObject(product?.materialSummary ?? product?.material_summary) || {};
    return [
      { label: 'Fabric', value: materialSummary.fabric || (product?.materials && product.materials[0]) },
      { label: 'Fill', value: materialSummary.fill },
      { label: 'Frame', value: materialSummary.frame },
      { label: 'Firmness', value: materialSummary.firmness || ((product?.softnessLevel || product?.softness_level) ? ['Firm', 'Medium Firm', 'Plush', 'Cloud-like', 'Ethereal'][(product.softnessLevel || product.softness_level) - 1] : '') },
      { label: 'Seat depth', value: materialSummary.seat_depth || product?.seatHeight || product?.seat_height },
    ].filter((item) => item.value);
  }, [product]);

  const buyBoxHighlights = useMemo(() => asArray(product?.buyBoxHighlights ?? product?.buy_box_highlights).map((item) => ({ title: item?.title || '', description: item?.description || '', icon: item?.icon || '' })).filter((item) => item.title || item.description), [product]);
  const bundleOffers = useMemo(() => asArray(product?.bundleOffers ?? product?.bundle_offers).map((item) => ({ title: item?.title || '', description: item?.description || '', badge: item?.badge || '', image: item?.image || '' })).filter((item) => item.title || item.description || item.badge || item.image), [product]);
  const featureCards = useMemo(() => asArray(product?.featureCards ?? product?.feature_cards).map((card) => ({ title: card?.title || '', body: card?.body || card?.description || '', icon: card?.icon || '', image: card?.image || '' })).filter((card) => card.title || card.body || card.image), [product]);
  const useCaseCards = useMemo(() => asArray(product?.useCaseCards ?? product?.use_case_cards).map((card) => ({ title: card?.title || '', body: card?.body || card?.description || '', image: card?.image || '' })).filter((card) => card.title || card.body || card.image), [product]);
  const considerationItems = useMemo(() => asArray(product?.technicalSpecs ?? product?.technical_specs).flatMap(g => g.items).length ? asArray(product?.technicalSpecs ?? product?.technical_specs).flatMap(g => g.items) : (asObject(product?.specs) ? Object.entries(product.specs).map(([label, value]) => ({ label: titleize(label), value })) : []), [product]);
  const dimensionBlocks = useMemo(() => asArray(product?.dimensionBlocks ?? product?.dimension_blocks).map((block) => ({ title: block?.title || '', image: block?.image || '', notes: asArray(block?.notes) })).filter((block) => block.title || block.image || block.notes.length), [product]);
  const reminderCards = useMemo(() => asArray(product?.careNoticeCards ?? product?.care_notice_cards).map((card) => ({ title: card?.title || '', body: card?.body || card?.description || '', icon: card?.icon || card?.tone })).filter((card) => card.title || card.body), [product]);
  const trustHighlights = useMemo(() => buyBoxHighlights.length ? buyBoxHighlights : [{ title: 'Free delivery', description: 'On orders over $1,500', icon: 'truck' }, { title: '30-day returns', description: 'Hassle-free guarantee', icon: 'returns' }, { title: `${product?.warrantyYears || product?.warranty_years || 5}-year warranty`, description: 'Crafted to last', icon: 'warranty' }], [buyBoxHighlights, product]);
  const videoEmbedUrl = useMemo(() => getVideoEmbedUrl(product?.assemblyVideoUrl), [product?.assemblyVideoUrl]);
  const featureHighlightBadges = useMemo(() => asArray(product?.featureHighlights).map(item => ({ title: item?.title || '', icon: item?.icon || 'sparkles' })).filter(item => item.title).length ? asArray(product?.featureHighlights).map(item => ({ title: item?.title || '', icon: item?.icon || 'sparkles' })) : asArray(product?.featureBadges ?? product?.feature_badges).map(b => ({ title: String(b), icon: 'check' })), [product]);

  if (productLoading) return <div className="pdp-loading">Loading...</div>;
  if (!product) return <div className="pdp-error">Product not found</div>;

  return (
    <main className="pdp">
      <Helmet>
        <title>{product.seo?.metaTitle || `${product.name} | Cozhaven - Premium Furniture`}</title>
        <meta name="description" content={product.seo?.metaDescription || product.description?.substring(0, 160)} />
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      </Helmet>

      <AnimatePresence>
        {isHeaderSticky && (
          <motion.div className="pdp__sticky-header" initial={{ y: -100 }} animate={{ y: 0 }} exit={{ y: -100 }}>
            <div className="container sticky-inner">
              <div className="sticky-info">
                <strong>{product.name}</strong>
                <div className="sticky-meta"><Star size={12} fill="currentColor" /><span>{product.rating} ({product.reviews})</span></div>
              </div>
              <div className="sticky-actions">
                <div className="sticky-price">${product.price?.toLocaleString()}</div>
                <button className="pdp__add-to-cart-sticky pdp__add-to-cart-compact" onClick={handleAddToCart} disabled={isOutOfStock}>{isOutOfStock ? 'Out of Stock' : `Add to Cart - $${product.price?.toLocaleString()}`}</button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <Breadcrumbs items={[{ label: 'Shop', link: '/shop' }, { label: CATEGORIES.find(c => c.id === product.category)?.name || product.category, link: `/shop?cat=${product.category}` }, { label: product.name }]} />

      <div className="container pdp__layout">
        <ProductGallery 
          product={product} 
          galleryImages={galleryImages} 
          selectedImage={selectedImage} 
          setSelectedImage={setSelectedImage} 
          onShowDetails={() => setShowDetailsSidebar(true)} 
        />
        
        <ProductConfigurator 
          product={product} 
          quantity={quantity} 
          setQuantity={setQuantity}
          selectedColor={selectedColor} 
          setSelectedColor={setSelectedColor}
          selectedConfiguration={selectedConfiguration}
          handleConfigChange={handleConfigChange}
          isOutOfStock={isOutOfStock}
          handleAddToCart={handleAddToCart}
          handleShare={handleShare}
          promoRows={promoRows}
          configurationOptions={configurationOptions}
          materialSummaryItems={materialSummaryItems}
          bundleOffers={bundleOffers}
          trustHighlights={trustHighlights}
          setVisualSelectionPriority={setVisualSelectionPriority}
        />
      </div>

      <ProductStory product={product} featureHighlightBadges={featureHighlightBadges} videoEmbedUrl={videoEmbedUrl} />

      {/* Editorial Section */}
      {featureCards.length > 0 && (
        <section className="pdp__editorial-section">
          <div className="container">
            <h2 className="pdp__editorial-heading">The Comfort is in the Details</h2>
            <div className="pdp__editorial-grid">
              {featureCards.map((card, i) => (
                <article key={`${card.title}-${i}`} className={`pdp__editorial-card ${card.image ? 'has-image' : 'no-image'} ${i === 0 && card.image ? 'is-hero' : ''}`}>
                  {card.image && <div className="pdp__editorial-img"><img src={card.image} alt={card.title} /></div>}
                  <div className="pdp__editorial-copy">
                    {!card.image && <span className="pdp__editorial-icon"><IconToken token={card.icon} size={24} /></span>}
                    <h3>{card.title}</h3>
                    {card.body && <p>{card.body}</p>}
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Additional sections would also be modularized in a full refactor */}
      {/* ... keeping the rest compact for now ... */}

      <div id="reviews"><ReviewsSection productId={product.id} /></div>

      <ProductDetailsSidebar 
        product={product} 
        showDetailsSidebar={showDetailsSidebar} 
        setShowDetailsSidebar={setShowDetailsSidebar} 
      />

      <RecommendationRow type="related" productId={product.id} title="Complete the Look" />
      <RecommendationRow type="trending" title="Global Bestsellers" />
      {user && <RecommendationRow type="recent" title="Pick up where you left off" />}
    </main>
  );
}
