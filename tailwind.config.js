/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        admin: {
          bg: '#ffffff', // MoltHub white primary
          surface: '#ffffff',
          'surface-subdued': '#f9fafb', // Zinc-50
          border: '#e4e4e7', // Zinc-200
          'border-subdued': '#f4f4f5', // Zinc-100
          primary: '#18181b', // Zinc-900 (High contrast)
          'primary-hover': '#27272a', // Zinc-800
          'primary-surface': '#f4f4f5', // Zinc-100
          'text-primary': '#09090b', // Zinc-950
          'text-secondary': '#3f3f46', // Zinc-700
          'text-subdued': '#71717a', // Zinc-500
          success: '#10b981', // Emerald-500
          'success-surface': '#ecfdf5',
          critical: '#ef4444', // Red-500
          'critical-surface': '#fef2f2',
          warning: '#f59e0b', // Amber-500
          'warning-surface': '#fffbeb',
        }
      },
      borderRadius: {
        'admin-sm': '4px',
        'admin-md': '6px', // MoltHub standard
        'admin-lg': '8px',
        'admin-xl': '12px', // Card standard
      },
      fontFamily: {
        admin: ['Inter', 'sans-serif'],
      },
      boxShadow: {
        'admin-sm': '0 1px 2px 0 rgba(0, 0, 0, 0.05)', // Subtle
        'admin-md': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      },
      letterSpacing: {
        tight: '-0.02em',
        tighter: '-0.05em',
      },
      spacing: {
        'admin-sidebar': '260px',
        'admin-header': '60px',
      }
    },
  },
  plugins: [],
}

