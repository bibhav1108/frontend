/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],

  theme: {
    extend: {
      // 🎨 COLORS (core system only)
      colors: {
        primary: "#005da9",
        primary_container: "#0075d4",
        azure: "#3590F3",

        surface: "#fff7fc",
        surface_low: "#fdefff",
        surface_lowest: "#ffffff",
        surface_high: "#f2e4f4",
        surface_highest: "#ecdeee",

        on_surface: "#201924",
        on_surface_variant: "#414752",
      },

      fontFamily: {
        outfit: ["Outfit", "sans-serif"],
        inter: ["Inter", "sans-serif"],
      },

      borderRadius: {
        lg: "1rem",
        xl: "1.25rem",
      },

      backdropBlur: {
        glass: "20px",
      },

      boxShadow: {
        soft: "0 20px 60px rgba(0,0,0,0.05)",
      },

      backgroundImage: {
        primaryGradient: "linear-gradient(135deg, #005da9 0%, #0075d4 100%)",
      },
    },
  },

  plugins: [],
};
