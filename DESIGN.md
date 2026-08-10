---
name: Ordito
description: A polished precision tool — one tray-click command execution, dark-first and exact. Single deep-teal accent on a cool-neutral graphite chassis, unified across desktop and web.
colors:
  # Accent — Deep Teal (the single shared brand color, hue ~196)
  accent: "oklch(0.36 0.10 196)"
  accent-light: "oklch(0.39 0.11 196)"
  accent-hover: "oklch(0.40 0.10 196)"
  accent-active: "oklch(0.32 0.09 197)"
  accent-foreground: "oklch(1.000 0 0)"
  accent-soft: "oklch(0.36 0.10 196 / 0.16)"
  # Status — success (verdant)
  success: "oklch(0.58 0.14 152)"
  success-soft: "oklch(0.58 0.14 152 / 0.14)"
  # Status — danger (crimson, hue 22 — held apart from the 196° accent)
  danger: "oklch(0.56 0.19 22)"
  danger-soft: "oklch(0.56 0.19 22 / 0.14)"
  # Status — warning (amber)
  warning: "oklch(0.70 0.15 70)"
  warning-soft: "oklch(0.70 0.15 70 / 0.14)"
typography:
  # Desktop — system-native (adaptive per OS)
  sans:
    fontFamily: "-apple-system, BlinkMacSystemFont, \"SF Pro Text\", \"Segoe UI\", sans-serif"
  mono:
    fontFamily: "\"SF Mono\", SFMono-Regular, Consolas, monospace"
  # Web — marketing site (all-sans; serif dropped in the Paseo.sh pivot)
  web-sans:
    fontFamily: "\"Plus Jakarta Sans\", ui-sans-serif, system-ui, sans-serif"
  web-mono:
    fontFamily: "\"IBM Plex Mono\", ui-monospace, monospace"
rounded:
  sm: "6px"
  md: "8px"
  lg: "10px"
  xl: "12px"
  sheet: "14px"
  pill: "9999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "10px"
  lg: "12px"
  xl: "16px"
  "2xl": "20px"
components:
  button-primary:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.accent-foreground}"
    rounded: "{rounded.md}"
    height: "30px"
    transition: "background-color 120ms"
  button-soft:
    backgroundColor: "{colors.control}"
    textColor: "{colors.ink}"
    borderColor: "{colors.border}"
    rounded: "{rounded.md}"
    height: "30px"
  button-icon:
    backgroundColor: "{colors.control}"
    textColor: "{colors.muted}"
    borderColor: "{colors.border}"
    rounded: "{rounded.md}"
    size: "30px"
  input-field:
    backgroundColor: "{colors.field}"
    textColor: "{colors.ink}"
    borderColor: "{colors.border}"
    rounded: "{rounded.lg}"
---

# Design System: Ordito

## 1. Overview

**Creative North Star: "The Polished Instrument"**

Ordito is a precision tool for running shell commands — calm, exact, and free of decoration. It earns trust through clean execution, not flourish: refined spacing, a quiet graphite chassis, modern type, and a single confident accent. It lives in the system tray and only speaks when it has something to say. The interface should feel considered and engineered — expertise without rough edges, quiet confidence over noise.

This system is a deliberate **pivot from the earlier Terracotta Coral direction** toward a dark-first, terminal-native aesthetic inspired by tools like Paseo.sh — without becoming a clone. The warm coral brand color is retired. In its place: one **Deep Teal** accent on a **cool-neutral graphite chassis**. Depth comes from tonal recession, never from cast shadows at rest. Status colors appear only where a command's state demands attention.

**Why teal, not the category-default blue:** a dark, cool-neutral, terminal aesthetic is now the saturated reflex for developer-tool marketing (Paseo.sh, Codex, Cursor). Blue would make Ordito invisible among them; indigo-violet is an explicit anti-reference. Teal — same cool family, one step sideways — stays terminal-credible while giving Ordito a recognizable, ownable color. The accent is tuned **deep** so white-on-accent fills pass WCAG-AA in both themes; it reads as a serious instrument, not a glowing consumer toy.

**Color strategy: Restrained.** The accent occupies ≤10% of any screen. Everything else is neutral surface and ink. Its rarity is what makes it authoritative.

**One unified core, two voices:**

| Surface | Register | Default theme | Type | Role |
|---|---|---|---|---|
| Desktop app (`apps/desktop`) | Product | System-driven (follows OS) | System-native (SF Pro / Segoe UI) | The compact tray panel — focused, dense, OS-native |
| Web marketing site (`apps/web`) | Brand | **Dark-first** (light via toggle) | Plus Jakarta Sans + IBM Plex Mono | Airy, trustworthy — where design IS the product |

A shared brand core threads through both: the Deep Teal accent, the cool-neutral chassis logic, the status semantics, and the calm-precision ethos. The palette tokens are identical across both apps; only the default theme and type stack differ.

**Key characteristics:**
- **Dark-first on web**, **system-driven on desktop**; both light and dark themes designed to pass contrast from the start.
- **Cool-neutral surfaces** — near-white in light, near-black in dark, with a whisper of blue (hue 240, chroma ≤ 0.006) for cohesion. No warm paper, no cream.
- **One accent (Deep Teal)** on ≤10% of any screen.
- **Compact 30px controls** with generous internal rhythm; calm despite density.
- **Flat at rest** — depth through tonal recession, never shadows (except the single sheet lift).
- **120ms control transitions** (140ms sheets, 160ms switches); reduced-motion fully respected.

## 2. Color: The Cool-Graphite Palette

Tokens are defined twice — `:root` (light) and `.dark` (dark) — so the same semantic name resolves per theme. This is the **same token vocabulary** the components reference (`bg-panel`, `text-ink`, `border-separator`, `text-muted`, …); the values below are implemented in both `apps/web/app/globals.css` and `apps/desktop/src/index.css`.

### The shared accent — Deep Teal (hue ~196)

Tuned deep so **white-on-accent fills pass 4.5:1** in both themes. The same token serves fills (buttons, badges, highlights) and markers (dots, selection bars, focus rings) — one color, calm rather than glowing. Verified contrast in §2.4.

| Token | Light | Dark | Role |
|---|---|---|---|
| `--accent` | `oklch(0.39 0.11 196)` | `oklch(0.36 0.10 196)` | **Deep Teal.** The sole interactive accent. Primary buttons, selection marker, running status, focus rings, active filters, highlighted menu items. |
| `--accent-hover` | `oklch(0.36 0.11 197)` | `oklch(0.40 0.10 196)` | Hover. |
| `--accent-active` | `oklch(0.33 0.10 198)` | `oklch(0.32 0.09 197)` | Pressed. |
| `--accent-foreground` | `oklch(1.000 0 0)` | `oklch(1.000 0 0)` | White text on teal fills. Deep teal is dark enough that white passes AA. |
| `--accent-soft` | `oklch(0.5 0.12 196 / 0.12)` | `oklch(0.36 0.10 196 / 0.16)` | Teal wash. Active filter pills, soft selection fills, running-status badges. |
| `--accent-soft-text` | `oklch(0.36 0.10 196)` | `oklch(0.82 0.10 195)` | Teal text against `--accent-soft`. Defined per theme for legibility. |

### Status colors (shared; soft-text defined per theme)

Status colors are **meaning, not decoration.** Each pairs a solid (dots, icons) with a soft wash (badges, pills). The accent (teal, hue 196) and danger (crimson, hue 22) sit far apart on the hue wheel; running vs failed is reinforced by animation and icon, never color alone.

| Token | Value | Role |
|---|---|---|
| `--success` | `oklch(0.58 0.14 152)` | Verdant. Completed runs, success states. |
| `--danger` | `oklch(0.56 0.19 22)` | Crimson. Failed runs, destructive actions, errors. |
| `--warning` | `oklch(0.70 0.15 70)` | Amber. Cautions in destructive confirmations. |
| `--success-soft` / `--danger-soft` / `--warning-soft` | `… / 0.14` alpha | Soft wash for badges/icons. |
| `--success-soft-text` / `--danger-soft-text` / `--warning-soft-text` | per-theme tint | Text on soft washes. |

### Light theme (`:root`)

Near-white canvas with a whisper of cool (hue 240, chroma ≤ 0.005) for cohesion — never enough to read as a tint.

| Token | Value | Role |
|---|---|---|
| `--panel` | `oklch(0.985 0.003 240)` | Main canvas. |
| `--surface` | `oklch(0.972 0.003 240)` | Cards, sheets — one shade off canvas. |
| `--inset` | `oklch(0.958 0.004 240)` | Recessed: section labels, bottom bar. |
| `--field` | `oklch(0.965 0.004 240)` | Inputs, search. |
| `--row` | `oklch(0.99 0.002 240)` | Default list-row bg. |
| `--row-hover` | `oklch(0.965 0.004 240)` | Hovered row. |
| `--row-selected` | `oklch(0.965 0.022 196)` | Selected row — teal-tinted wash + teal marker. |
| `--control` | `oklch(0.972 0.003 240)` | Icon / soft button at rest. |
| `--control-hover` | `oklch(0.952 0.005 240)` | Same on hover. |
| `--separator` | `oklch(0.91 0.004 240)` | Hairline row dividers. |
| `--border` | `oklch(0.90 0.005 240)` | Default borders on containers, inputs, buttons. |
| `--border-strong` | `oklch(0.82 0.006 240)` | Heavier border on hovered bordered controls. |
| `--ink` | `oklch(0.22 0.014 240)` | Primary text. ~6.7:1 on canvas. |
| `--muted-foreground` | `oklch(0.29 0.014 240)` | Secondary text. ~4.7:1. **Also the placeholder color.** |
| `--faint` | `oklch(0.40 0.012 240)` | Tertiary — timestamps, kbd hints. Decorative only; never must-read content. |
| `--ring` | `oklch(0.45 0.12 196)` | Teal focus color. |
| `--focus-ring` | `0 0 0 3px oklch(0.45 0.12 196 / 0.4)` | Teal focus halo (box-shadow, not a border change). |

### Dark theme (`.dark`) — the web default

Near-black graphite chassis with the same whisper of cool. Tonal recession cuts fields below the panel; raised surfaces step one shade above.

| Token | Value | Role |
|---|---|---|
| `--panel` | `oklch(0.145 0.006 240)` | Main canvas — near-black. |
| `--surface` | `oklch(0.175 0.006 240)` | Cards, sheets. |
| `--inset` | `oklch(0.122 0.005 240)` | Recessed (cut below panel). |
| `--field` | `oklch(0.128 0.005 240)` | Inputs — recessed wells. |
| `--row` | `oklch(0.165 0.006 240)` | Default row. |
| `--row-hover` | `oklch(0.185 0.006 240)` | Hovered row. |
| `--row-selected` | `oklch(0.20 0.018 196)` | Selected row — teal-tinted + teal marker. |
| `--control` | `oklch(0.185 0.006 240)` | Resting controls. |
| `--control-hover` | `oklch(0.215 0.007 240)` | Hovered controls. |
| `--separator` | `oklch(0.235 0.006 240)` | Hairline dividers. |
| `--border` | `oklch(0.28 0.008 240)` | Default borders. |
| `--border-strong` | `oklch(0.34 0.008 240)` | Strong borders. |
| `--ink` | `oklch(0.965 0.004 240)` | Primary text — near-white. ~11.2:1 on canvas. |
| `--muted-foreground` | `oklch(0.70 0.012 240)` | Secondary text. ~7.5:1. **Also the placeholder color.** |
| `--faint` | `oklch(0.52 0.010 240)` | Tertiary — decorative. |
| `--ring` | `oklch(0.40 0.10 196)` | Teal focus color. |
| `--focus-ring` | `0 0 0 3px oklch(0.40 0.10 196 / 0.45)` | Teal focus halo. |

### 2.4 Verified contrast (WCAG 2.1 AA)

All pairs below computed from the OKLCH values via a contrast script (OKLCH → linear sRGB → relative luminance). Hairline separators and `--faint` are decorative non-text (3:1 threshold).

| Pair (dark) | Ratio | Pair (light) | Ratio |
|---|---|---|---|
| ink / panel | 11.21:1 ✓ | ink / panel | 6.70:1 ✓ |
| muted / panel | 7.49:1 ✓ | muted / panel | 4.69:1 ✓ |
| faint / panel (non-text) | 5.15:1 ✓ | faint / panel (non-text) | 3.11:1 ✓ |
| accent(link) / panel | 8.24:1 ✓ | accent(link) / panel | 4.71:1 ✓ |
| white / accent fill (button) | 4.64:1 ✓ | white / accent fill (button) | 4.95:1 ✓ |
| accent-soft-text / panel | 9.03:1 ✓ | accent-soft-text / panel | 4.86:1 ✓ |

### Named rules

**The One-Accent Rule.** Deep Teal is the only interactive accent. It appears on ≤10% of any screen — primary buttons, the selected-row marker, focus rings, running status, active filters, highlighted items. Everything else is neutral surface and ink. Its rarity is the point.

**The Soft-Pair Rule.** Every status color pairs a soft wash (alpha ~0.14) with a per-theme soft-text tint. Badges, icons, and active pills always use the pair together. Never use a full-saturation status color for text against a soft wash.

**The Pure-Graphite Rule.** Backgrounds are near-white (light) or near-black (dark), tinted cool at chroma ≤ 0.006. No cream, no warm-paper neutrals. Coolness lives in the chassis; the teal carries the only warmth of hue.

## 3. Typography

### Desktop — system-native

One family in multiple weights; **weight, not size, carries hierarchy.** The system stack makes the panel feel OS-native — SF Pro Text on macOS, Segoe UI on Windows — not a web page dropped into a tray.

| Role | Weight | Size | LH | Usage |
|---|---|---|---|---|
| Title | 760 | 0.95rem | 1.35 | Header brand, sheet headings. |
| Body | 720 | 0.88rem | 1.35 | Command names, row primary text. |
| Label | 720 | 0.76rem | 1.35 | Buttons, tabs, field labels. |
| Mono | 400 | 0.71rem | 1.35 | **Command strings only** — the mono-means-executable rule. System mono: SF Mono / Consolas. |
| Meta | 760 | 0.68rem | 1.35 | Section labels, group counts. |
| Micro | 400 | 0.66rem | 1.35 | Timestamps, status badges, kbd hints. |

### Web — marketing site (all-sans)

A two-family system (wired in `apps/web/app/layout.tsx`); the Lora serif was **dropped** in the Paseo.sh pivot — a single clean sans is more terminal-native and credible for a shell tool:

- **Plus Jakarta Sans** (`--font-sans`) — primary body, UI, **and display headings**. Modern geometric-humanist, distinct from the Inter default.
- **IBM Plex Mono** (`--font-mono`) — command previews and code in marketing copy. Signals "executable text," consistent with the desktop mono-means-executable rule.

Display headings ride Plus Jakarta Sans across a clamp scale (max ≤ 6rem), letter-spacing ≥ -0.04em (floor — never tighter). `text-wrap: balance` on h1–h3.

### Named rules

**Mono-Means-Executable.** Mono is reserved for text the machine interprets — commands, paths, exit codes, output. Never for UI labels or navigation. Seeing mono always means "you could type this in a terminal."

**Weight-Not-Size (desktop).** Desktop hierarchy rides weight (400 → 720 → 760) across a tight size range (0.66–0.95rem). No large display jumps; the panel stays dense and instrument-like.

## 4. Elevation

**Flat at rest.** Depth comes from tonal recession — fields cut below the panel, raised surfaces step one shade above — never from cast shadows. Hover changes background tone, never adds a shadow.

Shadows exist in exactly one place: **bottom sheets**, where a single soft lift separates the sheet from the scrim. The switch knob carries a 1px shadow for physical separation. No other surface casts a shadow.

| Shadow | Value | Use |
|---|---|---|
| Sheet lift (light) | `0 18px 46px oklch(0.22 0.014 240 / 0.16)` | Bottom sheets only. |
| Sheet lift (dark) | `0 18px 46px oklch(0 0 0 / 0.50)` | Bottom sheets, dark theme. |
| Switch knob | `0 1px 3px oklch(0 0 0 / 0.25)` | Toggle knob only. |
| Focus ring | `--focus-ring` | All interactive elements, focus-visible. |

## 5. Radius & Spacing

Gentle, restrained radii — no sharp Neobrutalist corners, no over-rounding. Cards cap at 12px; sheets at 14px; controls at 8px; full-pill reserved for status badges, filter pills, and the switch.

| Token | Value | | Token | Value |
|---|---|---|---|---|
| `sm` | 6px | | `xs` | 4px |
| `md` | 8px | | `sm` | 8px |
| `lg` | 10px | | `md` | 10px |
| `xl` | 12px | | `lg` | 12px |
| `sheet` | 14px | | `xl` | 16px |
| `pill` | 9999px | | `2xl` | 20px |

## 6. Components

### Buttons
- **Shape:** 8px radius, 30px min-height across all variants. Primary has no border; soft/icon have a hairline border.
- **Primary:** Deep-teal fill, white text. → `--accent-hover` on hover, `--accent-active` on press (120ms). The single most important action per context (Run, Save). White-on-teal passes AA in both themes.
- **Primary Danger:** Crimson (`--danger`) fill. Destructive confirmations only.
- **Soft:** `--control` fill, `--ink` text, `--border` border. → `--control-hover` on hover. Secondary actions (Cancel).
- **Icon:** 30×30px, `--control` fill, `--muted` icon, `--border` border. → `--control-hover` + `--ink` + `--border-strong` on hover. Compact utility (Create, Settings, Delete, Close).
- **Focus:** Teal `--focus-ring` on focus-visible. No outline, no border-color change.

### Command rows (signature)
- Full-width list item, ~68px min-height, no radius; bottom hairline separator between rows.
- Layout: status dot (8px) → content stack (name + mono command) → right column (timestamp + play button). 3px teal marker when selected.
- States: default (`--row`) → hover (`--row-hover`) → selected (`--row-selected` + teal marker). Play button reveals on hover/selection.
- Behavior: single-click selects; double-click runs. The row is the button.

### History rows — expandable; collapsed shows status icon + name + duration + badge; expanded adds mono output preview + cancel (when running). Grouped by period (Today, Yesterday, Earlier).

### Schedule rows — command name + schedule label + next-run + enable/disable switch.

### Group headers — sticky, ~32px, semi-transparent `--inset` with backdrop blur. Collapsible chevron. "Run all" appears when expanded and non-empty.

### Inputs / fields
- **Style:** `--field` bg, `--ink` text, `--border` border, 10px radius, 7px padding.
- **Search bar:** 36px height; label wraps input + icon + kbd hint. Auto-focus on mount; ⌘K refocuses. Placeholder uses `--muted` (not `--faint`).
- **Textarea:** mono for command input, `--field` bg, min 68px.
- **Focus:** teal `--focus-ring`. **Error:** border → `--danger`; message in `--danger` below.

### Switch — 38×22px pill. Off: `--control` track. On: `--accent` (teal) track. 16px white knob (1px shadow), slides 19px. 160ms ease-out.

### Navigation (segmented) — 34px container in `--field` with `--border`, 10px radius. Active tab: `--ink` on `--control-hover`. Inactive: `--muted` on transparent. 120ms. 15px icon + label.

### Filter pills — full-pill. Active: `--accent-soft` + `--accent-soft-text`. Inactive: transparent; hover shows `--control`.

### Bottom sheets — bottom-anchored, full-width, 14px radius, `--surface` bg, `--border`, sheet-lift shadow. Slides up 8px + fades in (140ms). Scrim: black 52%, fades 120ms. Header → fields → toggle rows → action bar (Soft left, Primary right). Dismiss: Esc, scrim click, close icon.

### Status indicators
- **Dot** (8px): `--faint` idle, `--accent` (teal) running, `--success` completed, `--danger` failed.
- **Badge** (pill): soft-fill + soft-text pair. Min 54px, centered label.
- **Icon** (24px, 7px radius): soft-fill + soft-text pair, 15px Lucide icon.

### Empty states — centered: faint icon → ink title → muted description → optional action. Teaches the interface ("Click + to save your first command"), never just "nothing here."

### Bottom bar — ~52px, `--inset` bg, top border. Selected command's dot + name + status label; actions (Edit, Delete, Run) on the right when a command is selected in Commands view.

### Code — mono, `--muted`, 0.71rem. Block: `--field` bg, 7px radius, 7px padding. Always truncating, never wrapping.

## 7. Motion

Motion conveys state, never decorates. No orchestrated page-load sequences, no staggered list entrances, no ambient pulsing. Users are in flow; the panel loads into a task.

| Element | Duration | Curve |
|---|---|---|
| Control hover/active/focus | 120ms | ease-out |
| Switch toggle | 160ms | ease-out |
| Sheet entrance | 140ms | ease-out (slide 8px + fade) |
| Scrim fade | 120ms | linear |
| Group collapse | 160ms | ease-out (chevron rotate) |

**Reduced motion:** every animation has a `prefers-reduced-motion: reduce` alternative — crossfade or instant. Sheets fade without the slide; spinners show a static indicator; the running-status pulse is removed.

## 8. Web Marketing Site Direction

The web surface (`apps/web`, Next.js) is the **brand register** — where design IS the product. It shares the brand core (Deep Teal accent, status semantics, calm-precision ethos) with the desktop app, voiced for a broader evaluating audience.

- **Theme:** **Dark-first.** `<html>` receives `.dark` by default via a no-FOUC inline script (`localStorage.theme === 'light'` opts out). Light theme remains fully designed for the toggle.
- **Type:** Plus Jakarta Sans for everything including display (all-sans; no serif), IBM Plex Mono for command previews.
- **Surface:** Near-black graphite canvas. Render product mockups in the dark theme with the real product tokens so marketing and product feel like one object.
- **Accent:** Deep Teal, used with more presence than in the compact product panel (marketing can afford Committed moments on hero/CTA), still never decorative gradients or glass.
- **Depth:** Calm tonal layering, the occasional purposeful soft shadow on hero/product mockups — never hard offset shadows.
- **Inspiration without cloning:** borrow Paseo.sh's execution DNA — dense real product mockups, terminal-forward storytelling, mono-means-executable, restrained palette — while the teal accent and Plus Jakarta Sans keep Ordito distinct.

## 9. Implementation Status

**Implemented.** The system is live in both apps:

- **`apps/web/app/globals.css`** — full token set, dark-first via `:root` (light) + `.dark` (dark, default-applied). Serif dropped.
- **`apps/desktop/src/index.css`** — identical palette tokens, system-driven light/dark (no forced theme), system-native fonts preserved.
- **`apps/web/app/layout.tsx`** — Plus Jakarta Sans + IBM Plex Mono only; dark-first theme script; `themeColor` updated to the dark canvas (`#0c1014`).
- Both surfaces compile (web `next build` ✓, `check-types` ✓, `lint` ✓). Existing desktop components resolve the new tokens unchanged — the token vocabulary is untouched, only values moved from coral/warm to teal/cool.

**Open follow-ups:**
- A theme toggle control on the web (the infra exists; the UI ships with the landing build).
- Desktop `cargo`/Tauri build verification of the frontend recompile (CSS-only change; low risk).

## 10. Do's and Don'ts

**Do:**
- Use Deep Teal as the sole interactive accent, on ≤10% of any screen.
- Convey depth through tonal recession; keep surfaces flat at rest.
- Use mono exclusively for executable text — commands, paths, exit codes, output.
- Carry hierarchy through weight on desktop, keeping sizes within 0.66–0.95rem.
- Pair every status color with its soft wash + per-theme soft-text tint.
- Keep transitions at 120 / 140 / 160ms; fast, responsive, no choreography.
- Design both light and dark from the start; web defaults dark, desktop follows the OS.
- Use `--muted` (never `--faint`) for placeholder and must-read secondary text.

**Don't:**
- Don't use `border-left`/`border-right` > 1px as a colored stripe. The selected-row marker is a 3px absolutely-positioned element — the sole exception.
- Don't pair a 1px border with a soft wide box-shadow on the same element (the ghost-card pattern). Flat at rest.
- Don't round cards/containers beyond 14px. Sheets cap at 14px, containers at 12px, controls at 8px.
- Don't use full-saturation status colors for text against soft washes — always the soft-text tint.
- Don't add shadows to inline elements, buttons, rows, or hover states. The sheet lift is the only structural shadow.
- Don't reintroduce Terracotta Coral or warm-paper neutrals — the system is cool-neutral teal now.
- Don't use gradient text, glassmorphism, or decorative grid backgrounds.
- Don't reach for the category-default blue or indigo-violet — teal is the ownable accent; blue makes Ordito invisible.
- Don't make it feel like a toy — candy colors, excessive rounding, playful illustration, bouncy motion are prohibited.
