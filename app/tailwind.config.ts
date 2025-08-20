export default {
  darkMode: 'class',
  // You can remove 'content' entirely to use Nuxt defaults; keeping explicit list here
  content: [
    './app.vue',
    './components/**/*.{vue,js,ts}',
    './layouts/**/*.vue',
    './pages/**/*.vue',
    './plugins/**/*.{js,ts}',
  ],
  safelist: [
    'bg-bg','text-text','bg-card','text-subtext','border-border',
    'bg-primary','text-primary','bg-accent','bg-success'
  ],
  theme: {
    extend: {
      colors: {
        // Existing palette (kept for backward compatibility)
        bg: '#0A0A0A',
        card: '#141414',
        text: '#E5E7EB',
        subtext: '#9CA3AF',
        primary: '#F43F5E',
        accent: '#FDBA74',
        success: '#22C55E',
        danger: '#EF4444',
        border: '#1F2937',
        coal: { 900:'#0b0d10', 800:'#101317', 700:'#151a1f', 600:'#1b2229' },
        rosefire: { 500:'#ef3b57', 600:'#e11d48', 700:'#be123c' },
        firepink: { DEFAULT: '#f43f8f', 600: '#e11d74', 700: '#be1865' },
        // Cyberpunk Edgerunners additions
        bgDeep: '#0A0A0F',
        firePink: '#FF007A',
        neonYellow: '#FFD600',
        neonPurple: '#8B5CF6',
        textHi: '#E5E5E5',
        textLo: '#7D7D7D',
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['Rajdhani', 'Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        hud: ['Rajdhani', 'Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 10px 25px -12px rgba(244,63,94,0.25)',
        card: '0 8px 24px rgba(0,0,0,.35)',
        glow: '0 0 0 2px rgba(255,75,125,.35)',
        neonPink: '0 0 0 1px rgba(255,0,122,0.35), 0 0 12px rgba(255,0,122,0.35)',
        neonYellow: '0 0 0 1px rgba(255,214,0,0.35), 0 0 12px rgba(255,214,0,0.35)',
        neonPurple: '0 0 0 1px rgba(139,92,246,0.35), 0 0 12px rgba(139,92,246,0.35)'
      },
      borderRadius: {
        xl: '16px',
        '2xl': '20px',
      },
      zIndex: { sheet: '60', fab: '50', tooltip: '70', overlay: '55' }
    },
  },
  plugins: [],
}
