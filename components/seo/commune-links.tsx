import Link from "next/link";
import type { Commune } from "@/schemas/commune";

/** Nuage de liens vers des pages ville — brique de maillage interne des pages SEO. */
export function CommuneLinks({
  communes,
  prefix = "",
}: {
  communes: readonly Commune[];
  prefix?: string;
}) {
  return (
    <ul className="mt-6 flex flex-wrap gap-3">
      {communes.map((c) => (
        <li key={c.slug}>
          <Link
            href={`/vtc/${c.slug}`}
            className="inline-flex min-h-11 items-center rounded-standard border border-border bg-surface px-4 text-sm font-medium text-primary transition-colors hover:bg-surface-low dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50 dark:hover:bg-zinc-900"
          >
            {prefix}
            {c.nom}
          </Link>
        </li>
      ))}
    </ul>
  );
}
