# License API – Έλεγχος άδειας widget

Το widget φορτώνει **μόνο** αν υπάρχει `data-license-key` στο script tag και το **backend σου** επιστρέφει `valid: true` για το τρέχον domain.

---

## 1. Πώς το βάζει ο πελάτης

```html
<link rel="stylesheet" href="https://your-cdn.com/a11y-widget.css">
<script
  src="https://your-cdn.com/a11y-widget.js"
  data-license-key="XXXX-XXXX-XXXX"
></script>
```

Το `XXXX-XXXX-XXXX` το δίνεις εσύ στον πελάτη από το dashboard σου (ανά πακέτο/domain).

---

## 2. Τι καλεί το widget

**GET** request στο endpoint που ορίζεις στο build:

```
GET {A11Y_LICENSE_API}?key={licenseKey}&domain={currentHostname}
```

- `key`: το `data-license-key` (URL-encoded).
- `domain`: το `hostname` της σελίδας χωρίς `www` (π.χ. `example.com`).

Παράδειγμα:

```
GET https://api.yoursite.com/a11y/validate?key=abc-123-xyz&domain=client.com
```

---

## 3. Τι πρέπει να επιστρέφει το API σου

**Content-Type:** `application/json`

### Έγκυρη άδεια (widget φορτώνει)

```json
{
  "valid": true,
  "plan": "pro"
}
```

- `plan` προαιρετικό (για analytics ή μελλοντικές λειτουργίες ανά plan).

### Μη έγκυρη άδεια (widget δεν φορτώνει)

```json
{
  "valid": false,
  "message": "Domain not allowed for this license"
}
```

- `message` προαιρετικό (μπορείς να το χρησιμοποιήσεις για logging).

### Σφάλμα δικτύου / 5xx

Το widget θεωρεί την άδεια **μη έγκυρη** και δεν εμφανίζεται (ώστε να μην “ανοίγει” σε όλους σε περίπτωση πτώσης API).

---

## 4. Λογική που πρέπει να υλοποιήσεις (backend)

1. Λαμβάνεις `key` και `domain`.
2. Ψάχνεις τη license (DB/key-value) με βάση το `key`.
3. Ελέγχεις:
   - η license να είναι ενεργή (όχι expired, όχι ακυρωμένη),
   - το `domain` να ανήκει στα επιτρεπόμενα domains αυτής της license (ανά πακέτο: 1, 3, 10, unlimited).
4. Αν όλα OK → `{ "valid": true, "plan": "..." }`.
5. Αλλιώς → `{ "valid": false, "message": "..." }`.

**Domain matching:** Συνήθως κρατάς κανονικοποιημένα (lowercase, χωρίς `www`). Το widget σου στέλνει ήδη domain χωρίς `www`.

---

## 5. Build με License API

Πριν το production build, ορίζεις το base URL του validate endpoint:

**Windows (PowerShell):**
```powershell
$env:A11Y_LICENSE_API="https://api.yoursite.com/a11y/validate"; npm run build:widget
```

**Linux/macOS:**
```bash
A11Y_LICENSE_API=https://api.yoursite.com/a11y/validate npm run build:widget
```

Αν **δεν** ορίσεις `A11Y_LICENSE_API`, το built widget **δεν** κάνει license check (χρήσιμο για dev/demo). Στο production πάντα να βάζεις το API URL.

---

## 6. CORS

Το endpoint **πρέπει** να επιτρέπει CORS από **οποιοδήποτε** origin (όλες οι σελίδες πελατών):

- `Access-Control-Allow-Origin: *`  
ή  
- `Access-Control-Allow-Origin: https://client1.com` (αν θες whitelist).

Το widget τρέχει στο domain του πελάτη, οπότε το request γίνεται cross-origin.

---

## 7. Παράδειγμα απάντησης (Node/Express)

```js
// GET /a11y/validate?key=xxx&domain=yyy
app.get('/a11y/validate', (req, res) => {
  res.set('Access-Control-Allow-Origin', '*');
  const { key, domain } = req.query;
  const license = getLicenseFromDb(key); // δική σου συνάρτηση
  if (!license || license.revoked) {
    return res.json({ valid: false, message: 'Invalid license' });
  }
  if (license.expiresAt && new Date(license.expiresAt) < new Date()) {
    return res.json({ valid: false, message: 'License expired' });
  }
  const allowed = license.domains; // π.χ. ['client.com', 'app.client.com']
  const normalized = domain.replace(/^www\./, '').toLowerCase();
  if (!allowed.includes(normalized)) {
    return res.json({ valid: false, message: 'Domain not allowed' });
  }
  res.json({ valid: true, plan: license.plan });
});
```

Έχεις υλοποιήσει το module `src/lib/license.ts` και την ενσωμάτωση στο `widget-standalone.tsx`· μένει να φτιάξεις μόνο το backend και το dashboard για να δίνεις keys/domains ανά πακέτο.
