cask "ordito" do
  arch arm: "aarch64"

  version "0.1.3"
  sha256 "e2b7329ebb666ec8e7e6a601364d017c7415446180e59bed2ca150faa1d8d384"

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
