# Deployment

Frontend source: frontend/. Backend startup project: Fan-Hub/.

## Build and publish

Run from the solution root on the configured Windows development machine:

```powershell
./scripts/Build-Release.ps1
./scripts/Deploy-Iis.ps1 -Preview
./scripts/Deploy-Iis.ps1
```

The build installs locked frontend dependencies, runs frontend tests, builds React, copies assets into Fan-Hub/wwwroot and publishes ASP.NET into artifacts/publish. Deploy-Iis uses the existing IISProfile and Windows-protected saved credential. It preserves unrelated remote files and places the application offline only while syncing. No database migration or seeding is performed.

Frontend and API are served from https://tech360-fanhub.runasp.net/. Swagger remains at /swagger/index.html. SPA email routes load index.html; /api routes never fall back to HTML. Connection strings, SMTP credentials and the JWT signing key stay on the backend and must never be copied into VITE_ variables.

Local frontend:

```powershell
cd frontend
npm run dev
```

The local origin is http://localhost:5173 and API_PROXY_TARGET selects the backend for the Vite development proxy. Leave VITE_API_BASE_URL blank for same-origin production. Use the integrated frontend directory rather than the old Downloads copy.

Email:FrontendUrl points to the live HTTPS site. SMTP delivery requires a valid provider credential configured in the deployment environment. Keep a stable Jwt:Key across deployments. See FRONTEND_INTEGRATION.md for integration details and remaining external prerequisites.
