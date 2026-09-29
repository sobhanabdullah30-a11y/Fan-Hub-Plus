# Editorial catalog edition

The content library contains 60 database records across all eight categories: 16 articles, eight original character profiles, eight illustrated galleries, eight audio stories, eight narrated visual essays, eight product-design concepts, two real event listings and two release-calendar entries.

Each record has its own title, description, body and cover asset. The galleries contain additional composition plates. Media is hosted with the application under `/catalog/`; content, image references, media references and event/release fields are stored through the backend API in SQL. React does not import a fallback content dataset.

The Help page and Fan Guide also use 18 published database FAQ answers. Eight category descriptions explain the distinct subject matter of each collection. The former static Help-page answer array has been removed.

## Content and media provenance

- The eight fictional settings and characters are original editorial creations. They are identified as fiction in their profiles. They are not characters from a licensed commercial franchise.
- Artwork is original SVG illustration. Covers are editorial designs, not photographs of real events or official film/game posters.
- Audio stories and visual essays use original writing and synthetic narration from installed Microsoft system voices. They do not imitate a named performer. Videos are illustrated motion studies, not commercial film clips or music videos.
- Product entries are clearly described as display-only design concepts. No inventory, manufacture, endorsement or checkout is claimed.
- Video captions are available in English, with a full narration transcript in the content body.

## Time-sensitive sources

Event and release details were checked on 26 September 2026. They will need ordinary editorial review if organizers or publishers change their schedules.

- [New York Comic Con](https://www.newyorkcomiccon.com/): 8–11 October 2026 at the Javits Center. Stored event timestamps bound the announced dates; they are not admission hours.
- [MCM London Comic Con](https://www.mcmcomiccon.com/london/en-us.html): 23–25 October 2026 at ExCeL London. Daily opening times must be checked with the organizer.
- [Rockstar Games](https://www.rockstargames.com/VI): Grand Theft Auto VI release-calendar entry for 19 November 2026.
- [Disney Movies](https://movies.disney.com/avengers-doomsday): Avengers: Doomsday theatrical release-calendar entry for 18 December 2026.

## Maintenance and reproducibility

`scripts/catalog/worlds.mjs` contains the editable original writing. `build-catalog.mjs` generates illustrations and the import manifest. `render-plates.cjs` renders video plates with Playwright, and `Build-Media.ps1` creates narration and video using Windows speech synthesis and FFmpeg. Finished media is included in `frontend/public/catalog`, so rebuilding the application does not require regenerating it.

`scripts/Publish-Catalog.mjs` requires the API URL and administrator credentials in environment variables. Without `--apply` it prints an update plan. With `--apply` it verifies every deployed image/media URL, backs up affected records, updates tagged legacy records in place, creates the remaining entries and reads the public API back to verify persistence. Existing IDs are reused to preserve links and bookmarks. A rerun matches stable content keys rather than creating duplicates. Runtime backups and publication manifests are kept under `artifacts` and excluded from the source submission ZIP.

The earlier `Seed-Demo.mjs` and its manifest are historical development fixtures; do not run them against this edition. Use `Publish-Catalog.mjs` for the current library.

## Interface changes

Cards use category-specific accents, subtle pointer tilt, a cover-light sweep and image zoom. Character details show their portraits. Audio includes playback controls and transcripts; original videos include caption tracks. Keyboard focus, touch behavior, Effects off and reduced-motion preferences are preserved.

This edition fills the library; it does not resolve the previously documented rejected SMTP credential or establish backups, uptime or load-test guarantees.

## Release checks

Publication read-back verified all 60 content records and 18 FAQs. All 100 image/media URLs passed preflight; all 16 recordings passed complete file decoding and live browser playback. Eight caption tracks loaded successfully. Search/detail rendering, pointer hover, a 390px mobile viewport and reduced-motion behavior passed without browser runtime errors. Machine-readable results are in artifacts/catalog-verification.json.

