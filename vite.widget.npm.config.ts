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
        name: 'SmartRepWebWidget',
        fileName: () => 'index.min.js',
        formats: ['iife'],
      },
      rollupOptions: {
        output: {
          assetFileNames: (assetInfo) => {
            if (assetInfo.name?.endsWith('.css')) return 'index.min.css';
            return assetInfo.name || 'asset';
          },
        },
      },
    },
  })
);

