# Strongman Peak PWA

A lightweight, offline-capable progressive web app built around the 31 October 2026 Log + Deadlift competition peak.

## Included
- Handover week using the current coach's key log/deadlift prescriptions.
- Four progressive training weeks plus competition-week taper.
- Log target: 115 kg current PB → 120 kg goal.
- Deadlift target: 260 kg current PB → 280 kg goal.
- 4-day layout: Log/Upper, Deadlift/Back, Legs, Log+Deadlift Support.
- Set-by-set weight, reps and RPE logging.
- Readiness tracking.
- Competition countdown and training-best display.
- Offline caching after first load.
- Local browser storage plus JSON export/import.
- Responsive layout designed for a phone cover screen and a Fold-style larger inner display.

## GitHub Pages deployment

This repository includes `.github/workflows/pages.yml`, which deploys the site automatically whenever `main` is updated.

After creating the repository and pushing these files:

1. Open the repository on GitHub.
2. Go to **Settings → Pages**.
3. Under **Build and deployment → Source**, select **GitHub Actions**.
4. Open the **Actions** tab and confirm the `Deploy Strongman Peak to GitHub Pages` workflow succeeds.
5. The deployment page will show the live GitHub Pages URL.

All asset, manifest, and service-worker paths are relative, so the PWA works when hosted at a project URL such as `https://USERNAME.github.io/strongman-peak/`.

## Install on Android / Samsung Fold

Open the live HTTPS site in Chrome. Use **Install app** or **Add to Home screen**. Once loaded successfully, the service worker caches the app for offline use.

## Training data and privacy

Workout logs are stored in the browser's local storage. Publishing this repository does **not** publish entered weights, RPEs, readiness scores, or notes. Use **Data → Export JSON** inside the app for backups. Clearing browser/site data can remove local logs.

## Run locally

Because service workers require HTTP/HTTPS, run a local web server rather than double-clicking `index.html`:

```bash
python -m http.server 8080
```

Then open `http://localhost:8080`.

## Programming note

The optional 117.5 kg log and 270 kg deadlift singles are conditional on the preceding heavy single staying within its programmed RPE cap. The app intentionally does not schedule 120 kg log or 280 kg deadlift in training before competition day.
