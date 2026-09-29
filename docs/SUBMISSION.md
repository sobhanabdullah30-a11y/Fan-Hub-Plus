# Source submission

This source package contains the React frontend, four-layer ASP.NET Core backend, migrations, tests, SQL schema, documentation and build scripts. Existing implementation acknowledgments and design references are retained.

Generated output, dependencies, local IDE metadata, saved hosting credentials, private .env files and runtime secrets are excluded. Install dependencies and build before running. The working project's private settings are not changed by packaging.

## Reviewer setup

1. Install .NET 8 SDK and Node.js/npm.
2. Run `npm ci --ignore-scripts` from frontend, then `npm run lint` and `npm test`.
3. Configure ConnectionStrings:DefaultConnection and a persistent Jwt:Key through backend user secrets or environment variables. SMTP requires a valid provider credential for verification/recovery emails; do not use production credentials for review.
4. Create an empty review database and apply the existing migrations with `dotnet ef database update --project FanHub.Domain --startup-project Fan-Hub`. Do not apply the separate initial SQL script to a database already initialized by migrations.
5. Run `./scripts/Build-Release.ps1` from the solution root to package frontend and backend. Start the API with `dotnet run --project Fan-Hub --launch-profile http`. For React development, set API_PROXY_TARGET in frontend/.env to the API address and run `npm run dev` in frontend.
6. Run backend checks with `dotnet run --project FanHub.Tests`. The separate live SQL integration suite is opt-in and requires its own test-database configuration.

A reviewer can create an initial administrator using BootstrapAdmin:Email and BootstrapAdmin:Password and the existing --bootstrap-admin command on an empty review database. There are no seeded admin credentials in this archive.

The deployment script requires the owner's local Visual Studio publishing profile and protected saved credential, which are intentionally not included in the submission package. It is not needed to build or assess the application locally.

To regenerate this package from the working project, run `./scripts/Create-Submission.ps1` using PowerShell 7. The output is artifacts/Fan-Hub-Submission.zip.
