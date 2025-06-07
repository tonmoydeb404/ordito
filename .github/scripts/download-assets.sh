#!/bin/bash
# scripts/download-assets.sh

set -e

RELEASE_TAG="$1"
REPOSITORY="$2"

if [ -z "$RELEASE_TAG" ] || [ -z "$REPOSITORY" ]; then
    echo "❌ Usage: $0 <release_tag> <repository>"
    echo "   Example: $0 app-v1.0.1 username/repo"
    exit 1
fi

echo "📥 Downloading assets for release: $RELEASE_TAG"
echo "   Repository: $REPOSITORY"

# Get release data
echo "🔍 Getting release information..."
RELEASE_DATA=$(gh api repos/$REPOSITORY/releases/tags/$RELEASE_TAG)
RELEASE_ID=$(echo "$RELEASE_DATA" | jq -r '.id')

if [ "$RELEASE_ID" = "null" ] || [ -z "$RELEASE_ID" ]; then
    echo "❌ Release not found: $RELEASE_TAG"
    exit 1
fi

echo "   Release ID: $RELEASE_ID"

# Create assets directory
mkdir -p assets
echo "📁 Created assets directory"

# Get list of assets
ASSETS=$(gh api repos/$REPOSITORY/releases/$RELEASE_ID/assets)
ASSET_COUNT=$(echo "$ASSETS" | jq length)

echo "📦 Found $ASSET_COUNT asset(s) to download"

if [ "$ASSET_COUNT" = "0" ]; then
    echo "⚠️  No assets found in release"
    exit 0
fi

# Download all release assets
echo "$ASSETS" | jq -r '.[].browser_download_url' | while read url; do
    filename=$(basename "$url")
    echo "   Downloading: $filename"
    
    curl -L -H "Authorization: Bearer $GITHUB_TOKEN" \
         -o "assets/$filename" \
         --fail \
         --silent \
         --show-error \
         "$url"
    
    if [ $? -eq 0 ]; then
        echo "   ✅ Downloaded: $filename"
    else
        echo "   ❌ Failed to download: $filename"
        exit 1
    fi
done

echo ""
echo "📋 Downloaded assets:"
ls -la assets/

# Verify we have some files
DOWNLOADED_COUNT=$(ls -1 assets/ 2>/dev/null | wc -l)
echo ""
echo "✅ Successfully downloaded $DOWNLOADED_COUNT file(s)"