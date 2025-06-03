
/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        'm1ssion': {
          'blue': '#00D1FF',
          'purple': '#7B2EFF',
          'pink': '#F059FF',
          'deep-blue': '#131524'
        }
      },
      fontFamily: {
        'inter': ['Inter', 'sans-serif'],
        'orbitron': ['Orbitron', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
