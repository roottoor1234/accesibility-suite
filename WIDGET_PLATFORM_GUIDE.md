# Οδηγός πλατφόρμας συνδρομής για το A11y Widget

Αυτός ο οδηγός περιγράφει **αναλυτικά** τι χρειάζεται για να συνδέσεις το widget με τη δική σου πλατφόρμα (βάση δεδομένων, API, domain restriction) και τι πρέπει να κάνει ο πελάτης για να το ενσωματώσει.

---

## 1. Τι είναι ήδη έτοιμο (από αυτό το repo)

- **Widget build:** Με `npm run build:widget` παράγονται τα `dist-widget/a11y-widget.js` και `dist-widget/a11y-widget.css`.
- **Ενσωμάτωση με Account ID:** Το widget διαβάζει το `data-account` από το script tag και το χρησιμοποιεί για επικύρωση domain.
- **Domain validation:** Αν ορίσεις `A11Y_WIDGET_CONFIG.validationUrl`, το widget κάνει **GET** request στο URL σου με `accountId` και `domain` και εμφανίζεται μόνο αν η απάντηση είναι `{"allowed": true}`.
- **Αυτόματο CSS:** Αν το script φορτώνεται από URL (CDN), το widget φορτώνει αυτόματα το CSS από το ίδιο base path (ή από `data-cdn`).

Δεν χρειάζεται άλλη αλλαγή στο widget. Όλα τα επόμενα αφορούν **την πλατφόρμα που θα φτιάξεις εσύ**.

---

## 2. Τι πρέπει να φτιάξεις εσύ (πλατφόρμα)

1. **Βάση δεδομένων** – accounts, συνδρομές, επιτρεπόμενα domains.
2. **API endpoint** – ένα URL που το widget θα καλεί για να ελέγξει αν το domain επιτρέπεται για το accountId.
3. **Πλατφόρμα (frontend + backend)** – εγγραφή/συνδρομή, διαχείριση domains, παραγωγή snippet για τον πελάτη.

---

## 3. Βάση δεδομένων

Προτεινόμενη δομή (μπορείς να προσαρμόσεις τα ονόματα):

### Πίνακας `accounts` (ή `users`)

| Πεδίο      | Τύπος     | Σημείωση                          |
|-----------|------------|------------------------------------|
| id        | UUID / string | Primary key, **αυτό είναι το Account ID** που δίνεις στο script |
| email     | string     | Για login                          |
| password_hash | string  | Όχι plain password                 |
| created_at | timestamp |                                    |

### Πίνακας `subscriptions` (προαιρετικό)

| Πεδίο        | Τύπος     | Σημείωση                    |
|-------------|------------|-----------------------------|
| id          | UUID       |                             |
| account_id  | FK → accounts.id |                        |
| plan        | string     | π.χ. "basic", "pro"         |
| status      | string     | "active", "cancelled", "expired" |
| valid_until | date       |                              |

### Πίνακας `allowed_domains`

Εδώ κρατάς ποια domains επιτρέπονται ανά account (για το domain restriction).

| Πεδίο       | Τύπος     | Σημείωση |
|------------|------------|----------|
| id         | UUID       |          |
| account_id | FK → accounts.id | Το account που «αγοράζει» το widget |
| domain     | string     | Π.χ. `example.com` ή `www.example.com` (χωρίς protocol) |
| created_at | timestamp  |          |

- **Ένα account** μπορεί να έχει **πολλά** domains (πολλά rows με το ίδιο `account_id`).
- Στο API θα ελέγχεις: υπάρχει row με `account_id = X` και `domain = Y` (και αν χρησιμοποιείς subscriptions: η συνδρομή να είναι active).

**Σημαντικό:** Το widget σου στέλνει το **hostname** όπως το βλέπει ο browser (π.χ. `example.com`, `www.example.com`, `sub.example.com`). Αποφάσισε αν θέλεις να κρατάς `example.com` και να θεωρείς επιτρεπτό και το `www.example.com` (π.χ. κανονικοποίηση: αφαιρείς `www.` ή κρατάς και τα δύο ξεχωριστά).

---

## 4. API endpoint – ακριβής προδιαγραφή

Το widget καλεί **μόνο αυτό το endpoint**. Όλα τα υπόλοιπα (login, payments, UI) είναι δικά σου.

### 4.1 Μέθοδος και URL

- **Μέθοδος:** `GET`
- **URL:** Οποιοδήποτε URL θέλεις εσύ. Θα το πεις στους πελάτες μέσω του snippet (βλ. ενότητα 6).  
  Παράδειγμα: `https://your-platform.com/api/widget/validate`

### 4.2 Query parameters (από το widget)

| Παράμετρος | Πηγή | Παράδειγμα |
|------------|------|------------|
| `accountId` | `data-account` του script | `"acc_abc123"` |
| `domain`    | `window.location.hostname` | `"example.com"` ή `"www.example.com"` |

Παράδειγμα πλήρους κλήσης:

```http
GET https://your-platform.com/api/widget/validate?accountId=acc_abc123&domain=example.com
```

### 4.3 Απάντηση (response)

- **Content-Type:** `application/json`
- **Σώμα απάντησης:**

  - **Επιτρέπεται το domain:**  
    `{"allowed": true}`  
    → Το widget εμφανίζεται.

  - **Δεν επιτρέπεται:**  
    `{"allowed": false}`  
    → Το widget **δεν** εμφανίζεται (και τυπώνει προειδοποίηση στο console).

- **HTTP status:** Συνήθως 200 και για τα δύο (allowed true/false). Αν θες να «κρύψεις» την ύπαρξη του endpoint σε μη-έγκυρα requests, μπορείς να επιστρέφεις 403 ή 404 όταν `allowed: false`, αλλά τότε το widget πρέπει να θεωρεί και μη-200 σαν «δεν επιτρέπεται» (κάτι που ήδη κάνει αν η απάντηση δεν είναι `allowed: true`).

### 4.4 CORS

Το request γίνεται **από το browser του επισκέπτη** (domain της ιστοσελίδας του πελάτη, π.χ. `https://example.com`). Άρα το **API σου πρέπει να επιτρέπει CORS** για αυτή την προέλευση (ή για όλες τις προελεύσεις αν είναι δημόσιο widget).

Παράδειγμα headers (προσαρμογή ανά framework):

```http
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET
```

Ή πιο περιοριστικά:

```http
Access-Control-Allow-Origin: https://example.com
Access-Control-Allow-Methods: GET
```

Χωρίς σωστό CORS το browser θα μπλοκάρει το request και το widget θα συμπεριφερθεί σαν «domain not allowed».

### 4.5 Λογική στο backend (ψευδοκώδικας)

```
1. Πάρε από query: accountId, domain
2. (Προαιρετικά) Κανονικοποίηση domain (π.χ. αφαίρεση "www.")
3. Έλεγχος στη ΒΔ:
   - Υπάρχει account με id = accountId;
   - Υπάρχει εγγραφή στο allowed_domains με account_id = accountId και domain = domain;
   - (Προαιρετικά) Η συνδρομή του account είναι active
4. Αν όλα OK → απάντησε {"allowed": true}
   Αλλιώς → απάντησε {"allowed": false}
```

---

## 5. Πλατφόρμα – λειτουργίες που χρειάζονται

### 5.1 Για τον διαχειριστή (εσένα)

- Hosting των αρχείων widget: ανέβασμα των `a11y-widget.js` και `a11y-widget.css` (από `dist-widget/`) σε CDN ή static server. Το **base URL** αυτού του CDN θα το χρησιμοποιείς στο snippet (βλ. ενότητα 6).

### 5.2 Για τον πελάτη (χρήστη της πλατφόρμας)

- **Εγγραφή / σύνδεση**
- **Αγορά συνδρομής** (αν έχεις πλάνα)
- **Λήψη Account ID:** Μετά την εγγραφή/συνδρομή, ο πελάτης πρέπει να βλέπει το **Account ID** του (το `id` από τον πίνακα `accounts`, ή ένα δημόσιο αναγνωριστικό που εσύ αντιστοιχίζεις σε account).
- **Διαχείριση domains:**  
  - Προσθήκη domain (π.χ. `example.com`) που επιτρέπεται για το account του.  
  - Αποθήκευση στη ΒΔ στο `allowed_domains` (account_id + domain).
- **Λήψη snippet:** Η πλατφόρμα να δείχνει στον πελάτη το script που πρέπει να επικολλήσει στην ιστοσελίδα του, με **το δικό του accountId** και **το validation URL σου** (βλ. ενότητα 6).

---

## 6. Snippet που δίνεις στον πελάτη

Μετά τη ρύθμιση domains και την επιλογή CDN base URL, ο πελάτης πρέπει να βάλει **πριν το `</body>`** (ή στο `<head>`) το εξής. Τα `YOUR_ACCOUNT_ID`, `https://your-cdn.com`, `https://your-platform.com` αντικαθίστανται από τις πραγματικές τιμές από τη πλατφόρμα σου.

### 6.1 Με domain restriction (επικύρωση μέσω API)

```html
<script>
window.A11Y_WIDGET_CONFIG = {
  validationUrl: "https://your-platform.com/api/widget/validate"
};
</script>
<script>
(function(d){
  var s = d.createElement("script");
  s.setAttribute("data-account", "YOUR_ACCOUNT_ID");
  s.setAttribute("src", "https://your-cdn.com/a11y-widget.js");
  (d.body || d.head).appendChild(s);
})(document);
</script>
```

- `YOUR_ACCOUNT_ID` → το `account_id` (id από `accounts`) που αντιστοιχεί στον πελάτη.
- `https://your-cdn.com` → base URL όπου έχεις ανεβάσει τα `a11y-widget.js` και `a11y-widget.css`.
- `https://your-platform.com/api/widget/validate` → το API endpoint που περιγράφηκε παραπάνω.

### 6.2 Χωρίς domain restriction (μόνο για δοκιμές)

Αν **δεν** ορίσεις `A11Y_WIDGET_CONFIG.validationUrl`, το widget **πάντα** εμφανίζεται (δεν καλεί κανένα API). Χρήσιμο για development ή αν αργότερα απενεργοποιήσεις το restriction.

### 6.3 Προαιρετικό: ξεχωριστό CDN base URL

Αν το script φορτώνεται από διαφορετικό path από το CDN base, μπορείς να ορίσεις:

```html
s.setAttribute("data-cdn", "https://your-cdn.com/assets/");
s.setAttribute("src", "https://your-cdn.com/assets/a11y-widget.js");
```

Το widget θα φορτώσει το CSS από `https://your-cdn.com/assets/a11y-widget.css`.

---

## 7. Checklist – τι να κάνεις βήμα προς βήμα

### Βάση δεδομένων

- [ ] Πίνακας `accounts` με τουλάχιστον `id` (Account ID), email, password_hash.
- [ ] Πίνακας `allowed_domains` με `account_id`, `domain`.
- [ ] (Προαιρετικά) Πίνακας `subscriptions` και σύνδεση με `accounts`.

### API

- [ ] Endpoint `GET /api/widget/validate` (ή όποιο path διάλεξες).
- [ ] Διάβασμα `accountId` και `domain` από query params.
- [ ] Έλεγχος στη ΒΔ: account υπάρχει, domain επιτρέπεται για αυτό το account (και ενεργή συνδρομή αν υπάρχει).
- [ ] Απάντηση JSON: `{"allowed": true}` ή `{"allowed": false}`.
- [ ] CORS headers ώστε να καλεί το endpoint το browser από οποιοδήποτε domain (ή από τα domains των πελατών σου).

### Πλατφόρμα (UI + backend)

- [ ] Εγγραφή/σύνδεση και δημιουργία/ανάγνωση account.
- [ ] Σελίδα «Διαχείριση domains»: προσθήκη/αφαίρεση domains για το τρέχον account, αποθήκευση στο `allowed_domains`.
- [ ] Σελίδα «Ενσωμάτωση widget» (ή «Λήψη κώδικα»): εμφάνιση του snippet με το **πραγματικό** Account ID και το **validation URL** της πλατφόρμας σου και το **CDN URL** όπου hostάρεις τα `a11y-widget.js` και `a11y-widget.css`.

### Widget αρχεία

- [ ] Build: `npm run build:widget` (από αυτό το repo).
- [ ] Ανέβασμα `dist-widget/a11y-widget.js` και `dist-widget/a11y-widget.css` στο CDN/hosting σου.

---

## 8. Παράδειγμα απάντησης API

**Επιτρεπόμενο domain:**

```json
{"allowed": true}
```

**Μη επιτρεπόμενο domain:**

```json
{"allowed": false}
```

Μπορείς να προσθέσεις και extra πεδία (π.χ. `message`) για debugging· το widget χρησιμοποιεί **μόνο** το `allowed`.

---

## 9. Σύνοψη ροής

1. Ο πελάτης εγγράφεται στην πλατφόρμα σου και παίρνει ένα **Account ID**.
2. Προσθέτει **domains** (π.χ. `example.com`) στη διαχείριση domains.
3. Παίρνει από εσένα το **snippet** με το Account ID και το validation URL.
4. Επικολλάει το snippet στην ιστοσελίδα του.
5. Όταν ένας επισκέπτης ανοίγει τη σελίδα, το widget φορτώνεται και καλεί το API σου με `accountId` και `domain`.
6. Το API ελέγχει το `allowed_domains` (και συνδρομή αν θες) και απαντά `allowed: true/false`.
7. Το widget εμφανίζεται μόνο αν `allowed === true`.

Αν κάτι από τα παραπάνω θες να το προσαρμόσουμε (π.χ. διαφορετικό format για domain, ή extra query params), μπορούμε να το αλλάξουμε και στο widget και στον οδηγό.
