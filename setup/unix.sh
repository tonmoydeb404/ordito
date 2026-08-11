#!/bin/sh
# Ordito installer for macOS (via Homebrew) and Ubuntu/Debian (via .deb).
# Usage:
# @brand:start usage
#   curl -fsSL https://raw.githubusercontent.com/tonmoydeb404/ordito/main/setup/unix.sh | sh
#   curl -fsSL https://raw.githubusercontent.com/tonmoydeb404/ordito/main/setup/unix.sh | sh -s -- v2.0.1
# @brand:end usage
set -e

TAP="tonmoydeb404/ordito"
TAP_URL="https://github.com/tonmoydeb404/ordito.git"
REPO="tonmoydeb404/ordito"
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

  # Homebrew refuses to run as root; this installer must run as your normal user.
  if [ "$(id -u)" = "0" ]; then
    echo "This installer must run as your normal user, not root."
    echo "Homebrew cannot operate under sudo. Re-run without sudo:"
    echo "  curl -fsSL https://raw.githubusercontent.com/${REPO}/main/setup/unix.sh | sh"
    exit 1
  fi

  if [ "$VERSION" != "latest" ]; then
    echo "Note: Homebrew always installs the tap's current cask version; a"
    echo "pinned version argument is only honored for Linux installs."
  fi

  export HOMEBREW_NO_AUTO_UPDATE=1
  export HOMEBREW_NO_INSTALL_CLEANUP=1
  export HOMEBREW_NO_ENV_HINTS=1

  echo "==> Tapping ${TAP}..."
  brew tap "$TAP" "$TAP_URL"

  echo "==> Trusting ${TAP}..."
  brew trust "$TAP" 2>/dev/null || true

  echo "==> Installing Ordito into /Applications..."
  echo "    Your login password is required to complete the install."
  sudo -v
  # Keep sudo credentials fresh so a slow install never re-prompts.
  ( while true; do sudo -n true 2>/dev/null || exit; sleep 60; done ) &
  SUDO_KEEPALIVE_PID=$!
  trap 'kill "$SUDO_KEEPALIVE_PID" 2>/dev/null' EXIT

  brew install --cask ordito

  # The app is unsigned; clear macOS quarantine so it isn't flagged as damaged.
  if [ -d "/Applications/Ordito.app" ]; then
    xattr -dr com.apple.quarantine "/Applications/Ordito.app" 2>/dev/null \
      || sudo xattr -dr com.apple.quarantine "/Applications/Ordito.app" 2>/dev/null \
      || true
  fi

  kill "$SUDO_KEEPALIVE_PID" 2>/dev/null || true

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

  echo "==> Installing Ordito..."
  if [ "$(id -u)" != "0" ]; then
    echo "    Your password is required (sudo) to install system-wide."
    sudo -v
  fi
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
