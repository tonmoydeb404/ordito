import Link from "next/link";

type Props = {
  title: string;
  description: string;
  href: string;
};

export const LinkCard = (props: Props) => {
  return (
    <Link
      href={props.href}
      className="group flex items-center justify-between gap-4 rounded-lg p-5 transition-colors hover:bg-muted bg-card border hover:border-primary"
    >
      <div>
        <h2 className="text-base font-medium capitalize">{props.title}</h2>
        <p className="mt-1 text-sm leading-6 text-muted-foreground">
          {props.description}
        </p>
      </div>
    </Link>
  );
};
