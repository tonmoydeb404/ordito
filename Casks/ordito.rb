cask "ordito" do
  arch arm: "aarch64"

  version "2.0.4"
  sha256 "e7929d29a9ffad2fcfbffb650f69d9e45848bf0edaa46c359a6c34afc6e675f2"

  url "https://github.com/tonmoydeb404/ordito/releases/download/v#{version}/Ordito_#{version}_#{arch}.dmg"
  name "Ordito"
  desc "Run saved shell commands from the system tray"
  homepage "https://github.com/tonmoydeb404/ordito"

  depends_on macos: :big_sur
  depends_on arch: :arm64

  app "Ordito.app"

  # Unsigned/un-notarized build: strip the quarantine flag Gatekeeper adds on download.
  postflight do
    system_command "/usr/bin/xattr",
                    args: ["-cr", "#{appdir}/Ordito.app"]
  end

  zap trash: [
    "~/Library/Application Support/com.tonmoydeb.ordito",
    "~/Library/Caches/com.tonmoydeb.ordito",
    "~/Library/Preferences/com.tonmoydeb.ordito.plist",
    "~/Library/Saved Application State/com.tonmoydeb.ordito.savedState",
  ]
end
