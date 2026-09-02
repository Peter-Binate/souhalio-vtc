import { BUSINESS, telHref, waHref } from "@/lib/constants";

type PriceEstimateProps = {
  distanceKm: number;
  durationMin: number;
  price: number;
  isFixedAirportFare: boolean;
};

export function PriceEstimate({
  distanceKm,
  durationMin,
  price,
  isFixedAirportFare,
}: PriceEstimateProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="rounded-standard border border-border bg-surface-low p-4 text-center dark:border-zinc-700 dark:bg-zinc-900"
    >
      <span className="block text-xs font-semibold tracking-widest text-muted uppercase dark:text-zinc-400">
        {isFixedAirportFare ? "Tarif fixe" : "Prix estimé"}
      </span>
      <span className="font-headline block text-2xl font-bold text-primary dark:text-zinc-50">
        {price} €
      </span>
      <p className="mt-1 text-sm text-muted dark:text-zinc-400">
        Distance : {distanceKm.toFixed(1)} km · Durée estimée : {Math.round(durationMin)} min
      </p>

      {isFixedAirportFare ? (
        <p className="mt-2 text-xs text-muted dark:text-zinc-400">
          Transfert aéroport : tarif fixe garanti, prioritaire sur l&apos;estimation calculée
          (au départ de Paris et proche banlieue).
        </p>
      ) : (
        <p className="mt-2 text-xs text-muted dark:text-zinc-400">
          Estimation indicative — votre tarif est confirmé lors de la réservation. Appelez
          pour réserver.
        </p>
      )}

      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:justify-center">
        <a
          href={telHref(BUSINESS.phone)}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-standard bg-primary px-5 text-xs font-semibold tracking-widest text-white uppercase transition-colors hover:bg-deep-midnight dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          <span aria-hidden="true" className="material-symbols-outlined text-base!">
            call
          </span>
          Appeler pour réserver — {BUSINESS.phone}
        </a>
        <a
          href={waHref(BUSINESS.whatsapp)}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-standard border border-border-input px-5 text-xs font-semibold tracking-widest text-primary uppercase transition-colors hover:bg-surface dark:border-zinc-600 dark:text-zinc-50 dark:hover:bg-zinc-800"
        >
          <span aria-hidden="true" className="material-symbols-outlined text-base!">
            chat
          </span>
          Réserver par WhatsApp
        </a>
      </div>
    </div>
  );
}
