# Operation Strongman PWA v2

A local-first, installable strongman training app designed so the **app and the programme are separate**.

## What changed in v2

- Warm-up / mobility checklists inside every training session.
- Cardio prescription and logging.
- The bundled competition plan is stored as plan data rather than hard-coded app logic.
- New programmes can be imported from the **Data** screen without changing app code or redeploying GitHub Pages.
- Training data is stored separately from the active programme.
- Importing a new plan does **not** erase existing logs.
- Full backup exports the plan + all local training data.
- `plan-template.json` is a starting point for future blocks.

## GitHub Pages

GitHub Pages remains configured as:

- Branch: `main`
- Folder: `/(root)`

After an app update, refresh/reopen the installed PWA once so the new service worker activates.

## Future workflow

1. Create a new programme JSON following `plan-template.json`.
2. On the app, open **Data**.
3. Tap **Import Plan JSON**.
4. The new programme becomes active instantly.
5. Existing workout history remains stored on the device.

No GitHub rebuild is needed for routine programme changes.

## Data model

The plan controls block/week dates, day names, warm-ups, strength exercises, cardio and competition targets. The browser separately stores actual kg/reps/RPE, warm-up completion, cardio, readiness, session notes and history.

## Important

Browser data is local to the device/browser. Use **Export Full Backup** periodically and before clearing browser data or changing phones.
