"""
Cozhaven Pydantic schemas.
"""
import re
from datetime import datetime
from typing import Any, List, Optional

from pydantic import BaseModel, EmailStr, Field, field_validator


class UserCreate(BaseModel):
    email: EmailStr
    password: str
    first_name: str
    last_name: str

    @field_validator("password")
    @classmethod
    def validate_password(cls, value: str) -> str:
        if len(value) < 8:
            raise ValueError("Password must be at least 8 characters long")
        if not re.search(r"[A-Z]", value):
            raise ValueError("Password must contain at least one uppercase letter")
        if not re.search(r"[a-z]", value):
            raise ValueError("Password must contain at least one lowercase letter")
        if not re.search(r"[0-9]", value):
            raise ValueError("Password must contain at least one digit")
        return value


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class ProductSEO(BaseModel):
    meta_title: Optional[str] = None
    meta_description: Optional[str] = None
    canonical_url: Optional[str] = None
    robots_directive: Optional[str] = None


class ScheduledPriceInput(BaseModel):
    id: Optional[int] = None
    label: Optional[str] = None
    product_id: Optional[int] = None
    variant_id: Optional[int] = None
    price: float
    compare_at_price: Optional[float] = None
    starts_at: str
    ends_at: Optional[str] = None
    is_active: bool = True


class ScheduledPriceResponse(BaseModel):
    id: int
    label: Optional[str] = None
    product_id: Optional[int] = None
    variant_id: Optional[int] = None
    price: Optional[float] = None
    compare_at_price: Optional[float] = None
    starts_at: Optional[str] = None
    ends_at: Optional[str] = None
    is_active: bool = True
    active_now: bool = False


class PromoCodeAdminInput(BaseModel):
    code: str
    type: str
    value: float
    description: Optional[str] = None
    is_active: bool = True
    expires_at: Optional[str] = None


class PromoCodeAdminResponse(BaseModel):
    id: int
    code: str
    type: str
    value: float
    description: Optional[str] = None
    is_active: bool = True
    expires_at: Optional[str] = None
    created_at: Optional[str] = None


class AdminAuditLogResponse(BaseModel):
    id: int
    entity_type: str
    entity_id: Optional[int] = None
    entity_label: Optional[str] = None
    action: str
    summary: str
    metadata: Optional[dict[str, Any]] = None
    performed_by: Optional[int] = None
    performed_by_name: Optional[str] = None
    created_at: Optional[Any] = None


class PaginatedAdminAuditLogs(BaseModel):
    items: List[AdminAuditLogResponse]
    total: int
    page: int
    limit: int
    pages: int


class AdminApprovalRequestResponse(BaseModel):
    id: int
    entity_type: str
    entity_id: Optional[int] = None
    action: str
    summary: str
    status: str
    is_stale: bool = False
    age_hours: float = 0.0
    requested_by: int
    requested_by_name: Optional[str] = None
    reviewed_by: Optional[int] = None
    reviewed_by_name: Optional[str] = None
    review_notes: Optional[str] = None
    payload: Optional[dict[str, Any]] = None
    created_at: Optional[Any] = None
    reviewed_at: Optional[Any] = None


class PaginatedAdminApprovalRequests(BaseModel):
    items: List[AdminApprovalRequestResponse]
    total: int
    page: int
    limit: int
    pages: int


class ApprovalDecisionInput(BaseModel):
    review_notes: Optional[str] = None


class ProductOptionValueInput(BaseModel):
    id: Optional[int] = None
    value: str
    display_value: Optional[str] = None
    position: Optional[int] = None


class ProductOptionInput(BaseModel):
    id: Optional[int] = None
    name: str
    position: Optional[int] = None
    values: List[ProductOptionValueInput] = []


class VariantSelectedOptionInput(BaseModel):
    option_name: str
    value: str
    display_value: Optional[str] = None


class VariantInput(BaseModel):
    id: Optional[int] = None
    title: str
    sku: Optional[str] = None
    slug: Optional[str] = None
    price: float
    compare_at_price: Optional[float] = None
    stock: int = 0
    status: str = "active"
    position: Optional[int] = None
    selected_options: Optional[List[VariantSelectedOptionInput]] = None


class ProductOptionValueResponse(BaseModel):
    id: int
    value: str
    display_value: Optional[str] = None
    position: Optional[int] = None


class ProductOptionResponse(BaseModel):
    id: int
    name: str
    position: Optional[int] = None
    values: List[ProductOptionValueResponse] = []


class VariantResponse(BaseModel):
    id: int
    title: str
    sku: str
    slug: Optional[str] = None
    price: Optional[float] = None
    compare_at_price: Optional[float] = None
    stock: int = 0
    available_quantity: int = 0
    reserved_quantity: int = 0
    reorder_threshold: int = 10
    track_inventory: bool = True
    status: str = "active"
    position: Optional[int] = None
    selected_options: List[VariantSelectedOptionInput] = []


class Product(BaseModel):
    id: int
    name: str
    slug: Optional[str] = None
    sku: Optional[str] = None
    product_type: Optional[str] = None
    price: float
    original_price: Optional[float] = None
    description: str
    short_description: Optional[str] = None
    brand: Optional[str] = None
    category: str
    category_id: Optional[int] = None
    subcategory: Optional[str] = None
    is_featured: bool = False
    stock: int
    images: List[str]
    colors: List[str] = []
    sizes: List[str] = []
    badge: Optional[str] = None
    sale_percent: Optional[int] = None
    reviews: int = 0
    specs: Optional[dict] = None
    materials: List[str] = []
    configurations: List[str] = []
    colorNames: List[str] = []
    is_canadian_made: bool = True
    status: str = "active"
    seo: Optional[ProductSEO] = None
    scheduledPrices: List[ScheduledPriceResponse] = []
    options: List[ProductOptionResponse] = []
    variants: List[VariantResponse] = []


class ProductCreate(BaseModel):
    name: str
    slug: Optional[str] = None
    sku: Optional[str] = None
    product_type: str = "simple"
    price: float
    original_price: Optional[float] = None
    description: Optional[str] = None
    short_description: Optional[str] = None
    brand: Optional[str] = None
    category: str
    category_id: Optional[int] = None
    subcategory: Optional[str] = None
    is_featured: bool = False
    stock: int = 0
    images: List[str] = []
    colors: List[str] = []
    sizes: List[str] = []
    badge: Optional[str] = None
    sale_percent: Optional[int] = None
    rating: float = 4.5
    reviews: int = 0
    specs: Optional[dict | str] = None
    materials: Optional[List[str]] = None
    configurations: Optional[List[str]] = None
    colorNames: Optional[List[str]] = None
    is_canadian_made: bool = True
    status: str = "active"
    seo: Optional[ProductSEO] = None
    options: Optional[List[ProductOptionInput]] = None
    variants: Optional[List[VariantInput]] = None


class ProductUpdate(BaseModel):
    name: Optional[str] = None
    slug: Optional[str] = None
    sku: Optional[str] = None
    product_type: Optional[str] = None
    price: Optional[float] = None
    original_price: Optional[float] = None
    description: Optional[str] = None
    short_description: Optional[str] = None
    brand: Optional[str] = None
    category: Optional[str] = None
    category_id: Optional[int] = None
    subcategory: Optional[str] = None
    is_featured: Optional[bool] = None
    stock: Optional[int] = None
    images: Optional[List[str]] = None
    colors: Optional[List[str]] = None
    sizes: Optional[List[str]] = None
    badge: Optional[str] = None
    sale_percent: Optional[int] = None
    rating: Optional[float] = None
    reviews: Optional[int] = None
    specs: Optional[dict | str] = None
    materials: Optional[List[str]] = None
    configurations: Optional[List[str]] = None
    colorNames: Optional[List[str]] = None
    is_canadian_made: Optional[bool] = None
    status: Optional[str] = None
    seo: Optional[ProductSEO] = None
    options: Optional[List[ProductOptionInput]] = None
    variants: Optional[List[VariantInput]] = None


class ProductAdminListItem(BaseModel):
    id: int
    name: str
    slug: Optional[str] = None
    sku: Optional[str] = None
    brand: Optional[str] = None
    category: str
    category_id: Optional[int] = None
    is_featured: bool = False
    status: str
    stock: int
    price: float
    product_type: Optional[str] = None
    image: Optional[str] = None
    created_at: Optional[Any] = None
    updated_at: Optional[Any] = None


class PaginatedAdminProducts(BaseModel):
    items: List[ProductAdminListItem]
    total: int
    page: int
    limit: int
    pages: int


class InventoryAdjustmentRequest(BaseModel):
    variant_id: int
    adjustment_type: str = "increase"
    quantity: int = 0
    reason: str
    reference_type: Optional[str] = "admin_manual"
    reference_id: Optional[str] = None
    reorder_threshold: Optional[int] = None
    track_inventory: Optional[bool] = None

    @field_validator("adjustment_type")
    @classmethod
    def validate_adjustment_type(cls, value: str) -> str:
        allowed = {"increase", "decrease", "set"}
        if value not in allowed:
            raise ValueError(f"adjustment_type must be one of: {', '.join(sorted(allowed))}")
        return value

    @field_validator("quantity")
    @classmethod
    def validate_quantity(cls, value: int) -> int:
        if value < 0:
            raise ValueError("quantity must be zero or greater")
        return value

    @field_validator("reorder_threshold")
    @classmethod
    def validate_threshold(cls, value: Optional[int]) -> Optional[int]:
        if value is not None and value < 0:
            raise ValueError("reorder_threshold must be zero or greater")
        return value


class InventoryAdjustmentRecord(BaseModel):
    id: int
    variant_id: Optional[int] = None
    variant_title: Optional[str] = None
    sku: Optional[str] = None
    delta: int
    reason: str
    reference_type: Optional[str] = None
    reference_id: Optional[str] = None
    performed_by: Optional[int] = None
    performed_by_name: Optional[str] = None
    created_at: Optional[Any] = None


class InventoryHistoryResponse(BaseModel):
    product_id: int
    items: List[InventoryAdjustmentRecord]


class InventoryAdjustmentResult(BaseModel):
    product_id: int
    product_stock: int
    variant: VariantResponse
    adjustment: Optional[InventoryAdjustmentRecord] = None


class InventoryWorkbenchSummary(BaseModel):
    tracked_items: int
    total_on_hand: int
    low_stock_count: int
    out_of_stock_count: int


class InventoryWorkbenchItem(BaseModel):
    product_id: int
    product_name: str
    product_slug: Optional[str] = None
    product_status: str
    category: str
    variant_id: int
    variant_title: str
    sku: str
    available_quantity: int = 0
    reserved_quantity: int = 0
    reorder_threshold: int = 10
    track_inventory: bool = True
    price: Optional[float] = None
    updated_at: Optional[Any] = None


class PaginatedInventoryWorkbench(BaseModel):
    items: List[InventoryWorkbenchItem]
    summary: InventoryWorkbenchSummary
    total: int
    page: int
    limit: int
    pages: int


class CartItem(BaseModel):
    product_id: int
    quantity: int
    color: Optional[str] = None
    size: Optional[str] = None


class Order(BaseModel):
    user_id: int
    items: List[CartItem]
    shipping_address: str
    payment_method: str


class OrderStatusUpdate(BaseModel):
    status: str


class CheckoutItem(BaseModel):
    product_id: Any
    quantity: int
    color: Optional[str] = None
    size: Optional[str] = None


class CheckoutRequest(BaseModel):
    items: List[CheckoutItem]
    shipping_method: str = "standard"
    province: str = "ON"
    promo_code: Optional[str] = None
    email: Optional[str] = None
    shipping_address: Optional[Any] = None


class PromoCodeRequest(BaseModel):
    code: str
    subtotal: float


class UserRoleUpdate(BaseModel):
    role: str


class CollectionBrief(BaseModel):
    id: int
    name: str
    slug: str
    description: Optional[str] = None
    image_url: Optional[str] = None
    is_featured: bool = False

    class Config:
        from_attributes = True


class Collection(CollectionBrief):
    products: List[Product] = []


class SEOEntryBase(BaseModel):
    meta_title: Optional[str] = None
    meta_description: Optional[str] = None
    canonical_url: Optional[str] = None
    robots_directive: Optional[str] = None


class SEOEntryResponse(SEOEntryBase):
    id: int


class PageSectionResponse(BaseModel):
    id: int
    page_id: int
    section_type: str
    position: int
    config: Optional[dict] = None


class PageBase(BaseModel):
    title: str
    slug: str
    status: str = "draft"
    template: str = "default"
    seo: Optional[SEOEntryBase] = None
    published_at: Optional[Any] = None


class PageResponse(PageBase):
    id: int
    seo_id: Optional[int] = None
    seo: Optional[SEOEntryResponse] = None
    sections: List[PageSectionResponse] = []
    created_at: Optional[Any] = None
    updated_at: Optional[Any] = None

    class Config:
        from_attributes = True


class BlogPostBase(BaseModel):
    title: str
    slug: str
    excerpt: Optional[str] = None
    body: Optional[str] = None
    featured_image: Optional[str] = None
    category: Optional[str] = None
    read_time: Optional[str] = None
    status: str = "draft"
    seo: Optional[SEOEntryBase] = None
    published_at: Optional[Any] = None


class BlogPostResponse(BlogPostBase):
    id: int
    author_id: Optional[int] = None
    author_name: Optional[str] = None
    seo_id: Optional[int] = None
    seo: Optional[SEOEntryResponse] = None
    created_at: Optional[Any] = None
    updated_at: Optional[Any] = None

    class Config:
        from_attributes = True


class ContentBlockBase(BaseModel):
    name: str
    block_type: str
    content_json: Optional[str] = None


class ContentBlockResponse(ContentBlockBase):
    id: int
    created_at: Optional[Any] = None
    updated_at: Optional[Any] = None

    class Config:
        from_attributes = True


class BulkActionFilters(BaseModel):
    q: Optional[str] = None
    category: Optional[str] = None
    brand: Optional[str] = None
    collection_id: Optional[int] = None
    is_featured: Optional[bool] = None
    status: Optional[str] = None
    stock: Optional[str] = None
    min_price: Optional[float] = None
    max_price: Optional[float] = None


class BulkActionRequest(BaseModel):
    ids: Optional[List[int]] = None
    filters: Optional[BulkActionFilters] = None
    apply_to_all: bool = False


class BulkStatusUpdate(BulkActionRequest):
    status: str


class BulkPriceUpdate(BulkActionRequest):
    percentage: Optional[float] = None
    fixed_adjustment: Optional[float] = None


class BackgroundJobResponse(BaseModel):
    id: int
    job_type: str
    status: str
    progress: int
    message: Optional[str] = None
    file_path: Optional[str] = None
    created_at: Optional[Any] = None
    completed_at: Optional[Any] = None


class PaginatedBackgroundJobs(BaseModel):
    items: List[BackgroundJobResponse]
    total: int
    page: int
    limit: int
    pages: int


class CategoryCreate(BaseModel):
    name: str
    slug: Optional[str] = None
    description: Optional[str] = None
    image_url: Optional[str] = None
    parent_id: Optional[int] = None
    position: int = 0


class CategoryUpdate(BaseModel):
    name: Optional[str] = None
    slug: Optional[str] = None
    description: Optional[str] = None
    image_url: Optional[str] = None
    parent_id: Optional[int] = None
    position: Optional[int] = None


class CategoryResponse(BaseModel):
    id: int
    name: str
    slug: str
    description: Optional[str] = None
    image_url: Optional[str] = None
    parent_id: Optional[int] = None
    position: int = 0
    created_at: Optional[Any] = None
    class Config:
        from_attributes = True


# MERCHANDISING (Phase 4)
class PriceListEntryBase(BaseModel):
    variant_id: int
    price: float
    compare_at_price: Optional[float] = None

class PriceListEntryResponse(PriceListEntryBase):
    pass

class PriceListBase(BaseModel):
    name: str = Field(..., min_length=2)
    description: Optional[str] = None
    is_active: int = 1
    priority: int = 0

class PriceListResponse(PriceListBase):
    id: int
    created_at: datetime
    entries_count: int = 0

    class Config:
        from_attributes = True

class CustomerSegmentBase(BaseModel):
    name: str
    description: Optional[str] = None
    rule_type: str = "manual"
    rule_config_json: Optional[str] = "{}"

class CustomerSegmentResponse(CustomerSegmentBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True

class DiscountRuleBase(BaseModel):
    name: str
    discount_type: str # percentage, fixed
    value: float
    min_order_amount: Optional[float] = None
    apply_to_type: str = "all"
    apply_to_id: Optional[int] = None
    is_active: int = 1
    priority: int = 0

class DiscountRuleResponse(DiscountRuleBase):
    id: int

class PromotionCampaignBase(BaseModel):
    name: str
    description: Optional[str] = None
    status: str = "draft"
    starts_at: Optional[datetime] = None
    ends_at: Optional[datetime] = None

class PromotionCampaignResponse(PromotionCampaignBase):
    id: int
    created_at: datetime
    rules: List[DiscountRuleResponse] = []

    class Config:
        from_attributes = True


# TRANSLATIONS (Phase 5)
class ProductTranslationBase(BaseModel):
    product_id: int
    locale: str
    name: Optional[str] = None
    description: Optional[str] = None
    slug: Optional[str] = None

class PageTranslationBase(BaseModel):
    page_id: int
    locale: str
    title: Optional[str] = None
    slug: Optional[str] = None
    content_json: Optional[str] = None

class BlogTranslationBase(BaseModel):
    post_id: int
    locale: str
    title: Optional[str] = None
    slug: Optional[str] = None
    excerpt: Optional[str] = None
    body: Optional[str] = None

