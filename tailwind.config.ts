import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        'deep-space': 'rgb(var(--deep-space) / <alpha-value>)',
        'void-black': 'rgb(var(--void-black) / <alpha-value>)',
        'starlight': 'rgb(var(--starlight) / <alpha-value>)',
        'aged-parchment': 'rgb(var(--aged-parchment) / <alpha-value>)',
        'brass': 'rgb(var(--brass) / <alpha-value>)',
        'brass-dark': 'rgb(var(--brass-dark) / <alpha-value>)',
        'celestial-blue': 'rgb(var(--celestial-blue) / <alpha-value>)',
        'celestial-blue-light': 'rgb(var(--celestial-blue-light) / <alpha-value>)',
      },
      fontFamily: {
        sans: ['var(--font-outfit)', 'sans-serif'],
        serif: ['var(--font-eb-garamond)', 'serif'],
      },
      backgroundImage: {
        'old-noise': "url('/noise.png')",
      }
    },
  },
  plugins: [require('@tailwindcss/typography')],
};

export default config;
