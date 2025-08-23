#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Read version from package.json
const packageJsonPath = path.join(__dirname, '..', 'package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
const version = packageJson.version;

console.log(`📦 Syncing version ${version} across all files...`);

// Update Cargo.toml
const cargoTomlPath = path.join(__dirname, '..', 'src-tauri', 'Cargo.toml');
let cargoContent = fs.readFileSync(cargoTomlPath, 'utf8');
cargoContent = cargoContent.replace(/^version = ".*"$/m, `version = "${version}"`);
fs.writeFileSync(cargoTomlPath, cargoContent);
console.log('✅ Updated Cargo.toml');

// Update snapcraft.yaml
const snapcraftPath = path.join(__dirname, '..', 'snapcraft.yaml');
let snapcraftContent = fs.readFileSync(snapcraftPath, 'utf8');
snapcraftContent = snapcraftContent.replace(/^version: '.*'$/m, `version: '${version}'`);
fs.writeFileSync(snapcraftPath, snapcraftContent);
console.log('✅ Updated snapcraft.yaml');

console.log(`🎉 All files synced to version ${version}`);