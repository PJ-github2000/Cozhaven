import { Truck, Shield, RotateCcw, CreditCard, Package, Sparkles, Layers, Ruler, Check } from 'lucide-react';

export const asArray = (value) => (Array.isArray(value) ? value.filter(Boolean) : []);
export const asObject = (value) => (value && typeof value === 'object' && !Array.isArray(value) ? value : null);

export const titleize = (value) =>
  String(value || '')
    .replace(/[_-]+/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase())
    .trim();

export const iconMap = {
  truck: Truck,
  delivery: Truck,
  shipping: Truck,
  warranty: Shield,
  shield: Shield,
  returns: RotateCcw,
  return: RotateCcw,
  finance: CreditCard,
  financing: CreditCard,
  credit: CreditCard,
  package: Package,
  bundle: Package,
  sparkles: Sparkles,
  feature: Sparkles,
  modular: Layers,
  layout: Layers,
  dimensions: Ruler,
  ruler: Ruler,
  check: Check,
};

export const IconToken = ({ token, size = 18 }) => {
  const Icon = iconMap[String(token || '').toLowerCase()] || Sparkles;
  return <Icon size={size} />;
};

export const getVideoEmbedUrl = (url) => {
  if (!url) return null;
  if (url.includes('youtube.com/watch?v=')) {
    return url.replace('watch?v=', 'embed/');
  }
  if (url.includes('youtu.be/')) {
    return url.replace('youtu.be/', 'youtube.com/embed/');
  }
  return url;
};
