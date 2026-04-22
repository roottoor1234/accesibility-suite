import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  define: {
    'process.env': '{}',
    'process.env.NODE_ENV': '"production"',
    /** false = κανονικό build (επιτρέπει validation API). true μόνο στο vite.widget.personal.config.ts */
    __WIDGET_PERSONAL__: JSON.stringify(false),
  },
  build: {
    lib: {
      entry: 'src/widget-standalone.tsx',
      name: 'A11yWidget',
      fileName: () => 'a11y-widget.js',
      formats: ['iife'],
    },
    outDir: 'dist-widget',
    rollupOptions: {
      output: {
        banner:
          '/*! @bytepair/wcag-widget | (c) 2026 Bytepair | MIT License */',
        assetFileNames: (assetInfo) => {
          if (assetInfo.name?.endsWith('.css')) {
            return 'a11y-widget.css';
          }
          return assetInfo.name || 'asset';
        },
      },
    },
  },
});
