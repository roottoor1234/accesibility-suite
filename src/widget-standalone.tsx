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
:root {
  --line-height-scale: 1;
  --letter-spacing-scale: 0em;
  --word-spacing-scale: 0em;
  --cursor-size-scale: 1;
  --a11y-text-size: 100%;
}

/* Text spacing */
[data-a11y="on"] .a11y-content-wrap {
  font-size: var(--a11y-text-size);
}
[data-a11y="on"] .a11y-content-wrap * {
  line-height: calc(1.5 * var(--line-height-scale));
  letter-spacing: var(--letter-spacing-scale);
  word-spacing: var(--word-spacing-scale);
}

/* High contrast */
[data-a11y="on"][data-high-contrast="true"] { background-color: #000 !important; color: #fff !important; }
[data-a11y="on"][data-high-contrast="true"] .a11y-content-wrap * {
  background-color: #000 !important;
  color: #fff !important;
  border-color: #fff !important;
}

/* Invert / saturation / overlay only on wrap */
[data-a11y="on"][data-invert-colors="true"] .a11y-content-wrap { filter: invert(1) hue-rotate(180deg); }
[data-a11y="on"][data-invert-colors="true"] .a11y-content-wrap img,
[data-a11y="on"][data-invert-colors="true"] .a11y-content-wrap video,
[data-a11y="on"][data-invert-colors="true"] .a11y-content-wrap svg { filter: invert(1) hue-rotate(180deg); }

[data-a11y="on"][data-saturation="low"] .a11y-content-wrap { filter: saturate(0.3); }
[data-a11y="on"][data-saturation="high"] .a11y-content-wrap { filter: saturate(2); }
[data-a11y="on"][data-saturation="monochrome"] .a11y-content-wrap { filter: grayscale(1); }

[data-a11y="on"][data-color-overlay] .a11y-content-wrap { position: relative; }
[data-a11y="on"][data-color-overlay] .a11y-content-wrap::before {
  content: "";
  position: absolute;
  inset: 0;
  z-index: 1;
  pointer-events: none;
  mix-blend-mode: multiply;
}
[data-a11y="on"][data-color-overlay="yellow"] .a11y-content-wrap::before { background: rgba(255, 255, 100, 0.15); }
[data-a11y="on"][data-color-overlay="blue"] .a11y-content-wrap::before { background: rgba(100, 150, 255, 0.12); }
[data-a11y="on"][data-color-overlay="green"] .a11y-content-wrap::before { background: rgba(100, 255, 130, 0.10); }
[data-a11y="on"][data-color-overlay="pink"] .a11y-content-wrap::before { background: rgba(255, 130, 180, 0.10); }

/* Pause animations */
[data-a11y="on"][data-pause-animations="true"] .a11y-content-wrap,
[data-a11y="on"][data-pause-animations="true"] .a11y-content-wrap * {
  animation-duration: 0.001ms !important;
  animation-iteration-count: 1 !important;
  transition-duration: 0.001ms !important;
}

/* Highlight links */
[data-a11y="on"][data-highlight-links="true"] .a11y-content-wrap a {
  background-color: #fef08a !important;
  color: #000 !important;
  text-decoration: underline !important;
  text-decoration-thickness: 3px !important;
  text-underline-offset: 3px !important;
  padding: 2px 4px !important;
  border-radius: 3px !important;
  outline: 2px solid #eab308 !important;
}

/* Highlight headings */
[data-a11y="on"][data-highlight-headings="true"] .a11y-content-wrap h1,
[data-a11y="on"][data-highlight-headings="true"] .a11y-content-wrap h2,
[data-a11y="on"][data-highlight-headings="true"] .a11y-content-wrap h3,
[data-a11y="on"][data-highlight-headings="true"] .a11y-content-wrap h4,
[data-a11y="on"][data-highlight-headings="true"] .a11y-content-wrap h5,
[data-a11y="on"][data-highlight-headings="true"] .a11y-content-wrap h6 {
  border-bottom: 3px solid #3b82f6 !important;
  padding-bottom: 4px !important;
  background: linear-gradient(to right, rgba(59,130,246,0.08), transparent) !important;
  padding-left: 8px !important;
  border-left: 4px solid #3b82f6 !important;
  border-radius: 2px !important;
}

/* Dyslexic font */
[data-a11y="on"][data-dyslexic-font="true"] .a11y-content-wrap,
[data-a11y="on"][data-dyslexic-font="true"] .a11y-content-wrap * {
  font-family: "Comic Sans MS","OpenDyslexic",Arial,Helvetica,sans-serif !important;
  font-weight: 500 !important;
}

/* Hide images */
[data-a11y="on"][data-hide-images="true"] .a11y-content-wrap img,
[data-a11y="on"][data-hide-images="true"] .a11y-content-wrap svg,
[data-a11y="on"][data-hide-images="true"] .a11y-content-wrap video,
[data-a11y="on"][data-hide-images="true"] .a11y-content-wrap picture {
  opacity: 0.05 !important;
  pointer-events: none !important;
}

/* Text align */
[data-a11y="on"][data-text-align="left"] .a11y-content-wrap * { text-align: left !important; }
[data-a11y="on"][data-text-align="center"] .a11y-content-wrap * { text-align: center !important; }
[data-a11y="on"][data-text-align="right"] .a11y-content-wrap * { text-align: right !important; }

/* Focus highlight */
[data-a11y="on"][data-focus-highlight="true"] .a11y-content-wrap *:focus-visible {
  outline: 4px solid #ef4444 !important;
  outline-offset: 4px !important;
  box-shadow: 0 0 0 6px rgba(239,68,68,0.3) !important;
}

/* Target size */
[data-a11y="on"] .a11y-content-wrap button,
[data-a11y="on"] .a11y-content-wrap a,
[data-a11y="on"] .a11y-content-wrap [role="button"],
[data-a11y="on"] .a11y-content-wrap input[type="checkbox"],
[data-a11y="on"] .a11y-content-wrap input[type="radio"] {
  min-width: 44px !important;
  min-height: 44px !important;
}

/* Cursor size */
[data-a11y="on"][data-cursor-size="large"] .a11y-content-wrap,
[data-a11y="on"][data-cursor-size="large"] .a11y-content-wrap * {
  cursor: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48"><path d="M4 4 L4 42 L18 30 L26 44 L32 40 L24 27 L40 27 Z" fill="black" stroke="white" stroke-width="2"/></svg>') 0 0, auto !important;
}
[data-a11y="on"][data-cursor-size="xlarge"] .a11y-content-wrap,
[data-a11y="on"][data-cursor-size="xlarge"] .a11y-content-wrap * {
  cursor: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64"><path d="M5 5 L5 56 L24 40 L34 58 L42 54 L32 36 L52 36 Z" fill="black" stroke="white" stroke-width="3"/></svg>') 0 0, auto !important;
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
/* Base defaults INSIDE shadow only (preflight-like, but scoped) */
#a11y-widget-container {
  font-family: system-ui, -apple-system, "Segoe UI", Roboto, Arial, sans-serif;
  /* Slightly larger base for readability on content-heavy sites */
  font-size: 17px;
  line-height: 1.5;
  text-rendering: geometricPrecision;
  /* Prevent page text-spacing features from affecting widget UI */
  letter-spacing: normal;
  word-spacing: normal;
}

#a11y-widget-container,
#a11y-widget-container * {
  box-sizing: border-box;
}

#a11y-widget-container button,
#a11y-widget-container input,
#a11y-widget-container select,
#a11y-widget-container textarea {
  font: inherit;
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

/* Make small text a bit more readable */
#a11y-widget-container .text-xs { font-size: 0.8125rem; line-height: 1.1rem; }
#a11y-widget-container .text-sm { font-size: 0.9375rem; line-height: 1.35rem; }
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
  const resolvedCssUrl = cssUrl ?? (baseUrl ? baseUrl + 'a11y-widget.css' : null);
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
