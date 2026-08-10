# Web homepage

## Purpose

The Ordito homepage in `apps/web` is a product marketing surface for developers and technical users evaluating the desktop app. Its information hierarchy takes inspiration from Paseo's long-scroll product storytelling: a compact header, direct hero, dominant product visual, trust/capability pause, sequential feature demonstrations, workflow summary, FAQ, closing call to action, and footer.

The page adapts that structure to Ordito. It does not copy Paseo's brand, copy, testimonials, product artwork, or unsupported capabilities.

## Section map

1. Header with in-page navigation, GitHub, and download action.
2. Hero with positioning, availability badges, and a real screenshot of the full-window Commands view (Ordito is a full-window app, not a small tray panel).
3. Capability band for tray execution, local execution, scheduling, and history.
4. Sequential feature sections covering tray access, groups/search, schedules, history, and the terminal-reduction value proposition.
5. Verified keyboard workflow: Command/Control K, arrow selection, and Enter to run.
6. FAQ covering execution location, terminal requirements, scheduling, retained history, and platforms.
7. Download/source CTA and project footer.

## Component architecture

- `src/app/page.tsx` remains a small server-rendered route entry.
- `src/components/landing-page.tsx` composes the complete page.
- `src/components/site-header.tsx` is the client boundary for the mobile Sheet.
- `src/components/feature-section.tsx` owns repeated narrative/visual section structure.
- `src/components/app-screenshot.tsx` renders a real screenshot from `public/screenshots/` (`commands.png`, `schedule.png`, `history.png`) framed with a rounded border/shadow, for a given `view` (see below).
- `src/components/section-heading.tsx` is the single source of the shared `<h2>`/description typography used by every homepage section.
- `src/components/faq-section.tsx` composes FAQ data with the stock Accordion.
- `src/components/site-footer.tsx` renders verified product and repository links.
- `src/content/homepage.ts` is the source of homepage copy, links, and section data.

## Shadcn policy

Generated files under `src/components/ui/` must remain stock shadcn output. Do not hand-edit their implementation, variants, or internal classes for homepage work.

Required primitives:

- Button
- Card
- Accordion
- Separator
- Sheet
- Badge

Optional future primitives, if the corresponding interaction is implemented:

- Aspect Ratio for screenshots
- Carousel for a real screenshot or testimonial gallery
- Tabs for interactive demonstrations
- Tooltip for icon-only controls
- Dropdown Menu for download or theme choices

Homepage-specific layout is composed outside `src/components/ui/`. Tailwind classes on composition components may control widths, spacing, typography hierarchy, grids, and responsive behavior without changing the primitives themselves.

## Content constraints

Claims must be supported by `PRODUCT.md`, the root `README.md`, or the desktop implementation. Current verified claims include:

- macOS and Windows availability
- local command execution
- panel and system-tray execution
- named command groups and search
- Command/Control K search focus
- arrow-key selection and Enter execution
- recurring cron and one-time schedules
- output, duration, status, and exit-code history
- MIT licensing

Do not add customer quotes, usage numbers, download counts, mobile support, hosted execution, cloud synchronization, or CLI capabilities without a verified product source.

## Product visual contract

Every homepage product visual (the hero and the feature sections) renders through `AppScreenshot`, which takes a `view` (`"commands" | "schedules" | "history"`) and maps it to a real screenshot file in `public/screenshots/`. To update the artwork, replace the PNG at that path (native resolution 3420x2224) — no code changes needed unless the view names change.

## Typography scale

All section headings route through `SectionHeading` (`text-3xl font-medium` heading, `text-base` muted description, `max-w-lg`) and the hero uses `text-3xl font-medium tracking-tight md:text-5xl`. This mirrors the reference site's flat, restrained type scale — do not reintroduce per-section responsive heading size jumps (e.g. `md:text-4xl`) without updating `SectionHeading` itself so the scale stays consistent site-wide.

## Deferred design decisions

This implementation intentionally preserves the installed shadcn appearance and existing web tokens. Final branding, theme behavior, and real screenshot artwork are separate work. Any later styling must continue to leave generated shadcn files untouched.
