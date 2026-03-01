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
    // Ορίζεις A11Y_LICENSE_API=https://api.yoursite.com/a11y/validate πριν το build
    __A11Y_LICENSE_API__: JSON.stringify(process.env.A11Y_LICENSE_API || ''),
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
