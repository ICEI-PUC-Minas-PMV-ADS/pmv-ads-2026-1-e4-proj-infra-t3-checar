/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'checar-fundo': '#00112b',
        'checar-card': '#0052cc',
        'checar-ciano': '#0099cc',
        'checar-ciano-claro': '#33ccff',
        'checar-header': '#002b45',
      },
    },
  },
  plugins: [],
}