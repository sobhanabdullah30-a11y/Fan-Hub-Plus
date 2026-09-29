# Contributing

Thank you for improving Fan Hub Plus.

## Local workflow

1. Create a focused branch from `main`.
2. Configure secrets locally; never commit connection strings, JWT keys, SMTP credentials or API keys.
3. Run the frontend checks from `FRONTEND/`:
   - `npm ci`
   - `npm run format:check`
   - `npm run lint`
   - `npm test`
   - `npm run build`
4. Run the backend checks from the repository root:
   - `dotnet build Fan-Hub.slnx`
   - `dotnet run --project FanHub.Tests`
5. Open a pull request with a clear summary, screenshots for UI changes and notes about configuration or schema changes.

## Standards

- Keep controllers thin and place business behavior in services.
- Preserve the API → Infrastructure → Application → Domain dependency direction.
- Add or update tests for behavior changes.
- Keep UI changes responsive, keyboard accessible and compatible with reduced motion.
- Use reviewed incremental migrations for existing databases.

By contributing, you agree that your work may be included in this project under its repository terms.
