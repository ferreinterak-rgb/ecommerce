/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          orange: "#f48f25",
          "orange-dark": "#e07d10",
          "orange-light": "#ff8a00",
          black: "#111111",
          dark: "#1a1a1a",
          light: "#f8fafc",
          surface: "#f1f5f9",
          border: "#e2e8f0"
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'glass-sm': '0 4px 20px 0 rgba(0, 0, 0, 0.04)',
        'glass': '0 10px 30px 0 rgba(0, 0, 0, 0.06)',
        'glass-lg': '0 20px 40px -15px rgba(0, 0, 0, 0.08)',
        'glow-orange': '0 0 25px rgba(244, 143, 37, 0.35)',
      },
      borderRadius: {
        '3xl': '24px',
        '4xl': '32px',
      }
    },
  },
  plugins: [],
}
