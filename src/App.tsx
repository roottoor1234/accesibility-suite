import { AccessibilityWidget } from "./components/AccessibilityWidget";
import { Zap, Shield, Rocket } from "lucide-react";

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold text-gray-900">
            Εργαλείο Προσβασιμότητας
          </h1>
          <p className="mt-2 text-gray-600">
            Δοκιμάστε τα χαρακτηριστικά προσβασιμότητας χρησιμοποιώντας το
            κουμπί στην κάτω δεξιά γωνία
          </p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <section className="bg-white rounded-xl shadow-md p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Καλώς ήρθατε
            </h2>
            <p className="text-gray-700 mb-4">
              Αυτή η σελίδα επιδεικνύει ένα πλήρως λειτουργικό εργαλείο
              προσβασιμότητας που βοηθά τους χρήστες να προσαρμόσουν την
              εμπειρία περιήγησής τους σύμφωνα με τις ανάγκες τους.
            </p>
            <p className="text-gray-700 mb-4">
              Κάντε κλικ στο κουμπί προσβασιμότητας στην κάτω δεξιά γωνία για να
              ανοίξετε τον πίνακα ελέγχου και να εξερευνήσετε τα διαθέσιμα
              χαρακτηριστικά.
            </p>
            <a
              href="#features"
              className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Μάθετε Περισσότερα
            </a>
          </section>

          <section className="bg-white rounded-xl shadow-md p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Διαθέσιμα Χαρακτηριστικά
            </h2>
            <ul className="space-y-3 text-gray-700">
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-1">✓</span>
                <span>Προσαρμογή μεγέθους κειμένου</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-1">✓</span>
                <span>Λειτουργία υψηλής αντίθεσης</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-1">✓</span>
                <span>Παύση κινήσεων και μεταβάσεων</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-1">✓</span>
                <span>Επισήμανση συνδέσμων</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-1">✓</span>
                <span>Οδηγός ανάγνωσης</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-1">✓</span>
                <span>Ανάγνωση κειμένου σε ομιλία</span>
              </li>
            </ul>
          </section>
        </div>

        <section
          id="features"
          className="bg-white rounded-xl shadow-md p-8 mb-12"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Γιατί η Προσβασιμότητα Έχει Σημασία
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                <Zap className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Βελτιωμένη Εμπειρία
              </h3>
              <p className="text-gray-600">
                Προσφέρετε στους χρήστες τη δυνατότητα να προσαρμόσουν το
                περιβάλλον περιήγησης σύμφωνα με τις προτιμήσεις τους.
              </p>
            </div>

            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                <Shield className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Ισότιμη Πρόσβαση
              </h3>
              <p className="text-gray-600">
                Διασφαλίστε ότι όλοι οι χρήστες μπορούν να έχουν πρόσβαση στο
                περιεχόμενό σας, ανεξάρτητα από τις ικανότητές τους.
              </p>
            </div>

            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 rounded-full mb-4">
                <Rocket className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Καλύτερο SEO
              </h3>
              <p className="text-gray-600">
                Οι προσβάσιμοι ιστότοποι έχουν συχνά καλύτερη κατάταξη στις
                μηχανές αναζήτησης και φτάνουν σε ευρύτερο κοινό.
              </p>
            </div>
          </div>
        </section>

        <section className="bg-white rounded-xl shadow-md p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Σχετικά με αυτό το Εργαλείο
          </h2>
          <div className="prose max-w-none text-gray-700">
            <p className="mb-4">
              Αυτό το εργαλείο προσβασιμότητας δημιουργήθηκε για να βοηθήσει
              τους χρήστες να προσαρμόσουν τις ιστοσελίδες σύμφωνα με τις
              ατομικές τους ανάγκες. Όλες οι προτιμήσεις αποθηκεύονται τοπικά
              και παραμένουν ενεργές σε όλες τις επισκέψεις σας.
            </p>
            <p className="mb-4">
              Το εργαλείο περιλαμβάνει λειτουργίες όπως προσαρμογή μεγέθους
              κειμένου, λειτουργία υψηλής αντίθεσης, παύση κινήσεων, επισήμανση
              συνδέσμων, οδηγό ανάγνωσης, γραμματοσειρά για δυσλεξία, προσαρμογή
              ύψους γραμμής, απόστασης γραμμάτων και πολλά άλλα.
            </p>
            <p className="mb-4">
              Η λειτουργία ανάγνωσης κειμένου χρησιμοποιεί το Web Speech API για
              να διαβάσει φωναχτά το περιεχόμενο της σελίδας. Αυτή η λειτουργία
              προορίζεται ως βοηθητικό εργαλείο και δεν αντικαθιστά τους
              επαγγελματικούς αναγνώστες οθόνης.
            </p>
            <p>
              Για να επαναφέρετε όλες τις ρυθμίσεις στις προεπιλεγμένες τιμές,
              χρησιμοποιήστε το κουμπί "Επαναφορά Όλων" στο κάτω μέρος του
              πίνακα προσβασιμότητας.
            </p>
          </div>
        </section>
      </main>

      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <p className="text-center text-gray-600">
            Δημιουργήθηκε με έμφαση στην προσβασιμότητα και τη χρηστικότητα
          </p>
        </div>
      </footer>
      <div className="cursor-pointer">
        <AccessibilityWidget />
      </div>
    </div>
  );
}

export default App;
