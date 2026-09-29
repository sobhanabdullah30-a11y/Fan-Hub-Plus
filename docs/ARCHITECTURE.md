# Reference-aligned four-layer structure

This project follows the supplied `E-Project.zip` layout and constructor-injection style. It retains Fan Hub's own requirements, entity relationships and HTTP routes.

```text
FanHub.Domain/
  Entities/
  Enums/
  DatabaseConfiq/
    ApplicationDbContext.cs
    Configurations/
    EntityConstraints.cs
    CategorySeedData.cs
  Migrations/

FanHub.Application/
  DTOs/
    User/ Content/ Category/ Event/ Bookmark/ Rating/ Feedback/ Faq/ Chat/
  Interface/
    RepositoryInterface/
    ServiceInterface/
  MappingProfile/
    UserProfile/ ContentProfile/ CategoryProfile/ FeedbackProfile/
    FaqProfile/ RatingProfile/ ChatProfile/
  Configuration/
    JwtSettings.cs
  Common/

FanHub.Infrastructure/
  Repository/
    AccountRepository.cs
    CategoryRepository.cs
    ContentRepository.cs
    EventRepository.cs
    DashboardRepository.cs
    BookmarkRepository.cs
    RatingRepository.cs
    FeedbackRepository.cs
    AnalyticsRepository.cs
    FaqRepository.cs
    ChatRepository.cs
    EfRepository.cs
  Service/
    AccountService.cs
    CategoryService.cs
    ContentService.cs
    EventService.cs
    DashboardService.cs
    BookmarkService.cs
    RatingService.cs
    FeedbackService.cs
    AnalyticsService.cs
    FaqService.cs
    ChatService.cs
    JwtService.cs
    PasswordService.cs
    TokenService.cs
    AccountMailer.cs
  DependencyInjection.cs

Fan-Hub/
  Controllers/
  Configuration/
    JwtConfiguration.cs
    CorsConfiguration.cs
  Middleware/
  Program.cs
  appsettings.json
  appsettings.Development.json
```

`FanHub.Tests` is the verification project, not a runtime layer.

## Layer responsibilities

Domain contains entities and EF Core database configuration, including named DbSets and migrations, matching the reference. This layout intentionally makes Domain dependent on EF Core; it is the supplied project's four-layer convention rather than a framework-independent domain model.

Application contains request/response DTO classes, per-feature repository/service contracts and actual AutoMapper `Profile` classes. Creation/update DTOs follow `ForCreation` / `ForUpdation` naming where applicable. Read responses use `UserDto` and `ContentDto`. Existing request JSON field names remain compatible.

Infrastructure contains a repository and forwarding service for each feature. Feature repositories perform the use case's querying, ownership/validation checks and mapping. `EfRepository` centralizes EF query execution, saving and persistence-conflict translation. Services depend on repository interfaces through explicit constructors with private readonly fields, matching the reference's service-to-repository flow.

Fan-Hub contains feature controllers, middleware and startup/configuration files. `Program.cs` explicitly registers the DbContext, repositories, services and AutoMapper profiles. Controllers inject service interfaces. Existing `/api/admin`, `/api/me`, `/api/content` and other URLs are preserved while their actions are split into focused controller files.

## Authentication and CORS

`JwtService` signs JWTs with HS256 and includes subject, name, email, role and a unique token ID. ASP.NET Core JwtBearer validates signing key, issuer, audience and expiry. A database-backed session check also runs after validation so logout, password resets and account access changes immediately revoke access.

JWT settings use `Jwt:Key`, `Jwt:Issuer`, `Jwt:Audience` and `Jwt:ExpiryInMinutes`. Production requires a key of at least 32 UTF-8 bytes. Development can use a generated in-memory key when no key is supplied; those tokens become invalid after a restart. Configure a stable key with user secrets to preserve development sessions across restarts. Recovery/email tokens continue using cryptographically random, single-use values.

CORS uses ASP.NET Core's built-in CORS services and the named `Frontend` policy. `Cors:Origins` is the allowlist. No additional CORS NuGet package is needed.

## Mapping and persistence

AutoMapper 16.2.0 matches the reference package. Profiles are registered from the Application assembly, and their configuration is validated by the test runner. `AutoMapper:LicenseKey` can be supplied through user secrets/environment configuration for your own AutoMapper license; no license key is committed.

The context preserves the existing singular table names. The initial migration describes the same Fan Hub schema; moving files does not rename tables or apply database changes automatically. The design-time factory lives in `Fan-Hub/Configuration/ApplicationDbContextFactory.cs` so EF tools read the startup project's configuration, including appsettings, environment-specific settings, development user secrets, environment variables and forwarded command-line arguments. It has no hardcoded database fallback and does not start the web server. Use `--project FanHub.Domain --startup-project Fan-Hub` with EF commands; forward `-- --environment Development` when development configuration is required.

The API retains password hashing, role/ownership checks, pagination, request validation, rate limits and centralized problem responses. These remain part of Fan Hub's behavior while adopting the reference layout.
