
import type { Config } from 'tailwindcss';
import animate from 'tailwindcss-animate';

const config: Config = {
  darkMode: ['class'],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  prefix: '',
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px',
      },
    },
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        magenta: {
          400: '#ff00ff',
        },
        'm1ssion': {
          'blue': '#00D1FF',
          'purple': '#7B2EFF',
          'pink': '#F059FF',
          'deep-blue': '#131524'
        }
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
        'neon-pulse': {
          '0%, 100%': { 
            textShadow: '0 0 5px rgba(0, 229, 255, 0.7), 0 0 10px rgba(0, 229, 255, 0.5)'
          },
          '50%': {
            textShadow: '0 0 15px rgba(0, 229, 255, 0.8), 0 0 25px rgba(0, 229, 255, 0.6), 0 0 35px rgba(0, 229, 255, 0.4)'
          }
        },
        'float-particle': {
          '0%': { transform: 'translate(0, 0)' },
          '50%': { transform: 'translate(20px, -10px)' },
          '100%': { transform: 'translate(0, 0)' }
        },
        'fadeInUp': {
          from: {
            opacity: '0',
            transform: 'translateY(20px)'
          },
          to: {
            opacity: '1',
            transform: 'translateY(0)'
          }
        },
        'pulse': {
          '0%, 100%': { opacity: '0.3' },
          '50%': { opacity: '0.8' }
        },
        'lineMove': {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' }
        },
        'ripple': {
          '0%': { transform: 'scale(0)', opacity: '0.5' },
          '100%': { transform: 'scale(4)', opacity: '0' }
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' }
        },
        'text-glow': {
          '0%, 100%': {
            textShadow: '0 0 5px rgba(0, 229, 255, 0.7), 0 0 10px rgba(0, 229, 255, 0.5)'
          },
          '50%': {
            textShadow: '0 0 15px rgba(0, 229, 255, 0.9), 0 0 25px rgba(0, 229, 255, 0.7)'
          }
        },
        'reveal-text': {
          '0%': {
            clipPath: 'polygon(0 0, 0 0, 0 100%, 0 100%)'
          },
          '100%': {
            clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 100%)'
          }
        },
        'reveal-block': {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(101%)' }
        },
        'magnetic-effect': {
          '0%': { transform: 'translateX(0) translateY(0)' },
          '20%': { transform: 'translateX(2px) translateY(-2px)' },
          '40%': { transform: 'translateX(-2px) translateY(2px)' },
          '60%': { transform: 'translateX(1px) translateY(1px)' },
          '80%': { transform: 'translateX(-1px) translateY(-1px)' },
          '100%': { transform: 'translateX(0) translateY(0)' }
        },
        'rotate-3d': {
          '0%': { transform: 'perspective(1000px) rotateX(0) rotateY(0)' },
          '25%': { transform: 'perspective(1000px) rotateX(2deg) rotateY(2deg)' },
          '50%': { transform: 'perspective(1000px) rotateX(0) rotateY(4deg)' },
          '75%': { transform: 'perspective(1000px) rotateX(-2deg) rotateY(2deg)' },
          '100%': { transform: 'perspective(1000px) rotateX(0) rotateY(0)' }
        },
        'marquee': {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-100%)' }
        },
        'wave-text-effect': {
          '0%': { transform: 'translateY(0)' },
          '25%': { transform: 'translateY(-8px)' },
          '50%': { transform: 'translateY(0)' },
          '75%': { transform: 'translateY(8px)' },
          '100%': { transform: 'translateY(0)' }
        },
        'glow': {
          from: {
            opacity: '0',
            textShadow: 'none',
          },
          to: {
            opacity: '1',
            textShadow: '0 0 6px rgba(0, 255, 255, 0.6)',
          },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'neon-pulse': 'neon-pulse 2s infinite ease-in-out',
        'float-particle': 'float-particle 15s infinite ease-in-out',
        'fade-in-up': 'fadeInUp 0.5s ease-out forwards',
        'pulse-animation': 'pulse 3s infinite ease-in-out',
        'line-move': 'lineMove 2s infinite linear',
        'ripple': 'ripple 0.6s ease-in-out',
        'float-animation': 'float 4s infinite ease-in-out',
        'text-glow': 'text-glow 3s infinite ease-in-out',
        'reveal-text': 'reveal-text 0.8s cubic-bezier(0.77, 0, 0.175, 1) forwards',
        'reveal-block': 'reveal-block 1.1s cubic-bezier(0.19, 1, 0.22, 1) forwards',
        'magnetic-animation': 'magnetic-effect 8s ease-in-out infinite',
        'rotate-3d-animation': 'rotate-3d 12s ease-in-out infinite',
        'marquee-animation': 'marquee 20s linear infinite',
        'wave-text': 'wave-text-effect 2.5s ease-in-out infinite',
        'glow': 'glow 0.6s ease-in-out 2s forwards',
      },
      fontFamily: {
        'orbitron': ['Orbitron', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-landing': 'radial-gradient(circle at 50% 10%, rgba(19, 21, 36, 0.5) 0%, rgba(0, 0, 0, 0.8) 80%)',
      },
    },
  },
  plugins: [animate],
};

export default config;
