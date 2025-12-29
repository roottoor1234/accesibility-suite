# 🎯 Widget Προσβασιμότητας - Οδηγός Χρήσης

Ένα πλήρως λειτουργικό widget προσβασιμότητας που μπορεί να ενσωματωθεί σε οποιαδήποτε ιστοσελίδα.

## 📦 Δημιουργία Build

Για να δημιουργήσετε τα standalone αρχεία:

```bash
npm run build:widget
```

Αυτό θα δημιουργήσει τον φάκελο `dist-widget/` με τα εξής αρχεία:
- **a11y-widget.js** (~492KB) - Το JavaScript bundle
- **a11y-widget.css** (~20KB) - Τα CSS styles

## 🚀 Ενσωμάτωση σε Ιστοσελίδα

### Βήμα 1: Ανέβασμα σε CDN

Ανεβάστε τα δύο αρχεία από τον φάκελο `dist-widget/` στο CDN ή hosting σας.

### Βήμα 2: Προσθήκη στο HTML

Προσθέστε τα παρακάτω στο `<head>` ή πριν το κλείσιμο του `</body>`:

```html
<!-- Φόρτωση CSS -->
<link rel="stylesheet" href="https://your-cdn.com/a11y-widget.css">

<!-- Φόρτωση JavaScript -->
<script src="https://your-cdn.com/a11y-widget.js"></script>
```

Αυτό είναι όλο! Το widget θα εμφανιστεί αυτόματα στην κάτω δεξιά γωνία.

### Προαιρετική Χειροκίνητη Αρχικοποίηση

Αν θέλετε να ελέγξετε πότε και πώς εμφανίζεται το widget:

```html
<script>
  window.initA11yWidget({
    position: 'bottom-right' // Επιλογές: 'bottom-right', 'bottom-left', 'top-right', 'top-left'
  });
</script>
```

## ✨ Χαρακτηριστικά

Το widget προσφέρει 11 πλήρως λειτουργικά εργαλεία:

1. **Μέγεθος Κειμένου** - Ρύθμιση από 80% έως 200%
2. **Υψηλή Αντίθεση** - Μαύρο φόντο με λευκό κείμενο
3. **Παύση Κινήσεων** - Απενεργοποίηση animations
4. **Επισήμανση Συνδέσμων** - Κίτρινο φόντο στους συνδέσμους
5. **Οδηγός Ανάγνωσης** - Οπτικός κανόνας που ακολουθεί το ποντίκι
6. **Γραμματοσειρά Δυσλεξίας** - Arial με βαρύτερο font-weight
7. **Απόκρυψη Εικόνων** - Απόκρυψη όλων των εικόνων
8. **Ύψος Γραμμής** - Ρύθμιση από 80% έως 200%
9. **Απόσταση Γραμμάτων** - Ρύθμιση από 80% έως 200%
10. **Μέγεθος Δείκτη** - Μεγέθυνση cursor από 100% έως 300%
11. **Ανάγνωση Σελίδας** - Text-to-Speech με Web Speech API

## 💾 Αποθήκευση Ρυθμίσεων

Όλες οι ρυθμίσεις αποθηκεύονται αυτόματα στο localStorage του browser και παραμένουν ενεργές σε όλες τις επισκέψεις του χρήστη.

## ⌨️ Προσβασιμότητα Πληκτρολογίου

- **Tab** - Πλοήγηση στα στοιχεία
- **Esc** - Κλείσιμο του panel
- **Enter/Space** - Ενεργοποίηση επιλογών
- Focus trap μέσα στο panel όταν είναι ανοιχτό

## 🌐 Συμβατότητα Browser

- Chrome / Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers με Web Speech API

## 📋 Παράδειγμα Πλήρους Ενσωμάτωσης

```html
<!DOCTYPE html>
<html lang="el">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Η Ιστοσελίδα μου</title>

  <!-- Widget CSS -->
  <link rel="stylesheet" href="https://your-cdn.com/a11y-widget.css">
</head>
<body>
  <header>
    <h1>Καλώς ήρθατε</h1>
  </header>

  <main>
    <p>Το περιεχόμενο της σελίδας σας...</p>
  </main>

  <!-- Widget JS (φορτώνεται στο τέλος για καλύτερη απόδοση) -->
  <script src="https://your-cdn.com/a11y-widget.css"></script>
</body>
</html>
```

## 🔧 Troubleshooting

### Το widget δεν εμφανίζεται;
- Ελέγξτε ότι και τα δύο αρχεία (CSS & JS) φορτώνονται σωστά
- Δείτε το browser console για τυχόν σφάλματα
- Βεβαιωθείτε ότι τα URLs είναι σωστά

### Οι ρυθμίσεις δεν αποθηκεύονται;
- Ελέγξτε αν το localStorage είναι ενεργοποιημένο
- Σε private/incognito mode το localStorage μπορεί να μην λειτουργεί
- Καθαρίστε το cache του browser

### Η φωνητική ανάγνωση δεν λειτουργεί;
- Βεβαιωθείτε ότι ο browser υποστηρίζει Web Speech API
- Σε κάποιους browsers χρειάζεται σύνδεση στο internet
- Ελέγξτε τα permissions για μικρόφωνο (αν χρειάζεται)

## 📂 Δομή Project

```
project/
├── src/
│   ├── components/
│   │   ├── AccessibilityWidget.tsx
│   │   └── ReadingGuide.tsx
│   ├── contexts/
│   │   └── AccessibilityContext.tsx
│   ├── hooks/
│   │   ├── useTextToSpeech.ts
│   │   └── useReadingGuide.ts
│   ├── widget-standalone.tsx  # Entry point για standalone
│   └── widget-styles.css      # Styles για standalone
├── dist-widget/               # Output folder
│   ├── a11y-widget.js
│   └── a11y-widget.css
├── vite.widget.config.ts      # Vite config για widget build
└── WIDGET_EXAMPLE.html        # Demo σελίδα
```

## 📝 Development

### Εκτέλεση Demo

```bash
# Build του widget
npm run build:widget

# Άνοιγμα του WIDGET_EXAMPLE.html σε browser
# Ή χρησιμοποιήστε έναν local server
```

### Build για Production

```bash
# Build μόνο του widget
npm run build:widget

# Build και της κύριας εφαρμογής και του widget
npm run build:all
```

## 📄 Άδεια Χρήσης

Μπορείτε να χρησιμοποιήσετε αυτό το widget ελεύθερα στα projects σας.

## 🤝 Συνεισφορά

Για bugs ή features, ανοίξτε ένα issue ή στείλτε pull request.

---

Δημιουργήθηκε με ❤️ χρησιμοποιώντας React, TypeScript & Tailwind CSS
