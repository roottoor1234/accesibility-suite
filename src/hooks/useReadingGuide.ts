import { useEffect, useState } from 'react';
import { useAccessibility } from '../contexts/AccessibilityContext';

export function useReadingGuide() {
  const { settings } = useAccessibility();
  const [position, setPosition] = useState({ y: 0 });

  const needsTracking = settings.readingGuide || settings.readingMask;

  useEffect(() => {
    if (!needsTracking) return;

    const handleMouseMove = (e: MouseEvent) => {
      setPosition({ y: e.clientY });
    };

    document.addEventListener('mousemove', handleMouseMove);
    return () => document.removeEventListener('mousemove', handleMouseMove);
  }, [needsTracking]);

  return { enabled: settings.readingGuide, position };
}
