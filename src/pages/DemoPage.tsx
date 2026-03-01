import { Link } from "react-router-dom";
import { AccessibilityWidget } from "../components/AccessibilityWidget";
import { useAccessibility } from "../contexts/AccessibilityContext";
import { t, type TranslationKey } from "../i18n/translations";
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
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

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

const wcagCriteria = [
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
];

export function DemoPage() {
  const { settings } = useAccessibility();
  const L = (key: TranslationKey) => t(settings.language, key);

  return (
    <>
      <div className="a11y-content-wrap min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <a href="#main-content" className="skip-to-main">
          {L("skipToMain")}
        </a>

        <header className="bg-white/90 backdrop-blur-md shadow-sm sticky top-0 z-40 border-b border-gray-200" role="banner">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex items-center justify-between">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">
                {L("appTitle")}
              </h1>
              <p className="mt-1 text-sm text-gray-600">
                {L("appSubtitle")}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" className="text-gray-700 border-gray-300" asChild>
                <Link to="/">← Landing</Link>
              </Button>
              <Badge variant="secondary" className="hidden sm:inline-flex gap-1.5 text-gray-700 bg-gray-100 border-gray-200">
                <Keyboard className="w-3.5 h-3.5" />
                {L("tabNav")}
              </Badge>
            </div>
          </div>
        </header>

        <main
          id="main-content"
          className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10"
          tabIndex={-1}
        >
          <div className="grid lg:grid-cols-2 gap-8 mb-12">
            <Card className="border-gray-200 bg-white">
              <CardHeader>
                <CardTitle id="welcome-heading" className="text-gray-900">{L("welcome")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-gray-700">
                <p className="leading-relaxed">{L("welcomeP1")}</p>
                <p className="leading-relaxed">{L("welcomeP2")}</p>
                <Button className="bg-blue-600 hover:bg-blue-700 text-white border-0" asChild>
                  <a href="#features">
                    {L("learnMore")}
                    <span aria-hidden="true" className="ml-1">↓</span>
                  </a>
                </Button>
              </CardContent>
            </Card>

            <Card className="border-gray-200 bg-white">
              <CardHeader>
                <CardTitle id="features-list-heading" className="text-gray-900">{L("featuresTitle")}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  {features.map(({ key, Icon }) => (
                    <div key={key} className="flex items-center gap-2.5 text-sm text-gray-700">
                      <span className="shrink-0 w-7 h-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                        <Icon className="w-4 h-4" />
                      </span>
                      <span>{L(key)}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card id="features" className="mb-12 border-gray-200 bg-white">
            <CardHeader>
              <CardTitle id="why-a11y-heading" className="text-center text-gray-900">
                {L("whyTitle")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-8">
                {[
                  { icon: <Zap className="w-7 h-7" />, color: "bg-blue-100 text-blue-600", titleKey: "why1Title" as TranslationKey, textKey: "why1Text" as TranslationKey },
                  { icon: <Shield className="w-7 h-7" />, color: "bg-emerald-100 text-emerald-600", titleKey: "why2Title" as TranslationKey, textKey: "why2Text" as TranslationKey },
                  { icon: <Rocket className="w-7 h-7" />, color: "bg-purple-100 text-purple-600", titleKey: "why3Title" as TranslationKey, textKey: "why3Text" as TranslationKey },
                ].map((card, i) => (
                  <div key={i} className="text-center group">
                    <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4 transition-transform group-hover:scale-105 shadow-sm ${card.color}`}>
                      {card.icon}
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">{L(card.titleKey)}</h3>
                    <p className="text-gray-600 text-sm leading-relaxed">{L(card.textKey)}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border-gray-200 bg-white">
            <CardHeader>
              <CardTitle id="wcag-heading" className="text-gray-900">{L("wcagTitle")}</CardTitle>
              <CardDescription className="text-gray-600">{L("wcagIntro")}</CardDescription>
            </CardHeader>
            <CardContent className="text-gray-700">
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="criteria">
                  <AccordionTrigger>Κριτήρια WCAG 2.2 που υποστηρίζονται</AccordionTrigger>
                  <AccordionContent>
                    <ul className="grid md:grid-cols-2 gap-x-8 gap-y-1 pt-2">
                      {wcagCriteria.map((c, i) => (
                        <li key={i} className="flex items-center gap-2 py-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-600 shrink-0" />
                          <span className="text-sm text-gray-800">{c}</span>
                        </li>
                      ))}
                    </ul>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
              <p className="mt-4 text-sm text-gray-600">{L("wcagFooter")}</p>
            </CardContent>
          </Card>
        </main>

        <footer className="bg-white/80 backdrop-blur-sm border-t border-gray-200 py-6 mt-12" role="contentinfo">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <p className="text-center text-gray-600 text-sm">{L("footer")}</p>
          </div>
        </footer>
      </div>

      <AccessibilityWidget />
    </>
  );
}
