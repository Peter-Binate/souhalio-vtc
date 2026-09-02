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
      className="rounded-lg border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-700 dark:bg-zinc-900"
    >
      <p className="text-base text-zinc-900 dark:text-zinc-50">
        Distance : {distanceKm.toFixed(1)} km · Durée estimée : {Math.round(durationMin)} min ·{" "}
        <strong>
          {isFixedAirportFare ? "Tarif fixe" : "Estimation"} : {price} €
        </strong>
      </p>

      {isFixedAirportFare ? (
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          Transfert aéroport : tarif fixe garanti, prioritaire sur l&apos;estimation calculée
          (au départ de Paris et proche banlieue).
        </p>
      ) : (
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          Estimation indicative — votre tarif est confirmé lors de la réservation. Appelez
          pour réserver.
        </p>
      )}

      <div className="mt-4 flex flex-col gap-3 sm:flex-row">
        <a
          href={telHref(BUSINESS.phone)}
          className="inline-flex min-h-11 items-center justify-center rounded-full bg-zinc-900 px-5 text-sm font-medium text-white transition-colors hover:bg-zinc-700 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          📞 Appeler pour réserver — {BUSINESS.phone}
        </a>
        <a
          href={waHref(BUSINESS.whatsapp)}
          className="inline-flex min-h-11 items-center justify-center rounded-full border border-zinc-300 px-5 text-sm font-medium text-zinc-900 transition-colors hover:bg-zinc-100 dark:border-zinc-600 dark:text-zinc-50 dark:hover:bg-zinc-800"
        >
          💬 Réserver par WhatsApp
        </a>
      </div>
    </div>
  );
}
