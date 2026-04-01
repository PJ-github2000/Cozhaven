const PRODUCTS = []; // Cleared old Shopify products

export const CATEGORIES = [
  { id: "living-room", name: "Living Room Sets", image: "/assets/Living room Image 9.jpg", count: "35+" },
  { id: "sectionals", name: "Sectionals", image: "/assets/Image 4 sectional.jpg", count: "48+" },
  { id: "sofas", name: "Sofas", image: "/assets/Image 3 category modular.jpg", count: "112+" },
  { id: "dining", name: "Dining Sets", image: "/assets/Image 6 dining.webp", count: "42+" },
  { id: "bedroom", name: "Bedroom", image: "/assets/Image 5 Bed category.webp", count: "38+" },
  { id: "tables", name: "Tables & Coffee Tables", image: "/assets/Image 7 coffee table.jpg", count: "28+" },
  { id: "chairs", name: "Accent Chairs", image: "/assets/Image 8 Accent chair.png", count: "72+" },
  { id: "lighting", name: "Lighting", image: "/assets/Others Image 4.jpg", count: "15+" },
  { id: "vanity", name: "Vanity & Decor", image: "/assets/Others Image 3.jpg", count: "25+" },
];

export const REVIEWS = [
  { id: 1, name: "Jason Maxwell", rating: 5, text: "I have to admit, I was somewhat apprehensive about ordering furniture online, but Cozhaven exceeded every expectation. The quality is outstanding, delivery was right on schedule, and the customer service team was incredibly helpful throughout the entire process.", avatar: "JM", date: "2024-12-15", product: "Designer Sectional" },
  { id: 2, name: "Eileen Heckel", rating: 5, text: "Love my new vanity!! Great price and quick delivery! The craftsmanship is impeccable and it looks even better in person than in the photos.", avatar: "EH", date: "2025-01-08", product: "Designer Vanity" },
  { id: 3, name: "Rebecca Bolton", rating: 5, text: "Our experience in dealing with Cozhaven has been absolutely wonderful. The selection is curated perfectly and the quality speaks for itself.", avatar: "RB", date: "2025-01-22", product: "Marble Dining Set" }
];

export const BLOG_POSTS = [
  { id: 1, title: "5 Tips for Choosing the Perfect Sofa", excerpt: "Your sofa is the centerpiece of your living room. Here's how to find the one that's perfect for your space, style, and lifestyle.", image: "https://atunusfurniture.com/wp-content/uploads/2025/04/Sky-Cloud-Deluxe-Adjustable-Sectional-Sofa-Comfort-Versatility-102-Inch-Velvet-Chaise-Sectionals-3-Seaters-Atunus-10.webp", date: "2025-02-28", readTime: "5 min", category: "Living Room" },
  { id: 2, title: "Dining Room Trends for 2026", excerpt: "From live-edge tables to mixed seating, discover the dining room trends that are defining modern entertaining.", image: "https://atunusfurniture.com/wp-content/uploads/2025/06/53-Inch-Modern-Round-Dining-Table-1-1750239721.webp", date: "2025-02-15", readTime: "4 min", category: "Dining" },
];

export default PRODUCTS;
