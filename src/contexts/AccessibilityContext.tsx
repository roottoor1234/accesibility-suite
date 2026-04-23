import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

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
    /** Μόνο όταν υπάρχει τουλάχιστον μία ενεργή ρύθμιση· αλλιώς κανένα [data-a11y="on"] rule δεν εφαρμόζεται στη σελίδα. */
    const active = countActive(settings) > 0;
    if (active) {
      document.documentElement.setAttribute('data-a11y', 'on');
    } else {
      document.documentElement.removeAttribute('data-a11y');
    }
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

function applySettings(s: AccessibilitySettings) {
  const root = document.documentElement;

  /**
   * IMPORTANT: Δεν αλλάζουμε το font-size του host <html>.
   * Το scaling κειμένου γίνεται μόνο στο `.a11y-content-wrap` μέσω CSS (βλ. widget-standalone ensureGlobalEffectsStyle).
   */
  root.style.setProperty('--a11y-text-size', `${s.textSize}%`);

  setAttr(root, 'data-high-contrast', s.highContrast);
  setAttr(root, 'data-invert-colors', s.invertColors);
  setAttr(root, 'data-pause-animations', s.pauseAnimations);
  setAttr(root, 'data-highlight-links', s.highlightLinks);
  setAttr(root, 'data-highlight-headings', s.highlightHeadings);
  setAttr(root, 'data-reading-guide', s.readingGuide);
  setAttr(root, 'data-reading-mask', s.readingMask);
  setAttr(root, 'data-dyslexic-font', s.dyslexicFont);
  setAttr(root, 'data-hide-images', s.hideImages);
  setAttr(root, 'data-focus-highlight', s.focusHighlight);

  if (s.saturation !== 'normal') root.setAttribute('data-saturation', s.saturation);
  else root.removeAttribute('data-saturation');

  if (s.colorOverlay !== 'none') root.setAttribute('data-color-overlay', s.colorOverlay);
  else root.removeAttribute('data-color-overlay');

  if (s.textAlign !== 'default') root.setAttribute('data-text-align', s.textAlign);
  else root.removeAttribute('data-text-align');

  root.style.setProperty('--line-height-scale', `${s.lineHeight / 100}`);
  root.style.setProperty('--letter-spacing-scale', `${(s.letterSpacing - 100) / 100}em`);
  root.style.setProperty('--word-spacing-scale', `${(s.wordSpacing - 100) / 100}em`);

  if (s.cursorSize >= 200) root.setAttribute('data-cursor-size', 'xlarge');
  else if (s.cursorSize > 100) root.setAttribute('data-cursor-size', 'large');
  else root.removeAttribute('data-cursor-size');
}
