/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        border: "var(--border)",
        subtle: "var(--bg-subtle)",
        soft: "var(--bg-soft)",
        card: "var(--bg-card)",
        accent: {
          DEFAULT: "#20a39e",
          foreground: "#ffffff",
          soft: "#e6f6f5",
          hover: "#1b8f8a",
        },
        primary: {
          DEFAULT: "var(--text-primary)",
          soft: "var(--bg-soft)",
        },
        secondary: {
          DEFAULT: "var(--text-secondary)",
        },
        muted: {
          DEFAULT: "var(--text-muted)",
          foreground: "var(--text-muted)",
        },
      },
      maxWidth: {
        threadWidth: "820px",
      },
    },
  },
  plugins: [],
};
