/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        luxury: {
          bg: "#0d0a07",
          panel: "#15110c",
          border: "#2e2417",
          gold: "#c5a880",
          goldLight: "#e6c594",
          text: "#f5f0eb",
          textMuted: "#a39482",
          accent: "#c8815b",
        }
      },
    },
  },
  plugins: [],
}
