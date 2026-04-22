import { defineConfig, mergeConfig } from 'vite';
import widgetConfig from './vite.widget.config';

/**
 * Build για δημοσίευση σε npm (και χρήση από jsDelivr/unpkg).
 *
 * Παράγει:
 * - lib/index.min.js
 * - lib/index.min.css
 */
export default mergeConfig(
  widgetConfig,
  defineConfig({
    build: {
      outDir: 'lib',
      emptyOutDir: true,
      lib: {
        entry: 'src/widget-standalone.tsx',
        name: 'BytepairWebWidget',
        fileName: () => 'index.min.js',
        formats: ['iife'],
      },
      rollupOptions: {
        output: {
          banner:
            '/*! @bytepair/wcag-widget | (c) 2026 Bytepair | MIT License */',
          assetFileNames: (assetInfo) => {
            if (assetInfo.name?.endsWith('.css')) return 'index.min.css';
            return assetInfo.name || 'asset';
          },
        },
      },
    },
  })
);

