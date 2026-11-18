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
          // 600/700 legerement fonces : texte >= 4,5:1 sur blanc et sur creme (WCAG AA)
          600: '#836c2a',
          700: '#6b5618',
          800: '#604b07',
          900: '#3d2c00',
        },
        surface: '#f7f6f3',
        // Gris des textes secondaires : 400/500 fonces pour atteindre 4,5:1 (WCAG AA), hierarchie conservee
        gray: {
          50: '#f9fafb',
          100: '#f3f4f6',
          200: '#e5e7eb',
          300: '#d1d5db',
          400: '#687080',
          500: '#5a6170',
          600: '#4b5563',
          700: '#374151',
          800: '#1f2937',
          900: '#111827',
        },
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

export default config
