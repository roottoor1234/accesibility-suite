import { createRoot } from 'react-dom/client';
import { AccessibilityProvider } from './contexts/AccessibilityContext';
import { AccessibilityWidget, type WidgetPosition } from './components/AccessibilityWidget';
import './widget-styles.css';

/** CDN/base URL για φόρτωση CSS όταν ενσωματώνεται με ένα script tag (όπως Userway). */
export type WidgetInitOptions = {
  position?: WidgetPosition;
  /** Account ID από την πλατφόρμα συνδρομής. Χρησιμοποιείται για μελλοντικό domain restriction. */
  accountId?: string;
};

declare global {
  interface Window {
    initA11yWidget: (options?: WidgetInitOptions) => void | Promise<void>;
    /** Ορίζεται από loader ή από script tag· χρησιμοποιείται για domain validation. */
    __A11Y_WIDGET_ACCOUNT_ID__?: string;
    /** Προαιρετικό: base URL για φόρτωση CSS (π.χ. CDN). */
    __A11Y_WIDGET_CDN__?: string;
  }
}

/**
 * Επικύρωση domain για το accountId.
 * Στο μέλλον η πλατφόρμα μπορεί να καλεί API εδώ (π.χ. GET /api/widget/validate?accountId=...&domain=...).
 * Αν το domain δεν είναι επιτρεπόμενο, return false και το widget δεν θα εμφανιστεί.
 */
async function validateDomain(accountId: string, _currentHost: string): Promise<boolean> {
  /** Προσωπικό build (`npm run build:widget:personal`): ποτέ δεν καλεί API, αγνοεί validationUrl. */
  if (__WIDGET_PERSONAL__) return true;
  const config = (window as Window & { A11Y_WIDGET_CONFIG?: { validationUrl?: string } }).A11Y_WIDGET_CONFIG;
  if (config?.validationUrl) {
    try {
      const url = `${config.validationUrl}?accountId=${encodeURIComponent(accountId)}&domain=${encodeURIComponent(_currentHost)}`;
      const res = await fetch(url, { method: 'GET', mode: 'cors' });
      const data = (await res.json()) as { allowed?: boolean };
      return data?.allowed === true;
    } catch {
      return false;
    }
  }
  return true;
}

function getScriptConfig(): { accountId: string | null; baseUrl: string | null; cssUrl: string | null } {
  const script =
    (document.currentScript as HTMLScriptElement | null) ||
    Array.from(document.querySelectorAll<HTMLScriptElement>('script[data-account]')).pop() ||
    null;
  const accountId =
    script?.getAttribute('data-account')?.trim() ||
    window.__A11Y_WIDGET_ACCOUNT_ID__ ||
    null;
  let baseUrl =
    script?.getAttribute('data-cdn')?.trim()?.replace(/\/?$/, '/') ||
    window.__A11Y_WIDGET_CDN__ ||
    null;

  // Prefer deriving CSS URL from the script URL (index.min.js -> index.min.css, a11y-widget.js -> a11y-widget.css).
  const cssUrl = script?.src
    ? script.src.replace(/\.js(\?.*)?$/, '.css$1')
    : null;

  if (!baseUrl && script?.src) {
    try {
      const u = new URL(script.src);
      u.pathname = u.pathname.replace(/\/[^/]*$/, '/');
      baseUrl = u.origin + u.pathname;
    } catch {
      baseUrl = null;
    }
  }
  return { accountId, baseUrl, cssUrl };
}

/** Resolve widget CSS when script.src is unavailable (e.g. dynamic inject without currentScript). */
function resolveCssFallback(baseUrl: string): string {
  // npm/jsDelivr: .../lib/index.min.js → .../lib/index.min.css
  if (/\/lib\/?$/.test(baseUrl.replace(/\/?$/, ''))) {
    return baseUrl + 'index.min.css';
  }
  // dist-widget CDN: .../a11y-widget.css
  return baseUrl + 'a11y-widget.css';
}

/**
 * Inject minimal global CSS for page effects.
 * IMPORTANT: Everything is guarded by `[data-a11y="on"]` so nothing changes unless user enables a feature.
 */
function ensureGlobalEffectsStyle(): void {
  const id = 'a11y-widget-effects';
  if (document.getElementById(id)) return;
  const style = document.createElement('style');
  style.id = id;
  style.textContent = `
/* Page effects scoped to .a11y-content-wrap only — widget UI is never targeted */

/* Aggressive text scaling: zoom overrides host px/rem (Bootstrap 3, Drupal themes, etc.) */
.a11y-content-wrap[data-text-size]:not([data-text-size="100"]) {
  zoom: var(--a11y-text-zoom, 1) !important;
}
@supports not (zoom: 1) {
  .a11y-content-wrap[data-text-size]:not([data-text-size="100"]) {
    font-size: var(--a11y-text-size, 100%) !important;
  }
  .a11y-content-wrap[data-text-size]:not([data-text-size="100"]) *:not(svg):not(svg *):not(style):not(script) {
    font-size: inherit !important;
  }
}

.a11y-content-wrap[data-a11y="on"] * {
  line-height: calc(1.5 * var(--line-height-scale, 1));
  letter-spacing: var(--letter-spacing-scale, 0em);
  word-spacing: var(--word-spacing-scale, 0em);
}

.a11y-content-wrap[data-high-contrast="true"] {
  background-color: #000 !important;
  color: #fff !important;
}
.a11y-content-wrap[data-high-contrast="true"] * {
  background-color: #000 !important;
  color: #fff !important;
  border-color: #fff !important;
}

.a11y-content-wrap[data-invert-colors="true"] { filter: invert(1) hue-rotate(180deg); }
.a11y-content-wrap[data-invert-colors="true"] img,
.a11y-content-wrap[data-invert-colors="true"] video,
.a11y-content-wrap[data-invert-colors="true"] svg { filter: invert(1) hue-rotate(180deg); }

.a11y-content-wrap[data-saturation="low"] { filter: saturate(0.3); }
.a11y-content-wrap[data-saturation="high"] { filter: saturate(2); }
.a11y-content-wrap[data-saturation="monochrome"] { filter: grayscale(1); }

.a11y-content-wrap[data-color-overlay] { position: relative; }
.a11y-content-wrap[data-color-overlay]::before {
  content: "";
  position: absolute;
  inset: 0;
  z-index: 1;
  pointer-events: none;
  mix-blend-mode: multiply;
}
.a11y-content-wrap[data-color-overlay="yellow"]::before { background: rgba(255, 255, 100, 0.15); }
.a11y-content-wrap[data-color-overlay="blue"]::before { background: rgba(100, 150, 255, 0.12); }
.a11y-content-wrap[data-color-overlay="green"]::before { background: rgba(100, 255, 130, 0.10); }
.a11y-content-wrap[data-color-overlay="pink"]::before { background: rgba(255, 130, 180, 0.10); }

.a11y-content-wrap[data-pause-animations="true"],
.a11y-content-wrap[data-pause-animations="true"] * {
  animation-duration: 0.001ms !important;
  animation-iteration-count: 1 !important;
  transition-duration: 0.001ms !important;
}

.a11y-content-wrap[data-highlight-links="true"] a {
  background-color: #fef08a !important;
  color: #000 !important;
  text-decoration: underline !important;
  text-decoration-thickness: 3px !important;
  text-underline-offset: 3px !important;
  padding: 2px 4px !important;
  border-radius: 3px !important;
  outline: 2px solid #eab308 !important;
}

.a11y-content-wrap[data-highlight-headings="true"] h1,
.a11y-content-wrap[data-highlight-headings="true"] h2,
.a11y-content-wrap[data-highlight-headings="true"] h3,
.a11y-content-wrap[data-highlight-headings="true"] h4,
.a11y-content-wrap[data-highlight-headings="true"] h5,
.a11y-content-wrap[data-highlight-headings="true"] h6 {
  border-bottom: 3px solid #3b82f6 !important;
  padding-bottom: 4px !important;
  background: linear-gradient(to right, rgba(59,130,246,0.08), transparent) !important;
  padding-left: 8px !important;
  border-left: 4px solid #3b82f6 !important;
  border-radius: 2px !important;
}

.a11y-content-wrap[data-dyslexic-font="true"],
.a11y-content-wrap[data-dyslexic-font="true"] * {
  font-family: "Comic Sans MS","OpenDyslexic",Arial,Helvetica,sans-serif !important;
  font-weight: 500 !important;
}

.a11y-content-wrap[data-hide-images="true"] img,
.a11y-content-wrap[data-hide-images="true"] svg,
.a11y-content-wrap[data-hide-images="true"] video,
.a11y-content-wrap[data-hide-images="true"] picture {
  opacity: 0.05 !important;
  pointer-events: none !important;
}

.a11y-content-wrap[data-text-align="left"] * { text-align: left !important; }
.a11y-content-wrap[data-text-align="center"] * { text-align: center !important; }
.a11y-content-wrap[data-text-align="right"] * { text-align: right !important; }

.a11y-content-wrap[data-focus-highlight="true"] *:focus-visible {
  outline: 4px solid #ef4444 !important;
  outline-offset: 4px !important;
  box-shadow: 0 0 0 6px rgba(239,68,68,0.3) !important;
}

.a11y-content-wrap[data-a11y="on"] button,
.a11y-content-wrap[data-a11y="on"] a,
.a11y-content-wrap[data-a11y="on"] [role="button"],
.a11y-content-wrap[data-a11y="on"] input[type="checkbox"],
.a11y-content-wrap[data-a11y="on"] input[type="radio"] {
  min-width: 44px !important;
  min-height: 44px !important;
}

.a11y-content-wrap[data-cursor-size] {
  cursor: var(--a11y-cursor) !important;
}
.a11y-content-wrap[data-cursor-size] * {
  cursor: inherit !important;
}
`;
  (document.head || document.documentElement).appendChild(style);
}

function ensureShadowWidgetCss(shadow: ShadowRoot, cssUrl: string): void {
  const id = 'a11y-widget-shadow-styles';
  if (shadow.getElementById?.(id) || shadow.querySelector(`#${id}`)) return;
  const link = document.createElement('link');
  link.id = id;
  link.rel = 'stylesheet';
  link.href = cssUrl;
  shadow.appendChild(link);
}

function ensureShadowBaseStyle(shadow: ShadowRoot): void {
  const id = 'a11y-widget-shadow-base';
  if (shadow.querySelector(`#${id}`)) return;
  const style = document.createElement('style');
  style.id = id;
  style.textContent = `
/* Isolate widget UI from page a11y settings (CSS vars, inherited color/font) */
:host {
  font-size: 16px;
  font-family: system-ui, -apple-system, "Segoe UI", Roboto, Arial, sans-serif;
  line-height: 1.5;
  letter-spacing: normal;
  word-spacing: normal;
  color: #111827;
  --a11y-text-size: 100%;
  --line-height-scale: 1;
  --letter-spacing-scale: 0em;
  --word-spacing-scale: 0em;
}

/* Base defaults INSIDE shadow only (preflight-like, but scoped) */
#a11y-widget-container {
  font-family: inherit;
  font-size: 16px;
  line-height: inherit;
  text-rendering: geometricPrecision;
  letter-spacing: inherit;
  word-spacing: inherit;
  color: inherit;
}

#a11y-widget-container,
#a11y-widget-container * {
  box-sizing: border-box;
}

#a11y-widget-container button,
#a11y-widget-container input,
#a11y-widget-container select,
#a11y-widget-container textarea {
  font-family: inherit;
  font-size: inherit;
  line-height: inherit;
  letter-spacing: inherit;
  word-spacing: inherit;
  color: inherit;
}

#a11y-widget-container button {
  -webkit-appearance: button;
  appearance: button;
  /* Δεν κάνουμε background: none γιατί σβήνει Tailwind backgrounds (π.χ. bg-white/15 στο close button). */
  background-color: transparent;
  border: 0;
  padding: 0;
}

#a11y-widget-container summary {
  cursor: pointer;
}

/* Typography overrides (px — not rem — for host font-size independence) */
#a11y-widget-container .text-xs { font-size: 13px; line-height: 17.6px; }
#a11y-widget-container .text-sm { font-size: 15px; line-height: 21.6px; }
`;
  shadow.appendChild(style);
}

window.initA11yWidget = async (options = {}) => {
  const { position = 'bottom-left', accountId: optionsAccountId } = options;
  const { accountId: scriptAccountId, baseUrl, cssUrl } = getScriptConfig();
  const accountId = optionsAccountId ?? scriptAccountId ?? null;

  if (accountId) {
    const allowed = await validateDomain(accountId, window.location.hostname);
    if (!allowed) {
      if (typeof console !== 'undefined' && console.warn) {
        console.warn('[A11y Widget] Domain not allowed for this account.');
      }
      return;
    }
  }

  // Ensure CSS is loaded (supports both dist-widget and npm/jsDelivr outputs).
  const resolvedCssUrl = cssUrl ?? (baseUrl ? resolveCssFallback(baseUrl) : null);
  // In Shadow DOM mode we DO NOT load full widget CSS in document head (prevents global leakage).
  // We only inject a minimal effects stylesheet guarded by [data-a11y="on"].
  ensureGlobalEffectsStyle();

  const existingContainer = document.getElementById('a11y-widget-container');
  if (existingContainer) {
    if (typeof console !== 'undefined' && console.warn) {
      console.warn('A11y Widget is already initialized');
    }
    return;
  }

  if (!document.body.querySelector('.a11y-content-wrap')) {
    const wrap = document.createElement('div');
    wrap.className = 'a11y-content-wrap';
    wrap.style.minHeight = '100vh';
    while (document.body.firstChild) {
      wrap.appendChild(document.body.firstChild);
    }
    document.body.appendChild(wrap);
  }

  // Host element (in document) + Shadow DOM for full CSS isolation.
  const host = document.createElement('div');
  host.id = 'a11y-widget-container';
  host.style.position = 'fixed';
  /** Max z-index ώστε να μην «κρύβεται» πίσω από overlays admin/modals της host σελίδας. */
  host.style.zIndex = '2147483646';
  // IMPORTANT: αν είναι `none` εδώ, μπλοκάρει ΟΛΟ το subtree (άρα το widget δεν είναι κλικάρισιμο).
  host.style.pointerEvents = 'auto';
  host.setAttribute('data-a11y-widget-root', 'true');
  if (accountId) host.setAttribute('data-a11y-account', accountId);

  const positionStyles: Record<string, Record<string, string>> = {
    'bottom-right': { bottom: '0', right: '0' },
    'bottom-left': { bottom: '0', left: '0' },
    'top-right': { top: '0', right: '0' },
    'top-left': { top: '0', left: '0' },
  };

  const styles = positionStyles[position] || positionStyles['bottom-left'];
  Object.assign(host.style, styles);

  document.body.appendChild(host);

  const shadow = host.attachShadow({ mode: 'open' });
  ensureShadowBaseStyle(shadow);
  if (resolvedCssUrl) ensureShadowWidgetCss(shadow, resolvedCssUrl);

  // Wrapper inside shadow with same id so current Tailwind `important: '#a11y-widget-container'` CSS still matches.
  const shadowRootEl = document.createElement('div');
  shadowRootEl.id = 'a11y-widget-container';
  shadowRootEl.style.pointerEvents = 'auto';
  shadow.appendChild(shadowRootEl);

  const root = createRoot(shadowRootEl);
  root.render(
    <AccessibilityProvider>
      <AccessibilityWidget position={position} />
    </AccessibilityProvider>
  );
};

function bootstrap(): void {
  const { accountId } = getScriptConfig();
  window.initA11yWidget(accountId ? { accountId } : {});
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', bootstrap);
} else {
  bootstrap();
}
