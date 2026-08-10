export function BeforeFilingSection() {
  return (
    <section className="mt-16">
      <h2 className="text-xl font-medium">Before you file an issue</h2>
      <ul className="mt-4 space-y-2 leading-7 text-muted-foreground">
        <li>
          Confirm the command runs as expected in a normal terminal first.
        </li>
        <li>
          Note the command&apos;s working directory and environment, and the
          exit code and output shown in History.
        </li>
        <li>
          Include your OS (macOS or Windows) and where you installed Ordito.
        </li>
      </ul>
    </section>
  );
}
