/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",  // ✅ Указываем где искать классы Tailwind
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}