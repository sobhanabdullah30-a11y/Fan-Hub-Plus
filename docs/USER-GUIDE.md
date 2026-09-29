# Fan Hub Plus user guide

This guide covers the public, member and administrator experiences in Fan Hub Plus. The live application is available at [tech360-fanhub.runasp.net](https://tech360-fanhub.runasp.net/).

## Explore as a visitor

1. Open the home page and use the left navigation or the top navigation bar.
2. Select **Explore** to browse articles, characters, videos, audio, galleries, merchandise, releases and events.
3. Use search, fandom, genre, year and popularity filters to narrow the catalog.
4. Open any card for its full details, media, ratings and sharing options.
5. Visit **Events**, **Showcase** or **Resources** for focused discovery.

Visitors can read public content without creating an account. Actions such as bookmarks, ratings and submissions require a verified member account.

## Create and verify an account

1. Select **Sign in**, then choose the registration option.
2. Enter your name, email address and a strong password.
3. Open the verification email and follow its link.
4. Return to Fan Hub Plus and sign in.

If email delivery is unavailable in a development environment, the application writes messages to `Fan-Hub/App_Data/mail/`. Production environments must configure SMTP securely through environment variables or a secret store.

## Member workspace

After signing in, members can:

- save content to bookmarks and add private notes;
- rate catalog items and update or remove a rating;
- submit original fan content for moderation;
- review submission status and feedback;
- update profile, fandom and accessibility preferences;
- use the FAQ assistant and private conversation history.

Use the profile menu to sign out on a shared device. Session tokens expire automatically and are revoked after password or access changes.

## Administrator workspace

Administrator accounts have access to content moderation, category and FAQ management, user access controls, feedback handling and analytics. Administrative actions affect the public catalog and should be reviewed before confirmation.

There is no default administrator password. Follow the bootstrap procedure in the main [README](../README.md#setup), then remove the temporary bootstrap secrets.

## Accessibility and preferences

- Switch the visual theme and accent from the interface controls.
- Enable the larger-text preference when needed.
- Motion respects the operating system's reduced-motion preference and can also be disabled in the app.
- All primary workflows are keyboard accessible and include visible focus states.

## Troubleshooting

| Issue | What to try |
| --- | --- |
| Content does not load | Check your connection, then refresh. The API health endpoint is `/health/live`. |
| Sign-in fails | Confirm the email is verified and the credentials are correct. |
| Session expired | Sign in again; expired sessions are intentionally cleared. |
| Verification email is missing | Check spam, then use **Resend verification**. |
| A member action is unavailable | Confirm you are signed in and your account is enabled. |
| An admin page is unavailable | Confirm the account has the `Admin` role. |

For deployment and operator issues, see [DEPLOYMENT.md](DEPLOYMENT.md). For route-level behavior, see [ACCESS-AND-FLOWS.md](ACCESS-AND-FLOWS.md).
