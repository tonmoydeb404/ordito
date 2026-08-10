# @packages/eslint-config

The shared [ESLint](https://eslint.org/) flat-config package for the Ordito monorepo. Consumed by [`apps/desktop`](../../apps/desktop) and [`apps/web`](../../apps/web) via their `eslint.config.mjs`.

---

## Usage

Import the config in an app's `eslint.config.mjs`:

```js
import config from "@packages/eslint-config";

export default config;
```

## Run commands

This is a config-only package; there is no build or dev server. Lint the consuming apps from the repo root:

```sh
pnpm lint          # turbo run lint
```

## License

[MIT](../../LICENSE)
