/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        "azul-principal": "#0094d2",
        "azul-hover": "#0077a8",
        "azul-claro": "#e6f3f9",
        "verde-principal": "#4caf50",
        "verde-hover": "#3d8b40",
        "verde-claro": "#e8f5e9",
        "verde-secundaria": "#2e7d32",
        "laranja-accent": "#fff3e0",
      },
      fontFamily: {
        sans: ['"Inter"', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
