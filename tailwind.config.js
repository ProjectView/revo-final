import animate from 'tailwindcss-animate';

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './App.tsx',
    './index.tsx',
    './constants.tsx',
    './components/**/*.{ts,tsx}',
    './context/**/*.{ts,tsx}',
    './hooks/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
  ],
  // Classes built from runtime values (status / stage / site colors persisted
  // in Firestore) cannot be detected statically. Whitelist the palette used
  // by the color picker plus the legacy hardcoded status fallbacks.
  safelist: [
    // COLOR_PALETTE (sites, prestations, pipeline stages, statuses)
    'bg-blue-600', 'bg-emerald-600', 'bg-purple-600', 'bg-amber-600',
    'bg-cyan-600', 'bg-indigo-600', 'bg-teal-600', 'bg-orange-600',
    'bg-pink-600', 'bg-lime-600', 'bg-sky-600', 'bg-slate-700',
    // Smart-default status / stage colors (legacy fallback)
    'bg-emerald-500', 'bg-orange-500', 'bg-purple-500', 'bg-blue-500',
    'bg-amber-500', 'bg-red-500', 'bg-slate-400',
    // CalendarView status filter (light tints used in getStatusStyle)
    'bg-purple-100', 'bg-blue-100', 'bg-orange-100', 'bg-emerald-100', 'bg-slate-100',
    'border-purple-300', 'border-blue-300', 'border-orange-300', 'border-emerald-300', 'border-slate-300',
    'text-purple-700', 'text-blue-700', 'text-orange-700', 'text-emerald-700', 'text-slate-700',
    // Legacy client mock palette (kept for backward compat with existing data)
    'bg-rose-500', 'bg-indigo-500', 'bg-cyan-500', 'bg-slate-500',
    'bg-green-300', 'bg-lime-400',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [animate],
};
