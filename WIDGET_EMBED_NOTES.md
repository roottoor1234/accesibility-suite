# Σημειώσεις embed & γνωστοί κίνδυνοι

Γρήγορο checklist για προβλήματα όταν το widget φορτώνεται σε **ξένες** ιστοσελίδες.

---

## Ήδη αντιμετωπισμένα στον κώδικα

| Θέμα | Λύση |
|------|------|
| Tailwind Preflight αλλάζει όλη τη σελίδα | Ξεχωριστό `tailwind.widget.config.js` με `preflight: false` |
| `data-a11y="on"` ενεργοποιείται πριν αγγίξει ο χρήστης | Μόνο όταν `countActive > 0` |
| `rem` μεγαλώνει το widget | Κουμπί trigger & θέση σε `px` όπου χρειάζεται |
| Host αλλάζει `animation-duration` | Pulse με `!important` + μοναδικό `@keyframes` |
| `localStorage` ρίχνει exception (private mode) | `try/catch` + το widget δουλεύει χωρίς αποθήκευση |
| Σύγκρουση κλειδιού localStorage | Κλειδί `a11y-widget-settings` (με migration από `accessibility-settings`) |
| `font-size` στο `<html>` όταν text size = 100% | Αφαίρεση inline `font-size` ώστε να μην πειράζει το host root |
| z-index πολύ χαμηλό | `#a11y-widget-container` με `z-index: 2147483646` |

---

## Γνωστοί κίνδυνοι (χωρίς αυτόματη διόρθωση)

### 1. Αναδιάταξη `<body>` (`.a11y-content-wrap`)

Το embed τυλίγει **όλα** τα παιδιά του `body` σε ένα `div.a11y-content-wrap`. Μπορεί να επηρεάσει:

- Scripts που υποθέτουν ότι το script tag είναι **άμεσο** παιδί του `body`
- Κάποια analytics / consent banners που «κολλάνε» στο τέλος του `body`

**Σύσταση:** Δοκιμή σε staging της πραγματικής σελίδας. Αν υπάρχει πρόβλημα, χρειάζεται προσαρμογή (π.χ. χειροκίνητο wrap μόνο του `main` — αλλάζει την αρχιτεκτονική).

### 2. CSP (Content-Security-Policy)

Η σελίδα πρέπει να επιτρέπει:

- `script-src` / `script-src-elem`: το CDN του `a11y-widget.js`
- `style-src`: το CDN του `a11y-widget.css` (ή `unsafe-inline` αν φορτώνεις inline styles αλλού)
- Αν χρησιμοποιείς validation API: `connect-src` προς το domain του API
- `img-src`: flags από `flagcdn.com` (γλώσσα στο widget)

### 3. Mixed content

Φόρτωση widget από **HTTPS** σε σελίδα **HTTP** μπορεί να μπλοκάρεται. Χρησιμοποίησε HTTPS και για το CDN και για τη σελίδα.

### 4. `alert()` στην ανάγνωση σελίδας

Αν δεν υπάρχει κείμενο ή δεν υποστηρίζεται TTS, εμφανίζεται **browser `alert()`** — μπλοκάρει το thread και φαίνεται «ξένο» στο embed. Μελλοντικά: μήνυμα μέσα στο panel.

### 5. Πολλαπλά embeds

Δύο φορτώσεις του ίδιου script → το δεύτερο init αγνοείται (υπάρχει guard). Δεν υποστηρίζονται δύο ανεξάρτητα instances στο ίδιο DOM.

### 6. Shadow DOM / Web Components

Δεν έχει δοκιμαστεί εκτενώς. Το κείμενο για TTS διαβάζει `main` ή `body` — σε shadow roots μπορεί να μην «βλέπει» περιεχόμενο.

### 7. Ίδιο origin, διαφορετικά paths

Το `localStorage` είναι **ανά origin** (όχι ανά path). Όλες οι σελίδες του `example.com` μοιράζονται τις ίδιες ρυθμίσεις widget — συνήθως επιθυμητό.

---

## Έλεγχος μετά από deploy

- [ ] Το JS/CSS φορτώνουν 200 (Network tab)
- [ ] Δεν υπάρχουν CSP violations στην κονσόλα
- [ ] Widget ορατό και κλικάρισμα
- [ ] Με validation API: απάντηση JSON `{ "allowed": true }` και CORS OK
