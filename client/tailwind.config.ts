import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Tinder-inspired colors
        tinder: {
          pink: '#FD297B',
          red: '#FF5864',
          orange: '#FF655B',
          coral: '#FE3C72',
          gradient: 'linear-gradient(135deg, #FD297B 0%, #FF5864 50%, #FF655B 100%)',
        },
        // Primary - Tinder Pink/Magenta
        primary: {
          50: '#fff0f3',
          100: '#ffe0e8',
          200: '#ffc6d6',
          300: '#ff9db6',
          400: '#ff6491',
          500: '#FD297B',
          600: '#FE3C72',
          700: '#d91a60',
          800: '#b31852',
          900: '#991849',
          950: '#560824',
        },
        // Accent - Tinder Coral/Orange
        accent: {
          50: '#fff4ed',
          100: '#ffe6d4',
          200: '#ffc9a9',
          300: '#ffa472',
          400: '#FF655B',
          500: '#FF5864',
          600: '#f03a3a',
          700: '#c72727',
          800: '#9e2323',
          900: '#802121',
          950: '#450d0d',
        },
        // Keep emerald for success states
        emerald: {
          50: '#ecfdf5',
          100: '#d1fae5',
          200: '#a7f3d0',
          300: '#6ee7b7',
          400: '#34d399',
          500: '#10b981',
          600: '#059669',
          700: '#047857',
          800: '#065f46',
          900: '#064e3b',
          950: '#022c22',
        },
        // Gold accents
        gold: {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
          DEFAULT: '#D4AF37',
        },
        // Dark backgrounds
        dark: {
          DEFAULT: '#0f0f0f',
          50: '#1a1a1a',
          100: '#171717',
          200: '#141414',
          300: '#111111',
          400: '#0e0e0e',
          500: '#0a0a0a',
          light: '#1f1f1f',
          lighter: '#262626',
          card: '#181818',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        serif: ['Playfair Display', 'Georgia', 'serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'fade-up': 'fadeUp 0.6s ease-out',
        'scale-in': 'scaleIn 0.3s ease-out',
        'slide-in-right': 'slideInRight 0.4s ease-out',
        'slide-in-left': 'slideInLeft 0.4s ease-out',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'glow-tinder': 'glowTinder 2s ease-in-out infinite alternate',
        'float': 'float 6s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'pulse-slow': 'pulse 4s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        slideInRight: {
          '0%': { opacity: '0', transform: 'translateX(20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        slideInLeft: {
          '0%': { opacity: '0', transform: 'translateX(-20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        glow: {
          '0%': { boxShadow: '0 0 20px rgba(253, 41, 123, 0.3)' },
          '100%': { boxShadow: '0 0 40px rgba(253, 41, 123, 0.6)' },
        },
        glowTinder: {
          '0%': { boxShadow: '0 0 20px rgba(253, 41, 123, 0.4), 0 0 40px rgba(255, 88, 100, 0.2)' },
          '100%': { boxShadow: '0 0 30px rgba(253, 41, 123, 0.6), 0 0 60px rgba(255, 88, 100, 0.3)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'tinder-gradient': 'linear-gradient(135deg, #FD297B 0%, #FF5864 50%, #FF655B 100%)',
        'tinder-gradient-reverse': 'linear-gradient(135deg, #FF655B 0%, #FF5864 50%, #FD297B 100%)',
      },
    },
  },
  plugins: [],
};

export default config;
