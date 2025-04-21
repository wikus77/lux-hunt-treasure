
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
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
      },
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: '#111111',
          foreground: '#ffffff'
        },
        secondary: {
          DEFAULT: '#222222',
          foreground: '#ffffff'
        },
        destructive: {
          DEFAULT: '#dc2626',
          foreground: '#ffffff'
        },
        muted: {
          DEFAULT: '#333333',
          foreground: '#bbbbbb'
        },
        accent: {
          DEFAULT: '#232323',
          foreground: '#ffffff'
        },
        popover: {
          DEFAULT: '#161616',
          foreground: '#ffffff'
        },
        card: {
          DEFAULT: '#121212',
          foreground: '#ffffff'
        },
        sidebar: {
          DEFAULT: '#121212',
          foreground: '#ffffff',
          primary: '#121212',
          'primary-foreground': '#ffffff',
          accent: '#232323',
          'accent-foreground': '#ffffff',
          border: '#232323',
          ring: '#333333'
        },
        projectx: {
          blue: '#111111', // nero
          'neon-blue': '#171717', // nero intenso
          'deep-blue': '#151515', // nero profondo
          black: '#000000',
          'dark-gray': '#222222',
          pink: '#222222', // scuro
          'neon-pink': '#181818',
          gold: '#232323',
        }
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)'
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
          '0%, 100%': { 
            textShadow: '0 0 10px #111, 0 0 20px #222' 
          },
          '50%': { 
            textShadow: '0 0 15px #181818, 0 0 30px #151515' 
          }
        },
        'pulse-border': {
          '0%, 100%': { 
            borderColor: 'rgba(33, 33, 33, 0.8)' 
          },
          '50%': { 
            borderColor: 'rgba(12, 12, 12, 0.8)' 
          }
        }
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'glow': 'glow 4s ease-in-out infinite',
        'pulse-border': 'pulse-border 4s ease-in-out infinite'
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

