import { useState, useEffect, useRef } from "react";
import {
  Accessibility,
  X,
  Type,
  Contrast,
  PauseCircle,
  Link,
  Eye,
  BookOpen,
  // AArrow,
  ImageOff,
  AlignLeft,
  SpaceIcon,
  MousePointer,
  Volume2,
  StopCircle,
  RotateCcw,
} from "lucide-react";
import { useAccessibility } from "../contexts/AccessibilityContext";
import { useTextToSpeech } from "../hooks/useTextToSpeech";
import { ReadingGuide } from "./ReadingGuide";

export function AccessibilityWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const { settings, updateSetting, resetAll } = useAccessibility();
  const { speak, stop, isSpeaking } = useTextToSpeech();
  const panelRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false);
        buttonRef.current?.focus();
      }
    };

    const handleTabTrap = (e: KeyboardEvent) => {
      if (e.key !== "Tab" || !panelRef.current) return;

      const focusableElements = panelRef.current.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (e.shiftKey && document.activeElement === firstElement) {
        e.preventDefault();
        lastElement?.focus();
      } else if (!e.shiftKey && document.activeElement === lastElement) {
        e.preventDefault();
        firstElement?.focus();
      }
    };

    document.addEventListener("keydown", handleEscape);
    document.addEventListener("keydown", handleTabTrap);

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.removeEventListener("keydown", handleTabTrap);
    };
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && panelRef.current) {
      const firstButton = panelRef.current.querySelector<HTMLElement>("button");
      firstButton?.focus();
    }
  }, [isOpen]);

  const handleClose = () => {
    setIsOpen(false);
    buttonRef.current?.focus();
  };

  return (
    <>
      <ReadingGuide />

      <div className="accessibility-widget fixed bottom-6 left-6 z-[9999]">
        <button
          ref={buttonRef}
          onClick={() => setIsOpen(!isOpen)}
          className="w-14 h-14 rounded-full bg-blue-600 text-white shadow-lg hover:bg-blue-700 focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-300 transition-all duration-200 flex items-center justify-center group"
          aria-label="Άνοιγμα μενού προσβασιμότητας"
          aria-expanded={isOpen}
        >
          <Accessibility className="w-6 h-6 group-hover:scale-110 transition-transform" />
        </button>

        {isOpen && (
          <>
            <div
              className="fixed inset-0 bg-black/50 backdrop-blur-sm"
              onClick={handleClose}
              aria-hidden="true"
            />

            <div
              ref={panelRef}
              className="fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-2xl overflow-y-auto transform transition-transform duration-300 ease-out"
              role="dialog"
              aria-modal="true"
              aria-labelledby="accessibility-title"
            >
              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
                <h2
                  id="accessibility-title"
                  className="text-2xl font-bold text-gray-900"
                >
                  Προσβασιμότητα
                </h2>
                <button
                  onClick={handleClose}
                  className="w-10 h-10 rounded-lg hover:bg-gray-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 flex items-center justify-center transition-colors"
                  aria-label="Κλείσιμο"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <FeatureTile
                    icon={<Type className="w-6 h-6" />}
                    label="Μέγεθος Κειμένου"
                    onClick={() => {}}
                    active={settings.textSize !== 100}
                  >
                    <div className="mt-3 flex items-center justify-between gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          updateSetting(
                            "textSize",
                            Math.max(80, settings.textSize - 10)
                          );
                        }}
                        className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-semibold min-w-[44px] min-h-[44px] focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                        aria-label="Μείωση μεγέθους κειμένου"
                      >
                        A-
                      </button>
                      <span className="text-sm font-medium">
                        {settings.textSize}%
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          updateSetting(
                            "textSize",
                            Math.min(200, settings.textSize + 10)
                          );
                        }}
                        className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-semibold min-w-[44px] min-h-[44px] focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                        aria-label="Αύξηση μεγέθους κειμένου"
                      >
                        A+
                      </button>
                    </div>
                  </FeatureTile>

                  <FeatureTile
                    icon={<Contrast className="w-6 h-6" />}
                    label="Υψηλή Αντίθεση"
                    onClick={() =>
                      updateSetting("highContrast", !settings.highContrast)
                    }
                    active={settings.highContrast}
                  />

                  <FeatureTile
                    icon={<PauseCircle className="w-6 h-6" />}
                    label="Παύση Κινήσεων"
                    onClick={() =>
                      updateSetting(
                        "pauseAnimations",
                        !settings.pauseAnimations
                      )
                    }
                    active={settings.pauseAnimations}
                  />

                  <FeatureTile
                    icon={<Link className="w-6 h-6" />}
                    label="Επισήμανση Συνδέσμων"
                    onClick={() =>
                      updateSetting("highlightLinks", !settings.highlightLinks)
                    }
                    active={settings.highlightLinks}
                  />

                  <FeatureTile
                    icon={<Eye className="w-6 h-6" />}
                    label="Οδηγός Ανάγνωσης"
                    onClick={() =>
                      updateSetting("readingGuide", !settings.readingGuide)
                    }
                    active={settings.readingGuide}
                  />

                  <FeatureTile
                    icon={<BookOpen className="w-6 h-6" />}
                    label="Γραμματοσειρά Δυσλεξίας"
                    onClick={() =>
                      updateSetting("dyslexicFont", !settings.dyslexicFont)
                    }
                    active={settings.dyslexicFont}
                  />

                  <FeatureTile
                    icon={<ImageOff className="w-6 h-6" />}
                    label="Απόκρυψη Εικόνων"
                    onClick={() =>
                      updateSetting("hideImages", !settings.hideImages)
                    }
                    active={settings.hideImages}
                  />

                  <FeatureTile
                    icon={<AlignLeft className="w-6 h-6" />}
                    label="Ύψος Γραμμής"
                    onClick={() => {}}
                    active={settings.lineHeight !== 100}
                  >
                    <div className="mt-3 flex items-center justify-between gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          updateSetting(
                            "lineHeight",
                            Math.max(80, settings.lineHeight - 20)
                          );
                        }}
                        className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-semibold min-w-[44px] min-h-[44px] focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                        aria-label="Μείωση ύψους γραμμής"
                      >
                        -
                      </button>
                      <span className="text-sm font-medium">
                        {settings.lineHeight}%
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          updateSetting(
                            "lineHeight",
                            Math.min(200, settings.lineHeight + 20)
                          );
                        }}
                        className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-semibold min-w-[44px] min-h-[44px] focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                        aria-label="Αύξηση ύψους γραμμής"
                      >
                        +
                      </button>
                    </div>
                  </FeatureTile>

                  <FeatureTile
                    icon={<SpaceIcon className="w-6 h-6" />}
                    label="Απόσταση Γραμμάτων"
                    onClick={() => {}}
                    active={settings.letterSpacing !== 100}
                  >
                    <div className="mt-3 flex items-center justify-between gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          updateSetting(
                            "letterSpacing",
                            Math.max(80, settings.letterSpacing - 20)
                          );
                        }}
                        className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-semibold min-w-[44px] min-h-[44px] focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                        aria-label="Μείωση απόστασης γραμμάτων"
                      >
                        -
                      </button>
                      <span className="text-sm font-medium">
                        {settings.letterSpacing}%
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          updateSetting(
                            "letterSpacing",
                            Math.min(200, settings.letterSpacing + 20)
                          );
                        }}
                        className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-semibold min-w-[44px] min-h-[44px] focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                        aria-label="Αύξηση απόστασης γραμμάτων"
                      >
                        +
                      </button>
                    </div>
                  </FeatureTile>

                  <FeatureTile
                    icon={<MousePointer className="w-6 h-6" />}
                    label="Μέγεθος Δείκτη"
                    onClick={() => {}}
                    active={settings.cursorSize !== 100}
                  >
                    <div className="mt-3 flex items-center justify-between gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          updateSetting(
                            "cursorSize",
                            Math.max(100, settings.cursorSize - 50)
                          );
                        }}
                        className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-semibold min-w-[44px] min-h-[44px] focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                        aria-label="Μείωση μεγέθους δείκτη"
                      >
                        -
                      </button>
                      <span className="text-sm font-medium">
                        {settings.cursorSize}%
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          updateSetting(
                            "cursorSize",
                            Math.min(300, settings.cursorSize + 50)
                          );
                        }}
                        className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-semibold min-w-[44px] min-h-[44px] focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                        aria-label="Αύξηση μεγέθους δείκτη"
                      >
                        +
                      </button>
                    </div>
                  </FeatureTile>

                  <FeatureTile
                    icon={
                      isSpeaking ? (
                        <StopCircle className="w-6 h-6" />
                      ) : (
                        <Volume2 className="w-6 h-6" />
                      )
                    }
                    label={
                      isSpeaking ? "Διακοπή Ανάγνωσης" : "Ανάγνωση Σελίδας"
                    }
                    onClick={isSpeaking ? stop : speak}
                    active={isSpeaking}
                    className="col-span-2"
                  />
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <button
                    onClick={() => {
                      stop();
                      resetAll();
                    }}
                    className="w-full py-3 px-4 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium text-gray-700 flex items-center justify-center gap-2 min-h-[44px] focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 transition-colors"
                  >
                    <RotateCcw className="w-5 h-5" />
                    Επαναφορά Όλων
                  </button>
                </div>

                <div className="pt-2 text-xs text-gray-500 text-center">
                  <p>
                    Αυτό το εργαλείο παρέχει βοηθητικές λειτουργίες
                    προσβασιμότητας.
                  </p>
                  <p className="mt-1">
                    Δεν αντικαθιστά τους αναγνώστες οθόνης.
                  </p>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}

interface FeatureTileProps {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  active?: boolean;
  children?: React.ReactNode;
  className?: string;
}

function FeatureTile({
  icon,
  label,
  onClick,
  active,
  children,
  className = "",
}: FeatureTileProps) {
  return (
    <button
      onClick={onClick}
      className={`
        ${className}
        p-4 rounded-xl border-2 transition-all duration-200 text-left
        min-h-[120px] flex flex-col
        focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500
        ${
          active
            ? "border-blue-600 bg-blue-50 text-blue-900"
            : "border-gray-200 hover:border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
        }
      `}
      aria-pressed={active}
    >
      <div className="flex items-center gap-3">
        <div
          className={`
          p-2 rounded-lg transition-colors
          ${active ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600"}
        `}
        >
          {icon}
        </div>
        <span className="font-semibold text-sm leading-tight flex-1">
          {label}
        </span>
      </div>
      {children}
    </button>
  );
}
