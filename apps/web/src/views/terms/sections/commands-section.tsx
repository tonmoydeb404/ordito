export function CommandsSection() {
  return (
    <section className="mt-12">
      <h2 className="text-xl font-medium">Your commands are your responsibility</h2>
      <p className="mt-2 leading-7 text-muted-foreground">
        Ordito runs the shell commands you choose to save. Those commands can
        do anything a normal shell command can, including modifying files and
        making network requests. You are responsible for the commands you run
        and their results.
      </p>
    </section>
  );
}
