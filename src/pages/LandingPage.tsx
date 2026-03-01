import { Link } from "react-router-dom";
import {
  Accessibility,
  Check,
  Mail,
  Shield,
  Zap,
  Globe,
  Users,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const packages = [
  {
    name: "Starter",
    domains: 1,
    monthly: 29,
    yearly: 290,
    features: ["1 domain", "Όλες οι λειτουργίες", "Email support"],
    cta: "Ξεκινήστε",
    highlighted: false,
  },
  {
    name: "Pro",
    domains: 3,
    monthly: 59,
    yearly: 590,
    features: ["3 domains", "Προτεραιότητα support", "Όλες οι λειτουργίες"],
    cta: "Δημοφιλές",
    highlighted: true,
  },
  {
    name: "Business",
    domains: 10,
    monthly: 129,
    yearly: 1290,
    features: ["10 domains", "White-label επιλογή", "Προτεραιότητα support"],
    cta: "Για επιχειρήσεις",
    highlighted: false,
  },
  {
    name: "Enterprise",
    domains: "∞",
    monthly: null,
    yearly: null,
    features: ["Απεριόριστα domains", "SLA & dedicated support", "Custom integrations"],
    cta: "Επικοινωνήστε",
    highlighted: false,
  },
];

export function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0f172a] text-white">
      {/* Hero */}
      <header className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,#3b82f6,transparent)] opacity-40" />
        <div className="absolute inset-0 bg-grid-white/5 bg-[size:24px_24px]" />
        <nav className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
              <Accessibility className="w-5 h-5 text-blue-400" />
            </div>
            <span className="font-bold text-lg">A11y Widget</span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" className="text-slate-200 hover:text-white hover:bg-white/10" asChild>
              <a href="#paketa">Πακέτα</a>
            </Button>
            <Button variant="ghost" size="sm" className="text-slate-200 hover:text-white hover:bg-white/10" asChild>
              <a href="#synergasia">Συνεργασία</a>
            </Button>
            <Button variant="ghost" size="sm" className="text-blue-300 hover:text-white hover:bg-white/10" asChild>
              <Link to="/demo">Δείτε το widget →</Link>
            </Button>
            <Button variant="secondary" size="sm" className="bg-slate-600 hover:bg-slate-500 text-white border-0 font-medium" asChild>
              <Link to="/admin">Admin</Link>
            </Button>
          </div>
        </nav>
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-28 text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight">
            Προσβασιμότητα σελίδας
            <br />
            <span className="text-blue-400">σε ένα κλικ</span>
          </h1>
          <p className="mt-6 text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto">
            Widget WCAG 2.2 που κουμπώνει σε οποιαδήποτε ιστοσελίδα. Μεγέθυνση κειμένου,
            αντίθεση, οδηγός ανάγνωσης, text-to-speech και πολλά άλλα.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Button size="lg" className="bg-blue-500 hover:bg-blue-400 text-white shadow-lg shadow-blue-500/25 gap-2 border-0" asChild>
              <a href="#paketa">
                Δείτε τα πακέτα
                <ArrowRight className="w-4 h-4" />
              </a>
            </Button>
            <Button size="lg" variant="outline" className="border-2 border-slate-500 bg-transparent text-white hover:bg-slate-700 hover:text-white gap-2" asChild>
              <Link to="/demo">Δοκιμάστε το demo</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Features strip */}
      <section className="border-y border-slate-800 bg-slate-900/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { icon: Shield, text: "WCAG 2.2" },
              { icon: Zap, text: "Άμεση ενσωμάτωση" },
              { icon: Globe, text: "Πολλές γλώσσες widget" },
              { icon: Accessibility, text: "17+ ρυθμίσεις" },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex flex-col items-center gap-2">
                <Icon className="w-8 h-8 text-blue-400" />
                <span className="text-sm font-medium text-slate-300">{text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing - Cards */}
      <section id="paketa" className="py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-4">
            Πακέτα τιμών
          </h2>
          <p className="text-slate-400 text-center max-w-xl mx-auto mb-12">
            Επιλέξτε το πακέτο που ταιριάζει στις ανάγκες σας. Αδεια ανά domain· η τιμή καλύπτει τον αριθμό domains του πακέτου.
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {packages.map((pkg) => (
              <Card
                key={pkg.name}
                className={`flex flex-col border-2 text-white ${
                  pkg.highlighted
                    ? "border-blue-400 bg-slate-800 shadow-lg shadow-blue-500/20"
                    : "border-slate-600 bg-slate-800"
                }`}
              >
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 text-white">
                  <h3 className="text-lg font-bold text-white">{pkg.name}</h3>
                  {pkg.highlighted && (
                    <Badge className="bg-blue-500 text-white hover:bg-blue-600 border-0">
                      Δημοφιλές
                    </Badge>
                  )}
                </CardHeader>
                <CardContent className="flex-1 text-white">
                  <div className="mb-4">
                    <span className="text-3xl font-bold text-white">
                      {pkg.monthly != null ? `€${pkg.monthly}` : "Σύμβαση"}
                    </span>
                    {pkg.monthly != null && (
                      <span className="text-slate-300 text-sm ml-1">/μήνα</span>
                    )}
                  </div>
                  <p className="text-slate-300 text-sm mb-6">
                    {typeof pkg.domains === "number"
                      ? `${pkg.domains} domain${pkg.domains > 1 ? "s" : ""}`
                      : "Απεριόριστα domains"}
                  </p>
                  <ul className="space-y-2">
                    {pkg.features.map((f) => (
                      <li key={f} className="flex items-center gap-2 text-sm text-slate-200">
                        <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                        {f}
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button
                    className={`w-full text-white font-semibold border-0 ${
                      pkg.highlighted
                        ? "bg-blue-500 hover:bg-blue-400 text-white"
                        : "bg-slate-600 hover:bg-slate-500 text-white"
                    }`}
                    variant="secondary"
                    asChild
                  >
                    <a href="mailto:info@example.com?subject=A11y Widget - Αίτημα πακέτου">
                      {pkg.cta}
                    </a>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Συνεργασία / CTA */}
      <section id="synergasia" className="py-20 border-t border-slate-800">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-500/20 mb-6">
            <Users className="w-8 h-8 text-blue-400" />
          </div>
          <h2 className="text-3xl font-bold mb-4">
            Συνεργαστείτε μαζί μας
          </h2>
          <p className="text-slate-400 text-lg mb-8">
            Είστε agency ή εταιρεία και θέλετε να προσφέρετε το widget στους πελάτες σας;
            Επικοινωνήστε για συνεργασία, volume licenses και white-label επιλογές.
          </p>
          <Button size="lg" className="bg-slate-600 hover:bg-slate-500 text-white gap-2 border-0" asChild>
            <a href="mailto:info@example.com?subject=A11y Widget - Συνεργασία">
              <Mail className="w-4 h-4" />
              Επικοινωνία
            </a>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Accessibility className="w-5 h-5 text-slate-500" />
            <span className="text-slate-500 text-sm">A11y Widget · WCAG 2.2</span>
          </div>
          <div className="flex items-center gap-6 text-sm">
            <Button variant="link" size="sm" className="text-slate-400 hover:text-white p-0 h-auto" asChild>
              <Link to="/demo">Demo</Link>
            </Button>
            <Button variant="link" size="sm" className="text-slate-400 hover:text-white p-0 h-auto" asChild>
              <Link to="/admin">Admin</Link>
            </Button>
          </div>
        </div>
      </footer>
    </div>
  );
}
