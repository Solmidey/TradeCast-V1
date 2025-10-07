import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#5D6BFF",
          foreground: "#F5F7FF",
        },
        accent: "#F6C177",
        surface: "#0B0E1A",
      },
      boxShadow: {
        glow: "0 0 45px rgba(93, 107, 255, 0.45)",
      },
    },
  },
  plugins: [],
};

export default config;
