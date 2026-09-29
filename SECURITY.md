# Security policy

## Reporting a vulnerability

Please do not open a public issue for a suspected vulnerability or exposed credential. Use the repository's **Security → Report a vulnerability** option so the maintainer can investigate privately.

Include the affected route or component, reproduction steps, impact and any suggested mitigation. Do not access data that does not belong to you, disrupt the live service or publish exploit details before a fix is available.

## Supported version

Security fixes target the latest revision on the `main` branch.

## Secret handling

The repository intentionally contains no production secrets. Configure database connections, JWT keys, SMTP credentials, AutoMapper licensing and Gemini credentials through environment variables, .NET user secrets or the deployment platform's secret store. Rotate a credential immediately if it is accidentally committed or shared.
