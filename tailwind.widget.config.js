/**
 * Tailwind μόνο για το standalone widget embed.
 * - Χωρίς Preflight → δεν αλλάζει buttons/inputs της host σελίδας.
 * - important στο container του widget → utilities δεν χρειάζονται data-a11y στο <html>.
 */
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  important: '#a11y-widget-container',
  corePlugins: {
    preflight: false,
    /**
     * Το `.container` βγαίνει σαν global rule σε κάποια builds και μπορεί να συγκρουστεί
     * με frameworks που χρησιμοποιούν `.container` στο host site.
     */
    container: false,
  },
  theme: {
    extend: {},
  },
  plugins: [],
};
