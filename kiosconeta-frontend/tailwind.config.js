/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // ════════════════════════════════════════════════
      // COLORES PERSONALIZADOS - KIOSCONETA
      // ════════════════════════════════════════════════
      colors: {
        // Violeta principal
        primary: {
          DEFAULT: '#6b24d7',
          50: '#F5F3F7',
          100: '#EBE6EF',
          200: '#D7CDE0',
          300: '#C3B4D0',
          400: '#8F7AA8',
          500: '#402378',  // Base
          600: '#3A1F6C',
          700: '#311A5A',
          800: '#271548',
          900: '#1D103A',
          950: '#130A28',
        },
        
        // Naranja secundario
        secondary: {
          DEFAULT: '#000000',
          50: '#FFFCF0',
          100: '#FEF9E0',
          200: '#FDF3C2',
          300: '#FCEDA3',
          400: '#FAE171',
          500: '#F3CD40',  // Base
          600: '#E8B50F',
          700: '#B88D0B',
          800: '#8A6A08',
          900: '#5C4706',
          950: '#3A2D04',
        },
        
        // Grises neutros
        neutral: {
          50: '#F9FAFB',
          100: '#F5F5F5',
          200: '#E5E7EB',
          300: '#D1D5DB',
          400: '#9CA3AF',
          500: '#6B7280',
          600: '#4B5563',
          700: '#374151',
          800: '#1F2937',
          900: '#111827',
          950: '#030712',
        },
        
        // Estados
        success: {
          DEFAULT: '#10B981',
          50: '#ECFDF5',
          100: '#D1FAE5',
          500: '#10B981',
          600: '#059669',
          700: '#047857',
        },
        
        danger: {
          DEFAULT: '#EF4444',
          50: '#FEF2F2',
          100: '#FEE2E2',
          500: '#EF4444',
          600: '#DC2626',
          700: '#B91C1C',
        },
        
        warning: {
          DEFAULT: '#F59E0B',
          50: '#FFFBEB',
          100: '#FEF3C7',
          500: '#F59E0B',
          600: '#D97706',
          700: '#B45309',
        },
        
        info: {
          DEFAULT: '#3B82F6',
          50: '#EFF6FF',
          100: '#DBEAFE',
          500: '#3B82F6',
          600: '#2563EB',
          700: '#1D4ED8',
        },
      },
      
      // ════════════════════════════════════════════════
      // TIPOGRAFÍA
      // ════════════════════════════════════════════════
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      
      fontSize: {
        'xs': ['0.75rem', { lineHeight: '1rem' }],
        'sm': ['0.875rem', { lineHeight: '1.25rem' }],
        'base': ['1rem', { lineHeight: '1.5rem' }],
        'lg': ['1.125rem', { lineHeight: '1.75rem' }],
        'xl': ['1.25rem', { lineHeight: '1.75rem' }],
        '2xl': ['1.5rem', { lineHeight: '2rem' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
        '5xl': ['3rem', { lineHeight: '1' }],
      },
      
      // ════════════════════════════════════════════════
      // ESPACIADO
      // ════════════════════════════════════════════════
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },
      
      // ════════════════════════════════════════════════
      // BORDES Y SOMBRAS
      // ════════════════════════════════════════════════
      borderRadius: {
        'sm': '0.25rem',
        DEFAULT: '0.375rem',
        'md': '0.5rem',
        'lg': '0.75rem',
        'xl': '1rem',
        '2xl': '1.5rem',
      },
      
      boxShadow: {
        'sm': '0 1px 2px 0 rgb(0 0 0 / 0.05)',
        DEFAULT: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
        'md': '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
        'lg': '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
        'xl': '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
        'card': '0 1px 3px 0 rgba(64, 35, 120, 0.1), 0 1px 2px 0 rgba(64, 35, 120, 0.06)',
        'card-hover': '0 4px 6px -1px rgba(64, 35, 120, 0.1), 0 2px 4px -1px rgba(64, 35, 120, 0.06)',
      },
      
      // ════════════════════════════════════════════════
      // ANIMACIONES
      // ════════════════════════════════════════════════
      animation: {
        'spin-slow': 'spin 3s linear infinite',
        'bounce-slow': 'bounce 2s infinite',
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-in': 'slideIn 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
      },
      
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideIn: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
      
      // ════════════════════════════════════════════════
      // TRANSICIONES
      // ════════════════════════════════════════════════
      transitionDuration: {
        '400': '400ms',
      },
      
      // ════════════════════════════════════════════════
      // BREAKPOINTS (opcional)
      // ════════════════════════════════════════════════
      screens: {
        'xs': '475px',
        'sm': '640px',
        'md': '768px',
        'lg': '1024px',
        'xl': '1280px',
        '2xl': '1536px',
      },
    },
  },
  plugins: [
    // Plugin para ocultar scrollbar
    function ({ addUtilities }) {
      addUtilities({
        '.scrollbar-hide': {
          /* IE and Edge */
          '-ms-overflow-style': 'none',
          /* Firefox */
          'scrollbar-width': 'none',
          /* Safari and Chrome */
          '&::-webkit-scrollbar': {
            display: 'none'
          }
        }
      })
    },
  ],
}