#!/bin/bash
# scripts/validate-json.sh

set -e

JSON_FILE="${1:-latest.json}"

echo "🔍 Validating JSON file: $JSON_FILE"

# Check if file exists
if [ ! -f "$JSON_FILE" ]; then
    echo "❌ JSON file not found: $JSON_FILE"
    exit 1
fi

# Check file size
FILE_SIZE=$(stat -c%s "$JSON_FILE" 2>/dev/null || stat -f%z "$JSON_FILE" 2>/dev/null || echo "0")
if [ "$FILE_SIZE" -eq 0 ]; then
    echo "❌ JSON file is empty!"
    exit 1
fi

echo "📏 File size: $FILE_SIZE bytes"

# Validate JSON syntax
echo "🔧 Checking JSON syntax..."
if ! jq empty "$JSON_FILE" 2>/dev/null; then
    echo "❌ Invalid JSON syntax!"
    echo "File contents:"
    cat "$JSON_FILE"
    exit 1
fi

# Check required fields
echo "📋 Validating required fields..."

VERSION=$(jq -r '.version // empty' "$JSON_FILE")
if [ -z "$VERSION" ]; then
    echo "❌ Missing or empty 'version' field!"
    exit 1
fi

PLATFORMS_COUNT=$(jq -r '.platforms | length' "$JSON_FILE")
if [ "$PLATFORMS_COUNT" = "0" ]; then
    echo "❌ No platforms found in JSON!"
    exit 1
fi

PUB_DATE=$(jq -r '.pub_date // empty' "$JSON_FILE")
NOTES=$(jq -r '.notes // empty' "$JSON_FILE")

# Validate each platform
echo "🖥️  Validating platforms..."
PLATFORM_IDS=$(jq -r '.platforms | keys[]' "$JSON_FILE")

for platform in $PLATFORM_IDS; do
    echo "   Checking platform: $platform"
    
    SIGNATURE=$(jq -r ".platforms[\"$platform\"].signature // empty" "$JSON_FILE")
    URL=$(jq -r ".platforms[\"$platform\"].url // empty" "$JSON_FILE")
    
    if [ -z "$SIGNATURE" ]; then
        echo "   ❌ Missing signature for platform: $platform"
        exit 1
    fi
    
    if [ -z "$URL" ]; then
        echo "   ❌ Missing URL for platform: $platform"
        exit 1
    fi
    
    # Basic URL validation
    if [[ ! "$URL" =~ ^https?:// ]]; then
        echo "   ❌ Invalid URL format for platform $platform: $URL"
        exit 1
    fi
    
    echo "   ✅ Platform $platform is valid"
done

echo ""
echo "✅ JSON validation passed!"
echo ""
echo "📊 Summary:"
echo "   Version: $VERSION"
echo "   Platforms: $PLATFORMS_COUNT ($PLATFORM_IDS)"
echo "   Publication date: $PUB_DATE"
echo "   Notes: $(echo "$NOTES" | cut -c1-50)..."

echo ""
echo "📄 JSON structure preview:"
jq '.' "$JSON_FILE"