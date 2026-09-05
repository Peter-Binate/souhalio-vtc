import Link from "next/link";

export type Crumb = { name: string; path: string };

/** Fil d'Ariane visible — accompagne le balisage BreadcrumbList (lib/jsonld.ts). */
export function Breadcrumb({ items }: { items: readonly Crumb[] }) {
  return (
    <nav aria-label="Fil d'Ariane" className="text-xs text-muted dark:text-zinc-400">
      <ol className="flex flex-wrap items-center gap-x-2 gap-y-1">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <li key={item.path} className="flex items-center gap-2">
              {isLast ? (
                <span aria-current="page">{item.name}</span>
              ) : (
                <Link href={item.path} className="underline-offset-4 hover:underline">
                  {item.name}
                </Link>
              )}
              {!isLast && <span aria-hidden="true">›</span>}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
