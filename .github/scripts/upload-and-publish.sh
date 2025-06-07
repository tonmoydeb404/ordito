#!/bin/bash
# scripts/upload-and-publish.sh

set -e

RELEASE_TAG="$1"
REPOSITORY="$2"
JSON_FILE="${3:-latest.json}"

if [ -z "$RELEASE_TAG" ] || [ -z "$REPOSITORY" ]; then
    echo "❌ Usage: $0 <release_tag> <repository> [json_file]"
    echo "   Example: $0 app-v1.0.1 username/repo latest.json"
    exit 1
fi

echo "📤 Uploading and publishing release"
echo "   Release tag: $RELEASE_TAG"
echo "   Repository: $REPOSITORY"
echo "   JSON file: $JSON_FILE"

# Check if JSON file exists
if [ ! -f "$JSON_FILE" ]; then
    echo "❌ JSON file not found: $JSON_FILE"
    exit 1
fi

# Upload the JSON file to the release
echo "📤 Uploading $JSON_FILE to release..."
if gh release upload "$RELEASE_TAG" "$JSON_FILE" \
    --repo "$REPOSITORY" \
    --clobber; then
    echo "✅ Successfully uploaded $JSON_FILE"
else
    echo "❌ Failed to upload $JSON_FILE"
    exit 1
fi

# Publish the release (remove draft status)
echo "📢 Publishing release..."
if gh release edit "$RELEASE_TAG" \
    --repo "$REPOSITORY" \
    --draft=false; then
    echo "✅ Release published successfully!"
else
    echo "❌ Failed to publish release"
    exit 1
fi

echo ""
echo "🎉 Release pipeline completed successfully!"
echo ""
echo "🔗 Release URL: https://github.com/$REPOSITORY/releases/tag/$RELEASE_TAG"
echo "🔗 Updater endpoint: https://github.com/$REPOSITORY/releases/latest/download/$JSON_FILE"
echo ""
echo "📋 Next steps:"
echo "   1. Update your tauri.conf.json with the updater endpoint"
echo "   2. Test the auto-updater in your application"
echo "   3. Monitor download metrics in GitHub releases"