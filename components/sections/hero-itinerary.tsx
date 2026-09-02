import { BUSINESS, telHref, waHref } from "@/lib/constants";
import { ItinerarySimulator } from "@/components/itinerary/itinerary-simulator";

export function HeroItinerary() {
  return (
    <section
      aria-labelledby="hero-heading"
      className="mx-auto max-w-[1280px] px-6 pt-12 pb-12 md:pt-[80px] md:pb-[80px]"
    >
      <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-2 lg:gap-16">
        <div className="space-y-4">
          <p className="inline-flex items-center gap-2 rounded-full bg-surface-low px-3 py-1 text-xs font-semibold tracking-widest text-muted uppercase dark:bg-zinc-900 dark:text-zinc-400">
            Chauffeur privé VTC — {BUSINESS.city} &amp; toute l&apos;Île-de-France
          </p>
          <h1
            id="hero-heading"
            className="font-headline text-3xl font-semibold tracking-tight text-balance text-primary md:text-5xl md:font-bold md:tracking-tighter dark:text-zinc-50"
          >
            Votre chauffeur VTC en Île-de-France, 24h/24 et 7j/7
          </h1>
          <p className="max-w-lg text-lg text-muted dark:text-zinc-400">
            Réservation immédiate ou anticipée, transferts aéroports à prix fixe, trajets
            affaires, gares et longue distance. Un chauffeur privé ponctuel et discret,
            disponible jour et nuit, week-ends et jours fériés, pour des déplacements sans
            stress dans tout l&apos;Île-de-France.
          </p>

          <div className="flex flex-col gap-3 pt-4 sm:flex-row">
            <a
              href={telHref(BUSINESS.phone)}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-standard bg-primary px-6 text-xs font-semibold tracking-widest text-white uppercase transition-colors hover:bg-deep-midnight dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
            >
              <span aria-hidden="true" className="material-symbols-outlined text-base!">
                call
              </span>
              Appeler pour réserver — {BUSINESS.phone}
            </a>
            <a
              href={waHref(BUSINESS.whatsapp)}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-standard border border-border-input px-6 text-xs font-semibold tracking-widest text-primary uppercase transition-colors hover:bg-surface-low dark:border-zinc-600 dark:text-zinc-50 dark:hover:bg-zinc-800"
            >
              <span aria-hidden="true" className="material-symbols-outlined text-base!">
                chat
              </span>
              Réserver par WhatsApp
            </a>
          </div>
          <p className="text-sm text-muted dark:text-zinc-400">
            Réponse rapide · Tarifs aéroport fixes · Chauffeur ponctuel
          </p>
        </div>

        <div className="relative z-10">
          <ItinerarySimulator />
        </div>
      </div>
    </section>
  );
}
