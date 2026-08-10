# @packages/ui

The shared React component library for the Ordito monorepo. Consumed by [`apps/desktop`](../../apps/desktop) and [`apps/web`](../../apps/web).

---

## Tech stack

- **React** 19 (peer dependency)
- **Styling:** Tailwind v4, design tokens shared across both apps
- **Primitives:** shadcn/ui, [`@base-ui/react`](https://base-ui.com)
- **Styling utils:** `class-variance-authority`, `clsx`, `tailwind-merge`
- **Components:** `cmdk` (command menu), `react-day-picker`, `react-resizable-panels`, `sonner` (toasts), `next-themes`

## Exports

Source is consumed directly via the `exports` map in `package.json` (no build step):

```
@packages/ui/components/*        UI components
@packages/ui/fields/core         framework-agnostic form fields
@packages/ui/fields/rhf          React Hook Form fields
@packages/ui/hooks/*             shared hooks
@packages/ui/lib/*               utilities (cn, etc.)
@packages/ui/styles/globals.css  the global stylesheet / design tokens
```

## Run commands

This is a source-only package; there is no build or dev server.

```sh
pnpm check-types          # tsc --noEmit
```

Type-check across the whole workspace from the repo root:

```sh
pnpm check-types          # turbo run check-types
```

## License

[MIT](../../LICENSE)
