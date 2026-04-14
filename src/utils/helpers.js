export const jsonSafeParse = (str, fallback = null) => {
  if (!str) return fallback;
  try {
    return JSON.parse(str);
  } catch (e) {
    console.error("JSON Parse Error:", e, str);
    return fallback;
  }
};

export const titleize = (value) =>
  String(value || '')
    .replace(/[_-]+/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase())
    .trim();
