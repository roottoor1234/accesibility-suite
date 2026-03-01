/**
 * License validation για το A11y Widget.
 * Ο πελάτης βάζει data-license-key στο script tag. Το widget καλεί το API σου
 * με key + domain· αν το API επιστρέψει valid: true, το widget φορτώνει.
 */

declare const __A11Y_LICENSE_API__: string | undefined;

export interface LicenseResult {
  valid: boolean;
  message?: string;
  plan?: string;
}

const DEFAULT_API = typeof __A11Y_LICENSE_API__ !== 'undefined' ? __A11Y_LICENSE_API__ : '';

function normalizeDomain(hostname: string): string {
  return hostname.replace(/^www\./, '').toLowerCase();
}

/** Διάβασε το license key από το script tag που φόρτωσε το widget. */
export function getLicenseKeyFromPage(): string | null {
  if (typeof document === 'undefined') return null;
  const script =
    document.currentScript ||
    document.querySelector('script[data-license-key][src*="a11y-widget"]');
  const key = script?.getAttribute('data-license-key')?.trim() || null;
  return key || null;
}

/** Τρέχον domain (χωρίς www). */
export function getCurrentDomain(): string {
  if (typeof window === 'undefined') return '';
  return normalizeDomain(window.location.hostname);
}

/**
 * Επικύρωση άδειας στο backend σου.
 * GET apiUrl?key=xxx&domain=yyy → { valid: true } | { valid: false, message?: string }
 */
export function validateLicense(
  apiUrl: string,
  key: string,
  domain: string
): Promise<LicenseResult> {
  if (!apiUrl || !key) {
    return Promise.resolve({ valid: false, message: 'Missing API URL or license key' });
  }
  const url = `${apiUrl.replace(/\/$/, '')}?key=${encodeURIComponent(key)}&domain=${encodeURIComponent(domain)}`;
  return fetch(url, { method: 'GET', mode: 'cors' })
    .then((res) => res.json())
    .then((data: { valid?: boolean; message?: string; plan?: string }) => ({
      valid: Boolean(data.valid),
      message: data.message,
      plan: data.plan,
    }))
    .catch(() => ({ valid: false, message: 'License check failed' }));
}

/**
 * Ελέγχει αν πρέπει να τρέξει validation (υπάρχει API URL στο build).
 */
export function isLicenseCheckEnabled(): boolean {
  return Boolean(DEFAULT_API);
}

export function getLicenseApiUrl(): string {
  return DEFAULT_API;
}
