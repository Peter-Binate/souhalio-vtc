import { AIRPORTS, AIRPORT_FARES, BUSINESS, telHref } from "@/lib/constants";

const AIRPORT_CODES = ["ORLY", "CDG", "BEAUVAIS"] as const;

export function AirportPricing() {
  return (
    <section
      aria-labelledby="airport-pricing-heading"
      className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16"
    >
      <h2
        id="airport-pricing-heading"
        className="text-2xl font-semibold tracking-tight text-zinc-900 sm:text-3xl dark:text-zinc-50"
      >
        Transferts aéroport à prix fixe, sans mauvaise surprise
      </h2>
      <p className="mt-4 max-w-2xl text-base text-zinc-600 dark:text-zinc-400">
        Fini les tarifs qui grimpent aux heures de pointe. <strong>Au départ de Paris et de la
        proche banlieue</strong>, vos transferts vers et depuis les aéroports parisiens sont
        facturés à un <strong>prix fixe, connu à l&apos;avance</strong>, quelle que soit
        l&apos;heure — y compris la nuit, le week-end et les jours fériés. Vous réservez
        l&apos;esprit tranquille, votre chauffeur vous attend à l&apos;heure.
      </p>

      <div className="mt-6 overflow-x-auto">
        <table className="w-full max-w-xl border-collapse text-left text-sm">
          <caption className="sr-only">
            Tarifs fixes aéroport, au départ de Paris et proche banlieue
          </caption>
          <thead>
            <tr className="border-b border-zinc-200 dark:border-zinc-700">
              <th scope="col" className="py-2 pr-4 font-medium text-zinc-600 dark:text-zinc-400">
                Aéroport
              </th>
              <th scope="col" className="py-2 font-medium text-zinc-600 dark:text-zinc-400">
                Tarif fixe (Paris &amp; proche banlieue)
              </th>
            </tr>
          </thead>
          <tbody>
            {AIRPORT_CODES.map((code) => (
              <tr key={code} className="border-b border-zinc-100 dark:border-zinc-800">
                <td className="py-2 pr-4 text-zinc-900 dark:text-zinc-50">
                  {AIRPORTS[code].name}
                </td>
                <td className="py-2 font-semibold text-zinc-900 dark:text-zinc-50">
                  {AIRPORT_FARES[code]} €
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="mt-4 text-sm text-zinc-500 dark:text-zinc-400">
        Suivi des vols et prise en charge ponctuelle à l&apos;arrivée comme au départ. Tarif sur
        devis au-delà de la proche banlieue.
      </p>

      <a
        href={telHref(BUSINESS.phone)}
        className="mt-6 inline-flex min-h-11 items-center justify-center rounded-full bg-zinc-900 px-6 text-sm font-medium text-white transition-colors hover:bg-zinc-700 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
      >
        📞 Réservez votre transfert aéroport — {BUSINESS.phone}
      </a>
    </section>
  );
}
