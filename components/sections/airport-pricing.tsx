import { AIRPORTS, AIRPORT_FARES, BUSINESS, telHref } from "@/lib/constants";

const AIRPORT_CODES = ["ORLY", "CDG", "BEAUVAIS"] as const;

export function AirportPricing() {
  return (
    <section
      id="pricing"
      aria-labelledby="airport-pricing-heading"
      className="border-y border-border bg-surface-low py-12 md:py-[80px] dark:border-zinc-800 dark:bg-zinc-900/40"
    >
      <div className="mx-auto max-w-3xl px-6">
        <div className="mb-12 text-center">
          <h2
            id="airport-pricing-heading"
            className="font-headline text-2xl font-semibold text-primary md:text-3xl dark:text-zinc-50"
          >
            Transferts aéroport à prix fixe, sans mauvaise surprise
          </h2>
          <p className="mt-4 text-lg text-muted dark:text-zinc-400">
            Fini les tarifs qui grimpent aux heures de pointe. <strong>Au départ de Paris et de
            la proche banlieue</strong>, vos transferts vers et depuis les aéroports parisiens
            sont facturés à un <strong>prix fixe, connu à l&apos;avance</strong>, quelle que
            soit l&apos;heure — y compris la nuit, le week-end et les jours fériés. Vous
            réservez l&apos;esprit tranquille, votre chauffeur vous attend à l&apos;heure.
          </p>
        </div>

        <div className="relative overflow-hidden rounded-card border border-border bg-surface p-8 ambient-shadow dark:border-zinc-800 dark:bg-zinc-950">
          <span
            aria-hidden="true"
            className="material-symbols-outlined pointer-events-none absolute top-0 right-0 p-6 text-[120px] text-primary opacity-10 dark:text-zinc-50"
          >
            flight_takeoff
          </span>

          <table className="relative z-10 w-full border-collapse text-left">
            <caption className="sr-only">
              Tarifs fixes aéroport, au départ de Paris et proche banlieue
            </caption>
            <thead>
              <tr>
                <th scope="col" className="sr-only">
                  Aéroport
                </th>
                <th scope="col" className="sr-only">
                  Tarif fixe (Paris &amp; proche banlieue)
                </th>
              </tr>
            </thead>
            <tbody>
              {AIRPORT_CODES.map((code, index) => (
                <tr
                  key={code}
                  className={
                    index < AIRPORT_CODES.length - 1
                      ? "border-b border-border dark:border-zinc-800"
                      : ""
                  }
                >
                  <td className="py-4">
                    <span className="flex items-center gap-3">
                      <span
                        aria-hidden="true"
                        className="material-symbols-outlined text-accent"
                      >
                        flight_takeoff
                      </span>
                      <span className="font-semibold text-primary dark:text-zinc-50">
                        {AIRPORTS[code].name}
                      </span>
                    </span>
                  </td>
                  <td className="py-4 text-right">
                    <span className="font-headline text-2xl font-bold text-primary dark:text-zinc-50">
                      {AIRPORT_FARES[code]} €
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <p className="relative z-10 mt-6 text-sm text-muted dark:text-zinc-400">
            Suivi des vols et prise en charge ponctuelle à l&apos;arrivée comme au départ.
            Tarif sur devis au-delà de la proche banlieue.
          </p>

          <div className="relative z-10 mt-8 text-center">
            <a
              href={telHref(BUSINESS.phone)}
              className="inline-flex min-h-11 items-center gap-2 rounded-standard bg-accent px-8 py-4 text-xs font-semibold tracking-widest text-primary uppercase transition-colors hover:opacity-90"
            >
              <span aria-hidden="true" className="material-symbols-outlined text-base">
                call
              </span>
              Réservez votre transfert aéroport — {BUSINESS.phone}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
