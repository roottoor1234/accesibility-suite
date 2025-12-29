import { createRoot } from 'react-dom/client';
import { AccessibilityProvider } from './contexts/AccessibilityContext';
import { AccessibilityWidget } from './components/AccessibilityWidget';
import './widget-styles.css';

declare global {
  interface Window {
    initA11yWidget: (options?: { position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left' }) => void;
  }
}

window.initA11yWidget = (options = {}) => {
  const { position = 'bottom-right' } = options;

  const existingContainer = document.getElementById('a11y-widget-container');
  if (existingContainer) {
    console.warn('A11y Widget is already initialized');
    return;
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

  const styles = positionStyles[position] || positionStyles['bottom-right'];
  Object.assign(container.style, styles);

  document.body.appendChild(container);

  const root = createRoot(container);
  root.render(
    <AccessibilityProvider>
      <AccessibilityWidget />
    </AccessibilityProvider>
  );
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.initA11yWidget();
  });
} else {
  window.initA11yWidget();
}
