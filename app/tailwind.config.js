/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        deep:    '#030811',
        surface: '#070D1C',
        raised:  '#0B1228',
        gold:    '#C9A84C',
        'gold-bright': '#ECC870',
        emerald: '#16A379',
        silver:  '#8190A5',
        slate:   '#141C30',
        dim:     '#1C2640',
        coral:   '#E06B5A',
        sky:     '#5B9CF6',
        white:   '#F0F4FF',
      },
      fontFamily: {
        sans:  ['Inter', 'system-ui', 'sans-serif'],
        serif: ['Playfair Display', 'Georgia', 'serif'],
        mono:  ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      },
    },
  },
  plugins: [],
}
