import { IconToken, asArray } from './utils';

export default function ProductStory({ product, featureHighlightBadges, videoEmbedUrl }) {

  if (!product.lifestyleTitle && !product.lifestyleDescription && asArray(product.lifestyleImages).length === 0 && !product.description && !videoEmbedUrl) {
    return null;
  }

  return (
    <>
      {/* Video section */}
      {videoEmbedUrl && (
        <section className="pdp__video-section">
          <div className="pdp__video-wrap">
            <iframe
              src={videoEmbedUrl}
              title={`${product.name} video`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </section>
      )}

      {/* Story section */}
      {(product.lifestyleTitle || product.lifestyleDescription || asArray(product.lifestyleImages).length > 0 || product.description) && (
        <section className="pdp__story-section">
          <div className="container">
            <div className="pdp__story-grid">
              <div className="pdp__story-content">
                <h2 className="pdp__story-title">{product.lifestyleTitle || 'Designed for Everyday Living'}</h2>
                <p className="pdp__story-text">{product.lifestyleDescription || product.shortDescription || product.description}</p>
                {featureHighlightBadges.length > 0 && (
                  <div className="pdp__highlight-badges">
                    {featureHighlightBadges.map((badge, i) => (
                      <div key={i} className="pdp__highlight-badge">
                        <IconToken token={badge.icon} size={18} />
                        <span>{badge.title}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="pdp__story-image">
                <img
                  src={asArray(product.lifestyleImages)[0] || (product.images && product.images[product.images.length > 1 ? 1 : 0]) || product.image}
                  alt={product.lifestyleTitle || product.name}
                />
              </div>
            </div>
          </div>
        </section>
      )}
    </>
  );
}
