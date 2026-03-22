# Προσωπική χρήση (χωρίς API / domain checks)

Έχεις δύο τρόπους:

---

## 1) Κανονικό build — απλά μην βάζεις validation

Με το συνηθισμένο `npm run build:widget` (από `dist-widget/`), αν **δεν** ορίσεις `window.A11Y_WIDGET_CONFIG.validationUrl`, το widget **δεν** καλεί κανένα API και πάντα εμφανίζεται.

Βάλε μόνο το script (χωρίς `data-account` αν δεν θες):

```html
<script src="https://your-cdn.com/a11y-widget.js"></script>
```

Ή με loader (αν έχεις πλήρες URL του JS):

```html
<script>
(function(d){
  var s = d.createElement("script");
  s.setAttribute("src", "https://your-cdn.com/a11y-widget.js");
  (d.body || d.head).appendChild(s);
})(document);
</script>
```

- **Χωρίς** `A11Y_WIDGET_CONFIG` → καμία επικύρωση domain.
- **Χωρίς** `data-account` → δεν χρειάζεται account ID.

---

## 2) Προσωπικό build (`build:widget:personal`)

Για **γιατί-κάπου** να μην εκτελείται ποτέ validation API (ακόμα κι αν κάποιος λάθος επικολλήσει snippet με `validationUrl`):

```bash
npm run build:widget:personal
```

Τα αρχεία βγαίνουν στο **`dist-widget-personal/`** (ίδια ονόματα: `a11y-widget.js`, `a11y-widget.css`).

Χρησιμοποίησε αυτά τα αρχεία μόνο στα δικά σου sites / CDN. Η ενσωμάτωση είναι ίδια με πάνω, αλλά το bundle **αγνοεί** πλήρως το `validationUrl`.

---

## Σύνοψη

| Τρόπος | Εντολή | Χρήση |
|--------|--------|--------|
| Απλό (χωρίς config) | `npm run build:widget` | Μην βάζεις `A11Y_WIDGET_CONFIG` στη σελίδα |
| Προσωπικό bundle | `npm run build:widget:personal` | Κανένα API, ακόμα κι αν υπάρχει `validationUrl` |

---

## Παραγωγή

- **Για πλατφόρμα / πελάτες:** `npm run build:widget` → `dist-widget/`
- **Για προσωπική χρήση:** `npm run build:widget:personal` → `dist-widget-personal/`
