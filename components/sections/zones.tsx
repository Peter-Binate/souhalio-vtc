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
      className="border-t border-border bg-surface-low py-12 md:py-20 dark:border-zinc-800 dark:bg-zinc-900/40"
    >
      <div className="mx-auto max-w-7xl px-6">
        <h2
          id="zones-heading"
          className="font-headline text-2xl font-semibold text-primary md:text-3xl dark:text-zinc-50"
        >
          Une couverture complète, de {BUSINESS.city} à toute la France
        </h2>
        <p className="mt-4 max-w-2xl text-lg text-muted dark:text-zinc-400">
          Basé à <strong>{BUSINESS.city} (Val-de-Marne)</strong>, votre chauffeur VTC intervient
          dans <strong>toute l&apos;Île-de-France</strong> — Paris et l&apos;ensemble des
          départements franciliens — ainsi que sur les <strong>trajets longue distance en
          province</strong>. Aucune destination n&apos;est trop loin, aucune heure n&apos;est
          trop tardive.
        </p>

        <div className="mt-8 rounded-card border border-border bg-surface p-6 ambient-shadow md:p-8 dark:border-zinc-800 dark:bg-zinc-950">
          <h3 className="text-xs font-semibold tracking-widest text-muted uppercase dark:text-zinc-400">
            Gares desservies
          </h3>
          <ul className="mt-4 space-y-3">
            {GARES.map((gare) => (
              <li key={gare} className="flex items-center gap-3">
                <span aria-hidden="true" className="material-symbols-outlined text-accent">
                  train
                </span>
                <span className="text-sm text-foreground dark:text-zinc-300">{gare}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-8">
          <a
            href={telHref(BUSINESS.phone)}
            className="inline-flex min-h-11 items-center gap-2 rounded-standard bg-primary px-6 text-xs font-semibold tracking-widest text-white uppercase transition-colors hover:bg-deep-midnight dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            <span aria-hidden="true" className="material-symbols-outlined text-base!">
              call
            </span>
            Votre adresse est-elle desservie ? Vérifiez en un appel
          </a>
        </div>
      </div>
    </section>
  );
}
