# Focus Kitchen

A personal focus app for iPhone. While you concentrate, a dish cooks. See `docs/SPEC.md`.

## Develop

```bash
npm install
npm run dev      # local dev server
npm test         # unit tests (Vitest)
npm run e2e      # Playwright smoke test against a production build
npm run build    # production build in dist/
npm run icons    # regenerate PNG icons from public/icon.svg
```

## Deploy

Every push to `main` builds and deploys to GitHub Pages through `.github/workflows/deploy.yml`.
In the repository settings, Pages must have its source set to "GitHub Actions".
