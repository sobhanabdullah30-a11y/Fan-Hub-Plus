# Editorial catalog release — 2026-09-26

The live SQL-backed library now contains 60 distinct records: 16 articles and eight each of characters, galleries, audio stories, videos and merchandise concepts, plus two event listings and two release entries. Eighteen FAQs and eight distinct category descriptions are published from the database. All 24 former demo IDs were reused; 36 entries were added. Pre-update backups are in artifacts and excluded from the source archive.

Verification completed: 100 deployed image/media URLs passed preflight; all 16 files passed full local decoding and actual browser playback; eight WebVTT caption files loaded after explicitly registering their MIME type. Search and detail rendering, 12-card pagination, hover behavior, 390px layout without horizontal overflow and reduced-motion preference passed. No browser runtime errors were recorded. Backend regression checks and all 13 frontend tests passed, together with lint and production builds. See artifacts/catalog-verification.json and docs/CATALOG-EDITION.md.

The characters and design concepts are original fiction. Narration is synthetic; videos are original illustrated visual essays. The previous application demonstration video predates this catalog refresh. Production SMTP delivery remains blocked by the previously rejected credential; this release does not claim otherwise.

---
# Current SRS correction release — 2026-09-26

See docs/SRS-FIX-STATUS.md for current implementation and verification status. The updated site is deployed; 129 backend checks and 13 frontend tests passed. Production SMTP authentication still returns 535. Older entries below are historical and may describe resolved issues or pre-seeding data.

---

# Full-stack release — 2026-09-26

React and ASP.NET were published together at https://tech360-fanhub.runasp.net/. Eight frontend tests and 124 backend checks passed. Production frontend build and backend build passed. Browser admin form create/read/update/delete against the configured SQL database passed; the temporary record was removed. Mobile layout had no horizontal overflow. Live homepage, readiness, Swagger and email-route pages returned 200; unknown API route returned 404. Live browser admin login/Admin workspace and logout (204) passed without React runtime errors.

Registration/recovery email delivery remains blocked by Gmail rejecting the supplied SMTP credential (535/5.7.8). No demo data was seeded. Full details: frontend/INTEGRATION-REPORT.md and docs/DEPLOYMENT.md.

---

## Previous verification records

# Frontend integration verification — 2026-09-25

- Latest build passed with 0 warnings and 0 errors; 124 regression checks passed. Changed files passed whitespace verification.
- Registration retry after an SMTP failure is covered, including preservation of the existing account and rejection of password replacement. Production loopback email links require explicit opt-in; external HTTP and non-HTTP schemes remain rejected.
- Live configured SQL database: the configured administrator account is active and verified. Through a local Production API connected to that database, login, profile, admin users, content create/read/update/delete and logout passed. Temporary content was deleted. This is a targeted live smoke check; the separate full SQL integration suite still skipped without FANHUB_TEST_SQL.
- Deployed HTTP health endpoint is healthy and the localhost:5173 CORS preflight passed. Public content/events are empty. HTTPS handshake on tech360-fanhub.runasp.net resets. No authenticated requests were sent to the public HTTP endpoint.
- Gmail SMTP host/from/username and local React link settings are prepared. A Google App Password is still required; real SMTP delivery remains unverified. No changes were deployed during this task.
- See docs/FRONTEND_INTEGRATION.md for endpoint mapping and the exact outstanding hosting/configuration work.

---

## Earlier architecture verification (historical)

# Verification

Verified on 2026-09-25 after aligning the backend with the supplied E-Project reference ZIP.

- Build: `dotnet build FanHub.Tests/FanHub.Tests.csproj --no-restore --nologo -m:1 -p:UseSharedCompilation=false -nodeReuse:false -v:minimal` passed with zero warnings and zero errors.
- Regression runner: **115 checks passed**. Coverage includes account recovery, session revocation, moderation, ownership, search, ratings, activity pagination, events/calendar, admin feedback, credential-safe responses, SQL schema/query translation, and HTTP authorization and validation.
- JWT checks cover valid tokens, expiry, incorrect issuer/audience/signature, bearer authentication, logout and immediate revocation.
- CORS checks cover configured and unconfigured origins. The HTTP content update test verifies the update DTO, inherited validation and AutoMapper through the controller-service-repository chain.
- Architecture checks verify the reference layout, project dependencies, controller service contracts, separate DTO mappings and production service/repository registrations.
- Swagger smoke test: **67 controller operations + 2 health operations**, with JWT bearer documentation. Swagger JSON returned 200.
- Host smoke test: `/health/live` returned 200; `/health/ready` and `/api/categories` returned the expected 503 without database configuration.
- Formatting: `dotnet format whitespace . --folder --include FanHub.Domain FanHub.Application FanHub.Infrastructure Fan-Hub FanHub.Tests --exclude tmp --verify-no-changes --verbosity minimal` passed.
- Initial EF migration and model snapshot were generated in Domain/Migrations. `dotnet ef migrations has-pending-model-changes --project FanHub.Domain --startup-project Fan-Hub --no-build` reported no model changes. The migration was not applied to a live database.

## Integration checks still pending

- Real SQL Server persistence was **not tested**. Earlier local connection attempts encountered Windows security/SSL restrictions; automatic approval attempts for a read-only connection check timed out. No database was modified by those attempts.
- `SqlIntegrationChecks` is opt-in through `FANHUB_TEST_SQL`. It creates a uniquely named test database and removes that database after checking persistence, seeding, JSON queries, concurrency and cascading deletion. The final run skipped it because no connection was configured.
- External SMTP delivery remains unverified because SMTP settings were not supplied.
- Packages were restored from the available cache with vulnerability auditing disabled. This build is not a fresh NuGet vulnerability audit.
- Folder-based whitespace verification succeeded. The project-aware formatter previously encountered sandbox MSBuild named-pipe restrictions.

## Deployment notes

- Configure a persistent `Jwt:Key` before production. Development can use a generated temporary key; restarting with that key invalidates existing tokens. Existing opaque sessions require a fresh login after this JWT change.
- Review the initial migration against any existing database and establish a baseline before applying it. Configure the database, frontend CORS origins and email delivery for deployment.
- See [reference alignment](docs/REFERENCE_ALIGNMENT.md), [architecture](docs/ARCHITECTURE.md) and [backend requirements](docs/BACKEND_REQUIREMENTS.md).

## Deployment follow-up — 2026-09-25

The backend was republished using the saved IISProfile. A follow-up change redirects the API root to /swagger/index.html and removes duplicate Swagger middleware registration. Release publish succeeded.

HTTPS health/live, health/ready, public categories/content/events and Swagger returned 200. CORS for localhost:5173 returned 204 with the correct origin; deployed admin login returned 200. Subsequent protected endpoint checks encountered intermittent network/TLS/DNS failures, so full live protected-flow verification remains incomplete.

Gmail SMTP authentication was tested without sending email and rejected the supplied credential with 535 / 5.7.8 (Username and Password not accepted). A valid Google App Password or another working SMTP provider is required.

No React server was listening on localhost:5173 on this machine, and the React source folder has not been provided. Restarting/configuring the separate frontend remains pending that path. No real catalog content has been provided and no demo data was added.
- Final post-deployment check: HTTPS / returned 302 to /swagger/index.html; /health/ready returned 200 ready.
- Final local check: updated Vite server returned 200 on localhost:5173; its /health/ready proxy returned 200 ready. Local frontend remains running.
