import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

interface AccessibilitySettings {
  textSize: number;
  highContrast: boolean;
  pauseAnimations: boolean;
  highlightLinks: boolean;
  readingGuide: boolean;
  dyslexicFont: boolean;
  hideImages: boolean;
  lineHeight: number;
  letterSpacing: number;
  cursorSize: number;
  isSpeaking: boolean;
}

interface AccessibilityContextType {
  settings: AccessibilitySettings;
  updateSetting: <K extends keyof AccessibilitySettings>(
    key: K,
    value: AccessibilitySettings[K]
  ) => void;
  resetAll: () => void;
}

const defaultSettings: AccessibilitySettings = {
  textSize: 100,
  highContrast: false,
  pauseAnimations: false,
  highlightLinks: false,
  readingGuide: false,
  dyslexicFont: false,
  hideImages: false,
  lineHeight: 100,
  letterSpacing: 100,
  cursorSize: 100,
  isSpeaking: false,
};

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

export function AccessibilityProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<AccessibilitySettings>(() => {
    const stored = localStorage.getItem('accessibility-settings');
    if (stored) {
      try {
        return { ...defaultSettings, ...JSON.parse(stored), isSpeaking: false };
      } catch {
        return defaultSettings;
      }
    }
    return defaultSettings;
  });

  useEffect(() => {
    const toStore = { ...settings, isSpeaking: undefined };
    localStorage.setItem('accessibility-settings', JSON.stringify(toStore));
    applySettings(settings);
  }, [settings]);

  useEffect(() => {
    document.documentElement.setAttribute('data-a11y', 'on');
  }, []);

  const updateSetting = <K extends keyof AccessibilitySettings>(
    key: K,
    value: AccessibilitySettings[K]
  ) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const resetAll = () => {
    setSettings(defaultSettings);
    localStorage.removeItem('accessibility-settings');
  };

  return (
    <AccessibilityContext.Provider value={{ settings, updateSetting, resetAll }}>
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

function applySettings(settings: AccessibilitySettings) {
  const root = document.documentElement;

  root.style.fontSize = `${settings.textSize}%`;

  if (settings.highContrast) {
    root.setAttribute('data-high-contrast', 'true');
  } else {
    root.removeAttribute('data-high-contrast');
  }

  if (settings.pauseAnimations) {
    root.setAttribute('data-pause-animations', 'true');
  } else {
    root.removeAttribute('data-pause-animations');
  }

  if (settings.highlightLinks) {
    root.setAttribute('data-highlight-links', 'true');
  } else {
    root.removeAttribute('data-highlight-links');
  }

  if (settings.readingGuide) {
    root.setAttribute('data-reading-guide', 'true');
  } else {
    root.removeAttribute('data-reading-guide');
  }

  if (settings.dyslexicFont) {
    root.setAttribute('data-dyslexic-font', 'true');
  } else {
    root.removeAttribute('data-dyslexic-font');
  }

  if (settings.hideImages) {
    root.setAttribute('data-hide-images', 'true');
  } else {
    root.removeAttribute('data-hide-images');
  }

  root.style.setProperty('--line-height-scale', `${settings.lineHeight / 100}`);
  root.style.setProperty('--letter-spacing-scale', `${(settings.letterSpacing - 100) / 100}em`);
  root.style.setProperty('--cursor-size-scale', `${settings.cursorSize / 100}`);
}
