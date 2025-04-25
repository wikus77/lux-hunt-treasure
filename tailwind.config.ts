
import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        inter: ["Inter", "sans-serif"],
        orbitron: ["Orbitron", "sans-serif"],
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        projectx: {
          'dark': '#0c0c12',
          'deep-blue': '#151c38',
          'blue': '#00E5FF',
          'neon-blue': '#1EAEDB',
          'purple': '#D946EF',
          'pink': '#EC4899',
          'neon-pink': '#D946EF',
          'yellow': '#FFC300',
          'orange': '#F97316',
          'card': '#111124'
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      keyframes: {
        'accordion-down': {
          from: {
            height: '0'
          },
          to: {
            height: 'var(--radix-accordion-content-height)'
          }
        },
        'accordion-up': {
          from: {
            height: 'var(--radix-accordion-content-height)'
          },
          to: {
            height: '0'
          }
        },
        'glow': {
          '0%, 100%': { boxShadow: '0 0 10px 3px rgba(0, 229, 255, 0.7)' },
          '50%': { boxShadow: '0 0 20px 5px rgba(0, 229, 255, 0.9)' }
        },
        'neon-pulse': {
          '0%, 100%': { 
            textShadow: '0 0 7px rgba(0, 229, 255, 0.7), 0 0 15px rgba(0, 229, 255, 0.7), 0 0 25px rgba(0, 229, 255, 0.7)' 
          },
          '50%': { 
            textShadow: '0 0 15px rgba(0, 229, 255, 0.9), 0 0 25px rgba(0, 229, 255, 0.9), 0 0 35px rgba(0, 229, 255, 0.9)' 
          }
        },
        'moveLight': {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' }
        },
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        },
        'scale-in': {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' }
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' }
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'glow': 'glow 2s ease-in-out infinite',
        'neon-pulse': 'neon-pulse 2s ease-in-out infinite',
        'moveLight': 'moveLight 2s linear infinite',
        'fade-in': 'fade-in 0.3s ease-out',
        'scale-in': 'scale-in 0.2s ease-out',
        'float': 'float 6s ease-in-out infinite',
      },
      backgroundImage: {
        'hero-pattern': "linear-gradient(rgba(0,0,0,1),rgba(0,0,0,0.8))",
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'neon-gradient': 'linear-gradient(90deg, #00E5FF, #D946EF)'
      }
    }
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
