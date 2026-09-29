# Fan Hub Plus frontend

React/Vite frontend integrated with the four-layer ASP.NET Core backend in the parent directory.

## Run locally

```powershell
cd FRONTEND
npm ci --ignore-scripts
npm run dev
```

Open http://localhost:5173. Requests use relative /api URLs. Vite proxies them over verified HTTPS to https://tech360-fanhub.runasp.net. To use a local API, set API_PROXY_TARGET to its address in .env. Keep VITE_API_BASE_URL empty for same-origin hosting. Do not put database, JWT signing or SMTP credentials in VITE_ variables; those variables are public in the browser bundle.

## Verify

```powershell
npm test
npm run lint
npm run format:check
npm run build
```

The backend serves production assets from Fan-Hub/wwwroot, copied from frontend/dist during the release build. The live homepage is the React site, /swagger is API documentation, and /verify-email and /reset-password load the React email flow. Unknown /api routes remain 404 instead of returning HTML.

## Release

From the solution root, run ./scripts/Build-Release.ps1 to build and package both projects. Use ./scripts/Build-Release.ps1 -Deploy to publish using the saved Visual Studio IIS credentials on the owner's Windows account. No deployment credentials are stored in those scripts. Database migrations are not applied automatically by deployment.

Live URL: https://tech360-fanhub.runasp.net/

### Vercel frontend deployment

Import this GitHub repository into Vercel and set the project root directory to `FRONTEND`. The committed `vercel.json` builds the Vite application and proxies `/api` and `/health` to the hosted ASP.NET Core backend. No backend credentials or browser-visible secrets are required in Vercel.

The ASP.NET Core API and SQL Server database remain on their current host. Vercel serves the frontend only. Verification and password-reset links continue to use the backend's configured `Email:FrontendUrl` unless that deployment setting is intentionally changed.

## Source structure

- `app`: application state, navigation and route definitions.
- `pages`: page components, including public information pages.
- `features`: authentication, catalog, events, administration and feedback forms.
- `components`: shared layouts, dialogs, media and reusable controls.
- `services`: HTTP requests, session handling and API response adapters.
- `hooks`, `state`, `content`, `contracts`, `styles`: shared hooks, initial state, editorial content, API schema and styles.

Keep feature-specific UI with its feature. Shared components receive explicit props; API payload conversion belongs in the services layer.

## Integration details

- Profile responses use { user, categoryIds }; the adapter preserves the administrator role and category interests.
- The editor sends non-null string values required by the API and string enum names.
- Email links select verification/reset screens using the backend-generated URL paths.
- Published catalog data comes only from the database. Empty states are intentional until approved real content is added.
- Registration verification and password-recovery email delivery require a working SMTP provider. Configure it through secure deployment settings; email verification must not be bypassed.
