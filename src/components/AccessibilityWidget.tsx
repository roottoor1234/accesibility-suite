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
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

export type WidgetPosition =
  | "bottom-right"
  | "bottom-left"
  | "top-right"
  | "top-left";

const positionClasses: Record<WidgetPosition, string> = {
  "bottom-right": "bottom-6 right-6",
  "bottom-left": "bottom-6 left-6",
  "top-right": "top-6 right-6",
  "top-left": "top-6 left-6",
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
      >
        <Sheet
          open={isOpen}
          onOpenChange={(open) => {
            setIsOpen(open);
            if (!open) {
              setLangDropdownOpen(false);
              buttonRef.current?.focus();
            }
          }}
        >
          <SheetTrigger asChild>
            <Button
              ref={buttonRef}
              size="icon"
              className={`
                relative w-16 h-16 rounded-2xl text-white shadow-xl
                focus-visible:ring-4 focus-visible:ring-blue-300 focus-visible:ring-offset-2
                transition-all duration-300
                bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700
                hover:from-blue-500 hover:via-indigo-500 hover:to-purple-600
                hover:shadow-2xl hover:scale-105 border-0
                ${activeCount === 0 ? "a11y-trigger-pulse" : ""}
              `}
              aria-label={isOpen ? L("closeMenu") : L("openMenu")}
              aria-expanded={isOpen}
            >
              <Accessibility className="w-7 h-7 drop-shadow-md" />
              {activeCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full bg-red-500 text-white text-xs font-bold flex items-center justify-center shadow-lg ring-2 ring-white">
                  {activeCount}
                </span>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent
            ref={panelRef}
            side="left"
            className="w-full max-w-[420px] p-0 flex flex-col bg-gray-50 border-0 [&>:first-child]:hidden"
            aria-labelledby="a11y-panel-title"
          >
            {/* ── Header ── */}
            <div className="sticky top-0 z-10 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-700 px-5 py-4 flex items-center justify-between shadow-lg shrink-0">
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
              <Button
                id="a11y-close-btn"
                variant="ghost"
                size="icon"
                onClick={handleClose}
                className="w-10 h-10 rounded-xl bg-white/15 hover:bg-white/25 text-white hover:text-white focus-visible:ring-white"
                aria-label={L("closePanel")}
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            <div className="flex-1 overflow-y-auto">
              <div className="p-4 space-y-5">
                {/* ════════ Γλώσσα: WCAG 2.1.1 dropdown με σημαίες ════════ */}
                <Section title={L("language")}>
                  <div className="relative">
                    <Button
                      ref={langTriggerRef}
                      variant="outline"
                      type="button"
                      aria-haspopup="listbox"
                      aria-expanded={langDropdownOpen}
                      aria-controls={langListId}
                      id={`${langListId}-trigger`}
                      onClick={() => setLangDropdownOpen((v) => !v)}
                      className="w-full min-h-[48px] justify-between gap-3 px-4 py-3 rounded-xl border-2 text-left"
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
                    </Button>

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
                        <Button
                          key={o}
                          size="sm"
                          variant={settings.saturation === o ? "default" : "outline"}
                          onClick={() => updateSetting("saturation", o)}
                          className="min-h-[36px]"
                          aria-pressed={settings.saturation === o}
                        >
                          {L(satKey[o])}
                        </Button>
                      ))}
                    </div>
                  </OptionRow>

                  <OptionRow label={L("colorOverlay")} icon={<Layers className="w-4 h-4" />}>
                    <div className="flex gap-1.5 flex-wrap">
                      {overlayOpts.map((o) => (
                        <Button
                          key={o}
                          size="sm"
                          variant={settings.colorOverlay === o ? "default" : "outline"}
                          onClick={() => updateSetting("colorOverlay", o)}
                          className="min-h-[36px]"
                          aria-pressed={settings.colorOverlay === o}
                        >
                          {L(overlayKey[o])}
                        </Button>
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
                        <Button
                          key={o}
                          size="sm"
                          variant={settings.textAlign === o ? "default" : "outline"}
                          onClick={() => updateSetting("textAlign", o)}
                          className="min-h-[36px] gap-1.5"
                          aria-pressed={settings.textAlign === o}
                        >
                          {AlignIcons[o]}
                          {L(alignKey[o])}
                        </Button>
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
                  <Button
                    type="button"
                    variant={isSpeaking ? "destructive" : "default"}
                    onClick={isSpeaking ? stop : speak}
                    className={`w-full gap-3 py-3.5 min-h-[48px] ${!isSpeaking ? "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 border-0" : ""}`}
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
                  </Button>
                </Section>

                <div className="pt-3 border-t border-gray-200">
                  <div
                    role="status"
                    aria-live="polite"
                    aria-atomic="true"
                    className="sr-only"
                    id="a11y-reset-status"
                  />
                  <Button
                    variant="outline"
                    className="w-full py-3 min-h-[48px] gap-2"
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
                  >
                    <RotateCcw className="w-4 h-4" aria-hidden="true" />
                    {L("resetAll")}
                  </Button>
                </div>

                <p className="text-[11px] text-gray-500 text-center pb-2">
                  {L("disclaimer")}
                </p>
              </div>
            </div>
          </SheetContent>
        </Sheet>
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
      <h3 className="text-[11px] font-bold uppercase tracking-wider text-gray-600 mb-2.5 px-0.5">
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
    <Button
      type="button"
      variant={active ? "default" : "outline"}
      onClick={onClick}
      className={`
        p-3.5 rounded-xl h-auto min-h-[72px] w-full justify-start gap-3
        ${active ? "active-tile" : "bg-white hover:bg-gray-50"}
      `}
      aria-pressed={active}
    >
      <span
        className={`shrink-0 w-9 h-9 rounded-lg flex items-center justify-center ${
          active ? "bg-primary-foreground/20" : "bg-muted"
        }`}
        aria-hidden="true"
      >
        {icon}
      </span>
      <span className="text-xs font-semibold leading-tight pt-1.5 text-left">
        {label}
      </span>
    </Button>
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
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="h-8 w-8"
          onClick={() => onChange(Math.max(min, value - step))}
          disabled={value <= min}
          aria-label={ariaLabelMinus}
        >
          &minus;
        </Button>
        <span className="text-xs font-bold w-12 text-center tabular-nums">
          {value}{unit}
        </span>
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="h-8 w-8"
          onClick={() => onChange(Math.min(max, value + step))}
          disabled={value >= max}
          aria-label={ariaLabelPlus}
        >
          +
        </Button>
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
      className="p-3 rounded-xl border border-gray-200 bg-white space-y-2"
    >
      <div className="flex items-center gap-2">
        <span className="text-gray-500" aria-hidden="true">{icon}</span>
        <span id={`${id}-label`} className="text-xs font-semibold text-gray-800">
          {label}
        </span>
      </div>
      {children}
    </div>
  );
}
