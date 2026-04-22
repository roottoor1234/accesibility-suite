# Publishing / Versioning (npm + jsDelivr)

## Build artifacts

Το npm/jsDelivr build παράγει:

- `lib/index.min.js`
- `lib/index.min.css`

Εντολή:

```bash
npm run build:widget:npm
```

## Versioning

Ανεβάζεις έκδοση αλλάζοντας το `version` στο `package.json` (semver).

Παραδείγματα:
- patch: `1.0.31 -> 1.0.32`
- minor: `1.0.31 -> 1.1.0`
- major: `1.0.31 -> 2.0.0`

## Publish to npm

1. Login:

```bash
npm login
```

2. Publish (scoped package):

```bash
npm publish --access public
```

## jsDelivr URLs

Μετά το publish, μπορείς να φορτώσεις:

- JS: `https://cdn.jsdelivr.net/npm/@bytepair/web-widget@1.0.31/lib/index.min.js`
- CSS: `https://cdn.jsdelivr.net/npm/@bytepair/web-widget@1.0.31/lib/index.min.css`

Για “latest” χωρίς pin:

- JS: `https://cdn.jsdelivr.net/npm/@bytepair/web-widget/lib/index.min.js`
- CSS: `https://cdn.jsdelivr.net/npm/@bytepair/web-widget/lib/index.min.css`

