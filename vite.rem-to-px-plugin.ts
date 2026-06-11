import type { Plugin } from 'vite';

const REM_BASE_PX = 16;

function remToPx(css: string): string {
  return css.replace(/(-?\d*\.?\d+)rem\b/g, (_, num) => `${parseFloat(num) * REM_BASE_PX}px`);
}

/** Converts rem → px in widget CSS so sizing is independent of host html font-size. */
export function remToPxCssPlugin(): Plugin {
  return {
    name: 'rem-to-px-css',
    apply: 'build',
    enforce: 'post',
    transform(code, id) {
      if (!id.endsWith('.css') && !id.includes('.css?')) return;
      return { code: remToPx(code), map: null };
    },
    generateBundle(_options, bundle) {
      for (const chunk of Object.values(bundle)) {
        if (chunk.type !== 'asset' || !chunk.fileName.endsWith('.css')) continue;
        if (typeof chunk.source !== 'string') continue;
        chunk.source = remToPx(chunk.source);
      }
    },
  };
}
