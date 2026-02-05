/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: [
    "./index.html",
    "./index.tsx",
    "./App.tsx",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./context/**/*.{js,ts,jsx,tsx}",
    "./services/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#5D5FEF",
        "background-light": "#F8FAFC",
        "background-dark": "#0F172A",
        "card-light": "#FFFFFF",
        "card-dark": "#1E293B",
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
      },
      borderRadius: {
        DEFAULT: "1rem",
        xl: "1.5rem",
        "2xl": "1rem",
        "3xl": "1.5rem",
      },
      boxShadow: {
        'card': '0 4px 20px -4px rgba(0,0,0,0.08)',
        'nav': '0 -4px 30px rgba(0,0,0,0.15)',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
      },
    },
  },
  plugins: [],
}
