import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
    theme: {
      extend: {
        fontFamily: {
          divan: ["Divan", "sans-serif"],
          iranKharazmi: ["IranKharazmi", "sans-serif"],
        },
      },
    },

  plugins: [],
} satisfies Config;
