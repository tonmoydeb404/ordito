import { REPOSITORY_URL } from "@/content/homepage";

export function VerifySection() {
  return (
    <section className="mt-12">
      <h2 className="text-xl font-medium">Verify it yourself</h2>
      <p className="mt-2 leading-7 text-muted-foreground">
        Ordito is open source under the MIT License. The complete source code is
        available at{" "}
        <a
          href={REPOSITORY_URL}
          target="_blank"
          rel="noreferrer"
          className="font-medium text-primary underline underline-offset-4"
        >
          {REPOSITORY_URL.replace("https://", "")}
        </a>{" "}
        for anyone to inspect.
      </p>
    </section>
  );
}
