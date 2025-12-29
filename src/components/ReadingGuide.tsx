import { useReadingGuide } from '../hooks/useReadingGuide';

export function ReadingGuide() {
  const { enabled, position } = useReadingGuide();

  if (!enabled) return null;

  return (
    <>
      <div
        className="fixed left-0 right-0 h-1 bg-yellow-400 pointer-events-none z-[9998] shadow-lg"
        style={{ top: `${position.y}px` }}
        aria-hidden="true"
      />
      <div
        className="fixed left-0 right-0 pointer-events-none z-[9997]"
        style={{
          top: `${position.y - 60}px`,
          height: '120px',
          background: 'linear-gradient(to bottom, transparent 0%, rgba(255, 255, 255, 0.7) 45%, rgba(255, 255, 255, 0.7) 55%, transparent 100%)',
        }}
        aria-hidden="true"
      />
    </>
  );
}
