> Historical integration record. For the current corrected release, see docs/SRS-FIX-STATUS.md in the repository root.

# Full-stack integration and deployment — 2026-09-26

Live website: https://tech360-fanhub.runasp.net/
API documentation: https://tech360-fanhub.runasp.net/swagger/index.html
Local React: http://localhost:5173/

## Connected components

The supplied fandomuniverse.zip was extracted into frontend/ without its node_modules, build output or temporary credential/test files. The React build is served by the existing ASP.NET Core API from wwwroot. Browser requests use relative /api URLs, so the deployed frontend and API share HTTPS and do not require cross-origin configuration. The existing configured SQL database remains the source of truth.

Local Vite proxies /api and /health over verified HTTPS to the live API. The old Downloads copy's Vite process was replaced with the integrated frontend server. Use the frontend folder in this solution for future edits.

## Fixes

- Corrected the nested profile response adapter ({ user, categoryIds }) so login, admin role and saved interests load correctly.
- Preserved the current user's preferences when loading the admin users list.
- Replaced invalid null editor/rating text fields with empty strings accepted by the API.
- Connected backend /verify-email and /reset-password links to the corresponding React flows.
- Restricted rating controls to supported media types.
- Removed the hardcoded HTTP API fallback. The deployed UI uses its own HTTPS origin.
- Added static file serving and SPA fallback; unknown /api routes still return 404.
- Added scripts/Build-Release.ps1 and scripts/Deploy-Iis.ps1 for repeatable packaging/deployment.

## Verification

- npm ci completed; audit reported zero vulnerabilities at installation time.
- Eight frontend contract/integration tests passed, including the profile/admin store regression.
- Production Vite build passed; backend build passed with zero warnings/errors.
- 124 backend regression checks passed.
- Browser against the combined local app and configured SQL: admin login, dashboard/admin reads, actual form-based content create/read/update/delete, logout, and mobile viewport without horizontal overflow passed. The temporary test record was deleted. No demo catalog data was retained.
- Live browser: homepage 200, readiness 200, Swagger 200, email route pages 200, unknown API 404, admin login/admin workspace passed, no React runtime errors, logout 204.
- The combined frontend/backend was deployed through the saved IIS publish profile.

## Still requires external input

Gmail rejected the supplied SMTP credential with 535/5.7.8. The website and verified admin work, but registration verification and password-recovery emails cannot be certified until a valid Google App Password or another working SMTP provider is configured. Verification was not bypassed.

The catalog/events have no approved real content. The owner requested real content only, so no demonstration dataset was seeded. Administrators can add genuine content through the live UI.
