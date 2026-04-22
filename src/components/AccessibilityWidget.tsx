import { useState, useEffect, useRef, useId, type ReactNode } from "react";
import {
  Accessibility,
  X,
  Type,
  Contrast,
  PauseCircle,
  Link,
  Eye,
  BookOpen,
  ImageOff,
  AlignLeft,
  SpaceIcon,
  MousePointer,
  Volume2,
  StopCircle,
  RotateCcw,
  SunMoon,
  Palette,
  Heading,
  EyeOff,
  AlignCenter,
  AlignRight,
  Crosshair,
  Layers,
  MonitorDown,
} from "lucide-react";
import { useAccessibility } from "../contexts/AccessibilityContext";
import { useTextToSpeech } from "../hooks/useTextToSpeech";
import { ReadingGuide } from "./ReadingGuide";
import { t, type TranslationKey } from "../i18n/translations";

export type WidgetPosition =
  | "bottom-right"
  | "bottom-left"
  | "top-right"
  | "top-left";

/** Σταθερά px (όχι rem) ώστε embed σε host με μεγάλο html { font-size } να μην μεγαλώνει το widget. */
const positionClasses: Record<WidgetPosition, string> = {
  "bottom-right": "bottom-[24px] right-[24px]",
  "bottom-left": "bottom-[24px] left-[24px]",
  "top-right": "top-[24px] right-[24px]",
  "top-left": "top-[24px] left-[24px]",
};

const LANG_OPTIONS: { value: "el" | "en" | "de"; flagCode: string; name: string }[] = [
  { value: "el", flagCode: "gr", name: "Ελληνικά" },
  { value: "en", flagCode: "gb", name: "English" },
  { value: "de", flagCode: "de", name: "Deutsch" },
];

function LangFlag({ code, className = "w-7 h-5 object-cover rounded shrink-0" }: { code: string; className?: string }) {
  return (
    <img
      src={`https://flagcdn.com/w40/${code}.png`}
      alt=""
      className={className}
      width={28}
      height={20}
      loading="lazy"
    />
  );
}

export function AccessibilityWidget({
  position = "bottom-left",
}: { position?: WidgetPosition } = {}) {
  const [isOpen, setIsOpen] = useState(false);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const [panelMounted, setPanelMounted] = useState(false);
  const [panelVisible, setPanelVisible] = useState(false);
  const { settings, updateSetting, resetAll, activeCount } =
    useAccessibility();
  const { speak, stop, isSpeaking } = useTextToSpeech();
  const panelRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const langListRef = useRef<HTMLUListElement>(null);
  const langTriggerRef = useRef<HTMLButtonElement>(null);
  const langListId = useId();

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
      const els = panelRef.current.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      const first = els[0];
      const last = els[els.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last?.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first?.focus();
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
    if (isOpen) document.getElementById("a11y-close-btn")?.focus();
  }, [isOpen]);

  // Mount panel for animation; unmount after close transition ends.
  useEffect(() => {
    if (isOpen) {
      setPanelMounted(true);
      // Start from "closed" state then open on next frame,
      // otherwise mount happens already open and the slide-in won't animate.
      setPanelVisible(false);
      // Double rAF ensures at least one paint in the closed state (React 18 batching can skip it otherwise).
      requestAnimationFrame(() => {
        requestAnimationFrame(() => setPanelVisible(true));
      });
    } else {
      // Trigger slide-out + fade-out while staying mounted.
      setPanelVisible(false);
    }
  }, [isOpen]);

  // Language dropdown: keyboard (WCAG 2.1.1) and focus + aria-activedescendant
  const [langActiveId, setLangActiveId] = useState<string | null>(null);
  useEffect(() => {
    if (!langDropdownOpen || !langListRef.current) return;
    const list = langListRef.current;
    list.focus({ preventScroll: true });
    const current = settings.language;
    setLangActiveId(`${langListId}-option-${current}`);

    const options = Array.from(list.querySelectorAll<HTMLElement>("[role='option']"));
    const ids = options.map((el) => el.id);
    let activeIndex = ids.indexOf(`${langListId}-option-${current}`);
    if (activeIndex < 0) activeIndex = 0;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        setLangDropdownOpen(false);
        langTriggerRef.current?.focus();
        return;
      }
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        const id = ids[activeIndex];
        const opt = id ? document.getElementById(id) : null;
        const val = opt?.getAttribute("data-lang") as "el" | "en" | "de" | null;
        if (val) {
          updateSetting("language", val);
          setLangDropdownOpen(false);
          langTriggerRef.current?.focus();
        }
        return;
      }
      if (e.key === "ArrowDown") {
        e.preventDefault();
        activeIndex = Math.min(activeIndex + 1, options.length - 1);
        setLangActiveId(ids[activeIndex] ?? null);
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        activeIndex = Math.max(activeIndex - 1, 0);
        setLangActiveId(ids[activeIndex] ?? null);
      }
    };

    list.addEventListener("keydown", handleKeyDown);
    return () => list.removeEventListener("keydown", handleKeyDown);
  }, [langDropdownOpen, langListId, settings.language, updateSetting]);

  const handleClose = () => {
    setLangDropdownOpen(false);
    setIsOpen(false);
    buttonRef.current?.focus();
  };

  const lang = settings.language;
  const L = (key: TranslationKey) => t(lang, key);

  const satOpts = ["normal", "low", "high", "monochrome"] as const;
  const satKey: Record<string, TranslationKey> = {
    normal: "satNormal",
    low: "satLow",
    high: "satHigh",
    monochrome: "satMono",
  };

  const overlayOpts = ["none", "yellow", "blue", "green", "pink"] as const;
  const overlayKey: Record<string, TranslationKey> = {
    none: "overlayNone",
    yellow: "overlayYellow",
    blue: "overlayBlue",
    green: "overlayGreen",
    pink: "overlayPink",
  };

  const alignOpts = ["default", "left", "center", "right"] as const;
  const alignKey: Record<string, TranslationKey> = {
    default: "alignDefault",
    left: "alignLeft",
    center: "alignCenter",
    right: "alignRight",
  };
  const AlignIcons: Record<string, ReactNode> = {
    default: <AlignLeft className="w-3.5 h-3.5" />,
    left: <AlignLeft className="w-3.5 h-3.5" />,
    center: <AlignCenter className="w-3.5 h-3.5" />,
    right: <AlignRight className="w-3.5 h-3.5" />,
  };

  return (
    <>
      <ReadingGuide />

      <div
        className={`accessibility-widget fixed ${positionClasses[position]} z-[9999]`}
        lang={settings.language}
        data-a11y-widget-root=""
      >
        {/* ═══ Trigger Button ═══ */}
        <button
          ref={buttonRef}
          onClick={() => setIsOpen(!isOpen)}
          className={`
            relative w-[64px] h-[64px] min-w-[64px] min-h-[64px] rounded-[16px] text-white shadow-xl
            focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-300 focus-visible:ring-offset-2
            transition-all duration-300 flex items-center justify-center group
            bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700
            hover:from-blue-500 hover:via-indigo-500 hover:to-purple-600
            hover:shadow-2xl hover:scale-105
            ${activeCount === 0 ? "a11y-trigger-pulse" : ""}
          `}
          aria-label={isOpen ? L("closeMenu") : L("openMenu")}
          aria-expanded={isOpen}
        >
          <Accessibility className="w-[28px] h-[28px] group-hover:scale-110 transition-transform drop-shadow-md shrink-0" />
          {activeCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 min-w-[24px] min-h-[24px] w-[24px] h-[24px] rounded-full bg-red-500 text-white text-xs font-bold flex items-center justify-center shadow-lg ring-2 ring-white">
              {activeCount}
            </span>
          )}
        </button>

        {/* ═══ Panel ═══ */}
        {panelMounted && (
          <>
            <div
              className={[
                "fixed inset-0 z-[9998] transition-opacity duration-300 ease-out",
                "motion-reduce:transition-none",
                panelVisible
                  ? "opacity-100 bg-black/25"
                  : "opacity-0 bg-black/0 pointer-events-none",
              ].join(" ")}
              onClick={handleClose}
              aria-hidden="true"
              onTransitionEnd={() => {
                // When overlay finishes fading out, unmount panel
                if (!panelVisible && !isOpen) setPanelMounted(false);
              }}
            />

            <div
              ref={panelRef}
              className={[
                "fixed top-0 left-0 h-full w-full max-w-[420px] bg-gray-50 shadow-2xl overflow-y-auto z-[9999]",
                "transform transition-transform duration-300 ease-out will-change-transform",
                "motion-reduce:transition-none motion-reduce:transform-none",
                panelVisible
                  ? "translate-x-0"
                  : "-translate-x-full pointer-events-none",
              ].join(" ")}
              role={panelVisible ? "dialog" : undefined}
              aria-modal={panelVisible ? "true" : undefined}
              aria-labelledby={panelVisible ? "a11y-panel-title" : undefined}
              aria-hidden={panelVisible ? undefined : true}
              tabIndex={panelVisible ? undefined : -1}
            >
              {/* ── Header ── */}
              <div className="sticky top-0 z-10 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-700 px-5 py-4 flex items-center justify-between shadow-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center">
                    <Accessibility className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2
                      id="a11y-panel-title"
                      className="text-lg font-bold text-white leading-tight"
                    >
                      {L("a11y")}
                    </h2>
                    <p className="text-xs text-blue-100">
                      {L("wcag22")}
                      {activeCount > 0 && (
                        <span className="ml-2 px-1.5 py-0.5 bg-white/20 rounded text-white font-semibold">
                          {activeCount} {activeCount === 1 ? L("activeOne") : L("activeMany")}
                        </span>
                      )}
                    </p>
                  </div>
                </div>
                <button
                  id="a11y-close-btn"
                  onClick={handleClose}
                  className="w-10 h-10 rounded-xl bg-white/15 hover:bg-white/25 focus:outline-none focus-visible:ring-2 focus-visible:ring-white flex items-center justify-center transition-colors"
                  aria-label={L("closePanel")}
                >
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>

              <div className="p-4 space-y-5">
                {/* ════════ Γλώσσα: WCAG 2.1.1 dropdown με σημαίες ════════ */}
                <Section title={L("language")}>
                  <div className="relative">
                    <button
                      ref={langTriggerRef}
                      type="button"
                      aria-haspopup="listbox"
                      aria-expanded={langDropdownOpen}
                      aria-controls={langListId}
                      id={`${langListId}-trigger`}
                      onClick={() => setLangDropdownOpen((v) => !v)}
                      className="w-full min-h-[48px] flex items-center justify-between gap-3 px-4 py-3 rounded-xl border-2 border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 transition-colors text-left"
                      aria-label={L("language")}
                    >
                      <span className="flex items-center gap-3">
                        <LangFlag code={LANG_OPTIONS.find((o) => o.value === settings.language)?.flagCode ?? "gr"} />
                        <span className="font-semibold text-gray-800">
                          {LANG_OPTIONS.find((o) => o.value === settings.language)?.name ?? "Ελληνικά"}
                        </span>
                      </span>
                      <span
                        className={`text-gray-400 transition-transform ${langDropdownOpen ? "rotate-180" : ""}`}
                        aria-hidden="true"
                      >
                        ▼
                      </span>
                    </button>

                    {langDropdownOpen && (
                      <ul
                        ref={langListRef}
                        id={langListId}
                        role="listbox"
                        aria-label={L("language")}
                        aria-activedescendant={langActiveId ?? `${langListId}-option-${settings.language}`}
                        tabIndex={-1}
                        className="absolute left-0 right-0 top-full mt-1 py-1 bg-white border-2 border-gray-200 rounded-xl shadow-lg z-20 overflow-hidden"
                      >
                        {LANG_OPTIONS.map((opt) => {
                          const selected = settings.language === opt.value;
                          const isActive = langActiveId === `${langListId}-option-${opt.value}`;
                          return (
                            <li
                              key={opt.value}
                              id={`${langListId}-option-${opt.value}`}
                              role="option"
                              aria-selected={selected}
                              data-lang={opt.value}
                              onClick={() => {
                                updateSetting("language", opt.value);
                                setLangDropdownOpen(false);
                                langTriggerRef.current?.focus();
                              }}
                              className={`min-h-[48px] flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors focus:outline-none ${
                                selected ? "bg-blue-50 text-blue-800 font-semibold" : "hover:bg-gray-50 text-gray-800"
                              } ${isActive ? "ring-2 ring-blue-500 ring-inset" : ""}`}
                            >
                              <LangFlag code={opt.flagCode} />
                              <span>{opt.name}</span>
                            </li>
                          );
                        })}
                      </ul>
                    )}

                    {langDropdownOpen && (
                      <div
                        className="fixed inset-0 z-10"
                        aria-hidden="true"
                        onClick={() => {
                          setLangDropdownOpen(false);
                          langTriggerRef.current?.focus();
                        }}
                      />
                    )}
                  </div>
                </Section>

                {/* ════════ SECTION: Όραση ════════ */}
                <Section title={L("sectionVision")}>
                  <div className="grid grid-cols-2 gap-2.5">
                    <ToggleTile
                      icon={<Contrast className="w-5 h-5" />}
                      label={L("highContrast")}
                      active={settings.highContrast}
                      onClick={() =>
                        updateSetting("highContrast", !settings.highContrast)
                      }
                    />
                    <ToggleTile
                      icon={<SunMoon className="w-5 h-5" />}
                      label={L("invertColors")}
                      active={settings.invertColors}
                      onClick={() =>
                        updateSetting("invertColors", !settings.invertColors)
                      }
                    />
                    <ToggleTile
                      icon={<ImageOff className="w-5 h-5" />}
                      label={L("hideImages")}
                      active={settings.hideImages}
                      onClick={() =>
                        updateSetting("hideImages", !settings.hideImages)
                      }
                    />
                    <ToggleTile
                      icon={<PauseCircle className="w-5 h-5" />}
                      label={L("pauseAnimations")}
                      active={settings.pauseAnimations}
                      onClick={() =>
                        updateSetting(
                          "pauseAnimations",
                          !settings.pauseAnimations
                        )
                      }
                    />
                  </div>

                  {/* Saturation picker */}
                  <OptionRow label={L("saturation")} icon={<Palette className="w-4 h-4" />}>
                    <div className="flex gap-1.5 flex-wrap">
                      {satOpts.map((o) => (
                        <button
                          key={o}
                          type="button"
                          onClick={() => updateSetting("saturation", o)}
                          className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all min-h-[36px]
                            ${
                              settings.saturation === o
                                ? "bg-blue-600 text-white shadow-md"
                                : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
                            }`}
                          aria-pressed={settings.saturation === o}
                        >
                          {L(satKey[o])}
                        </button>
                      ))}
                    </div>
                  </OptionRow>

                  <OptionRow label={L("colorOverlay")} icon={<Layers className="w-4 h-4" />}>
                    <div className="flex gap-1.5 flex-wrap">
                      {overlayOpts.map((o) => (
                        <button
                          key={o}
                          type="button"
                          onClick={() => updateSetting("colorOverlay", o)}
                          className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all min-h-[36px]
                            ${
                              settings.colorOverlay === o
                                ? "bg-blue-600 text-white shadow-md"
                                : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
                            }`}
                          aria-pressed={settings.colorOverlay === o}
                        >
                          {L(overlayKey[o])}
                        </button>
                      ))}
                    </div>
                  </OptionRow>
                </Section>

                <Section title={L("sectionText")}>
                  <SliderRow
                    icon={<Type className="w-4 h-4" />}
                    label={L("textSize")}
                    value={settings.textSize}
                    unit="%"
                    min={80}
                    max={200}
                    step={10}
                    onChange={(v) => updateSetting("textSize", v)}
                    ariaLabelMinus={L("ariaTextSizeMinus")}
                    ariaLabelPlus={L("ariaTextSizePlus")}
                  />
                  <SliderRow
                    icon={<AlignLeft className="w-4 h-4" />}
                    label={L("lineHeight")}
                    value={settings.lineHeight}
                    unit="%"
                    min={80}
                    max={200}
                    step={20}
                    onChange={(v) => updateSetting("lineHeight", v)}
                    ariaLabelMinus={L("ariaLineHeightMinus")}
                    ariaLabelPlus={L("ariaLineHeightPlus")}
                  />
                  <SliderRow
                    icon={<SpaceIcon className="w-4 h-4" />}
                    label={L("letterSpacing")}
                    value={settings.letterSpacing}
                    unit="%"
                    min={80}
                    max={200}
                    step={20}
                    onChange={(v) => updateSetting("letterSpacing", v)}
                    ariaLabelMinus={L("ariaLetterSpacingMinus")}
                    ariaLabelPlus={L("ariaLetterSpacingPlus")}
                  />
                  <SliderRow
                    icon={<MonitorDown className="w-4 h-4" />}
                    label={L("wordSpacing")}
                    value={settings.wordSpacing}
                    unit="%"
                    min={100}
                    max={200}
                    step={20}
                    onChange={(v) => updateSetting("wordSpacing", v)}
                    ariaLabelMinus={L("ariaWordSpacingMinus")}
                    ariaLabelPlus={L("ariaWordSpacingPlus")}
                  />

                  <div className="grid grid-cols-2 gap-2.5 pt-1">
                    <ToggleTile
                      icon={<BookOpen className="w-5 h-5" />}
                      label={L("dyslexicFont")}
                      active={settings.dyslexicFont}
                      onClick={() =>
                        updateSetting("dyslexicFont", !settings.dyslexicFont)
                      }
                    />
                    <ToggleTile
                      icon={<Heading className="w-5 h-5" />}
                      label={L("highlightHeadings")}
                      active={settings.highlightHeadings}
                      onClick={() =>
                        updateSetting(
                          "highlightHeadings",
                          !settings.highlightHeadings
                        )
                      }
                    />
                  </div>

                  <OptionRow label={L("textAlign")} icon={<AlignLeft className="w-4 h-4" />}>
                    <div className="flex gap-1.5">
                      {alignOpts.map((o) => (
                        <button
                          key={o}
                          type="button"
                          onClick={() => updateSetting("textAlign", o)}
                          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all min-h-[36px]
                            ${
                              settings.textAlign === o
                                ? "bg-blue-600 text-white shadow-md"
                                : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
                            }`}
                          aria-pressed={settings.textAlign === o}
                        >
                          {AlignIcons[o]}
                          {L(alignKey[o])}
                        </button>
                      ))}
                    </div>
                  </OptionRow>
                </Section>

                <Section title={L("sectionNav")}>
                  <div className="grid grid-cols-2 gap-2.5">
                    <ToggleTile
                      icon={<Link className="w-5 h-5" />}
                      label={L("highlightLinks")}
                      active={settings.highlightLinks}
                      onClick={() =>
                        updateSetting(
                          "highlightLinks",
                          !settings.highlightLinks
                        )
                      }
                    />
                    <ToggleTile
                      icon={<Crosshair className="w-5 h-5" />}
                      label={L("focusHighlight")}
                      active={settings.focusHighlight}
                      onClick={() =>
                        updateSetting(
                          "focusHighlight",
                          !settings.focusHighlight
                        )
                      }
                    />
                    <ToggleTile
                      icon={<Eye className="w-5 h-5" />}
                      label={L("readingGuide")}
                      active={settings.readingGuide}
                      onClick={() =>
                        updateSetting("readingGuide", !settings.readingGuide)
                      }
                    />
                    <ToggleTile
                      icon={<EyeOff className="w-5 h-5" />}
                      label={L("readingMask")}
                      active={settings.readingMask}
                      onClick={() =>
                        updateSetting("readingMask", !settings.readingMask)
                      }
                    />
                  </div>

                  <SliderRow
                    icon={<MousePointer className="w-4 h-4" />}
                    label={L("cursorSize")}
                    value={settings.cursorSize}
                    unit="%"
                    min={100}
                    max={300}
                    step={50}
                    onChange={(v) => updateSetting("cursorSize", v)}
                    ariaLabelMinus={L("ariaCursorMinus")}
                    ariaLabelPlus={L("ariaCursorPlus")}
                  />
                </Section>

                <Section title={L("sectionSpeech")}>
                  <button
                    type="button"
                    onClick={isSpeaking ? stop : speak}
                    className={`
                      w-full flex items-center justify-center gap-3 py-3.5 px-4 rounded-xl font-semibold text-sm transition-all
                      focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 min-h-[48px]
                      ${
                        isSpeaking
                          ? "bg-red-500 hover:bg-red-600 text-white shadow-md"
                          : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-md"
                      }
                    `}
                    aria-pressed={isSpeaking}
                  >
                    {isSpeaking ? (
                      <>
                        <StopCircle className="w-5 h-5" />
                        {L("stopReading")}
                      </>
                    ) : (
                      <>
                        <Volume2 className="w-5 h-5" />
                        {L("readPage")}
                      </>
                    )}
                  </button>
                </Section>

                <div className="pt-3 border-t border-gray-200">
                  <div
                    role="status"
                    aria-live="polite"
                    aria-atomic="true"
                    className="sr-only"
                    id="a11y-reset-status"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      stop();
                      resetAll();
                      const el = document.getElementById("a11y-reset-status");
                      if (el) {
                        el.textContent = "";
                        requestAnimationFrame(() => {
                          el.textContent = L("resetDone");
                        });
                      }
                    }}
                    className="w-full py-3 px-4 bg-white hover:bg-gray-50 border border-gray-200 rounded-xl font-semibold text-gray-600 flex items-center justify-center gap-2 min-h-[48px] focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 transition-all hover:shadow-sm"
                  >
                    <RotateCcw className="w-4 h-4" aria-hidden="true" />
                    {L("resetAll")}
                  </button>
                </div>

                <p className="text-[11px] text-gray-400 text-center pb-2">
                  {L("disclaimer")}
                </p>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}

/* ═══════════════════════════════════════════════════════════
   Sub-components
   ═══════════════════════════════════════════════════════════ */

function Section({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section aria-label={title}>
      <h3 className="text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-2.5 px-0.5">
        {title}
      </h3>
      <div className="space-y-2.5">{children}</div>
    </section>
  );
}

function ToggleTile({
  icon,
  label,
  active,
  onClick,
}: {
  icon: ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        p-3.5 rounded-xl border transition-all duration-150 text-left w-full
        flex items-start gap-3 min-h-[72px]
        focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1
        ${
          active
            ? "border-blue-500 bg-blue-50 text-blue-900 shadow-sm active-tile"
            : "border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50 hover:shadow-sm"
        }
      `}
      aria-pressed={active}
    >
      <div
        className={`shrink-0 w-9 h-9 rounded-lg flex items-center justify-center transition-colors ${
          active
            ? "bg-blue-600 text-white"
            : "bg-gray-100 text-gray-500"
        }`}
        aria-hidden="true"
      >
        {icon}
      </div>
      <span className="text-xs font-semibold leading-tight pt-1.5">
        {label}
      </span>
    </button>
  );
}

function SliderRow({
  icon,
  label,
  value,
  unit,
  min,
  max,
  step,
  onChange,
  ariaLabelMinus,
  ariaLabelPlus,
}: {
  icon: ReactNode;
  label: string;
  value: number;
  unit: string;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
  ariaLabelMinus: string;
  ariaLabelPlus: string;
}) {
  const id = useId();
  const isAtDefault = (min === 100 && value === 100) || (min === 80 && value === 100);

  return (
    <div
      role="group"
      aria-labelledby={`${id}-label`}
      className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
        !isAtDefault
          ? "border-blue-200 bg-blue-50/50"
          : "border-gray-100 bg-white"
      }`}
    >
      <div className="text-gray-400 shrink-0" aria-hidden="true">
        {icon}
      </div>
      <span
        id={`${id}-label`}
        className="text-xs font-semibold text-gray-700 w-24 shrink-0"
      >
        {label}
      </span>
      <div className="flex items-center gap-2 ml-auto">
        <button
          type="button"
          onClick={() => onChange(Math.max(min, value - step))}
          disabled={value <= min}
          className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center text-sm font-bold text-gray-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 transition-colors"
          aria-label={ariaLabelMinus}
        >
          &minus;
        </button>
        <span className="text-xs font-bold text-gray-800 w-12 text-center tabular-nums">
          {value}{unit}
        </span>
        <button
          type="button"
          onClick={() => onChange(Math.min(max, value + step))}
          disabled={value >= max}
          className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center text-sm font-bold text-gray-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 transition-colors"
          aria-label={ariaLabelPlus}
        >
          +
        </button>
      </div>
    </div>
  );
}

function OptionRow({
  label,
  icon,
  children,
}: {
  label: string;
  icon: ReactNode;
  children: ReactNode;
}) {
  const id = useId();
  return (
    <div
      role="group"
      aria-labelledby={`${id}-label`}
      className="p-3 rounded-xl border border-gray-100 bg-white space-y-2"
    >
      <div className="flex items-center gap-2">
        <span className="text-gray-400" aria-hidden="true">{icon}</span>
        <span id={`${id}-label`} className="text-xs font-semibold text-gray-700">
          {label}
        </span>
      </div>
      {children}
    </div>
  );
}
