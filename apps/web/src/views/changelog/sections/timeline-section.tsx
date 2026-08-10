import { changelog } from "@/content/changelog";

function formatDate(date: string) {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(date));
}

export function TimelineSection() {
  return (
    <ol className="mt-12 space-y-12">
      {changelog.map((entry) => (
        <li key={entry.version} className="relative pl-6 ring-foreground/10">
          <span
            aria-hidden="true"
            className="absolute left-0 top-2 size-2 rounded-full bg-primary"
          />
          <p className="text-sm text-muted-foreground">
            {formatDate(entry.date)}
          </p>
          <h2 className="mt-1 text-xl font-medium">{entry.version}</h2>
          <p className="mt-2 max-w-2xl leading-7 text-muted-foreground">
            {entry.summary}
          </p>
          <ul className="mt-4 space-y-2">
            {entry.highlights.map((highlight) => (
              <li
                key={highlight}
                className="flex gap-2 leading-7 text-muted-foreground"
              >
                <span aria-hidden="true" className="mt-2.5 size-1.5 shrink-0 rounded-full bg-muted-foreground/50" />
                {highlight}
              </li>
            ))}
          </ul>
        </li>
      ))}
    </ol>
  );
}
