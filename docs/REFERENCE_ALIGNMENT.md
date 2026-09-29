# E-Project reference alignment

Reference inspected: `C:/Users/ok/Documents/E-Project/E-Project.zip`.

| Reference pattern | Fan Hub implementation |
| --- | --- |
| Domain/Entities | FanHub.Domain/Entities; one entity per file |
| Domain/DatabaseConfiq/ApplicationDbContext | Same folder/context name under FanHub.Domain, with the existing Fan Hub schema and constraints |
| Domain/Migrations | InitialCreate and ApplicationDbContextModelSnapshot |
| Application/DTOs/<feature> | Per-feature DTO classes; creation/update DTO naming |
| Application/Interface/RepositoryInterface | Dedicated interfaces for 11 feature repositories plus the common persistence contract |
| Application/Interface/ServiceInterface | Matching feature-service interfaces and security/email contracts |
| Application/MappingProfile/<feature>Profile | AutoMapper Profile classes for actual entity/DTO transformations |
| Infrastructure/Repository | Per-feature repositories; EfRepository centralizes persistence execution |
| Infrastructure/Service | Explicit readonly-field constructor injection and forwarding service methods |
| API/Controllers | Focused feature controllers; Fan Hub route names and authorization are preserved |
| JWT package and token generation | JwtBearer 8.0.23, JwtService, configured HS256 validation and session revocation |
| Program.cs registrations | Explicit DbContext, repository/service and AutoMapper registrations |
| appsettings.json | ConnectionStrings, Jwt, Cors, Email and AutoMapper configuration sections |
| CORS | Named Frontend policy using the framework's built-in CORS support; the inspected reference did not configure a CORS policy |

Fan Hub's additional requirements (moderation, email verification, password recovery, private bookmarks/activity, event discovery and calendar output) remain implemented. Packages are referenced only where used. Connection strings, JWT keys and credentials from the reference are not imported.

Initial database migrations are for an empty database. A database created earlier from `database/001-initial.sql` needs an intentional migration-history baseline before applying EF migrations; the API never automatically applies migrations on startup.

JWT generation/validation uses Microsoft.IdentityModel.JsonWebTokens 8.14.0, matching the IdentityModel version required by AutoMapper 16.2.0. This avoids mixing the older JWT parser with newer token primitives. ASP.NET Core JwtBearer remains 8.0.23.
