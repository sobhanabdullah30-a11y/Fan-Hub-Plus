# Fan Hub Plus — Universe Edition design research

Ten premium website references reviewed on 24 September 2026. This is a curated design shortlist, not an objective worldwide ranking. Primary websites were researched for the redesign; Raycast, Lusion and Resend were also inspected visually in the browser. The takeaways below are our design interpretation and intended adaptation, not claims made by these companies.

| Reference | Design direction taken into the project |
| --- | --- |
| [Linear](https://linear.app/) and its [interface refresh discussion](https://linear.app/now/behind-the-latest-design-refresh) | Restrained navigation, consistent action placement, clear hierarchy and quieter supporting controls |
| [Stripe](https://stripe.com/) | Cohesive section storytelling and a strong connection between visual detail and the primary action |
| [Lusion](https://lusion.co/) | A central interactive visual, dimensional composition and movement that establishes a distinctive identity |
| [Active Theory](https://activetheory.net/) | Immersive creative-experience direction; adapted as a lightweight interactive universe rather than reproducing a site |
| [Immersive Garden](https://immersive-g.com/) | Narrative digital-experience direction and deliberate pacing between sections |
| [Vercel](https://vercel.com/) | Structured product presentation, measured grid rhythm and technical micro-labels |
| [Raycast](https://www.raycast.com/) | Clear central message, generous spacing, detailed product interaction and confident typography |
| [Resend](https://resend.com/) | Large expressive headings, atmospheric dark surfaces and visual restraint around calls to action |
| [Apple AirPods Pro](https://www.apple.com/airpods-pro/) | Focused feature presentation and deliberate visual sequencing |
| [Nothing](https://nothing.tech/) | Distinct brand details and consistent compact metadata treatment |

## Original implementation

The resulting Fan Hub Plus design uses its own typography system, original vector artwork for all eight fandoms, a CSS orbital portal, a small animated canvas starfield, floating scene cards, pointer-follow highlights, optional card tilt, scroll reveals, a continuous decorative category ribbon, and deliberate hover/focus states. No reference site's source, template, product copy or artwork has been copied.

The homepage is composed in `src/components/Premium.jsx`; original SVG scenes are in `src/components/UniverseArtwork.jsx`; visual tokens and responsive refinements are in `src/premium.css`. Existing catalog, member, admin, help, sitemap and event behavior remains connected to the same frontend state.

## Motion and performance

- The Effects control pauses decorative motion and the canvas animation. Its preference is saved in the browser.
- `prefers-reduced-motion` is respected. Content remains visible with reduced/disabled motion.
- Canvas work is capped near 30 fps, limited to 90 particles, and stops offscreen or when the document is hidden. Pixel density is capped at 1.5.
- Pointer effects are requestAnimationFrame-throttled and skip touch input.
- Category art is vector code bundled with the app, so those illustrations do not depend on third-party image requests.
- Chapter controls are manual; important text does not auto-rotate while being read.
- No scroll hijacking, custom replacement cursor, flashing sequences, forced intro loader or autoplay sound.

This design work does not change the backend and competition-deliverable boundaries recorded in REQUIREMENTS-AUDIT.md. A visual redesign cannot guarantee a competition result; final judging also depends on content, completeness, usability, performance, accessibility and presentation.
