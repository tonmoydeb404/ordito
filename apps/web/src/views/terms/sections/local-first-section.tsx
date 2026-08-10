import { SITE_URL } from "@/content/homepage";

export function LocalFirstSection() {
  return (
    <section className="mt-12">
      <h2 className="text-xl font-medium">Local-first</h2>
      <p className="mt-2 leading-7 text-muted-foreground">
        Ordito stores all of your commands, schedules, and run history locally
        on your device. It does not collect personal data, require an account,
        or send your data to a server. See the{" "}
        <a
          href={`${SITE_URL}/privacy`}
          className="font-medium text-primary underline underline-offset-4"
        >
          Privacy page
        </a>{" "}
        for details.
      </p>
    </section>
  );
}
