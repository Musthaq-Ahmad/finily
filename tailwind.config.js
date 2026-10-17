/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        finly: {
          lime: '#D8FA36',
          limeHover: '#C6EB28',
          limeSoft: 'rgba(216, 250, 54, 0.3)',
          cyan: '#C4EDEE',
          cyanLight: '#E3F7F8',
          dark: '#1C1E21',
          ink: '#141517',
          surface: '#F4F5F2',
          cardBg: '#FFFFFF',
          pill: '#E9EAE5',
          muted: '#73767D',
          hairline: 'rgba(28, 30, 33, 0.08)',
          amber: '#E59218',
          amberBg: '#FEF7E8',
          success: '#10B981',
          successBg: '#E6F7F0',
          error: '#DC2626',
          errorBg: '#FEE2E2',
        },
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        display: ['"Space Grotesk"', '"Plus Jakarta Sans"', 'sans-serif'],
      },
      borderRadius: {
        '3xl': '1.5rem',
        '4xl': '2rem',
        '5xl': '2.5rem',
      },
      boxShadow: {
        dock: '0 18px 45px -10px rgba(0, 0, 0, 0.12), 0 0 1px 1px rgba(0,0,0,0.04)',
        pill: '0 2px 8px -2px rgba(0, 0, 0, 0.06)',
        limeCard: '0 20px 35px -12px rgba(186, 222, 33, 0.35)',
        tactile: '0 8px 30px rgba(0,0,0,0.05)',
        level1: '0 4px 20px -2px rgba(28, 29, 31, 0.04)',
        level2: '0 8px 24px -4px rgba(28, 29, 31, 0.08)',
        level3: '0 16px 40px -6px rgba(28, 29, 31, 0.12)',
      },
      spacing: {
        'dock-safe': 'calc(env(safe-area-inset-bottom) + 5rem)',
        'safe-top': 'env(safe-area-inset-top)',
        'safe-bottom': 'env(safe-area-inset-bottom)',
      },
    },
  },
  plugins: [],
}
