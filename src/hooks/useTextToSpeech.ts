import { useCallback } from 'react';
import { useAccessibility } from '../contexts/AccessibilityContext';

export function useTextToSpeech() {
  const { settings, updateSetting } = useAccessibility();

  const speak = useCallback(() => {
    if (!('speechSynthesis' in window)) {
      alert('Η φωνητική σύνθεση δεν υποστηρίζεται από το πρόγραμμα περιήγησής σας.');
      return;
    }

    window.speechSynthesis.cancel();

    const mainContent = document.querySelector('main') || document.body;
    const textContent = extractTextContent(mainContent);

    if (!textContent.trim()) {
      alert('Δεν βρέθηκε κείμενο για ανάγνωση.');
      return;
    }

    const utterance = new SpeechSynthesisUtterance(textContent);
    utterance.lang = 'el-GR';
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.volume = 1;

    utterance.onstart = () => {
      updateSetting('isSpeaking', true);
    };

    utterance.onend = () => {
      updateSetting('isSpeaking', false);
    };

    utterance.onerror = () => {
      updateSetting('isSpeaking', false);
    };

    window.speechSynthesis.speak(utterance);
  }, [updateSetting]);

  const stop = useCallback(() => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      updateSetting('isSpeaking', false);
    }
  }, [updateSetting]);

  return { speak, stop, isSpeaking: settings.isSpeaking };
}

function extractTextContent(element: Element): string {
  const clone = element.cloneNode(true) as Element;

  const excludeSelectors = [
    'script',
    'style',
    'noscript',
    'iframe',
    '[aria-hidden="true"]',
    '.accessibility-widget',
  ];

  excludeSelectors.forEach((selector) => {
    clone.querySelectorAll(selector).forEach((el) => el.remove());
  });

  let text = clone.textContent || '';
  text = text.replace(/\s+/g, ' ').trim();

  return text;
}
