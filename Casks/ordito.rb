cask "ordito" do
  arch arm: "aarch64"

  version "2.0.1"
  sha256 "f127094b9f53e32e025cd997ee9abad5bb9aae429f303647da65387ed853106e"

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
