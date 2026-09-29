# Acceptance and operational checklist

Use a dedicated evaluation account and clearly labelled test records. Delete temporary content after a test; keep evaluator credentials outside the public source archive.

| Check | Expected outcome |
|---|---|
| Open root URL while signed out | Homepage, access explanation, category browsing and sitemap; no private member/admin sidebar |
| Visit a private member route while signed out | Sign-in explanation; no private data |
| Search a term found only in article body | Same result count as API; server pagination of 12 results |
| Open a direct `/content/{id}` link | Correct detail opens, including after reload |
| Play a direct MP4 | Native player advances time; error/fallback link on failure |
| View homepage featured section | Only published featured articles for selected category |
| View upcoming releases | Only future releases, nearest first |
| Register and verify | Unverified login rejected; single-use token activates account |
| Reset password | New password works; old sessions are revoked |
| Member bookmarks and notes | Persist for that member; another member cannot read them |
| Member media rating | One rating per member/media; update and remove work |
| Submit fan content | Hidden publicly until admin approval |
| Member visits Admin | UI explanation and API 403 |
| Admin content and user tabs | Bounded server pages; correct totals |
| Event city and nearby filters | Matching database events; 100 km radius for GPS search |
| Edit event without changing time | Stored instant unchanged across browser timezones |
| Theme and text size | Controls work and saved preferences restore |
| Keyboard navigation | Visible focus, modal Escape, focus containment and return |
| Small viewport | Readable controls, no horizontal page overflow |

## Production dependencies

- A working SMTP credential is still required. The configured Gmail login was rejected with status 535. Development email pickup verifies application behavior only.
- Configure uptime alerts outside the application. A readiness check is not an uptime guarantee.
- Confirm the hosting provider's database backup schedule and retention. Rehearse restoration to a separate database before claiming recovery is verified. Do not restore over the live database for a test.
- Use a separate staging/test database for load tests. Record environment, record counts, concurrency, duration, response percentiles and errors. This release does not claim an unperformed load test.
- Verify the final media sources and permissions. See CATALOG-EDITION.md for original illustrations, synthetic narration and official event/release sources.
- Confirm actual Safari/Firefox/mobile-device behavior before claiming full browser compatibility.

## Participant submission work

The SRS requires participants to understand their implementation and author the final report. Use the technical guide and diagrams as review material. Add your own problem definition, design decisions, explanation of the database, test evidence and assumptions. Include the actual tools used in acknowledgments. Review the recorded demonstration and supplement any flows it does not show, especially production inbox delivery once SMTP works.

ReadMe.docx uses modern Word format. If the evaluator strictly requires legacy ReadMe.doc, save it as that format using Word or LibreOffice after review; changing a file extension is not conversion.
