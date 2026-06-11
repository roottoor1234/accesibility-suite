import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { buildA11yCursor } from '../utils/cursorSize';

export type AppLocale = 'el' | 'en' | 'de';

export interface AccessibilitySettings {
  language: AppLocale;
  textSize: number;
  highContrast: boolean;
  invertColors: boolean;
  saturation: 'normal' | 'low' | 'high' | 'monochrome';
  colorOverlay: 'none' | 'yellow' | 'blue' | 'green' | 'pink';
  pauseAnimations: boolean;
  highlightLinks: boolean;
  highlightHeadings: boolean;
  readingGuide: boolean;
  readingMask: boolean;
  dyslexicFont: boolean;
  hideImages: boolean;
  lineHeight: number;
  letterSpacing: number;
  wordSpacing: number;
  textAlign: 'default' | 'left' | 'center' | 'right';
  cursorSize: number;
  focusHighlight: boolean;
  isSpeaking: boolean;
}

interface AccessibilityContextType {
  settings: AccessibilitySettings;
  updateSetting: <K extends keyof AccessibilitySettings>(
    key: K,
    value: AccessibilitySettings[K]
  ) => void;
  resetAll: () => void;
  activeCount: number;
}

/** Namespace ώστε να μη συγκρούεται με άλλα scripts που χρησιμοποιούν `accessibility-settings`. */
const LS_KEY = 'a11y-widget-settings';
const LS_KEY_LEGACY = 'accessibility-settings';

const defaultSettings: AccessibilitySettings = {
  language: 'el',
  textSize: 100,
  highContrast: false,
  invertColors: false,
  saturation: 'normal',
  colorOverlay: 'none',
  pauseAnimations: false,
  highlightLinks: false,
  highlightHeadings: false,
  readingGuide: false,
  readingMask: false,
  dyslexicFont: false,
  hideImages: false,
  lineHeight: 100,
  letterSpacing: 100,
  wordSpacing: 100,
  textAlign: 'default',
  cursorSize: 100,
  focusHighlight: false,
  isSpeaking: false,
};

function safeGetLocalStorage(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function safeSetLocalStorage(key: string, value: string): void {
  try {
    localStorage.setItem(key, value);
  } catch {
    /* private mode / αποκλεισμός — το widget λειτουργεί χωρίς persistence */
  }
}

function safeRemoveLocalStorage(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch {
    /* ignore */
  }
}

function loadStoredSettings(): AccessibilitySettings {
  const raw =
    safeGetLocalStorage(LS_KEY) ?? safeGetLocalStorage(LS_KEY_LEGACY);
  if (raw) {
    try {
      return { ...defaultSettings, ...JSON.parse(raw), isSpeaking: false };
    } catch {
      return defaultSettings;
    }
  }
  return defaultSettings;
}

function countActive(s: AccessibilitySettings): number {
  let count = 0;
  if (s.textSize !== 100) count++;
  if (s.highContrast) count++;
  if (s.invertColors) count++;
  if (s.saturation !== 'normal') count++;
  if (s.colorOverlay !== 'none') count++;
  if (s.pauseAnimations) count++;
  if (s.highlightLinks) count++;
  if (s.highlightHeadings) count++;
  if (s.readingGuide) count++;
  if (s.readingMask) count++;
  if (s.dyslexicFont) count++;
  if (s.hideImages) count++;
  if (s.lineHeight !== 100) count++;
  if (s.letterSpacing !== 100) count++;
  if (s.wordSpacing !== 100) count++;
  if (s.textAlign !== 'default') count++;
  if (s.cursorSize !== 100) count++;
  if (s.focusHighlight) count++;
  return count;
}

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

export function AccessibilityProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<AccessibilitySettings>(() => loadStoredSettings());

  useEffect(() => {
    const { isSpeaking: _, ...persistable } = settings;
    safeSetLocalStorage(LS_KEY, JSON.stringify(persistable));
    safeRemoveLocalStorage(LS_KEY_LEGACY);
    applySettings(settings);
  }, [settings]);

  // Γλώσσα widget: ΜΟΝΟ το UI του widget (όχι το κείμενο της σελίδας του πελάτη).
  // Το document.documentElement.lang αφήνεται όπως το έχει η σελίδα.

  const updateSetting = <K extends keyof AccessibilitySettings>(
    key: K,
    value: AccessibilitySettings[K]
  ) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const resetAll = () => {
    setSettings(defaultSettings);
    safeRemoveLocalStorage(LS_KEY);
    safeRemoveLocalStorage(LS_KEY_LEGACY);
  };

  return (
    <AccessibilityContext.Provider value={{ settings, updateSetting, resetAll, activeCount: countActive(settings) }}>
      {children}
    </AccessibilityContext.Provider>
  );
}

export function useAccessibility() {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error('useAccessibility must be used within AccessibilityProvider');
  }
  return context;
}

function setAttr(el: HTMLElement, attr: string, on: boolean) {
  if (on) el.setAttribute(attr, 'true');
  else el.removeAttribute(attr);
}

/** Καθαρίζει legacy attributes/CSS vars από <html> (παλιότερες εκδόσεις). */
function clearLegacyPageAttrs(): void {
  const root = document.documentElement;
  const legacyAttrs = [
    'data-a11y',
    'data-high-contrast',
    'data-invert-colors',
    'data-pause-animations',
    'data-highlight-links',
    'data-highlight-headings',
    'data-reading-guide',
    'data-reading-mask',
    'data-dyslexic-font',
    'data-hide-images',
    'data-focus-highlight',
    'data-saturation',
    'data-color-overlay',
    'data-text-align',
    'data-cursor-size',
  ];
  for (const attr of legacyAttrs) root.removeAttribute(attr);
  root.style.removeProperty('--a11y-text-size');
  root.style.removeProperty('--line-height-scale');
  root.style.removeProperty('--letter-spacing-scale');
  root.style.removeProperty('--word-spacing-scale');
}

function getPageTarget(): HTMLElement {
  return (document.querySelector('.a11y-content-wrap') as HTMLElement | null) ?? document.documentElement;
}

function applySettings(s: AccessibilitySettings) {
  clearLegacyPageAttrs();
  const target = getPageTarget();

  /**
   * Όλες οι ρυθμίσεις σελίδας μόνο στο `.a11y-content-wrap` — όχι στο <html>.
   * Έτσι δεν διαρρέουν CSS variables / inherited styles στο widget (Shadow DOM host).
   */
  target.style.setProperty('--a11y-text-size', `${s.textSize}%`);
  target.style.setProperty('--line-height-scale', `${s.lineHeight / 100}`);
  target.style.setProperty('--letter-spacing-scale', `${(s.letterSpacing - 100) / 100}em`);
  target.style.setProperty('--word-spacing-scale', `${(s.wordSpacing - 100) / 100}em`);

  setAttr(target, 'data-high-contrast', s.highContrast);
  setAttr(target, 'data-invert-colors', s.invertColors);
  setAttr(target, 'data-pause-animations', s.pauseAnimations);
  setAttr(target, 'data-highlight-links', s.highlightLinks);
  setAttr(target, 'data-highlight-headings', s.highlightHeadings);
  setAttr(target, 'data-reading-guide', s.readingGuide);
  setAttr(target, 'data-reading-mask', s.readingMask);
  setAttr(target, 'data-dyslexic-font', s.dyslexicFont);
  setAttr(target, 'data-hide-images', s.hideImages);
  setAttr(target, 'data-focus-highlight', s.focusHighlight);

  if (s.saturation !== 'normal') target.setAttribute('data-saturation', s.saturation);
  else target.removeAttribute('data-saturation');

  if (s.colorOverlay !== 'none') target.setAttribute('data-color-overlay', s.colorOverlay);
  else target.removeAttribute('data-color-overlay');

  if (s.textAlign !== 'default') target.setAttribute('data-text-align', s.textAlign);
  else target.removeAttribute('data-text-align');

  const cursor = buildA11yCursor(s.cursorSize);
  if (cursor) {
    target.style.setProperty('--a11y-cursor', cursor);
    target.setAttribute('data-cursor-size', String(s.cursorSize));
  } else {
    target.style.removeProperty('--a11y-cursor');
    target.removeAttribute('data-cursor-size');
  }

  const active = countActive(s) > 0;
  if (active) target.setAttribute('data-a11y', 'on');
  else target.removeAttribute('data-a11y');
}
