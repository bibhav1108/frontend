/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],

  theme: {
    extend: {
      // 🎨 COLORS — Theme 1: Warm Earth & Teal
      colors: {
        primary: "#0D7377",
        primary_container: "#14919B",
        azure: "#14919B",

        surface: "#FFF8F1",
        surface_low: "#F9F3EB",
        surface_lowest: "#FFFFFF",
        surface_high: "#EEE7DF",
        surface_highest: "#E8E1DA",

        on_surface: "#1E1B17",
        on_surface_variant: "#5C4A3A",
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
        primaryGradient: "linear-gradient(135deg, #0D7377 0%, #14919B 100%)",
      },
    },
  },

  plugins: [],
};
