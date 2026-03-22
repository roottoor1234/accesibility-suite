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

function getScriptConfig(): { accountId: string | null; baseUrl: string | null } {
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
  if (!baseUrl && script?.src) {
    try {
      const u = new URL(script.src);
      u.pathname = u.pathname.replace(/\/[^/]*$/, '/');
      baseUrl = u.origin + u.pathname;
    } catch {
      baseUrl = null;
    }
  }
  return { accountId, baseUrl };
}

function ensureWidgetCss(baseUrl: string): void {
  const id = 'a11y-widget-styles';
  if (document.getElementById(id)) return;
  const link = document.createElement('link');
  link.id = id;
  link.rel = 'stylesheet';
  link.href = baseUrl + 'a11y-widget.css';
  (document.head || document.documentElement).appendChild(link);
}

window.initA11yWidget = async (options = {}) => {
  const { position = 'bottom-left', accountId: optionsAccountId } = options;
  const { accountId: scriptAccountId, baseUrl } = getScriptConfig();
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

  if (baseUrl) ensureWidgetCss(baseUrl);

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

  const container = document.createElement('div');
  container.id = 'a11y-widget-container';
  container.style.position = 'fixed';
  /** Max z-index ώστε να μην «κρύβεται» πίσω από overlays admin/modals της host σελίδας. */
  container.style.zIndex = '2147483646';
  container.style.pointerEvents = 'none';
  container.setAttribute('data-a11y-widget-root', 'true');
  if (accountId) container.setAttribute('data-a11y-account', accountId);

  const positionStyles: Record<string, Record<string, string>> = {
    'bottom-right': { bottom: '0', right: '0' },
    'bottom-left': { bottom: '0', left: '0' },
    'top-right': { top: '0', right: '0' },
    'top-left': { top: '0', left: '0' },
  };

  const styles = positionStyles[position] || positionStyles['bottom-left'];
  Object.assign(container.style, styles);

  document.body.appendChild(container);

  const root = createRoot(container);
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
