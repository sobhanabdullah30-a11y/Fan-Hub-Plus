# SRS fixes and verification

Release date: 26 September 2026. Live target: https://tech360-fanhub.runasp.net/

Current catalog edition: 60 unique database records replace the old 24-item demo set. Eighteen published FAQs and eight category descriptions are also stored in SQL. See CATALOG-EDITION.md for content, media and source details. Earlier numeric search examples below describe the previous test dataset.

This status supersedes the implementation defects listed in artifacts/SRS-Audit.md. The audit remains a historical record.

| Finding | Result |
|---|---|
| A1 Video playback | Fixed. Direct MP4/WebM/OGV sources use a native player; supported YouTube/Vimeo URLs use provider embeds; other providers have a safe external link. Actual playback time advanced in browser verification. |
| A2 Email delivery | Application verification/reset flows tested with development pickup messages and the actual database. Production SMTP remains blocked: the current appsettings credential returned Gmail status 535 in a fresh authentication-only check. No verification bypass was introduced. |
| A3 Search mismatch | Fixed. Server search/filter results are authoritative; body-only matches remain visible. 24 matches render across two 12-item pages. |
| A4 Featured selection | Fixed. Homepage queries featured Article records and provides an empty state for a category without any. |
| A5 Share routing | Fixed. Canonical /content/{id} and legacy ?content= links open the detail dialog; frontend sharing uses the canonical path. |
| A6 Upcoming/latest | Fixed. Upcoming records have future release timestamps and are ordered nearest-first; regular latest sorting remains server creation order. |
| A7 Editor dates | Fixed. Removed the unused year input; release date is required only for releases; event timestamps are converted to local editor values and back to UTC. |
| A8 Full-library downloads | Fixed for catalog, events and admin/member workspaces. Server pagination replaces all-page fetching; homepage loads bounded featured/release/video subsets; private bookmark state is requested for visible content only. FAQ/category lists remain small reference lists. |
| Role visibility | Public navigation, Member Space and Administration are separated. Private routes display explicit sign-in/access messages, independently of API authorization. |
| Logout transition | Fixed. Session cleanup completes before homepage navigation, and open editor/detail dialogs close on sign-out. |
| Avatar display | Saved HTTPS avatar URLs are now rendered with initials as a fallback. Binary upload remains an optional feature. |
| Map presentation | Embedded event map added, with selectable locations, larger-map fallback and GPS radius filtering. |

## Verification evidence

- Release backend build: zero warnings and zero errors; 129 regression checks passed.
- Frontend ESLint and 13 contract/regression tests passed; production build passed.
- Live deployment completed using the saved IIS profile. Readiness returned ready. The scoped media query returned only Audio/Video; upcoming query returned two releases.
- Browser: visitor private navigation hidden, member admin route denied, server search pagination correct, featured articles correct and video playback functional.
- Database-backed Member checks: bookmark, private note, media rating, collection and profile update passed. Temporary rating/bookmark records were removed after verification.
- A temporary member submission was hidden publicly, approved through the admin API, then visible publicly. The temporary submission was deleted afterward.
- Development pickup verification and password reset were exercised for the dedicated evaluation Member. This does not establish production SMTP delivery.
- Live browser sign-out completed for Member and Admin after the transition fix. Repeated recording requests reached the API rate limit at the end; the UI displayed its retry message rather than remaining in a loading state.
- Admin tabs opened without browser runtime errors; content pages are bounded to 20 records. Backend tests cover ownership, member 403, anonymous 401 and token/session revocation.

## Submission material

ReadMe.docx provides installation, access rules and assumptions. ACCESS-AND-FLOWS.md contains role, process, data-flow and relationship diagrams. ACCEPTANCE-CHECKLIST.md lists reviewer and operational checks. Dedicated Member credentials are in artifacts/Evaluator-Credentials.txt and excluded from the public source archive.

The participant must review and author the final competition report and explain their decisions. A captioned application demonstration is supplied separately as artifacts/Fan-Hub-Demonstration.mp4. It shows visitor browsing, member access and administrator management. It is silent; it does not demonstrate every regression check or claim successful production inbox delivery.

## External or evaluation work remaining

1. Supply a Gmail App Password or another accepted SMTP credential, then verify actual inbox registration/recovery.
2. Review the final report and demonstration against the evaluator's submission format. ReadMe.docx is modern Word format; a literal legacy .doc requirement needs a real format conversion, not an extension rename.
3. Verify host backups/restore, uptime monitoring, broad browser/device support, load behavior and final media licensing before making those operational claims. Those are not established by the targeted release tests.

No database migration is required for this release; existing entities and schema were preserved.
