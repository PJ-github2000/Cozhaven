"""
Cozhaven SQLAlchemy models.
Declarative models for users, catalog, orders, and supporting operations.
"""
from sqlalchemy import Column, Integer, String, Float, Text, ForeignKey, DateTime, func, Numeric, UniqueConstraint
from sqlalchemy.orm import DeclarativeBase, relationship


class Base(DeclarativeBase):
    pass


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    first_name = Column(String, nullable=False)
    last_name = Column(String, nullable=False)
    role = Column(String, default="customer")
    created_at = Column(DateTime, server_default=func.now())

    orders = relationship("Order", back_populates="user")
    audit_logs = relationship("AdminAuditLog", back_populates="user")
    requested_approvals = relationship("AdminApprovalRequest", back_populates="requested_by_user", foreign_keys="AdminApprovalRequest.requested_by")
    reviewed_approvals = relationship("AdminApprovalRequest", back_populates="reviewed_by_user", foreign_keys="AdminApprovalRequest.reviewed_by")


class Category(Base):
    __tablename__ = "categories"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    slug = Column(String, unique=True, index=True, nullable=False)
    description = Column(Text)
    image_url = Column(String)
    parent_id = Column(Integer, ForeignKey("categories.id"), nullable=True, index=True)
    position = Column(Integer, default=0)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    parent = relationship("Category", remote_side="Category.id", backref="children")
    products = relationship("Product", back_populates="category_ref")


class Collection(Base):
    __tablename__ = "collections"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    slug = Column(String, unique=True, index=True, nullable=False)
    description = Column(Text)
    image_url = Column(String)
    is_featured = Column(Integer, default=0)
    created_at = Column(DateTime, server_default=func.now())

    products = relationship("Product", back_populates="collection")


class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    slug = Column(String, unique=True, index=True, nullable=True)
    product_type = Column(String, index=True, default="simple")
    price = Column(Numeric(10, 2), nullable=False)
    original_price = Column(Numeric(10, 2))
    description = Column(Text)
    short_description = Column(Text)
    brand = Column(String, nullable=True, index=True)
    category = Column(String, index=True, nullable=False)
    category_id = Column(Integer, ForeignKey("categories.id"), nullable=True, index=True)
    subcategory = Column(String)
    is_featured = Column(Integer, default=0, index=True)
    stock = Column(Integer, default=0)
    images = Column(Text)
    colors = Column(Text)
    sizes = Column(Text)
    badge = Column(String)
    sale_percent = Column(Integer)
    rating = Column(Float, default=4.5)
    reviews = Column(Integer, default=0)
    specs = Column(Text)
    materials = Column(Text)
    configurations = Column(Text)
    colorNames = Column(Text)
    is_canadian_made = Column(Integer, default=1)
    status = Column(String, index=True, default="active")
    collection_id = Column(Integer, ForeignKey("collections.id"), nullable=True)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    category_ref = relationship("Category", back_populates="products")
    collection = relationship("Collection", back_populates="products")
    options = relationship("ProductOption", back_populates="product", cascade="all, delete-orphan")
    variants = relationship("Variant", back_populates="product", cascade="all, delete-orphan")
    seo = relationship("ProductSEO", back_populates="product", uselist=False, cascade="all, delete-orphan")
    scheduled_prices = relationship("ScheduledPrice", back_populates="product", cascade="all, delete-orphan")
    related_links = relationship("RelatedProduct", foreign_keys=[RelatedProduct.product_id], back_populates="product", cascade="all, delete-orphan")
    recent_views = relationship("UserRecentView", backref="product", cascade="all, delete-orphan")


class ProductOption(Base):
    __tablename__ = "product_options"

    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False, index=True)
    name = Column(String, nullable=False)
    position = Column(Integer, default=0)

    product = relationship("Product", back_populates="options")
    values = relationship("ProductOptionValue", back_populates="option", cascade="all, delete-orphan")


class ProductOptionValue(Base):
    __tablename__ = "product_option_values"

    id = Column(Integer, primary_key=True, index=True)
    option_id = Column(Integer, ForeignKey("product_options.id"), nullable=False, index=True)
    value = Column(String, nullable=False)
    display_value = Column(String)
    position = Column(Integer, default=0)

    option = relationship("ProductOption", back_populates="values")
    variant_links = relationship("VariantOptionValue", back_populates="option_value", cascade="all, delete-orphan")


class Variant(Base):
    __tablename__ = "variants"
    __table_args__ = (
        UniqueConstraint("product_id", "position", name="uq_variants_product_position"),
    )

    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False, index=True)
    title = Column(String, nullable=False)
    sku = Column(String, unique=True, index=True, nullable=False)
    barcode = Column(String, index=True)
    slug = Column(String, index=True)
    price = Column(Numeric(10, 2), nullable=False)
    compare_at_price = Column(Numeric(10, 2))
    cost = Column(Numeric(10, 2))
    status = Column(String, index=True, default="active")
    weight = Column(Float)
    position = Column(Integer, default=1)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    product = relationship("Product", back_populates="variants")
    option_links = relationship("VariantOptionValue", back_populates="variant", cascade="all, delete-orphan")
    inventory_item = relationship("InventoryItem", back_populates="variant", uselist=False, cascade="all, delete-orphan")
    media_assets = relationship("MediaAsset", back_populates="variant", cascade="all, delete-orphan")
    scheduled_prices = relationship("ScheduledPrice", back_populates="variant", cascade="all, delete-orphan")


class VariantOptionValue(Base):
    __tablename__ = "variant_option_values"

    variant_id = Column(Integer, ForeignKey("variants.id"), primary_key=True)
    option_value_id = Column(Integer, ForeignKey("product_option_values.id"), primary_key=True)

    variant = relationship("Variant", back_populates="option_links")
    option_value = relationship("ProductOptionValue", back_populates="variant_links")


class InventoryItem(Base):
    __tablename__ = "inventory_items"

    id = Column(Integer, primary_key=True, index=True)
    variant_id = Column(Integer, ForeignKey("variants.id"), nullable=False, unique=True, index=True)
    available_quantity = Column(Integer, default=0)
    reserved_quantity = Column(Integer, default=0)
    reorder_threshold = Column(Integer, default=10)
    track_inventory = Column(Integer, default=1)
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    variant = relationship("Variant", back_populates="inventory_item")
    adjustments = relationship("InventoryAdjustment", back_populates="inventory_item", cascade="all, delete-orphan")


class InventoryAdjustment(Base):
    __tablename__ = "inventory_adjustments"

    id = Column(Integer, primary_key=True, index=True)
    inventory_item_id = Column(Integer, ForeignKey("inventory_items.id"), nullable=False, index=True)
    delta = Column(Integer, nullable=False)
    reason = Column(String, nullable=False)
    reference_type = Column(String)
    reference_id = Column(String)
    performed_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime, server_default=func.now())

    inventory_item = relationship("InventoryItem", back_populates="adjustments")


class MediaAsset(Base):
    __tablename__ = "media_assets"

    id = Column(Integer, primary_key=True, index=True)
    owner_type = Column(String, nullable=False, default="product")
    owner_id = Column(Integer, nullable=False, index=True)
    variant_id = Column(Integer, ForeignKey("variants.id"), nullable=True, index=True)
    type = Column(String, nullable=False, default="image")
    url = Column(String, nullable=False)
    alt_text = Column(String)
    position = Column(Integer, default=0)
    metadata_json = Column(Text)
    created_at = Column(DateTime, server_default=func.now())

    variant = relationship("Variant", back_populates="media_assets")


class ProductSEO(Base):
    __tablename__ = "product_seo"

    product_id = Column(Integer, ForeignKey("products.id"), primary_key=True)
    meta_title = Column(String)
    meta_description = Column(Text)
    canonical_url = Column(String)
    robots_directive = Column(String)
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    product = relationship("Product", back_populates="seo")


class ScheduledPrice(Base):
    __tablename__ = "scheduled_prices"

    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=True, index=True)
    variant_id = Column(Integer, ForeignKey("variants.id"), nullable=True, index=True)
    label = Column(String)
    price = Column(Numeric(10, 2), nullable=False)
    compare_at_price = Column(Numeric(10, 2))
    starts_at = Column(DateTime, nullable=False, index=True)
    ends_at = Column(DateTime, nullable=True, index=True)
    is_active = Column(Integer, default=1, index=True)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    product = relationship("Product", back_populates="scheduled_prices")
    variant = relationship("Variant", back_populates="scheduled_prices")


class Order(Base):
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), index=True, nullable=True)
    guest_email = Column(String, index=True)
    guest_name = Column(String)
    total_amount = Column(Numeric(10, 2), nullable=False)
    subtotal = Column(Numeric(10, 2), default=0.0)
    tax_amount = Column(Numeric(10, 2), default=0.0)
    shipping_cost = Column(Numeric(10, 2), default=0.0)
    discount_amount = Column(Numeric(10, 2), default=0.0)
    promo_code = Column(String)
    status = Column(String, index=True, default="pending")
    shipping_address = Column(Text, nullable=False)
    payment_method = Column(String, nullable=False)
    created_at = Column(DateTime, server_default=func.now())

    user = relationship("User", back_populates="orders")
    items = relationship("OrderItem", back_populates="order")


class OrderItem(Base):
    __tablename__ = "order_items"

    id = Column(Integer, primary_key=True)
    order_id = Column(Integer, ForeignKey("orders.id"), index=True, nullable=False)
    product_id = Column(Integer, ForeignKey("products.id"), index=True, nullable=False)
    quantity = Column(Integer, nullable=False)
    price = Column(Numeric(10, 2), nullable=False)
    color = Column(String)
    size = Column(String)

    order = relationship("Order", back_populates="items")


class PromoCode(Base):
    __tablename__ = "promo_codes"

    id = Column(Integer, primary_key=True, index=True)
    code = Column(String, unique=True, index=True, nullable=False)
    type = Column(String, nullable=False)
    value = Column(Numeric(10, 2), nullable=False)
    description = Column(String)
    is_active = Column(Integer, default=1)
    expires_at = Column(DateTime)
    created_at = Column(DateTime, server_default=func.now())


class PriceList(Base):
    __tablename__ = "price_lists"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    description = Column(String)
    is_active = Column(Integer, default=1)
    priority = Column(Integer, default=0)
    created_at = Column(DateTime, server_default=func.now())

    entries = relationship("PriceListEntry", back_populates="price_list", cascade="all, delete-orphan")


class PriceListEntry(Base):
    __tablename__ = "price_list_entries"
    price_list_id = Column(Integer, ForeignKey("price_lists.id"), primary_key=True)
    variant_id = Column(Integer, ForeignKey("variants.id"), primary_key=True)
    price = Column(Numeric(10, 2), nullable=False)
    compare_at_price = Column(Numeric(10, 2))

    price_list = relationship("PriceList", back_populates="entries")
    variant = relationship("Variant")


class CustomerSegment(Base):
    __tablename__ = "customer_segments"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, nullable=False)
    description = Column(String)
    rule_type = Column(String) # e.g., "manual", "spending_threshold"
    rule_config_json = Column(Text)
    created_at = Column(DateTime, server_default=func.now())

    price_lists = relationship("PriceList", secondary="segment_price_lists")


class SegmentPriceList(Base):
    __tablename__ = "segment_price_lists"
    segment_id = Column(Integer, ForeignKey("customer_segments.id"), primary_key=True)
    price_list_id = Column(Integer, ForeignKey("price_lists.id"), primary_key=True)


class PromotionCampaign(Base):
    __tablename__ = "promotion_campaigns"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    description = Column(String)
    status = Column(String, default="draft") # draft, active, ended, rolled_back
    starts_at = Column(DateTime, index=True)
    ends_at = Column(DateTime, index=True)
    created_at = Column(DateTime, server_default=func.now())

    discount_rules = relationship("DiscountRule", back_populates="campaign", cascade="all, delete-orphan")


class DiscountRule(Base):
    __tablename__ = "discount_rules"
    id = Column(Integer, primary_key=True, index=True)
    campaign_id = Column(Integer, ForeignKey("promotion_campaigns.id"), nullable=True)
    name = Column(String, nullable=False)
    discount_type = Column(String, nullable=False) # percentage, fixed
    value = Column(Numeric(10, 2), nullable=False)
    min_order_amount = Column(Numeric(10, 2))
    apply_to_type = Column(String, default="all") # all, category, collection, product
    apply_to_id = Column(Integer)
    is_active = Column(Integer, default=1)
    priority = Column(Integer, default=0)

    campaign = relationship("PromotionCampaign", back_populates="discount_rules")


class AdminAuditLog(Base):
    __tablename__ = "admin_audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    entity_type = Column(String, nullable=False, index=True)
    entity_id = Column(Integer, nullable=True, index=True)
    entity_label = Column(String)
    action = Column(String, nullable=False, index=True)
    summary = Column(String, nullable=False)
    metadata_json = Column(Text)
    performed_by = Column(Integer, ForeignKey("users.id"), nullable=True, index=True)
    created_at = Column(DateTime, server_default=func.now(), index=True)

    user = relationship("User", back_populates="audit_logs")


class AdminApprovalRequest(Base):
    __tablename__ = "admin_approval_requests"

    id = Column(Integer, primary_key=True, index=True)
    entity_type = Column(String, nullable=False, index=True)
    entity_id = Column(Integer, nullable=True, index=True)
    action = Column(String, nullable=False, index=True)
    summary = Column(String, nullable=False)
    payload_json = Column(Text, nullable=False)
    status = Column(String, nullable=False, default="pending", index=True)
    requested_by = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    reviewed_by = Column(Integer, ForeignKey("users.id"), nullable=True, index=True)
    review_notes = Column(Text)
    created_at = Column(DateTime, server_default=func.now(), index=True)
    reviewed_at = Column(DateTime)

    requested_by_user = relationship("User", back_populates="requested_approvals", foreign_keys=[requested_by])
    reviewed_by_user = relationship("User", back_populates="reviewed_approvals", foreign_keys=[reviewed_by])


class SEOEntry(Base):
    __tablename__ = "seo_entries"

    id = Column(Integer, primary_key=True, index=True)
    meta_title = Column(String)
    meta_description = Column(Text)
    canonical_url = Column(String)
    robots_directive = Column(String)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())


class Page(Base):
    __tablename__ = "pages"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    slug = Column(String, unique=True, index=True, nullable=False)
    status = Column(String, default="draft", index=True)
    template = Column(String, default="default")
    seo_id = Column(Integer, ForeignKey("seo_entries.id"), nullable=True)
    published_at = Column(DateTime)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    seo = relationship("SEOEntry", uselist=False)
    sections = relationship("PageSection", back_populates="page", cascade="all, delete-orphan", order_by="PageSection.position")


class PageSection(Base):
    __tablename__ = "page_sections"

    id = Column(Integer, primary_key=True, index=True)
    page_id = Column(Integer, ForeignKey("pages.id"), nullable=False, index=True)
    section_type = Column(String, nullable=False)
    position = Column(Integer, default=0)
    config_json = Column(Text)

    page = relationship("Page", back_populates="sections")


class SectionTemplate(Base):
    __tablename__ = "section_templates"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    section_type = Column(String, nullable=False)
    default_config_json = Column(Text)


class BlogPost(Base):
    __tablename__ = "blog_posts"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    slug = Column(String, unique=True, index=True, nullable=False)
    excerpt = Column(Text)
    body = Column(Text)
    featured_image = Column(String)
    author_id = Column(Integer, ForeignKey("users.id"), nullable=True, index=True)
    category = Column(String, index=True)
    read_time = Column(String)
    status = Column(String, default="draft", index=True)
    published_at = Column(DateTime)
    seo_id = Column(Integer, ForeignKey("seo_entries.id"), nullable=True)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    author = relationship("User")
    seo = relationship("SEOEntry", uselist=False)


class ContentBlock(Base):
    __tablename__ = "content_blocks"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True, nullable=False)
    block_type = Column(String, nullable=False, index=True)
    content_json = Column(Text)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())


class BackgroundJob(Base):
    __tablename__ = "background_jobs"

    id = Column(Integer, primary_key=True, index=True)
    job_type = Column(String, nullable=False, index=True)
    status = Column(String, default="pending", index=True)
    progress = Column(Integer, default=0)
    message = Column(String)
    payload_json = Column(Text)
    result_json = Column(Text)
    file_path = Column(String)
    performed_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime, server_default=func.now())
    completed_at = Column(DateTime)

    user = relationship("User")


class ProductTranslation(Base):
    __tablename__ = "product_translations"
    product_id = Column(Integer, ForeignKey("products.id"), primary_key=True)
    locale = Column(String, primary_key=True)
    name = Column(String)
    description = Column(Text)
    slug = Column(String, index=True)
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

class PageTranslation(Base):
    __tablename__ = "page_translations"
    page_id = Column(Integer, ForeignKey("pages.id"), primary_key=True)
    locale = Column(String, primary_key=True)
    title = Column(String)
    slug = Column(String, index=True)
    content_json = Column(Text)
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

class BlogTranslation(Base):
    __tablename__ = "blog_translations"
    post_id = Column(Integer, ForeignKey("blog_posts.id"), primary_key=True)
    locale = Column(String, primary_key=True)
    title = Column(String)
    slug = Column(String, index=True)
    excerpt = Column(Text)
    body = Column(Text)
# DISCOVERY & RECOMMENDATIONS (Phase 6)
class RelatedProduct(Base):
    __tablename__ = "related_products"
    product_id = Column(Integer, ForeignKey("products.id"), primary_key=True)
    related_id = Column(Integer, ForeignKey("products.id"), primary_key=True)
    relation_type = Column(String, default="cross_sell") # cross_sell, up_sell, similar
    position = Column(Integer, default=0)

    product = relationship("Product", foreign_keys=[product_id], back_populates="related_links")
    related = relationship("Product", foreign_keys=[related_id])

class UserRecentView(Base):
    __tablename__ = "user_recent_views"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), index=True, nullable=False)
    product_id = Column(Integer, ForeignKey("products.id"), index=True, nullable=False)
    viewed_at = Column(DateTime, server_default=func.now(), onupdate=func.now())


# Update User model to include background_jobs
User.background_jobs = relationship("BackgroundJob", back_populates="user")
