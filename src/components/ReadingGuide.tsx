import { useReadingGuide } from '../hooks/useReadingGuide';
import { useAccessibility } from '../contexts/AccessibilityContext';

export function ReadingGuide() {
  const { enabled, position } = useReadingGuide();
  const { settings } = useAccessibility();

  return (
    <>
      {/* Reading Guide line */}
      {enabled && (
        <>
          <div
            className="fixed left-0 right-0 h-0.5 pointer-events-none z-[9998]"
            style={{
              top: `${position.y}px`,
              background: 'linear-gradient(to right, transparent, #facc15 10%, #facc15 90%, transparent)',
              boxShadow: '0 0 8px rgba(250, 204, 21, 0.6)',
            }}
            aria-hidden="true"
          />
          <div
            className="fixed left-0 right-0 pointer-events-none z-[9997]"
            style={{
              top: `${position.y - 50}px`,
              height: '100px',
              background: 'linear-gradient(to bottom, transparent 0%, rgba(250, 204, 21, 0.06) 40%, rgba(250, 204, 21, 0.06) 60%, transparent 100%)',
            }}
            aria-hidden="true"
          />
        </>
      )}

      {/* Reading Mask */}
      {settings.readingMask && (
        <>
          <div
            className="reading-mask-top"
            style={{ top: 0, height: `${Math.max(0, position.y - 60)}px` }}
            aria-hidden="true"
          />
          <div
            className="reading-mask-bottom"
            style={{ top: `${position.y + 60}px`, bottom: 0 }}
            aria-hidden="true"
          />
        </>
      )}
    </>
  );
}
