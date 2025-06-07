#!/bin/bash
# scripts/get-release-info.sh

set -e

echo "🔍 Getting release information..."

# Get the tag name
if [ "$GITHUB_EVENT_NAME" = "workflow_dispatch" ]; then
    TAG=$(git describe --tags --abbrev=0)
    echo "📋 Manual dispatch - using latest tag: $TAG"
else
    TAG="$GITHUB_REF_NAME"
    echo "📋 Tag push event - using: $TAG"
fi

# Add app- prefix to match tagName format
RELEASE_TAG="app-${TAG}"

# Extract version (remove 'v' prefix)
VERSION=${TAG#v}

# Get current date in RFC 3339 format
PUB_DATE=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

# Output the information
echo "tag=$TAG" >> $GITHUB_OUTPUT
echo "release_tag=$RELEASE_TAG" >> $GITHUB_OUTPUT
echo "version=$VERSION" >> $GITHUB_OUTPUT
echo "pub_date=$PUB_DATE" >> $GITHUB_OUTPUT

echo "✅ Release info extracted:"
echo "   Original tag: $TAG"
echo "   Release tag: $RELEASE_TAG"
echo "   Version: $VERSION"
echo "   Publication date: $PUB_DATE"