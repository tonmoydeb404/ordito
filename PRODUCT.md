# Product

## Register

product

## Platform

web

## Users

Power users — technical generalists who automate repetitive shell workflows, scripts, and system tasks throughout their day. Their context: at their machine, jumping between projects, running the same build, deploy, and diagnostic commands over and over, tired of switching to a terminal and retyping or recalling syntax. They value speed and muscle memory; they don't need to be told what a command does. They want it one click away and then out of their way.

The desktop app lives in the system tray as a compact, always-on-top panel (420×640px default, resizable down to 360×560). Users interact in two modes: the full panel for managing commands and reviewing history, and the native tray menu for one-click execution without opening the panel at all.

A web marketing site (`apps/web`) addresses a broader audience evaluating Ordito before downloading — developers and technical users who haven't tried it yet and need to understand what it does in seconds.

## Product Purpose

Ordito organizes frequently used shell commands into named groups and runs them with a single click — from the panel or directly from the system tray menu — with no terminal window, no command recall, no friction. It schedules recurring (cron) and one-time runs, tracks every execution with full output history and exit codes, and lives in the tray until you need it. The panel surfaces three views: Commands (grouped, searchable, keyboard-navigable), Schedule (active/paused recurrences with next-run timing), and History (filterable by status, grouped by time, expandable output previews). Success is a user who never opens a terminal for a command they've already saved.

## Positioning

Your commands, one tray-click away — no terminal, no memory, no friction.

## Brand Personality

A polished precision tool. Ordito is minimal, exact, and free of decoration — a pro instrument that respects the user's attention and screen space. It earns trust through clean execution: refined spacing, calm hierarchy, modern type, and a single confident accent. It lives in the tray and only speaks when it has something to say. The interface should feel engineered and considered, never styled for its own sake — quiet confidence over noise, expertise without rough edges.

## Anti-references

- **Neobrutalism.** Hard-black borders, zero-blur offset shadows, cream canvas, and candy-pop chart colors — a look both apps carried in an earlier iteration and have since abandoned. It reads as a stylistic affectation, not a serious tool; do not bring it back.
- **Generic AI-template SaaS.** Indigo-to-violet gradient washes, glassmorphism, identical icon-heading-text card grids, emoji-as-icons, and the uppercase-tracked eyebrow above every section. The saturated template look that signals "generated," not "designed."
- **Toy or novelty apps.** Candy colors, excessive rounding, playful illustration, bouncy motion. Ordito is a utility for experts; it should never feel like a game or a consumer trinket.

## Design Principles

- **Polished precision.** Clean execution over flourish. Refined spacing, calmer hierarchy, modern typography. The tool feels made, not decorated — expertise stays, rough edges go. Every element earns its place.
- **Calm by default.** Minimal and clean as a design virtue, not a compromise. One accent carries all interactive emphasis; status colors appear only where a command's state demands attention. Generous breathing room even at higher density, so the eye scans without friction.
- **Instant and trustworthy.** Speed and immediacy are the product — open tray, click command, back to work. The desktop panel follows the system (light and dark) so it always feels native and unobtrusive; the web marketing site defaults to dark to show the tray panel in its native theme, with light available.
- **Shared core, separate voices.** One brand identity — accent and status semantics — threads through both surfaces, but each gets the treatment and typeface it deserves: a focused, compact product panel in system-native type, and an airy, dark-first marketing page in Plus Jakarta Sans. Same blood, different register.

## Accessibility & Inclusion

WCAG 2.1 AA: body text contrast at 4.5:1 minimum, large text at 3:1, full keyboard navigation, and visible focus indicators throughout. Reduced-motion preferences respected on every animation. Both light and dark themes designed to pass contrast from the start — desktop follows the OS, web defaults dark with a light toggle.

## Surfaces

- **Desktop app** (`apps/desktop`): Primary surface — product register, web platform (Tauri 2 webview rendering a compact tray panel on macOS and Windows). Shares the unified brand core with the web app; system-driven light and dark, system-native type for an OS-native feel.
- **Web marketing site** (`apps/web`): Secondary surface — brand register, web platform (Next.js). Where design IS the product: landing page, download CTA, feature highlights. Dark-first with a light toggle, all-sans (Plus Jakarta Sans + IBM Plex Mono). Shares the brand core (accent, status semantics) with the desktop app, voiced for a broader evaluating audience.
