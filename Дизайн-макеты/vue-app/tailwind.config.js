/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#F5F7FA',
        surface: '#FFFFFF',
        'surface-2': '#F9FAFB',
        line: '#E4E7EC',
        ink: '#0F172A',
        'ink-2': '#475467',
        'ink-3': '#98A2B3',
        brand: {
          50: '#EFF6FF',
          100: '#DBEAFE',
          200: '#BFDBFE',
          500: '#3B82F6',
          600: '#2563EB',
          700: '#1D4ED8',
          800: '#1E40AF',
          900: '#172554',
        },
        ok: { 50: '#ECFDF5', 500: '#10B981', 600: '#059669', 700: '#047857' },
        warn: { 50: '#FFFBEB', 500: '#F59E0B', 600: '#D97706', 700: '#B45309' },
        danger: { 50: '#FEF2F2', 500: '#EF4444', 600: '#DC2626', 700: '#B91C1C' },
      },
      boxShadow: {
        card: '0 1px 2px rgba(15,23,42,.06)',
        pop: '0 8px 24px -8px rgba(15,23,42,.12)',
        device: '0 24px 60px -24px rgba(15,23,42,.35)',
      },
      borderRadius: {
        sm: '6px',
        md: '10px',
        lg: '14px',
        xl: '18px',
      },
    },
  },
  plugins: [],
}
