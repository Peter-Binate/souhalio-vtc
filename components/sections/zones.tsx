import { BUSINESS, telHref } from "@/lib/constants";

const GARES = [
  "Gares de Paris (Gare de Lyon, Montparnasse, Nord, Est, Saint-Lazare, Austerlitz…)",
  "Massy-Palaiseau",
  // À confirmer avec le client avant mise en ligne : intitulé exact (gare desservant Disneyland). Cf. ai_docs/content-reference.md.
  "Marne-la-Vallée Chessy",
  "Gare TGV de l'aéroport Roissy-Charles de Gaulle",
] as const;

export function Zones() {
  return (
    <section
      aria-labelledby="zones-heading"
      className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16"
    >
      <h2
        id="zones-heading"
        className="text-2xl font-semibold tracking-tight text-zinc-900 sm:text-3xl dark:text-zinc-50"
      >
        Une couverture complète, de {BUSINESS.city} à toute la France
      </h2>
      <p className="mt-4 max-w-2xl text-base text-zinc-600 dark:text-zinc-400">
        Basé à <strong>{BUSINESS.city} (Val-de-Marne)</strong>, votre chauffeur VTC intervient
        dans <strong>toute l&apos;Île-de-France</strong> — Paris et l&apos;ensemble des
        départements franciliens — ainsi que sur les <strong>trajets longue distance en
        province</strong>. Aucune destination n&apos;est trop loin, aucune heure n&apos;est trop
        tardive.
      </p>

      <div className="mt-6">
        <h3 className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Gares desservies
        </h3>
        <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-zinc-600 dark:text-zinc-400">
          {GARES.map((gare) => (
            <li key={gare}>{gare}</li>
          ))}
        </ul>
      </div>

      <a
        href={telHref(BUSINESS.phone)}
        className="mt-6 inline-flex min-h-11 items-center justify-center rounded-full bg-zinc-900 px-6 text-sm font-medium text-white transition-colors hover:bg-zinc-700 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
      >
        Votre adresse est-elle desservie ? 📞 Vérifiez en un appel — {BUSINESS.phone}
      </a>
    </section>
  );
}
