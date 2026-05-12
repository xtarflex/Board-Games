/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        obsidian: {
          900: '#020617', // Main bg
          800: '#0f172a', // Cards
          700: '#1e293b', // Borders/Hover
        },
        indigo: {
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5',
        },
        rose: {
          400: '#fb7185',
          500: '#f43f5e',
          600: '#e11d48',
        }
      },
      borderRadius: {
        '4xl': '3rem',
      },
      boxShadow: {
        'neon-indigo': '0 0 20px -5px rgba(99, 102, 241, 0.4)',
        'neon-rose': '0 0 20px -5px rgba(244, 63, 94, 0.4)',
        'deep': '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }
    },
  },
  plugins: [],
}
