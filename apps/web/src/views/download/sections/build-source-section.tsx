import { REPOSITORY_URL } from "@/content/homepage";

const buildFromSource = `git clone ${REPOSITORY_URL}.git
cd ordito
pnpm install

# Run the desktop app (Tauri dev)
pnpm dev:desktop

# Build the desktop app for production
pnpm --filter @apps/desktop tauri build`;

export function BuildSourceSection() {
  return (
    <section className="mt-16">
      <h2 className="text-xl font-medium">Build from source</h2>
      <p className="mt-2 leading-7 text-muted-foreground">
        Requires Node.js 18+, pnpm, and the Rust toolchain.
      </p>
      <pre className="mt-4 overflow-x-auto rounded-lg bg-muted p-4 font-mono text-sm leading-6">
        <code>{buildFromSource}</code>
      </pre>
      <p className="mt-4 leading-7 text-muted-foreground">
        The finished binaries appear in{" "}
        <code className="font-mono">apps/desktop/src-tauri/target/release/bundle</code>
        .
      </p>
    </section>
  );
}
