#!/bin/sh
# Ordito installer for macOS (via Homebrew) and Ubuntu/Debian (via .deb).
# Usage:
# @brand:start usage
#   curl -fsSL https://raw.githubusercontent.com/tonmoydeb404/ordito-new/main/setup.sh | sh
#   curl -fsSL https://raw.githubusercontent.com/tonmoydeb404/ordito-new/main/setup.sh | sh -s -- v2.0.0
# @brand:end usage
set -e

TAP="tonmoydeb404/ordito-new"
TAP_URL="https://github.com/tonmoydeb404/ordito-new.git"
REPO="tonmoydeb404/ordito-new"
# Optional version tag (e.g. "v0.1.3"); defaults to the latest release.
VERSION="${1:-latest}"

release_json() {
  if [ "$VERSION" = "latest" ]; then
    curl -fsSL "https://api.github.com/repos/${REPO}/releases/latest"
  else
    curl -fsSL "https://api.github.com/repos/${REPO}/releases/tags/${VERSION}"
  fi
}

install_macos() {
  if [ "$(uname -m)" != "arm64" ]; then
    echo "Only Apple Silicon (arm64) builds are currently published."
    echo "Download other builds manually from: https://github.com/${REPO}/releases/latest"
    exit 1
  fi

  if ! command -v brew >/dev/null 2>&1; then
    echo "Homebrew is required but was not found."
    echo "Install it from https://brew.sh, then re-run this script."
    exit 1
  fi

  if [ "$VERSION" != "latest" ]; then
    echo "Note: Homebrew always installs the tap's current cask version; a"
    echo "pinned version argument is only honored for Linux installs."
  fi

  echo "==> Tapping ${TAP}..."
  brew tap "$TAP" "$TAP_URL"

  echo "==> Installing Ordito..."
  brew install --cask ordito

  echo "==> Done! Launch Ordito from /Applications/Ordito.app"
}

install_linux() {
  if [ "$(uname -m)" != "x86_64" ]; then
    echo "Only x86_64 builds are currently published for Linux."
    echo "Download other builds manually from: https://github.com/${REPO}/releases/latest"
    exit 1
  fi

  if ! command -v dpkg >/dev/null 2>&1; then
    echo "This installer only supports Debian/Ubuntu (dpkg not found)."
    echo "Download other builds manually from: https://github.com/${REPO}/releases/latest"
    exit 1
  fi

  echo "==> Fetching release info (${VERSION})..."
  RELEASE_JSON=$(release_json)

  DEB_URL=$(printf '%s' "$RELEASE_JSON" | grep -o '"browser_download_url": *"[^"]*_amd64\.deb"' | sed -E 's/.*"(https:[^"]+)"/\1/' | head -n1)

  if [ -z "$DEB_URL" ]; then
    echo "Could not find a Linux build for ${VERSION}."
    exit 1
  fi

  TMP_DEB=$(mktemp -t ordito.XXXXXX.deb)
  trap 'rm -f "$TMP_DEB"' EXIT

  echo "==> Downloading Ordito..."
  curl -fsSL "$DEB_URL" -o "$TMP_DEB"

  echo "==> Installing (requires sudo)..."
  sudo dpkg -i "$TMP_DEB" || sudo apt-get install -f -y

  echo "==> Done! Launch Ordito from your applications menu."
}

case "$(uname -s)" in
  Darwin)
    install_macos
    ;;
  Linux)
    install_linux
    ;;
  *)
    echo "This installer only supports macOS and Ubuntu/Debian. For Windows builds, see:"
    echo "https://github.com/${REPO}/releases/latest"
    exit 1
    ;;
esac
