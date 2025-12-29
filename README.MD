# A11y Widget – Standalone Accessibility Suite

Ένα σύγχρονο, πλήρως παραμετροποιήσιμο accessibility widget για εύκολη ενσωμάτωση σε οποιαδήποτε ιστοσελίδα.

---

## 🚀 Γρήγορη Ενσωμάτωση

1. **Build:**  
   Τρέξε:
   ```bash
   npm run build:widget
   ```
   Τα αρχεία θα παραχθούν στον φάκελο `dist-widget/`:
   - `a11y-widget.js`
   - `a11y-widget.css`

2. **Πρόσθεσε στο HTML σου:**
   ```html
   <link rel="stylesheet" href="dist-widget/a11y-widget.css" />
   <script src="dist-widget/a11y-widget.js"></script>
   ```

3. **Εμφάνισε το widget (προαιρετικά):**
   Το widget εμφανίζεται αυτόματα.  
   Για χειροκίνητη ενεργοποίηση:
   ```js
   window.initA11yWidget({ position: 'bottom-right' });
   ```
   Θέσεις: `'bottom-right'` (default), `'bottom-left'`, `'top-right'`, `'top-left'`.

---

## 🧩 Features

- Μεγέθυνση/σμίκρυνση κειμένου
- Υψηλή αντίθεση
- Παύση animations
- Επισήμανση συνδέσμων
- Οδηγός ανάγνωσης (reading guide)
- Γραμματοσειρά για δυσλεξία
- Απόκρυψη εικόνων
- Ρύθμιση line height & letter spacing
- Μεγέθυνση κέρσορα
- Text-to-speech (ανάγνωση σελίδας)
- Πλήρης υποστήριξη πληκτρολογίου
- Αποθήκευση ρυθμίσεων στο localStorage

---

## 🛠️ Ανάπτυξη

1. **Εγκατάσταση:**
   ```bash
   npm install
   ```

2. **Development mode:**
   ```bash
   npm run dev
   ```
   Άνοιξε το [localhost:5173](http://localhost:5173) για demo.

3. **Build για παραγωγή:**
   ```bash
   npm run build:widget
   ```

---

## 📁 Δομή

- `src/widget-standalone.tsx` – Entry point για το standalone widget
- `src/components/AccessibilityWidget.tsx` – Κύριο React component
- `src/contexts/AccessibilityContext.tsx` – State management
- `dist-widget/` – Παραγόμενα αρχεία για ενσωμάτωση

---

## 📝 Παραμετροποίηση

Μπορείς να αλλάξεις το όνομα των παραγόμενων αρχείων στο [`vite.widget.config.ts`](vite.widget.config.ts) (τιμές `fileName` & `assetFileNames`).

---

## 📄 Παράδειγμα

Δες το αρχείο [`WIDGET_EXAMPLE.html`](WIDGET_EXAMPLE.html) για πλήρες παράδειγμα ενσωμάτωσης.

---

## 🧑‍💻 Credits

Developed by [Your Name/Team].

---

## 📜 Άδεια