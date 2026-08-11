#!/usr/bin/env node
// @ts-check
/**
 * Release tag orchestrator.
 *
 * `brand.json` (repo root) is the single source of truth for the version, and
 * `pnpm sync-brand` propagates it into every consumer file. So releasing is:
 *   1. bump `version` in brand.json
 *   2. run `pnpm sync-brand` to rewrite all consumers
 *   3. commit + create an annotated `vX.Y.Z` tag + push
 *
 * Usage:
 *   pnpm release:tag <major|minor|patch|x.y.z> [--dry-run] [--no-push]
 */
import { execSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const ROOT = path.resolve(path.dirname(__filename), "..");
const BRAND_FILE = path.join(ROOT, "brand.json");

function run(cmd, options = {}) {
  const output = execSync(cmd, {
    cwd: ROOT,
    stdio: ["ignore", "pipe", "pipe"],
    ...options,
  });
  return output == null ? "" : output.toString().trim();
}

function readJson(filePath) {
  return JSON.parse(readFileSync(filePath, "utf8"));
}

function writeJson(filePath, data) {
  writeFileSync(filePath, `${JSON.stringify(data, null, 2)}\n`, "utf8");
}

function parseVersion(version) {
  const match = version.match(/^(\d+)\.(\d+)\.(\d+)$/);
  if (!match) {
    throw new Error(`Invalid semver version: ${version}`);
  }
  return {
    major: Number(match[1]),
    minor: Number(match[2]),
    patch: Number(match[3]),
  };
}

function nextVersion(current, bump) {
  const v = parseVersion(current);
  if (bump === "major") return `${v.major + 1}.0.0`;
  if (bump === "minor") return `${v.major}.${v.minor + 1}.0`;
  if (bump === "patch") return `${v.major}.${v.minor}.${v.patch + 1}`;
  parseVersion(bump); // throws if invalid explicit version
  return bump;
}

function usage() {
  console.log(
    "\nUsage:\n  pnpm release:tag <major|minor|patch|x.y.z> [--dry-run] [--no-push]\n\nExamples:\n  pnpm release:tag patch\n  pnpm release:tag 2.1.0\n  pnpm release:tag minor --dry-run\n",
  );
}

function main() {
  const args = process.argv.slice(2);
  const bumpOrVersion = args[0];
  const dryRun = args.includes("--dry-run");
  const noPush = args.includes("--no-push");

  if (!bumpOrVersion || bumpOrVersion.startsWith("-")) {
    usage();
    process.exit(1);
  }

  const brand = readJson(BRAND_FILE);
  const currentVersion = brand.version;
  const newVersion = nextVersion(currentVersion, bumpOrVersion);
  const tag = `v${newVersion}`;

  if (newVersion === currentVersion) {
    throw new Error(`Version is unchanged (${newVersion}).`);
  }

  if (dryRun) {
    console.log(
      `Dry run complete. Would set version ${currentVersion} -> ${newVersion} in brand.json (and sync all consumers).`,
    );
    console.log(`Would create tag: ${tag}`);
    return;
  }

  // Keep release commits predictable and avoid tagging unreviewed work.
  const status = run("git status --porcelain");
  if (status) {
    throw new Error(
      "Git working tree is not clean. Commit or stash changes first.",
    );
  }

  const existingTag = run(`git tag -l ${tag}`);
  if (existingTag === tag) {
    throw new Error(`Tag already exists: ${tag}`);
  }

  // 1. bump the single source of truth.
  brand.version = newVersion;
  writeJson(BRAND_FILE, brand);

  // 2. propagate to every consumer (package.json, tauri.conf.json, Cargo.toml, ...).
  run("pnpm sync-brand", { stdio: "inherit" });

  // 3. commit, tag, and (optionally) push.
  run("git add -A");
  run(`git commit -m "chore(release): ${tag}"`, { stdio: "inherit" });
  run(`git tag -a ${tag} -m "Release ${tag}"`);

  if (!noPush) {
    run("git push", { stdio: "inherit" });
    run("git push --tags", { stdio: "inherit" });
  }

  console.log(`Released ${tag} (brand.json + synced consumers).`);
}

try {
  main();
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
}
