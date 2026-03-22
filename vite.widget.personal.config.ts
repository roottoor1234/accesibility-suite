import { defineConfig, mergeConfig } from 'vite';
import widgetConfig from './vite.widget.config';

/**
 * Προσωπική / καθαρή έκδοση για δική σου χρήση:
 * χωρίς κλήση validation API (ακόμα κι αν ορίσεις A11Y_WIDGET_CONFIG.validationUrl).
 * Output: dist-widget-personal/
 */
export default mergeConfig(
  widgetConfig,
  defineConfig({
    define: {
      __WIDGET_PERSONAL__: JSON.stringify(true),
    },
    build: {
      outDir: 'dist-widget-personal',
    },
  })
);
