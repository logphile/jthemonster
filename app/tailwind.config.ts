import type { Config } from 'tailwindcss'

export default <Partial<Config>>{
  darkMode: 'class',
  content: [
    './components/**/*.{vue,js,ts}',
    './layouts/**/*.vue',
    './pages/**/*.vue',
    './composables/**/*.{js,ts}',
    './plugins/**/*.{js,ts}',
    './app.vue',
  ],
  theme: {
    extend: {
      colors: {
        // Option C — Black & Fire
        bg: '#0A0A0A',
        card: '#141414',
        text: '#E5E7EB',
        subtext: '#9CA3AF',
        primary: '#F43F5E',   // fire
        accent: '#FDBA74',    // warm accent
        success: '#22C55E',
        danger: '#EF4444',
        border: '#1F2937'
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['Sora', 'Inter', 'ui-sans-serif', 'system-ui', 'sans-serif']
      },
      boxShadow: {
        soft: '0 10px 25px -12px rgba(244,63,94,0.25)' // primary glow
      },
      borderRadius: {
        '2xl': '1rem',
      }
    },
  },
  plugins: [],
}
