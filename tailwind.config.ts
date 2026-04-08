import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ["var(--font-jakarta)", "Inter", "system-ui", "sans-serif"],
        body: ["var(--font-jakarta)", "Inter", "system-ui", "sans-serif"],
      },
      colors: {
        ink: "#0f172a",
        sand: "#f7f3ef",
        blush: "#f3d1c4",
        coal: "#111827",
        accent: "#ff7f50",
      },
      boxShadow: {
        soft: "0 20px 60px rgba(0,0,0,0.08)",
      },
      borderRadius: {
        xl: "1.25rem",
      },
      container: {
        center: true,
        padding: "1.25rem",
      },
    },
  },
  plugins: [],
};
export default config;
