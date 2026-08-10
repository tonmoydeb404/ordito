# @packages/typescript-config

The shared [`tsconfig`](https://www.typescriptlang.org/docs/handbook/tsconfig-json.html) base files for the Ordito monorepo. Extended by [`apps/web`](../../apps/web), [`apps/desktop`](../../apps/desktop), and [`packages/ui`](../../packages/ui).

---

## Bases

| File | Used by |
| --- | --- |
| `base.json` | Common compiler options inherited by the others |
| `nextjs.json` | `apps/web` (Next.js) |
| `react-library.json` | `packages/ui` and `apps/desktop` (React + Vite library/app) |

## Usage

Extend from the appropriate base in a package's `tsconfig.json`:

```json
{
  "extends": "@packages/typescript-config/react-library.json"
}
```

## Run commands

This is a config-only package; there is no build or dev server. Type-check the workspace from the repo root:

```sh
pnpm check-types          # turbo run check-types
```

## License

[MIT](../../LICENSE)
