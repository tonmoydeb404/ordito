// @ts-check
/**
 * Single-source-of-truth brand synchronizer.
 *
 * `brand.json` (repo root) is the ONLY file you should edit for brand values.
 * This script propagates those values into every consumer file:
 *   - structured JSON/TOML configs (tauri.conf.json, package.json, Cargo.toml)
 *   - generated typed wrappers (brand.ts, brand.rs, scripts-config.ts)
 *   - token-marked prose (README.md, llms.txt, pricing.md, paths-config.ts)
 *   - line-keyed shell/ruby configs (setup.sh, setup.ps1, Casks/ordito.rb)
 *
 * Modes:
 *   pnpm sync-brand          rewrite all consumers from brand.json
 *   pnpm sync-brand --check  exit 1 if any consumer is out of sync (CI guard)
 */
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const REPO_ROOT = path.resolve(path.dirname(__filename), "..");
const CHECK = process.argv.includes("--check");

/** @type {Record<string, string>} */
const raw = JSON.parse(
  readFileSync(path.join(REPO_ROOT, "brand.json"), "utf8"),
);
const brand = raw;

const repoSlug = brand.repository.replace(/^https:\/\/github\.com\//, "");
const repoGit = `${brand.repository}.git`;

// Flat map of every token the prose markers can reference.
const markers = {
  appName: brand.appName,
  version: brand.version,
  identifier: brand.identifier,
  developerName: brand.developer.name,
  website: brand.developer.website,
  repository: brand.repository,
  repositoryGit: repoGit,
  repoSlug,
  downloadUrl: brand.downloadUrl,
  licenseUrl: brand.licenseUrl,
  updaterEndpoint: brand.updaterEndpoint,
  setupSh: brand.scripts.setupSh,
  setupPs1: brand.scripts.setupPs1,
  uninstallSh: brand.scripts.uninstallSh,
  uninstallPs1: brand.scripts.uninstallPs1,
  descriptionShort: brand.description.short,
  descriptionLong: brand.description.long,
  copyright: brand.copyright,
  homebrewTap: brand.homebrewTap,
};

// ---------------------------------------------------------------------------
// helpers
// ---------------------------------------------------------------------------

const read = (rel) => {
  const abs = path.join(REPO_ROOT, rel);
  return existsSync(abs) ? readFileSync(abs, "utf8") : undefined;
};

const escRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/** Replace every `<!-- @brand:KEY -->..../@brand:KEY -->` with the marker value. */
const applyInlineMarkers = (text) => {
  let out = text;
  for (const [key, val] of Object.entries(markers)) {
    const re = new RegExp(
      `(<!--\\s*@brand:${key}\\s*-->)([\\s\\S]*?)(<!--\\s*/@brand:${key}\\s*-->)`,
      "g",
    );
    out = out.replace(re, (_, open, _inner, close) => `${open}${val}${close}`);
  }
  return out;
};

/** Replace content between `// @brand:generated-start` and `-end` comment lines. */
const applyTsBlock = (text, block) =>
  text.replace(
    new RegExp(
      `(^//\\s*@brand:generated-start\\s*\\n)([\\s\\S]*?)(^//\\s*@brand:generated-end)`,
      "m",
    ),
    (_, start, _inner, end) => `${start}${block}${end}`,
  );

/** Replace content between `# @brand:start <name>` / `# @brand:end <name>` shell block. */
const applyShellBlock = (text, name, block) =>
  text.replace(
    new RegExp(
      `(^#\\s*@brand:start\\s+${escRe(name)}\\s*\\n)([\\s\\S]*?)(^#\\s*@brand:end\\s+${escRe(name)})`,
      "m",
    ),
    (_, start, _inner, end) => `${start}${block}${end}`,
  );

/** Replace content between `<!-- @brand:start NAME -->` and `<!-- @brand:end NAME -->`.
 *  Used for markdown regions (e.g. badges) whose brand values can't sit inside a
 *  link's `()` (HTML comments there break CommonMark parsing): the whole region is
 *  regenerated from brand.json each run, with no comment tags left in the URL. */
const applyBlock = (text, name, block) =>
  text.replace(
    new RegExp(
      `(<!--\\s*@brand:start\\s+${escRe(name)}\\s*-->)([\\s\\S]*?)(<!--\\s*@brand:end\\s+${escRe(name)}\\s*-->)`,
    ),
    (_, start, _inner, end) => `${start}${block}${end}`,
  );

/** Set a `key = value` line in TOML; returns null if the key is absent. */
const setTomlField = (text, key, value) => {
  const re = new RegExp(`^(${escRe(key)}\\s*=\\s*).*$`, "m");
  if (!re.test(text)) return null;
  return text.replace(re, `$1${value}`);
};

/** Set a TOML field, inserting after `afterKey` when it does not yet exist. */
const upsertTomlField = (text, key, value, afterKey) => {
  const replaced = setTomlField(text, key, value);
  if (replaced !== null) return replaced;
  const re = new RegExp(`^(${escRe(afterKey)}\\s*=\\s*.*$)`, "m");
  return text.replace(re, `$1\n${key} = ${value}`);
};

/** Replace a line matching `prefix` with `replacement` (full line). */
const setLine = (text, prefix, replacement) => {
  const re = new RegExp(`^${escRe(prefix)}.*$`, "m");
  return text.replace(re, replacement);
};

// ---------------------------------------------------------------------------
// generated file bodies
// ---------------------------------------------------------------------------

const GENERATED_NOTE =
  "/**\n * GENERATED BY scripts/sync-brand.mjs — DO NOT EDIT BY HAND.\n * Source of truth: brand.json at the repo root. Run `pnpm sync-brand`.\n */";

const brandTs = `${GENERATED_NOTE}

export const brand = ${JSON.stringify(brand, null, 2)} as const;

export type Brand = typeof brand;
`;

const brandRs = `//! GENERATED BY scripts/sync-brand.mjs — DO NOT EDIT BY HAND.
//! Source of truth: brand.json at the repo root. Run \`pnpm sync-brand\`.
#![allow(dead_code)]

pub const APP_NAME: &str = ${JSON.stringify(brand.appName)};
pub const IDENTIFIER: &str = ${JSON.stringify(brand.identifier)};
pub const DEVELOPER_NAME: &str = ${JSON.stringify(brand.developer.name)};
pub const WEBSITE: &str = ${JSON.stringify(brand.developer.website)};
pub const REPOSITORY: &str = ${JSON.stringify(brand.repository)};
pub const DOWNLOAD_URL: &str = ${JSON.stringify(brand.downloadUrl)};
pub const LICENSE_URL: &str = ${JSON.stringify(brand.licenseUrl)};
pub const COPYRIGHT: &str = ${JSON.stringify(brand.copyright)};
pub const HOMEBREW_TAP: &str = ${JSON.stringify(brand.homebrewTap)};
pub const SETUP_SCRIPT_URL: &str = ${JSON.stringify(brand.scripts.setupSh)};

/// App version, read from Cargo.toml at compile time.
pub const VERSION: &str = env!("CARGO_PKG_VERSION");
`;

const scriptsConfigTs = `${GENERATED_NOTE}

export const scriptUrls = ${JSON.stringify(brand.scripts, null, 2)} as const;
`;

// ---------------------------------------------------------------------------
// transforms: each returns the desired file content for a relative path
// ---------------------------------------------------------------------------

const desktopPkg = JSON.parse(read("apps/desktop/package.json"));
desktopPkg.version = brand.version;
desktopPkg.homepage = brand.developer.website;
desktopPkg.repository.url = repoGit;

const rootPkg = JSON.parse(read("package.json"));
rootPkg.version = brand.version;
rootPkg.homepage = brand.developer.website;
rootPkg.repository.url = repoGit;

const webPkg = JSON.parse(read("apps/web/package.json"));
webPkg.version = brand.version;

const tauriConf = JSON.parse(read("apps/desktop/src-tauri/tauri.conf.json"));
tauriConf.productName = brand.appName;
tauriConf.version = brand.version;
tauriConf.identifier = brand.identifier;
tauriConf.app.windows[0].title = brand.appName;
tauriConf.plugins.updater.endpoints[0] = brand.updaterEndpoint;
tauriConf.bundle.publisher = brand.developer.name;
tauriConf.bundle.copyright = brand.copyright;
tauriConf.bundle.shortDescription = brand.description.short;
tauriConf.bundle.longDescription = brand.description.long;

let cargo = read("apps/desktop/src-tauri/Cargo.toml");
cargo = upsertTomlField(cargo, "version", `"${brand.version}"`, "name");
cargo = upsertTomlField(
  cargo,
  "description",
  `"${brand.description.short}"`,
  "version",
);
cargo = upsertTomlField(
  cargo,
  "authors",
  `["${brand.developer.name}"]`,
  "edition",
);
cargo = upsertTomlField(
  cargo,
  "homepage",
  `"${brand.developer.website}"`,
  "authors",
);
cargo = upsertTomlField(
  cargo,
  "repository",
  `"${brand.repository}"`,
  "homepage",
);

const dmgUrl = `"https://github.com/${repoSlug}/releases/download/v#{version}/Ordito_#{version}_#{arch}.dmg"`;
let cask = read("Casks/ordito.rb");
cask = setLine(cask, `  url `, `  url ${dmgUrl}`);
cask = setLine(cask, `  homepage `, `  homepage "${brand.repository}"`);

const shUsageBlock = `#   curl -fsSL ${brand.scripts.setupSh} | sh
#   curl -fsSL ${brand.scripts.setupSh} | sh -s -- v${brand.version}
`;
let setupSh = read("setup/unix.sh");
setupSh = applyShellBlock(setupSh, "usage", shUsageBlock);
setupSh = setLine(setupSh, `TAP=`, `TAP="${brand.homebrewTap}"`);
setupSh = setLine(setupSh, `TAP_URL=`, `TAP_URL="${repoGit}"`);
setupSh = setLine(setupSh, `REPO=`, `REPO="${repoSlug}"`);

const ps1UsageBlock = `#   irm ${brand.scripts.setupPs1} | iex
`;
let setupPs1 = read("setup/windows.ps1");
setupPs1 = applyShellBlock(setupPs1, "usage", ps1UsageBlock);
setupPs1 = setLine(setupPs1, `$Repo = `, `$Repo = "${repoSlug}"`);

const uninstallShUsageBlock = `#   curl -fsSL ${brand.scripts.uninstallSh} | sh
`;
let uninstallSh = read("setup/unix-uninstall.sh");
uninstallSh = applyShellBlock(uninstallSh, "usage", uninstallShUsageBlock);
uninstallSh = setLine(uninstallSh, `TAP=`, `TAP="${brand.homebrewTap}"`);
uninstallSh = setLine(uninstallSh, `REPO=`, `REPO="${repoSlug}"`);

const uninstallPs1UsageBlock = `#   irm ${brand.scripts.uninstallPs1} | iex
`;
let uninstallPs1 = read("setup/windows-uninstall.ps1");
uninstallPs1 = applyShellBlock(uninstallPs1, "usage", uninstallPs1UsageBlock);
uninstallPs1 = setLine(uninstallPs1, `$Repo = `, `$Repo = "${repoSlug}"`);

const externalUrlsBlock = `export const externalUrls = {
  site: "${brand.developer.website}",
  download: "${brand.downloadUrl}",
  repository: "${brand.repository}",
  license: "${brand.licenseUrl}",
} as const;
`;
const pathsConfig = applyTsBlock(
  read("apps/web/src/config/paths-config.ts"),
  externalUrlsBlock,
);

// Markdown regions regenerated from brand.json. Blank lines around the content
// are intentional: without them the `<!-- @brand:start -->` comment (an HTML
// block) would absorb the adjacent markdown and stop it rendering on GitHub.
const badgeBlock = `\n\n[![Release](https://img.shields.io/github/v/release/${repoSlug})](${brand.downloadUrl})\n[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)\n[![Platform](https://img.shields.io/badge/platform-macOS%20%7C%20Windows%20%7C%20Linux-blue)](#download)\n\n`;
const downloadLinkBlock = `\n\n[Download the latest release &raquo;](${brand.downloadUrl})\n\n`;

const readme = applyBlock(
  applyBlock(applyInlineMarkers(read("README.md")), "badges", badgeBlock),
  "downloadLink",
  downloadLinkBlock,
);
const desktopReadme = applyInlineMarkers(read("apps/desktop/README.md"));
const webReadme = applyInlineMarkers(read("apps/web/README.md"));
const llmsTxt = applyInlineMarkers(read("apps/web/public/llms.txt"));
const pricingMd = applyInlineMarkers(read("apps/web/public/pricing.md"));

// ---------------------------------------------------------------------------
// apply
// ---------------------------------------------------------------------------

const targets = {
  "apps/desktop/src/lib/brand.ts": brandTs,
  "apps/desktop/src-tauri/src/brand.rs": brandRs,
  "apps/web/src/config/scripts-config.ts": scriptsConfigTs,
  "apps/desktop/package.json": `${JSON.stringify(desktopPkg, null, 2)}\n`,
  "package.json": `${JSON.stringify(rootPkg, null, 2)}\n`,
  "apps/web/package.json": `${JSON.stringify(webPkg, null, 2)}\n`,
  "apps/desktop/src-tauri/tauri.conf.json": `${JSON.stringify(tauriConf, null, 2)}\n`,
  "apps/desktop/src-tauri/Cargo.toml": cargo,
  "Casks/ordito.rb": cask,
  "setup/unix.sh": setupSh,
  "setup/windows.ps1": setupPs1,
  "setup/unix-uninstall.sh": uninstallSh,
  "setup/windows-uninstall.ps1": uninstallPs1,
  "apps/web/src/config/paths-config.ts": pathsConfig,
  "README.md": readme,
  "apps/desktop/README.md": desktopReadme,
  "apps/web/README.md": webReadme,
  "apps/web/public/llms.txt": llmsTxt,
  "apps/web/public/pricing.md": pricingMd,
};

const drift = [];
for (const [rel, content] of Object.entries(targets)) {
  const current = read(rel);
  if (current === content) continue;
  drift.push(rel);
  if (!CHECK) writeFileSync(path.join(REPO_ROOT, rel), content, "utf8");
}

if (CHECK) {
  if (drift.length) {
    console.error("brand: out of sync — run `pnpm sync-brand` and recommit:");
    for (const f of drift) console.error(`  ${f}`);
    process.exit(1);
  }
  console.log("brand: in sync ✓");
} else {
  const wrote = drift.length;
  console.log(
    `brand: ${wrote === 0 ? "already in sync ✓" : `synced ${wrote} file${wrote === 1 ? "" : "s"} ✓`}`,
  );
}
