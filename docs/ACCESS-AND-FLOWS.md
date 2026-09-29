# Access and application flows

| Capability | Visitor | Registered member | Administrator |
|---|---|---|---|
| Home, categories, search and public content | Yes | Yes | Yes |
| Media, events, calendar, map and showcase | Yes | Yes | Yes |
| About, resources, help and sitemap | Yes | Yes | Yes |
| Personal dashboard and profile preferences | Sign in required | Own account | Own account |
| Bookmarks and private notes | Sign in required | Own records | Own records |
| Media ratings and feedback | Sign in required | Yes | Yes |
| Fan submissions | Sign in required | Pending review | Can publish directly |
| Content and category management | No | No | Yes |
| User access, moderation, feedback replies and analytics | No | No | Yes |
| FAQ management | No | No | Yes |

The sidebar separates public browsing, Member Space and Administration. Guests see sign-in and registration calls to action instead of private navigation. The homepage describes all three access levels. A direct visit to a private route shows a sign-in requirement; a member visiting the admin route sees an access-denied explanation. Backend authorization and ownership checks enforce these rules independently of the UI.

## Visitor and member flow

```mermaid
flowchart TD
  Home[Public homepage and sitemap] --> Browse[Choose category or search]
  Browse --> Detail[Read article or view media]
  Detail --> Save{Save or contribute?}
  Save -->|Visitor| Register[Register and verify email]
  Register --> Login[Sign in]
  Save -->|Member| Member[Member workspace]
  Login --> Member
  Member --> Bookmarks[Bookmarks and private notes]
  Member --> Preferences[Profile and preferences]
  Member --> Submit[Submit fan content]
  Submit --> Pending[Pending review]
  Pending --> Review{Administrator review}
  Review -->|Approve| Public[Published content]
  Review -->|Reject| Rejected[Rejected submission visible to author]
```

## Request and data flow

```mermaid
flowchart LR
  Browser[React pages and feature components] --> HTTP[HTTP client and DTO adapters]
  HTTP --> API[ASP.NET controllers]
  API --> Auth[JWT and ownership checks]
  Auth --> Service[Application service contracts]
  Service --> Implementation[Infrastructure services and repositories]
  Implementation --> Context[Domain DbContext and configurations]
  Context --> SQL[(SQL Server)]
  Implementation --> Mail[SMTP or development pickup]
  SQL --> Implementation
  Implementation --> API
  API --> HTTP
  HTTP --> Browser
```

Domain's EF configuration placement follows the supplied reference project's four-layer convention. It is not a framework-independent domain model.

## Database relationships

```mermaid
erDiagram
  User ||--o{ Session : authenticates
  User ||--o{ AccountToken : verifies_or_recovers
  User ||--o{ UserInterest : selects
  Category ||--o{ UserInterest : interests
  Category ||--o{ Content : groups
  User ||--o{ Content : authors
  User ||--o{ Bookmark : saves
  Content ||--o{ Bookmark : bookmarked
  User ||--o{ Rating : rates
  Content ||--o{ Rating : receives
  User ||--o{ Feedback : submits
  User ||--o{ Activity : performs
  User ||--o{ ChatMessage : converses
```

Content types share one aggregate so moderation, ratings and bookmarks use consistent foreign keys. Categories and user interests provide the many-to-many relationship. FAQ entries are managed independently; stored chat responses preserve conversation history.
