/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./pages/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}"],
  theme: { extend: {
    colors: {
      brand: { green: "#0C362C", gold: "#D4AF37" }
    }
  }},
  plugins: [],
}
