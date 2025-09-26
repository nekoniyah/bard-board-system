/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      animation: {
        'shimmer': 'shimmer 0.5s ease forwards',
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-in': 'slideIn 0.3s ease-out',
        'shimmer-global': 'shimmerGlobal 2s infinite',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
        'bounce-subtle': 'bounceSubtle 0.6s ease-out',
      },
      keyframes: {
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' }
        },
        fadeIn: {
          'from': {
            opacity: '0',
            transform: 'translateY(10px)',
          },
          'to': {
            opacity: '1',
            transform: 'translateY(0)',
          },
        },
        slideIn: {
          'from': {
            opacity: '0',
            transform: 'translateX(-20px)',
          },
          'to': {
            opacity: '1',
            transform: 'translateX(0)',
          },
        },
        shimmerGlobal: {
          '0%': {
            transform: 'translateX(-100%)',
          },
          '100%': {
            transform: 'translateX(100%)',
          },
        },
        pulseGlow: {
          '0%, 100%': {
            boxShadow: '0 0 20px rgba(168, 85, 247, 0.4)',
          },
          '50%': {
            boxShadow: '0 0 40px rgba(168, 85, 247, 0.6)',
          },
        },
        bounceSubtle: {
          '0%, 100%': {
            transform: 'translateY(0)',
          },
          '50%': {
            transform: 'translateY(-4px)',
          },
        },
      },
      backdropBlur: {
        '20': '20px',
      },
      colors: {
        gray: {
          50: '#f9fafb',
          100: '#f3f4f6',
          200: '#e5e7eb',
          300: '#d1d5db',
          400: '#9ca3af',
          500: '#6b7280',
          600: '#606060',
          700: '#374151',
          750: '#2a2a2a',
          800: '#1f2937',
          850: '#1a1a1a',
          900: '#111111',
          950: '#0a0a0a',
        },
        'dark': {
          100: '#0a0a0a',
          200: '#111111',
          300: '#151515',
          400: '#1a1a1a',
          500: '#252525',
          600: '#2a2a2a',
          700: '#3a3a3a',
          800: '#484f58',
          900: '#606060',
        },
        'primary': {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#4c6ef5',
          600: '#364fc7',
          700: '#1c7ed6',
          800: '#1e40af',
          900: '#1e3a8a',
          950: '#172554',
          bg: '#0f0f0f',
          text: '#ffffff',
        },
        grid: {
          special: '#ff6b6b',
          center: '#4ecdc4',
          normal: '#45b7d1',
          default: '#95a5a6',
        },
        // couleurs syntaxe json
        json: {
          bracket: '#c9d1d9',
          key: '#79c0ff',
          string: '#a5d6ff',
          number: '#79c0ff',
          comma: '#c9d1d9',
          colon: '#c9d1d9',
          null: '#ff7b72',
        },
        // couleurs bordures
        border: {
          light: 'rgba(255, 255, 255, 0.1)',
          medium: 'rgba(255, 255, 255, 0.2)',
          strong: 'rgba(255, 255, 255, 0.3)',
          stronger: 'rgba(255, 255, 255, 0.4)',
          focus: 'rgba(255, 255, 255, 0.5)',
          dark: '#252525',
          darker: '#1a1a1a',
          darkest: '#0a0a0a',
          github: '#30363d',
        },
        github: {
          bg: '#0d1117',
          border: '#30363d',
          hover: '#484f58',
          text: '#c9d1d9',
        },
        selection: 'rgba(255, 255, 255, 0.2)',
        scrollbar: {
          thumb: 'rgba(255, 255, 255, 0.2)',
          thumbHover: 'rgba(255, 255, 255, 0.3)',
        },
        focus: 'rgba(255, 255, 255, 0.5)',
        // rouge étapes non liées
        'danger': {
          500: '#fa5252',
          600: '#e03131',
          700: '#dc2626',
        },
        // succès
        'success': {
          500: '#51cf66',
          600: '#40c057',
          700: '#37b24d',
        },
        // avertissements
        'warning': {
          500: '#ffd43b',
          600: '#fab005',
          700: '#f59f00',
        },
        // texte
        text: {
          primary: '#ffffff',
          secondary: '#a0a0a0',
          muted: '#71717a',
          disabled: '#52525b',
        },
      },
      fontFamily: {
        'sans': ['SF Pro Display', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', 'sans-serif'],
        'mono': ['SF Mono', 'Monaco', 'Cascadia Code', 'Roboto Mono', 'Consolas', 'Courier New', 'monospace'],
      },
      letterSpacing: {
        'tight': '-0.02em',
        'tighter': '-0.02em',
        'wide': '0.05em',
        'wider': '0.08em',
      },
      boxShadow: {
        'glass': '0 0 40px rgba(0, 0, 0, 0.5)',
        'elevated': '0 2px 8px rgba(0, 0, 0, 0.3), 0 8px 32px rgba(0, 0, 0, 0.4)',
        'primary-glow': '0 8px 24px rgba(76, 110, 245, 0.3)',
        'red-glow': '0 4px 16px rgba(250, 82, 82, 0.7)',
        'blue-glow': '0 4px 16px rgba(76, 110, 245, 0.7)',
      },
      transitionTimingFunction: {
        'smooth': 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
      spacing: {
        'screen-w': '100vw',
        'screen-h': '100vh',
      },
      zIndex: {
        '200': '200',
        '201': '201',
        '1000': '1000',
        '1001': '1001',
      },
    },
  },
  plugins: [
    function({ addUtilities }) {
      const scrollbarUtilities = {
        '.scrollbar-thin': {
          '&::-webkit-scrollbar': {
            width: '8px',
          },
          '&::-webkit-scrollbar-track': {
            background: 'transparent',
          },
          '&::-webkit-scrollbar-thumb': {
            background: 'rgba(255, 255, 255, 0.2)',
            borderRadius: '4px',
          },
          '&::-webkit-scrollbar-thumb:hover': {
            background: 'rgba(255, 255, 255, 0.3)',
          },
        },
        '.selection-custom': {
          '&::selection': {
            background: 'rgba(255, 255, 255, 0.2)',
            color: '#ffffff',
          },
          '&::-moz-selection': {
            background: 'rgba(255, 255, 255, 0.2)',
            color: '#ffffff',
          },
        },
      };
      addUtilities(scrollbarUtilities);
    },
    function({ addUtilities }) {
      const focusUtilities = {
        '.focus-custom': {
          '&:focus-visible': {
            outline: '2px solid rgba(255, 255, 255, 0.5)',
            outlineOffset: '2px',
          },
          '&:focus:not(:focus-visible)': {
            outline: 'none',
          },
        },
      };
      addUtilities(focusUtilities);
    },
  ],
}