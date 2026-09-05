import Link from "next/link";
import { legOf, type LegKey } from "@/lib/communes";
import type { Commune } from "@/schemas/commune";

export type LegColumn = { key: LegKey; label: string };

/**
 * Tableau « distance / durée depuis chaque commune » vers un ou plusieurs points de
 * référence. C'est le contenu réellement unique des pages département et aéroport :
 * les valeurs viennent d'itinéraires OpenRouteService précalculés (data/communes.json).
 * Chaque ligne est aussi un lien vers la page ville → maillage interne.
 */
export function CommuneTable({
  communes,
  columns,
  caption,
}: {
  communes: readonly Commune[];
  columns: readonly LegColumn[];
  caption: string;
}) {
  return (
    <div className="mt-6 overflow-x-auto rounded-card border border-border bg-surface ambient-shadow dark:border-zinc-800 dark:bg-zinc-950">
      <table className="w-full border-collapse text-left text-sm">
        <caption className="sr-only">{caption}</caption>
        <thead>
          <tr className="border-b border-border dark:border-zinc-800">
            <th scope="col" className="px-4 py-3 font-semibold text-primary dark:text-zinc-50">
              Départ
            </th>
            {columns.map((col) => (
              <th
                key={col.key}
                scope="col"
                className="px-4 py-3 text-right font-semibold whitespace-nowrap text-primary dark:text-zinc-50"
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {communes.map((c) => (
            <tr key={c.slug} className="border-b border-border last:border-b-0 dark:border-zinc-800">
              <th scope="row" className="px-4 py-3 font-medium">
                <Link
                  href={`/vtc/${c.slug}`}
                  className="text-primary underline-offset-4 hover:underline dark:text-zinc-50"
                >
                  {c.nom}
                </Link>
              </th>
              {columns.map((col) => {
                const { km, min } = legOf(c, col.key);
                return (
                  <td
                    key={col.key}
                    className="px-4 py-3 text-right whitespace-nowrap text-muted dark:text-zinc-400"
                  >
                    ~{km} km · ~{min} min
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
