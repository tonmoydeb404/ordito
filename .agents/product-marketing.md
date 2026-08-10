# Product Marketing Context

*Last updated: July 2026*
*Auto-drafted from PRODUCT.md, landing page, and codebase.*

## Product Overview

**One-liner:** Your commands, one tray-click away.

**What it does:** Ordito organizes frequently used shell commands into named groups and runs them with a single click — from the panel or directly from the system tray. No terminal window, no command recall, no friction. It schedules recurring (cron) and one-time runs, tracks every execution with full output history and exit codes, and lives in the tray until you need it.

**Product category:** Command runner / task automation / developer tools

**Product type:** Desktop application (Tauri 2), free and open source (MIT)

**Business model:** Free. No paid tiers, no accounts, no cloud. Source code public on GitHub.

## Target Audience

**Target users:** Power users — technical generalists who automate repetitive shell workflows, scripts, and system tasks throughout their day. They are at their machine, jumping between projects, running the same build/deploy/diagnostic commands repeatedly, and tired of switching to a terminal and retyping syntax.

**Decision-makers:** Individual developers, DevOps engineers, sysadmins, SREs, indie hackers.

**Primary use case:** Running saved shell commands from the system tray without opening a terminal.

**Jobs to be done:**
1. Run a known command instantly without opening a terminal or recalling syntax
2. Schedule recurring commands (nightly builds, weekly deploys, hourly syncs)
3. Track what commands ran, when, and what happened (exit codes, output)

**Use cases:**
- Running build commands across multiple projects
- Triggering deploy scripts from the menu bar
- Scheduling data syncs, backups, or cleanup tasks
- Quick access to diagnostic commands (git status, docker ps, etc.)

## Personas

| Persona | Cares about | Challenge | Value we promise |
|---------|-------------|-----------|------------------|
| Developer | Speed, muscle memory | Tired of switching to terminal for commands they already know | One-click execution from tray — never open terminal for a saved command |
| DevOps / Sysadmin | Reliability, visibility | Needs to schedule tasks and verify they ran correctly | Cron scheduling + full run history with exit codes |
| Power user / tinkerer | Customization, control | Has dozens of shell aliases scattered across projects | Organized groups + search + instant execution |

## Problems & Pain Points

**Core problem:** Power users run the same shell commands dozens of times a day. Every invocation requires context-switching to a terminal, recalling or copy-pasting syntax, and running it — a round trip that wastes seconds but adds up to friction and broken flow.

**Why alternatives fall short:**
- Shell aliases: flat list, no scheduling, no history, no output tracking, lives in one terminal session
- cron: no UI, no tray access, no history visibility, painful to set up for simple tasks
- Launchers (Raycast, Alfred): can run scripts but no scheduling, no history, no tray-resident one-click flow

**What it costs them:** Constant context-switching, lost flow state, time recalling syntax, no visibility into what ran and when.

**Emotional tension:** Frustration with repeating themselves. Distrust of whether scheduled tasks actually ran. Mild anxiety about losing track of what they deployed.

## Competitive Landscape

**Direct:** [None currently — Ordito is in a niche between launchers and cron]

**Secondary (same problem, different approach):**
- Terminal aliases / shell scripts — free, fast, but no scheduling, no history, no tray access
- cron / launchd — scheduling only, no UI, no history, painful setup
- Raycast / Alfred — launchers with script commands, but not tray-resident, no scheduling, no history

**Indirect (conflicting approach):**
- Jenkins / GitHub Actions — CI/CD scheduled runs, but heavyweight, server-based, not for local one-click tasks
- Task Runner apps (Automator, Keyboard Maestro) — general automation, not purpose-built for command execution

## Differentiation

**Key differentiators:**
- System tray execution — native menu bar / tray icon, no app window needed
- Combined tray + scheduling + history — none of the alternatives offer all three
- Local-first — zero cloud, zero accounts, zero telemetry

**How we do it differently:** Purpose-built for the "I already know this command, just run it" moment. Not a general automation tool, not a CI/CD platform, not a launcher — a focused utility for one-click command execution from the tray.

**Why that's better:** Faster than a terminal (one click vs. open + recall + type). More visible than cron (tray icon, history panel). Simpler than a launcher (no config, no plugins — just save and run).

**Why customers choose us:** Speed + simplicity + local privacy. No accounts, no cloud, no data leaves your machine.

## Objections

| Objection | Response |
|-----------|----------|
| "I can just use aliases" | Aliases work in one terminal session. Ordito gives you tray access, groups, scheduling, and history — things aliases can't do. |
| "I already use Raycast/Alfred" | Launchers are great for opening apps. Ordito is purpose-built for running commands from the tray with history and scheduling. They complement each other. |
| "I don't need yet another tool" | Ordito replaces the terminal round trip you do dozens of times a day. If you're happy retyping commands, it's not for you. If you're not, it saves real time. |
| "Is it free? What's the catch?" | Free and open source under MIT. No catch — it's a side project, not a startup. Source code is public. |

**Anti-persona:** Users who rarely use the terminal, prefer GUI-only workflows, or don't run commands repeatedly.

## Switching Dynamics

**Push:** Tired of terminal context-switching, losing track of what ran, and retyping syntax for commands they already know.

**Pull:** One click from the tray, organized groups, scheduled runs, visible history — the commands they run every day are always one click away.

**Habit:** Muscle memory of opening a terminal, typing a command, pressing Enter. The terminal "just works" and they've always done it this way.

**Anxiety:** "Will this replace my terminal?" (No — it's for the commands you already know. You still need a terminal for exploration.) "Is my data safe?" (Yes — local SQLite, no cloud, open source.)

## Customer Language

**How they describe the problem:**
- "I run the same 10 commands all day"
- "I keep losing track of what I deployed"
- "I wish I could just click a button instead of opening a terminal"
- "My shell aliases are a mess across different projects"

**How they describe us:**
- "It's like having my most-used commands in the menu bar"
- "Finally, a tray app for running shell commands"
- "Cron with a UI"

**Words to use:** tray, one-click, commands, system tray, menu bar, run, execute, schedule, history, local, terminal, shell, open source

**Words to avoid:** automation platform, workflow engine, orchestration, enterprise, SaaS, cloud, dashboard

**Glossary:**
| Term | Meaning |
|------|---------|
| Tray / menu bar | The macOS menu bar or Windows system tray where Ordito lives |
| Panel | The main Ordito window (420×640 compact panel) |
| Group | A named collection of related commands |
| Run | A single execution of a saved command |
| Exit code | The numeric status returned by a command (0 = success) |

## Brand Voice

**Tone:** Quiet and precise. Direct. No marketing-speak.

**Style:** Short sentences. Concrete. "This does that" — no superlatives, no filler.

**Personality:** Minimal, dense, engineered. A pro tool that respects attention. Not a toy.

**Non-negotiables:** Never playful, never cute, never "fun." Always confident, always concise.

## Proof Points

**Metrics:** [needs input — any usage stats, stars, downloads?]

**Customers:** [needs input — any notable users, testimonials, logos?]

**Testimonials:** [needs input]

**Value themes:**
| Theme | Proof |
|-------|-------|
| Speed | One-click execution from tray vs. terminal round trip |
| Visibility | Full history with exit codes, duration, output |
| Privacy | Local SQLite, no cloud, open source (MIT) |
| Simplicity | Save once, run forever — no config, no accounts |

## Goals

**Business goal:** Grow adoption of Ordito among power users. Get it into the hands of developers who run repetitive shell commands daily.

**Conversion action:** Download the app from GitHub Releases.

**Current metrics:** [needs input — stars, downloads, traffic, signups]

---

*Review and update: fill in [needs input] items. This file is referenced by all other marketing skills — seo-audit, ai-seo, marketing-plan, schema, directory-submissions, launch, etc.*
