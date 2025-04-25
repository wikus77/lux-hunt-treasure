
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
          'blue': '#00a3ff',
          'neon-blue': '#1EAEDB',
          'purple': '#a855f7',
          'pink': '#ec4899',
          'neon-pink': '#D946EF',
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
          '0%, 100%': { boxShadow: '0 0 8px 2px rgba(0, 163, 255, 0.6)' },
          '50%': { boxShadow: '0 0 16px 4px rgba(0, 163, 255, 0.8)' }
        },
        'neon-pulse': {
          '0%, 100%': { 
            textShadow: '0 0 4px rgba(0, 163, 255, 0.6), 0 0 11px rgba(0, 163, 255, 0.6), 0 0 19px rgba(0, 163, 255, 0.6)' 
          },
          '50%': { 
            textShadow: '0 0 4px rgba(0, 163, 255, 0.8), 0 0 11px rgba(0, 163, 255, 0.8), 0 0 19px rgba(0, 163, 255, 0.8)' 
          }
        },
        'pulse-border': {
          '0%, 100%': { 
            borderColor: 'rgba(33, 33, 33, 0.8)' 
          },
          '50%': { 
            borderColor: 'rgba(12, 12, 12, 0.8)' 
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
        }
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'glow': 'glow 2s ease-in-out infinite',
        'neon-pulse': 'neon-pulse 2s ease-in-out infinite',
        'pulse-border': 'pulse-border 4s ease-in-out infinite',
        'moveLight': 'moveLight 2s linear infinite',
        'fade-in': 'fade-in 0.3s ease-out',
        'scale-in': 'scale-in 0.2s ease-out',
      },
      backgroundImage: {
        'hero-pattern': "linear-gradient(rgba(0,0,0,1),rgba(0,0,0,1))",
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'neon-gradient': 'linear-gradient(90deg, #111111, #222222)'
      }
    }
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
