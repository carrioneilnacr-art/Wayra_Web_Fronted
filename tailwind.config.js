/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}", // 👈 Asegúrate de que termine en js, ts, jsx, tsx
  ],
  darkMode: 'class', // 👈 Esto le dice a Tailwind que escuche al F12
  theme: {
    extend: {},
  },
  plugins: [],
}