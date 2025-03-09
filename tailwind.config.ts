import type { Config } from 'tailwindcss'

export default {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx}',
    './theme.config.tsx'
  ],
  theme: {
    container: {
      center: true,
      padding: "1rem",
    },
    extend: {
      colors: {
        primary: {
          DEFAULT: "#c260cd",
          light: "#0099ff",
          dark: "#0055aa",
          500: "#0077cc",
        },
        "conf-black": "#0e031c",
        black: "#1b1b1b",
      },
      animation: {
        "jump-once": "jump-once 0.25s ease-in-out",
        "zoom": "zoom 0.5s ease-in-out"
      },
      keyframes: {
        "jump-once": {
          '0%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
          '100%': { transform: 'translateY(0)' }
        },
        "zoom": {
          '0%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.5)' },
          '100%': { transform: 'scale(1)' }
        }
      }
    }
  },
  plugins: [],
  darkMode: 'class'
} satisfies Config
