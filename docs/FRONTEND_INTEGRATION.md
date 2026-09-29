> Historical integration record. For the current corrected release, see docs/SRS-FIX-STATUS.md in the repository root.

# React integration handoff

Verified on 2026-09-25. Frontend origin: http://localhost:5173.

## Source and admin

Backend source: C:/Users/ok/source/repos/Fan-Hub. API startup project: Fan-Hub.
Use a dedicated administrator account configured by the owner. Never place its password in the React source, environment bundle or this document.
The configured SQL database contains this account with Admin role, active status and verified email. Login, profile, admin users and protected content create/read/update/delete succeeded through a local backend connected to that database. Temporary content was removed and test sessions were logged out. This does not establish that the deployed site uses the same connection or has the latest binaries.

## Deployment checks

- http://tech360-fanhub.runasp.net/health/live returned healthy.
- HTTPS connection to that hostname was reset before an HTTP response. Enable the site's HTTPS certificate/binding in the hosting panel and retest before sending credentials or bearer tokens publicly. CORS cannot fix a TLS failure.
- Deployed POST preflight for http://localhost:5173 allowed authorization/content-type and returned 204.
- Public /api/content and /api/events returned empty paginated results; the configured database had no content. No demo content was retained, as requested. Add real content with the admin API.
- The deployment has not been updated during this task. Republish after applying the code/configuration changes.

## Email settings

Configure the SMTP host, port, sender and username through deployment settings. Keep Email:Password blank in source control and set Email__Password in the hosting environment. For Gmail, use an App Password rather than the normal account password.

Email:FrontendUrl is http://localhost:5173 and Email:AllowLoopbackFrontend is true for this explicitly requested local integration. For a hosted frontend set Email__FrontendUrl to its HTTPS origin, set Email__AllowLoopbackFrontend=false and add its exact origin to Cors:Origins. Loopback links open on the email recipient's computer, so these current links only work for a developer running React locally.

Production requires real SMTP delivery; development pickup is not enabled in production. Locally, appsettings.Development.json enables pickup to Fan-Hub/App_Data/mail. To test locally run:

```powershell
dotnet run --project Fan-Hub --launch-profile http
```

Set the React API base URL to http://localhost:5218 for that local run. Inspect the generated .eml file locally for its verification link. Do not expose the pickup directory through HTTP.

## Endpoint mapping

| Action | Endpoint | Notes |
| --- | --- | --- |
| Register | POST /api/auth/register | email, password, displayName; 202 still requires verification |
| Resend verification | POST /api/auth/resend-verification | email |
| Verify | POST /api/auth/verify-email | token from the verification link; success 204 |
| Login | POST /api/auth/login | email, password; response accessToken, expiresAt, user |
| Profile | GET /api/me | Authorization: Bearer accessToken |
| Categories | GET /api/categories | Returns an array; use an individual category id |
| Catalog | GET /api/content | items, total, pageNumber, pageSize |
| Events | GET /api/events | Paginated; event detail/calendar endpoints also available |
| Admin catalog | GET/POST /api/admin/content | Admin bearer token |
| Admin detail/update/delete | GET/PUT/DELETE /api/admin/content/{id} | Admin bearer token |
| Logout | POST /api/auth/logout | Revokes current token |

Verification page: read the token query parameter and POST { token } to /api/auth/verify-email, then navigate to login. Do not treat 202 registration as an authenticated session. A 403 on an unverified member is expected until verification completes.

Registration now retries verification delivery for an existing active, unverified account when the same password is submitted. It does not overwrite that account or auto-verify it. Alternatively call resend-verification after configuring SMTP.

Admin content DTO: categoryId, title, description, body, type (string enum), fandom, genre, tags (array), imageUrls (array), optional mediaUrl, releaseDate, featured and event fields. Event content requires startsAt and city; endsAt must not precede startsAt. Admin-created content is published immediately, so only submit genuine content intended for display.

The npm install/dev/test/build commands belong in the separate React project. This workspace contains the .NET backend; no React build was run here.

## Deployment follow-up — 2026-09-25

The backend was republished using the saved IISProfile. A follow-up change redirects the API root to /swagger/index.html and removes duplicate Swagger middleware registration. Release publish succeeded.

HTTPS health/live, health/ready, public categories/content/events and Swagger returned 200. CORS for localhost:5173 returned 204 with the correct origin; deployed admin login returned 200. Subsequent protected endpoint checks encountered intermittent network/TLS/DNS failures, so full live protected-flow verification remains incomplete.

Gmail SMTP authentication was tested without sending email and rejected the supplied credential with 535 / 5.7.8 (Username and Password not accepted). A valid Google App Password or another working SMTP provider is required.

No React server was listening on localhost:5173 on this machine, and the React source folder has not been provided. Restarting/configuring the separate frontend remains pending that path. No real catalog content has been provided and no demo data was added.
