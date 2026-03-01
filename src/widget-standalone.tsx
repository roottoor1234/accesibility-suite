import { createRoot } from 'react-dom/client';
import { AccessibilityProvider } from './contexts/AccessibilityContext';
import { AccessibilityWidget, type WidgetPosition } from './components/AccessibilityWidget';
import {
  getLicenseKeyFromPage,
  getCurrentDomain,
  validateLicense,
  isLicenseCheckEnabled,
  getLicenseApiUrl,
} from './lib/license';
import './widget-styles.css';

declare global {
  interface Window {
    initA11yWidget: (options?: { position?: WidgetPosition }) => void;
  }
}

function mountWidget(position: WidgetPosition = 'bottom-left') {
  const existingContainer = document.getElementById('a11y-widget-container');
  if (existingContainer) {
    console.warn('A11y Widget is already initialized');
    return;
  }

  /* Τυλίγουμε το υπάρχον περιεχόμενο του body ώστε invert/επικάλυψη να μην πιάνουν το widget */
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
  container.style.zIndex = '99999';
  container.style.pointerEvents = 'none';
  container.setAttribute('data-a11y-widget-root', 'true');

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
}

window.initA11yWidget = (options = {}) => {
  mountWidget(options.position);
};

async function bootstrap() {
  const position: WidgetPosition = 'bottom-left';

  if (isLicenseCheckEnabled()) {
    const key = getLicenseKeyFromPage();
    if (!key) {
      return; // Χωρίς key δεν φορτώνει το widget
    }
    const apiUrl = getLicenseApiUrl();
    const domain = getCurrentDomain();
    const result = await validateLicense(apiUrl, key, domain);
    if (!result.valid) {
      return; // Invalid license → δεν εμφανίζουμε widget
    }
  }

  mountWidget(position);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    bootstrap();
  });
} else {
  bootstrap();
}
