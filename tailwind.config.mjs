/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        paper: '#fbfbf9',
        ink: '#0f172a',
        body: '#3f4c5f',
        muted: '#68778c',
        line: '#e3e7ee',
        'line-soft': '#eef1f5',
        green: {
          brand: '#177245',
          deep: '#0e5a35',
          tint: '#edf6f1'
        },
        concern: {
          low: '#2f9e44',
          mid: '#dd9413',
          high: '#cf3f3f',
          amberTint: '#fdf4e3',
          redTint: '#fbeeec'
        }
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'Segoe UI', 'sans-serif'],
        serif: ['Newsreader', 'Georgia', 'serif']
      }
    }
  },
  plugins: []
};
