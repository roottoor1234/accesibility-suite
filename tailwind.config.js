/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  /** Σκοπός: utilities χωρίς να χρειάζεται data-a11y στο <html> (το οποίο ενεργοποιείται μόνο με ενεργές ρυθμίσεις). */
  important: '#root',
  theme: {
    extend: {},
  },
  plugins: [],
};
