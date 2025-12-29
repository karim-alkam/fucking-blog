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
        'cyber-black': 'var(--cyber-black)',
        'cyber-dark-gray': 'var(--cyber-dark-gray)',
        'cyber-gray': 'var(--cyber-gray)',
        'cyber-gray-light': 'var(--cyber-gray-light)',
        'cyber-white': 'var(--cyber-white)',
        'cyber-neon-yellow': 'var(--cyber-neon-yellow)',
        'cyber-neon-cyan': 'var(--cyber-neon-cyan)',
        'cyber-neon-pink': 'var(--cyber-neon-pink)',
        'cyber-neon-purple': 'var(--cyber-neon-purple)',
        'cyber-neon-green': 'var(--cyber-neon-green)',
        'cyber-neon-blue': 'var(--cyber-neon-blue)',
      },
      fontFamily: {
        sans: ['var(--font-outfit)', 'sans-serif'],
        display: ['var(--font-rajdhani)', 'sans-serif'],
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
};

export default config;
