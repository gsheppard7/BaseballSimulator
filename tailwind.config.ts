import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: {
          50: "#f4f6fb",
          100: "#e7ebf4",
          300: "#9aa6c2",
          700: "#243352",
          800: "#1a2744",
          900: "#14213a",
          950: "#0b1220",
        },
        grass: {
          50: "#eef8f1",
          100: "#d8f3e1",
          300: "#7dcea0",
          400: "#3dbe6e",
          500: "#1f9d4e",
          600: "#178a42",
          700: "#146e36",
          800: "#11562c",
          900: "#0d3e20",
        },
        clay: {
          100: "#f3e6cf",
          300: "#e0c48a",
          500: "#c4a574",
          700: "#8d6438",
        },
        stitch: {
          500: "#d3122a",
          600: "#b10e24",
        },
        chalk: "#f6f1e7",
        diamond: {
          50: "#f0fdf4",
          100: "#dcfce7",
          200: "#bbf7d0",
          300: "#86efac",
          400: "#4ade80",
          500: "#22c55e",
          600: "#16a34a",
          700: "#15803d",
          800: "#166534",
          900: "#14532d",
          950: "#052e16",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "ui-sans-serif", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0 1px 2px rgba(18, 28, 51, 0.06), 0 16px 40px rgba(18, 28, 51, 0.08)",
      },
    },
  },
  plugins: [],
};
export default config;
