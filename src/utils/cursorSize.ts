const BASE_CURSOR_PX = 32;

export function cursorPercentToPx(percent: number): number {
  return Math.round(BASE_CURSOR_PX * (percent / 100));
}

/** Custom cursor CSS value for a given size % (100 = default / no custom cursor). */
export function buildA11yCursor(percent: number): string | null {
  if (percent <= 100) return null;
  const px = cursorPercentToPx(percent);
  const stroke = px >= 48 ? 3 : 2;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${px}" height="${px}" viewBox="0 0 48 48"><path d="M4 4 L4 42 L18 30 L26 44 L32 40 L24 27 L40 27 Z" fill="black" stroke="white" stroke-width="${stroke}"/></svg>`;
  return `url('data:image/svg+xml;utf8,${encodeURIComponent(svg)}') 0 0, auto`;
}
