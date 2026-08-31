# I PAH website

Static, dependency-free, trilingual presentation website for I PAH memorial care services.

## Local preview

```bash
node scripts/generate-pages.mjs
node scripts/serve.mjs
```

Then open `http://localhost:4173/hy/`.

## Client preview

The `docs/` directory is published from the `main` branch through GitHub Pages.
Regenerate it before publishing website changes:

```bash
node scripts/prepare-pages.mjs
```

The Pages artifact uses `IPAH_BASE_PATH=/ipah`, so every language and asset works
at `https://creatortelegramapp.github.io/ipah/`.

## Before production launch

Replace the generic WhatsApp and Telegram share URLs in `scripts/generate-pages.mjs` with the company’s direct WhatsApp number and Telegram username, then regenerate the pages.
