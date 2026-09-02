import { BUSINESS, telHref, waHref } from "@/lib/constants";
import { ItinerarySimulator } from "@/components/itinerary/itinerary-simulator";

export function HeroItinerary() {
  return (
    <section aria-labelledby="hero-heading" className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
      <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
        Chauffeur privé VTC — {BUSINESS.city} &amp; toute l&apos;Île-de-France
      </p>
      <h1
        id="hero-heading"
        className="mt-2 max-w-2xl text-3xl font-semibold tracking-tight text-zinc-900 sm:text-4xl dark:text-zinc-50"
      >
        Votre chauffeur VTC en Île-de-France, 24h/24 et 7j/7
      </h1>
      <p className="mt-4 max-w-2xl text-base text-zinc-600 dark:text-zinc-400">
        Réservation immédiate ou anticipée, transferts aéroports à prix fixe, trajets affaires,
        gares et longue distance. Un chauffeur privé ponctuel et discret, disponible jour et
        nuit, week-ends et jours fériés, pour des déplacements sans stress dans tout
        l&apos;Île-de-France.
      </p>

      <div className="mt-8">
        <ItinerarySimulator />
      </div>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <a
          href={telHref(BUSINESS.phone)}
          className="inline-flex min-h-11 items-center justify-center rounded-full bg-zinc-900 px-6 text-sm font-medium text-white transition-colors hover:bg-zinc-700 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          📞 Appeler pour réserver — {BUSINESS.phone}
        </a>
        <a
          href={waHref(BUSINESS.whatsapp)}
          className="inline-flex min-h-11 items-center justify-center rounded-full border border-zinc-300 px-6 text-sm font-medium text-zinc-900 transition-colors hover:bg-zinc-100 dark:border-zinc-600 dark:text-zinc-50 dark:hover:bg-zinc-800"
        >
          💬 Réserver par WhatsApp
        </a>
      </div>
      <p className="mt-3 text-sm text-zinc-500 dark:text-zinc-400">
        Réponse rapide · Tarifs aéroport fixes · Chauffeur ponctuel
      </p>
    </section>
  );
}
