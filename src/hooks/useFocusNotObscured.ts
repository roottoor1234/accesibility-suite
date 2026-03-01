import { useEffect } from 'react';

/**
 * WCAG 2.2 SC 2.4.11 Focus Not Obscured (Minimum) - Level AA.
 * When a component receives keyboard focus, scroll it into view so it is not entirely
 * hidden by author-created content (e.g. sticky headers, fixed widgets).
 */
export function useFocusNotObscured() {
  useEffect(() => {
    const handleFocusIn = (e: FocusEvent) => {
      const target = e.target as HTMLElement;
      if (target && typeof target.scrollIntoView === 'function') {
        target.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: 'instant' });
      }
    };

    document.addEventListener('focusin', handleFocusIn, true);
    return () => document.removeEventListener('focusin', handleFocusIn, true);
  }, []);
}
