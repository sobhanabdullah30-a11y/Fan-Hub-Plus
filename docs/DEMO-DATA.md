> Historical: superseded by CATALOG-EDITION.md and scripts/Publish-Catalog.mjs. Do not run this legacy importer against the current edition.

# Database demo content

`scripts/Seed-Demo.mjs` writes 24 published content records through the authenticated admin API. The normal repository saves them in the configured SQL database; the React application reads them through its existing endpoints. No frontend fallback dataset is used.

The dataset covers all eight categories and all eight content types, including four upcoming events. Every item has a cover image; gallery entries have multiple images. Video and audio entries use public playback samples. Photography is illustrative, not official franchise artwork. All titles start with `[Demo]`, and the `fanhub-demo-v1` tag identifies this dataset. Event venues and coordinates are illustrative; there are no booking or payment links.

Run with Node.js 22 or later. Set `FANHUB_API_URL`, `FANHUB_ADMIN_EMAIL` and `FANHUB_ADMIN_PASSWORD` in the process environment, then run `node scripts/Seed-Demo.mjs`. Do not commit passwords. The target URL must use HTTPS.

The script checks asset availability before inserting, skips existing demo records with matching titles, and reads each new item back through the public API. Dates are assigned relative to the initial run. Running it again preserves existing records and dates. Run only one instance at a time. If interrupted, rerun to finish the missing records.

Images are hosted at images.unsplash.com. The video and audio samples are hosted at w3schools.com; the audio is explicitly labelled as a technical sound sample. These external assets require an internet connection. To remove demo content, filter for the demo tag in the admin content list and delete the selected records.
