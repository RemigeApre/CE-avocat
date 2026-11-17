import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: '#1b2d5a',
          50: '#f0f3fa',
          100: '#d9e1f0',
          200: '#b3c3e1',
          300: '#8da5d2',
          400: '#6787c3',
          500: '#4169b4',
          600: '#34548e',
          700: '#273f69',
          800: '#1b2d5a',
          900: '#0e1a3f',
          950: '#070d24',
        },
        gold: {
          DEFAULT: '#c9a84c',
          50: '#fdf8ec',
          100: '#faefd0',
          200: '#f5dea1',
          300: '#f0cd72',
          400: '#ebbc43',
          500: '#c9a84c',
          600: '#a68935',
          700: '#836a1e',
          800: '#604b07',
          900: '#3d2c00',
        },
        surface: '#f7f6f3',
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

export default config
