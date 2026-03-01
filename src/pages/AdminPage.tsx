import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Plus, Copy, Trash2, Key, Globe, User } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";

const STORAGE_KEY = "a11y-widget-licenses";

export interface License {
  id: string;
  key: string;
  customerName: string;
  plan: "starter" | "pro" | "business" | "enterprise";
  domains: string[];
  createdAt: string;
}

function generateLicenseKey(): string {
  const segment = () => Math.random().toString(36).slice(2, 6);
  return `${segment()}-${segment()}-${segment()}`.toUpperCase();
}

function loadLicenses(): License[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function saveLicenses(licenses: License[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(licenses));
}

export function AdminPage() {
  const [licenses, setLicenses] = useState<License[]>([]);
  const [customerName, setCustomerName] = useState("");
  const [plan, setPlan] = useState<License["plan"]>("starter");
  const [newDomain, setNewDomain] = useState("");
  const [addingDomainToId, setAddingDomainToId] = useState<string | null>(null);

  useEffect(() => {
    setLicenses(loadLicenses());
  }, []);

  const addLicense = () => {
    if (!customerName.trim()) return;
    const license: License = {
      id: crypto.randomUUID(),
      key: generateLicenseKey(),
      customerName: customerName.trim(),
      plan,
      domains: [],
      createdAt: new Date().toISOString(),
    };
    const next = [license, ...licenses];
    setLicenses(next);
    saveLicenses(next);
    setCustomerName("");
    setPlan("starter");
  };

  const addDomain = (licenseId: string, domain: string) => {
    const d = domain.replace(/^www\./, "").toLowerCase().trim();
    if (!d) return;
    const next = licenses.map((l) =>
      l.id === licenseId
        ? { ...l, domains: l.domains.includes(d) ? l.domains : [...l.domains, d] }
        : l
    );
    setLicenses(next);
    saveLicenses(next);
    setNewDomain("");
    setAddingDomainToId(null);
  };

  const removeDomain = (licenseId: string, domain: string) => {
    const next = licenses.map((l) =>
      l.id === licenseId
        ? { ...l, domains: l.domains.filter((d) => d !== domain) }
        : l
    );
    setLicenses(next);
    saveLicenses(next);
  };

  const deleteLicense = (id: string) => {
    const next = licenses.filter((l) => l.id !== id);
    setLicenses(next);
    saveLicenses(next);
  };

  const copyKey = (key: string) => {
    navigator.clipboard.writeText(key);
    toast.success("Key αντιγράφηκε");
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" className="text-gray-700 border-gray-300" asChild>
              <Link to="/">← Landing</Link>
            </Button>
            <div className="flex items-center gap-2">
              <Key className="w-5 h-5 text-gray-600" />
              <h1 className="text-xl font-bold text-gray-900">Διαχείριση αδειών</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        {/* Νέα άδεια */}
        <Card className="mb-8 border-gray-200 bg-white">
          <CardHeader>
            <CardTitle className="text-gray-900">Νέα άδεια πελάτη</CardTitle>
            <CardDescription className="text-gray-600">
              Μετά τη δημιουργία, πρόσθεσε domain(s) στην άδεια. Το widget θα φορτώνει μόνο σε αυτά τα domains (με το key που θα δώσεις στον πελάτη).
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4 items-end">
              <div className="flex-1 min-w-[200px] space-y-2">
                <Label htmlFor="customer-name">Όνομα πελάτη</Label>
                <Input
                  id="customer-name"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="π.χ. Acme Ltd"
                />
              </div>
              <div className="w-40 space-y-2">
                <Label htmlFor="plan">Πακέτο</Label>
                <Select value={plan} onValueChange={(v) => setPlan(v as License["plan"])}>
                  <SelectTrigger id="plan">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="starter">Starter (1)</SelectItem>
                    <SelectItem value="pro">Pro (3)</SelectItem>
                    <SelectItem value="business">Business (10)</SelectItem>
                    <SelectItem value="enterprise">Enterprise (∞)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={addLicense} className="gap-2 bg-blue-600 hover:bg-blue-700 text-white border-0">
                <Plus className="w-4 h-4" />
                Δημιουργία key
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Λίστα αδειών */}
        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Πελάτες & keys</h2>
          {licenses.length === 0 ? (
            <Card className="border-gray-200 bg-white">
              <CardContent className="flex flex-col items-center justify-center py-12 text-center text-gray-600">
                <User className="w-12 h-12 mb-3 text-gray-400" />
                <p>Δεν υπάρχουν αδείες ακόμα. Δημιούργησε μια από πάνω.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {licenses.map((license) => (
                <Card key={license.id} className="border-gray-200 bg-white">
                  <CardHeader className="pb-3">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <div>
                        <CardTitle className="text-base text-gray-900">{license.customerName}</CardTitle>
                        <CardDescription className="capitalize text-gray-600">{license.plan}</CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        <code className="px-3 py-1.5 bg-gray-100 text-gray-800 rounded text-sm font-mono border border-gray-200">
                          {license.key}
                        </code>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => copyKey(license.key)}
                          title="Αντιγραφή key"
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" title="Διαγραφή" className="text-destructive hover:text-destructive">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Διαγραφή άδειας;</AlertDialogTitle>
                              <AlertDialogDescription>
                                Η άδεια για {license.customerName} θα διαγραφεί. Δεν μπορεί να αναιρεθεί.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Ακύρωση</AlertDialogCancel>
                              <AlertDialogAction
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                onClick={() => deleteLicense(license.id)}
                              >
                                Διαγραφή
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0 text-gray-800">
                    <div className="flex items-center gap-2 mb-2">
                      <Globe className="w-4 h-4 text-gray-500" />
                      <span className="text-sm font-medium text-gray-700">Domains ({license.domains.length})</span>
                    </div>
                    {license.domains.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-3">
                        {license.domains.map((d) => (
                          <Badge key={d} variant="secondary" className="gap-1 pr-1">
                            {d}
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-4 w-4 rounded-full hover:bg-destructive/20 hover:text-destructive"
                              onClick={() => removeDomain(license.id, d)}
                              aria-label={`Αφαίρεση ${d}`}
                            >
                              ×
                            </Button>
                          </Badge>
                        ))}
                      </div>
                    )}
                    {addingDomainToId === license.id ? (
                      <div className="flex gap-2">
                        <Input
                          value={newDomain}
                          onChange={(e) => setNewDomain(e.target.value)}
                          placeholder="example.com"
                          className="max-w-xs"
                          onKeyDown={(e) => {
                            if (e.key === "Enter") addDomain(license.id, newDomain);
                            if (e.key === "Escape") setAddingDomainToId(null);
                          }}
                        />
                        <Button size="sm" onClick={() => addDomain(license.id, newDomain)} className="bg-blue-600 hover:bg-blue-700 text-white border-0">
                          Προσθήκη
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setAddingDomainToId(null);
                            setNewDomain("");
                          }}
                        >
                          Ακύρωση
                        </Button>
                      </div>
                    ) : (
                      <Button
                        variant="link"
                        size="sm"
                        className="h-auto p-0 text-blue-600 hover:text-blue-700 font-medium"
                        onClick={() => setAddingDomainToId(license.id)}
                      >
                        + Προσθήκη domain
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>

        <p className="mt-8 text-sm text-gray-600">
          Τα δεδομένα αποθηκεύονται τοπικά (localStorage). Για production χρειάζεσαι backend που να αποθηκεύει keys & domains και να εξυπηρετεί το License API (βλέπε <code className="text-xs bg-gray-200 text-gray-800 px-1 rounded">docs/LICENSE_API.md</code> στο repo).
        </p>
      </main>
    </div>
  );
}
