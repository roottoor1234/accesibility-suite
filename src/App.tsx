import { AccessibilityWidget } from "./components/AccessibilityWidget";
import { useAccessibility } from "./contexts/AccessibilityContext";
import { t, type TranslationKey } from "./i18n/translations";
import {
  Zap,
  Shield,
  Rocket,
  Eye,
  Type,
  Palette,
  MousePointer,
  Volume2,
  Keyboard,
} from "lucide-react";

const features: { key: TranslationKey; Icon: typeof Type }[] = [
  { key: "textSize", Icon: Type },
  { key: "highContrast", Icon: Eye },
  { key: "invertColors", Icon: Palette },
  { key: "saturation", Icon: Palette },
  { key: "colorOverlay", Icon: Eye },
  { key: "pauseAnimations", Icon: Zap },
  { key: "highlightLinks", Icon: Type },
  { key: "highlightHeadings", Icon: Type },
  { key: "readingGuide", Icon: Eye },
  { key: "readingMask", Icon: Eye },
  { key: "dyslexicFont", Icon: Type },
  { key: "lineHeight", Icon: Type },
  { key: "wordSpacing", Icon: Type },
  { key: "textAlign", Icon: Type },
  { key: "cursorSize", Icon: MousePointer },
  { key: "focusHighlight", Icon: Eye },
  { key: "readPage", Icon: Volume2 },
  { key: "hideImages", Icon: Zap },
];

function App() {
  const { settings } = useAccessibility();
  const L = (key: TranslationKey) => t(settings.language, key);

  return (
    <>
      <div className="a11y-content-wrap min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <a href="#main-content" className="skip-to-main">
          {L("skipToMain")}
        </a>

        <header className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-40" role="banner">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex items-center justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold bg-gradient-to-r from-blue-700 to-indigo-600 bg-clip-text text-transparent">
              {L("appTitle")}
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              {L("appSubtitle")}
            </p>
          </div>
          <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 text-xs font-semibold rounded-full border border-blue-200">
            <Keyboard className="w-3.5 h-3.5" />
            {L("tabNav")}
          </span>
        </div>
      </header>

      <main
        id="main-content"
        className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10"
        tabIndex={-1}
      >
        <div className="grid lg:grid-cols-2 gap-8 mb-12">
          <section
            className="bg-white rounded-2xl shadow-md p-8 border border-gray-100"
            aria-labelledby="welcome-heading"
          >
            <h2
              id="welcome-heading"
              className="text-2xl font-bold text-gray-900 mb-4"
            >
              {L("welcome")}
            </h2>
            <p className="text-gray-600 mb-4 leading-relaxed">
              {L("welcomeP1")}
            </p>
            <p className="text-gray-600 mb-6 leading-relaxed">
              {L("welcomeP2")}
            </p>
            <a
              href="#features"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:from-blue-500 hover:to-indigo-500 transition-all shadow-md hover:shadow-lg"
            >
              {L("learnMore")}
              <span aria-hidden="true">&darr;</span>
            </a>
          </section>

          <section
            className="bg-white rounded-2xl shadow-md p-8 border border-gray-100"
            aria-labelledby="features-list-heading"
          >
            <h2
              id="features-list-heading"
              className="text-2xl font-bold text-gray-900 mb-4"
            >
              {L("featuresTitle")}
            </h2>
            <div className="grid grid-cols-2 gap-3">
              {features.map(({ key, Icon }) => (
                <div
                  key={key}
                  className="flex items-center gap-2.5 text-sm text-gray-600"
                >
                  <span className="shrink-0 w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                    <Icon className="w-4 h-4" />
                  </span>
                  <span>{L(key)}</span>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Why a11y matters */}
        <section
          id="features"
          className="bg-white rounded-2xl shadow-md p-8 mb-12 border border-gray-100"
          aria-labelledby="why-a11y-heading"
        >
          <h2
            id="why-a11y-heading"
            className="text-2xl font-bold text-gray-900 mb-8 text-center"
          >
            {L("whyTitle")}
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: <Zap className="w-7 h-7" />, color: "blue", titleKey: "why1Title" as TranslationKey, textKey: "why1Text" as TranslationKey },
              { icon: <Shield className="w-7 h-7" />, color: "emerald", titleKey: "why2Title" as TranslationKey, textKey: "why2Text" as TranslationKey },
              { icon: <Rocket className="w-7 h-7" />, color: "purple", titleKey: "why3Title" as TranslationKey, textKey: "why3Text" as TranslationKey },
            ].map((card, i) => (
              <div key={i} className="text-center group">
                <div
                  className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4 transition-transform group-hover:scale-105 shadow-sm
                    ${card.color === "blue" ? "bg-blue-100 text-blue-600" : ""}
                    ${card.color === "emerald" ? "bg-emerald-100 text-emerald-600" : ""}
                    ${card.color === "purple" ? "bg-purple-100 text-purple-600" : ""}
                  `}
                >
                  {card.icon}
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  {L(card.titleKey)}
                </h3>
                <p className="text-gray-500 text-sm leading-relaxed">
                  {L(card.textKey)}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* WCAG Info */}
        <section
          className="bg-white rounded-2xl shadow-md p-8 border border-gray-100"
          aria-labelledby="wcag-heading"
        >
          <h2
            id="wcag-heading"
            className="text-2xl font-bold text-gray-900 mb-4"
          >
            {L("wcagTitle")}
          </h2>
          <div className="prose max-w-none text-gray-600 text-sm leading-relaxed">
            <p className="mb-3">
              {L("wcagIntro")}
            </p>
            <div className="grid md:grid-cols-2 gap-x-8 gap-y-1 mb-4">
              {[
                "1.1.1 Μη-κειμενικό Περιεχόμενο",
                "1.3.1 Πληροφορίες & Σχέσεις",
                "1.4.1 Χρήση Χρώματος",
                "1.4.3 Ελάχιστη Αντίθεση",
                "1.4.4 Αλλαγή Μεγέθους Κειμένου",
                "1.4.8 Οπτική Παρουσίαση",
                "1.4.12 Αποστάσεις Κειμένου",
                "2.1.1 Πληκτρολόγιο",
                "2.2.2 Παύση, Διακοπή, Απόκρυψη",
                "2.3.3 Κίνηση από Αλληλεπίδραση",
                "2.4.1 Παράκαμψη Μπλοκ",
                "2.4.4 Σκοπός Συνδέσμου",
                "2.4.7 Ορατό Focus",
                "2.4.11 Focus Not Obscured",
                "2.4.13 Εμφάνιση Focus",
                "2.5.5 Μέγεθος Στόχου (Enhanced)",
                "2.5.8 Μέγεθος Στόχου (Minimum)",
                "4.1.3 Μηνύματα Κατάστασης",
              ].map((c, i) => (
                <div key={i} className="flex items-center gap-2 py-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
                  <span>{c}</span>
                </div>
              ))}
            </div>
            <p>
              {L("wcagFooter")}
            </p>
          </div>
        </section>
      </main>

      <footer
        className="bg-white/80 backdrop-blur-sm border-t border-gray-200 mt-12"
        role="contentinfo"
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-center text-gray-400 text-sm">
            {L("footer")}
          </p>
        </div>
      </footer>
      </div>

      <AccessibilityWidget />
    </>
  );
}

export default App;
