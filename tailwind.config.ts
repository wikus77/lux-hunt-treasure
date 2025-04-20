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
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))'
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))'
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))'
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))'
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))'
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))'
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))'
        },
        sidebar: {
          DEFAULT: 'hsl(var(--sidebar-background))',
          foreground: 'hsl(var(--sidebar-foreground))',
          primary: 'hsl(var(--sidebar-primary))',
          'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
          accent: 'hsl(var(--sidebar-accent))',
          'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
          border: 'hsl(var(--sidebar-border))',
          ring: 'hsl(var(--sidebar-ring))'
        },
        projectx: {
          blue: '#0EA5E9',
          'neon-blue': '#33C3F0',
          'deep-blue': '#1A1F2C',
          black: '#000000',
          'dark-gray': '#222222',
          pink: '#D946EF',
          'neon-pink': '#F97316',
          gold: '#FFC107',
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
            textShadow: '0 0 10px rgba(51, 195, 240, 0.8), 0 0 20px rgba(51, 195, 240, 0.5)' 
          },
          '50%': { 
            textShadow: '0 0 15px rgba(217, 70, 239, 0.8), 0 0 30px rgba(217, 70, 239, 0.5)' 
          }
        },
        'pulse-border': {
          '0%, 100%': { 
            borderColor: 'rgba(51, 195, 240, 0.8)' 
          },
          '50%': { 
            borderColor: 'rgba(217, 70, 239, 0.8)' 
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
        'hero-pattern': "linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), url('/public/lovable-uploads/e017275b-1b75-4b7c-bab0-1ce246d4bbce.png')",
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'neon-gradient': 'linear-gradient(90deg, #0EA5E9, #D946EF)'
      }
    }
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
