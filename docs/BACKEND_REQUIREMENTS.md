# Backend requirements coverage

Source: Fan Hub Plus SRS v1.0, functional requirements in section 1.6. This is an implementation checklist, not the academic project report requested by the document.

All routes below start with `/api`. Public resources expose published content only. Personalized resources derive ownership from the authenticated session. Admin routes require the Admin role.

| Requirement | Backend implementation / routes | Status |
| --- | --- | --- |
| Registration, secure sessions, email verification, password recovery | `auth/register`, `auth/login`, `auth/verify-email`, `auth/resend-verification`, `auth/forgot-password`, `auth/reset-password`, `auth/change-password`, `auth/logout` | Implemented; SMTP delivery requires deployment configuration |
| Editable profile, favorite fandoms, category interests, display preferences | `GET/PUT me`; theme, font size, fandoms and category IDs | Implemented |
| Personalized greeting, recent activity, favorites, bookmarks | `GET me/dashboard`, `GET me/activity`, `GET me/bookmarks` | Implemented; activity is private and paginated |
| Eight fandom categories | `GET categories`, category seed data, admin category CRUD | Implemented |
| Database-driven articles, profiles, and media | `GET content`, `GET content/{id}`, type-specific `explore/*` routes | Implemented |
| Combined search, category, genre, release year, popularity and type filtering | `GET content` with `ContentFilter`; `GET content/filters` for selectable values | Implemented; search includes title, description, body, fandom and genre |
| Latest, popular and alphabetical sorting | `sort=latest`, `sort=popular`, `sort=alphabetical` | Implemented |
| Video, trailer, audio and animated media playback data | Video/Audio/Image content with HTTPS media URLs and gallery URLs | Implemented backend; playback belongs to frontend |
| Admin-controlled media tags and categories | `POST/PUT admin/content`; tags, category, fandom, genre, featured flag | Implemented |
| Media feedback and five-star ratings | `GET content/{id}/ratings`, `PUT/DELETE content/{id}/rating` | Implemented; one rating per member per media item |
| Character biographies and fandom/category filtering | `GET explore/characters`, `GET content/{id}` | Implemented using Character content and Body |
| Featured rich-text articles and embedded images | `GET explore/articles?featured=true`, content Body and ImageUrls | Implemented; frontend must sanitize rendered rich text |
| Event highlights and storytelling content | `GET content?type=Event` (including historical highlights); Body and ImageUrls | Implemented; timeline layout belongs to frontend |
| Fan submissions requiring approval | `GET/POST me/submissions`, `GET/PUT/DELETE me/submissions/{id}`, `PUT admin/content/{id}/moderation` | Implemented; member edits require reapproval |
| Merchandise galleries grouped by fandom/category | `GET explore/merchandise` with filters | Implemented; display only |
| Upcoming releases and merchandise drops | `GET explore/upcoming`; future ReleaseDate on any content type | Implemented |
| Limited Edition, Pre-Order and Collectible tags | Content Tags and `tag` filter | Implemented |
| Optional view tracking and popularity | `POST content/{id}/views`, `sort=popular`, `GET admin/analytics` | Implemented; counts views, not unique visitors |
| Bug, suggestion and query feedback | `GET/POST me/feedback` | Implemented |
| Bookmark articles, characters, video and merchandise | `GET me/bookmarks`, `PUT/DELETE me/bookmarks/{contentId}` | Implemented for every published content type |
| Notes and sharing | Bookmark Note; `GET content/{id}/share` | Implemented |
| Nearby events, city filters, schedules, ticket links | `GET events`, `GET events/{id}`; coordinates, radius, date range and city | Implemented; map and GPS permission belong to frontend |
| Calendar integration | `GET events/{id}/calendar` | Implemented as UTC iCalendar export |
| Admin category/content/media/profile/article CRUD | `admin/categories`, `admin/content` and their ID routes | Implemented |
| Admin feedback add/edit/remove and fan-content management | `GET/POST admin/feedback`, `GET/PUT/DELETE admin/feedback/{id}`, content moderation | Implemented; admin-created feedback belongs to that admin |
| User administration | `GET admin/users`, `GET admin/users/{id}`, `PUT admin/users/{id}/access` | Implemented; no credential hashes in responses |
| Active users, popular categories, chatbot volume | `GET admin/analytics` | Implemented |
| Optional FAQ knowledge base | `GET assistant/faqs`; admin FAQ CRUD | Implemented |
| Optional AI chatbot, contextual recommendations, guided conversation | Authenticated FAQ matching and private chat history through `assistant/messages` and `assistant/conversations/{id}` | Limited FAQ assistant only; no AI or multi-step contextual assistant claimed |
| Optional avatar binary upload | Profile AvatarUrl accepts an HTTPS image URL | Binary upload not implemented; optional in SRS |
| Dark mode/font sizing | Saved profile preferences | Backend implemented; frontend rendering required |
| Breadcrumbs, transitions, spinners, responsive cards, accessibility | Frontend work | Outside this backend task |

## Non-functional boundaries

- Implemented: password hashing, hashed expiring session/recovery tokens, role authorization, owner isolation, request validation, HTTPS URL validation, CORS configuration, rate limits, database constraints, concurrency checks, pagination, error responses and health routes.
- Database persistence: EF Core SQL Server adapter and initial SQL script are present. `FANHUB_TEST_SQL` enables isolated real-database regression checks; the runner creates and deletes only a fresh generated test database.
- Deployment verification still required: real SMTP delivery, production database connectivity and backups, performance/load testing, uptime monitoring, TLS/reverse-proxy setup, and browser/device accessibility verification with a frontend.
- Merchandise purchase, checkout, orders and payments are explicitly outside the SRS scope.

## Maintained structure

See [architecture](ARCHITECTURE.md) and [reference alignment](REFERENCE_ALIGNMENT.md). Domain now contains the EF DbContext, configurations, migrations and entities as in the supplied ZIP. Application contains DTOs, AutoMapper profiles and feature interfaces. Infrastructure contains feature repositories and forwarding services. Fan-Hub contains controllers and JWT/CORS/startup configuration. Existing HTTP routes and required backend features are preserved.
