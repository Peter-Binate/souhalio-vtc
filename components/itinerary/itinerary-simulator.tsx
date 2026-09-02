"use client";

import { AddressAutocomplete, type AddressValue } from "@/components/itinerary/address-autocomplete";
import { RouteMap } from "@/components/itinerary/route-map-loader";
import { PriceEstimate } from "@/components/itinerary/price-estimate";
import { useRoute } from "@/lib/use-route";
import { getFareEstimate } from "@/lib/pricing";
import { BUSINESS, telHref } from "@/lib/constants";
import { useState } from "react";

export function ItinerarySimulator() {
  const [from, setFrom] = useState<AddressValue | null>(null);
  const [to, setTo] = useState<AddressValue | null>(null);
  const { mutate, data, error, isPending, reset } = useRoute();

  const canCalculate = from !== null && to !== null;

  function handleCalculate() {
    if (!from || !to) return;
    mutate({ from: from.coord, to: to.coord });
  }

  const fare =
    data && from && to
      ? getFareEstimate(from.coord, to.coord, data.distanceKm, data.durationMin)
      : null;

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm sm:p-6 dark:border-zinc-800 dark:bg-zinc-950">
      <p className="mb-4 text-sm text-zinc-600 dark:text-zinc-400">
        Indiquez votre point de départ et votre destination : l&apos;itinéraire, la distance et
        la durée s&apos;affichent instantanément. Pour un transfert aéroport, le tarif est fixe
        et connu d&apos;avance. Pour tout autre trajet, confirmez votre tarif en un appel — sans
        engagement.
      </p>

      <div className="grid gap-4 sm:grid-cols-2">
        <AddressAutocomplete
          label="Départ"
          placeholder="Adresse de départ"
          value={from}
          onChange={(value) => {
            setFrom(value);
            reset();
          }}
        />
        <AddressAutocomplete
          label="Destination"
          placeholder="Adresse de destination"
          value={to}
          onChange={(value) => {
            setTo(value);
            reset();
          }}
        />
      </div>

      <button
        type="button"
        onClick={handleCalculate}
        disabled={!canCalculate || isPending}
        className="mt-4 flex min-h-11 w-full items-center justify-center gap-2 rounded-full bg-zinc-900 px-5 text-sm font-medium text-white transition-colors hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
      >
        {isPending && (
          <span
            aria-hidden="true"
            className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white dark:border-zinc-900/40 dark:border-t-zinc-900"
          />
        )}
        {isPending ? "Calcul en cours…" : "Calculer l'itinéraire"}
      </button>

      <div className="mt-4">
        <RouteMap route={data?.geometry ?? null} />
      </div>

      {error && (
        <div
          role="alert"
          className="mt-4 rounded-lg border border-zinc-300 bg-zinc-50 p-4 dark:border-zinc-700 dark:bg-zinc-900"
        >
          <p className="text-sm text-zinc-700 dark:text-zinc-300">
            Le calcul d&apos;itinéraire est momentanément indisponible. Appelez pour connaître
            votre tarif.
          </p>
          <a
            href={telHref(BUSINESS.phone)}
            className="mt-3 inline-flex min-h-11 items-center justify-center rounded-full bg-zinc-900 px-5 text-sm font-medium text-white transition-colors hover:bg-zinc-700 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            📞 Appeler pour réserver — {BUSINESS.phone}
          </a>
        </div>
      )}

      {fare && data && (
        <div className="mt-4">
          <PriceEstimate
            distanceKm={data.distanceKm}
            durationMin={data.durationMin}
            price={fare.amount}
            isFixedAirportFare={fare.isFixedAirportFare}
          />
        </div>
      )}
    </div>
  );
}
