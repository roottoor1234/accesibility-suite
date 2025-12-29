import { useEffect, useState } from 'react';
import { useAccessibility } from '../contexts/AccessibilityContext';

export function useReadingGuide() {
  const { settings } = useAccessibility();
  const [position, setPosition] = useState({ y: 0 });

  useEffect(() => {
    if (!settings.readingGuide) return;

    const handleMouseMove = (e: MouseEvent) => {
      setPosition({ y: e.clientY });
    };

    document.addEventListener('mousemove', handleMouseMove);
    return () => document.removeEventListener('mousemove', handleMouseMove);
  }, [settings.readingGuide]);

  return { enabled: settings.readingGuide, position };
}
