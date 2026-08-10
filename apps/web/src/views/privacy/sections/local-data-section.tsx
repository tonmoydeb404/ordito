export function LocalDataSection() {
  return (
    <section className="mt-12">
      <h2 className="text-xl font-medium">What stays on your device</h2>
      <p className="mt-2 leading-7 text-muted-foreground">
        Everything you create is kept in a local SQLite database in your
        operating system&apos;s standard application data directory:
      </p>
      <ul className="mt-4 space-y-2 leading-7 text-muted-foreground">
        <li>Command names, shell instructions, and working directories.</li>
        <li>Groups, search state, and configuration.</li>
        <li>Recurring and one-time schedules.</li>
        <li>
          Full run history: status, start time, duration, exit codes, and
          captured output.
        </li>
      </ul>
    </section>
  );
}
