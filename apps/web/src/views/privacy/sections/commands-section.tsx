export function CommandsSection() {
  return (
    <section className="mt-12">
      <h2 className="text-xl font-medium">Your commands are your own</h2>
      <p className="mt-2 leading-7 text-muted-foreground">
        Ordito runs the shell commands you choose to save. Those commands can
        do anything a normal shell command can, including making network
        requests. That behavior comes from your commands, not from Ordito —
        Ordito itself does not transmit command data or run history to any
        server.
      </p>
    </section>
  );
}
