export function NoTransmissionSection() {
  return (
    <section className="mt-12">
      <h2 className="text-xl font-medium">What is never sent anywhere</h2>
      <ul className="mt-4 space-y-2 leading-7 text-muted-foreground">
        <li>No accounts and no sign-in.</li>
        <li>No cloud synchronization.</li>
        <li>No telemetry, analytics, or error reporting.</li>
        <li>No advertising or tracking.</li>
        <li>No automatic update checks.</li>
      </ul>
    </section>
  );
}
