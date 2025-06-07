// scripts/generate-updater.js
const fs = require("fs");
const path = require("path");

class UpdaterGenerator {
  constructor() {
    this.config = {
      version: process.env.VERSION,
      tagName: process.env.TAG_NAME,
      pubDate: process.env.PUB_DATE || new Date().toISOString(),
      repository: process.env.REPOSITORY,
      assetsDir: process.env.ASSETS_DIR || "./assets",
      releaseNotes: process.env.RELEASE_NOTES,
    };

    this.validateConfig();
  }

  validateConfig() {
    const required = ["version", "tagName", "repository"];
    const missing = required.filter((field) => !this.config[field]);

    if (missing.length > 0) {
      throw new Error(
        `Missing required environment variables: ${missing.join(", ")}`
      );
    }
  }

  // Platform configurations
  getPlatformConfigs() {
    return {
      "linux-x86_64": {
        patterns: [
          "*.AppImage",
          "*-linux.AppImage",
          "*_amd64.AppImage",
          "*_x86_64.AppImage",
        ],
        sigPatterns: [
          "*.AppImage.sig",
          "*-linux.AppImage.sig",
          "*_amd64.AppImage.sig",
          "*_x86_64.AppImage.sig",
        ],
        description: "Linux x64 AppImage",
      },
      "windows-x86_64": {
        patterns: [
          "*-setup.exe",
          "*_x64-setup.exe",
          "*-windows.exe",
          "*.msi",
          "*_x64.msi",
          "*-windows.msi",
        ],
        sigPatterns: [
          "*-setup.exe.sig",
          "*_x64-setup.exe.sig",
          "*-windows.exe.sig",
          "*.msi.sig",
          "*_x64.msi.sig",
          "*-windows.msi.sig",
        ],
        description: "Windows x64 Installer",
      },
      "darwin-x86_64": {
        patterns: [
          "*_x64.app.tar.gz",
          "*-x64.app.tar.gz",
          "*_intel.app.tar.gz",
          "*x86_64.app.tar.gz",
        ],
        sigPatterns: [
          "*_x64.app.tar.gz.sig",
          "*-x64.app.tar.gz.sig",
          "*_intel.app.tar.gz.sig",
          "*x86_64.app.tar.gz.sig",
        ],
        description: "macOS Intel",
      },
      "darwin-aarch64": {
        patterns: [
          "*_aarch64.app.tar.gz",
          "*-aarch64.app.tar.gz",
          "*_arm64.app.tar.gz",
          "*aarch64.app.tar.gz",
        ],
        sigPatterns: [
          "*_aarch64.app.tar.gz.sig",
          "*-aarch64.app.tar.gz.sig",
          "*_arm64.app.tar.gz.sig",
          "*aarch64.app.tar.gz.sig",
        ],
        description: "macOS Apple Silicon",
      },
      "darwin-universal": {
        patterns: [
          "*.app.tar.gz",
          "*-macos.app.tar.gz",
          "*_universal.app.tar.gz",
        ],
        sigPatterns: [
          "*.app.tar.gz.sig",
          "*-macos.app.tar.gz.sig",
          "*_universal.app.tar.gz.sig",
        ],
        description: "macOS Universal",
      },
    };
  }

  // Find files matching patterns
  findAsset(patterns, assets) {
    for (const pattern of patterns) {
      const regex = new RegExp("^" + pattern.replace(/\*/g, ".*") + "$", "i");
      const match = assets.find((file) => regex.test(file));
      if (match) return match;
    }
    return null;
  }

  // Generate download URL
  generateDownloadUrl(filename) {
    return `https://github.com/${this.config.repository}/releases/download/${this.config.tagName}/${filename}`;
  }

  // Read signature file
  readSignature(sigFile) {
    try {
      const signaturePath = path.join(this.config.assetsDir, sigFile);
      const signature = fs.readFileSync(signaturePath, "utf8").trim();

      if (!signature) {
        throw new Error("Empty signature file");
      }

      return signature;
    } catch (error) {
      throw new Error(`Failed to read signature: ${error.message}`);
    }
  }

  // Process a single platform
  processPlatform(platformId, platformConfig, assets) {
    console.log(
      `🔍 Processing ${platformId} (${platformConfig.description})...`
    );

    const mainFile = this.findAsset(platformConfig.patterns, assets);
    const sigFile = this.findAsset(platformConfig.sigPatterns, assets);

    if (!mainFile || !sigFile) {
      const missing = [];
      if (!mainFile) missing.push("installer");
      if (!sigFile) missing.push("signature");
      console.log(`  ⏭️  Skipped (missing: ${missing.join(", ")})`);
      return null;
    }

    try {
      const signature = this.readSignature(sigFile);
      const downloadUrl = this.generateDownloadUrl(mainFile);

      console.log(`  ✅ ${mainFile} -> ${downloadUrl}`);

      return {
        signature,
        url: downloadUrl,
      };
    } catch (error) {
      console.log(`  ❌ Error: ${error.message}`);
      return null;
    }
  }

  // Generate the complete JSON
  generate() {
    console.log("🔧 Generating updater JSON");
    console.log(`Version: ${this.config.version}`);
    console.log(`Tag: ${this.config.tagName}`);
    console.log(`Repository: ${this.config.repository}`);
    console.log("");

    // Read assets directory
    let assets;
    try {
      assets = fs.readdirSync(this.config.assetsDir);
      console.log("📦 Available assets:");
      assets.forEach((asset) => console.log(`  - ${asset}`));
      console.log("");
    } catch (error) {
      throw new Error(`Cannot read assets directory: ${error.message}`);
    }

    const platformConfigs = this.getPlatformConfigs();
    const platforms = {};
    let processedCount = 0;

    // Process each platform
    for (const [platformId, platformConfig] of Object.entries(
      platformConfigs
    )) {
      const result = this.processPlatform(platformId, platformConfig, assets);
      if (result) {
        platforms[platformId] = result;
        processedCount++;
      }
    }

    if (processedCount === 0) {
      console.error("❌ No valid platform assets found!");
      console.log("\nAvailable files:", assets);
      console.log("\nExpected patterns:");
      Object.entries(platformConfigs).forEach(([id, config]) => {
        console.log(
          `  ${id}: ${config.patterns[0]} + ${config.sigPatterns[0]}`
        );
      });
      process.exit(1);
    }

    // Generate release notes
    const releaseNotes =
      this.config.releaseNotes ||
      `Update to version ${this.config.version}. Download the appropriate installer for your platform.`;

    // Create final JSON
    const updaterJson = {
      version: this.config.version,
      notes: releaseNotes,
      pub_date: this.config.pubDate,
      platforms,
    };

    return updaterJson;
  }

  // Save JSON to file
  save(json, outputPath = "latest.json") {
    try {
      const jsonString = JSON.stringify(json, null, 2);
      fs.writeFileSync(outputPath, jsonString);

      console.log("✅ Successfully generated updater JSON:");
      console.log(`   File: ${outputPath}`);
      console.log(`   Version: ${json.version}`);
      console.log(`   Platforms: ${Object.keys(json.platforms).join(", ")}`);
      console.log(`   Date: ${json.pub_date}`);
      console.log("");
      console.log("📄 Generated JSON:");
      console.log(jsonString);

      return outputPath;
    } catch (error) {
      throw new Error(`Failed to save JSON: ${error.message}`);
    }
  }

  // Main execution
  run(outputPath = "latest.json") {
    try {
      const json = this.generate();
      this.save(json, outputPath);
      return json;
    } catch (error) {
      console.error("❌ Fatal error:", error.message);
      process.exit(1);
    }
  }
}

// CLI usage
if (require.main === module) {
  const generator = new UpdaterGenerator();
  generator.run();
}

module.exports = UpdaterGenerator;
