/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#edf8ff",
          100: "#d7edff",
          200: "#b2ddff",
          300: "#84c5ff",
          400: "#4ea5ff",
          500: "#1d84ff",
          600: "#0065e0",
          700: "#004fb3",
          800: "#003b80",
          900: "#002752"
        },
        energy: {
          green: "#22c55e",
          yellow: "#eab308",
          red: "#ef4444"
        }
      },
      boxShadow: {
        "soft-card": "0 18px 45px rgba(15, 23, 42, 0.08)"
      }
    }
  },
  plugins: []
};
