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
    <div className="rounded-card border border-border bg-surface p-4 sm:p-5 ambient-shadow md:p-6 dark:border-zinc-800 dark:bg-zinc-950">
      <div className="mb-2.5 flex items-center justify-between">
        <h2 className="font-headline text-lg font-semibold text-primary sm:text-xl dark:text-zinc-50">
          Estimer un trajet
        </h2>
        <span aria-hidden="true" className="material-symbols-outlined text-muted">
          calculate
        </span>
      </div>

      <p className="mb-3 text-xs leading-relaxed text-muted sm:text-sm dark:text-zinc-400">
        Indiquez votre point de départ et votre destination : l&apos;itinéraire, la distance et
        la durée s&apos;affichent instantanément. Pour un transfert aéroport, le tarif est fixe
        et connu d&apos;avance. Pour tout autre trajet, confirmez votre tarif en un appel — sans
        engagement.
      </p>

      <div className="space-y-2.5">
        <AddressAutocomplete
          label="Départ"
          placeholder="Adresse de départ"
          icon="location_on"
          value={from}
          onChange={(value) => {
            setFrom(value);
            reset();
          }}
        />
        <AddressAutocomplete
          label="Destination"
          placeholder="Adresse de destination"
          icon="near_me"
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
        className="mt-2.5 flex min-h-10 w-full items-center justify-center gap-2 rounded-standard bg-primary px-5 py-2.5 text-xs font-semibold tracking-widest text-white uppercase transition-colors hover:bg-deep-midnight disabled:cursor-not-allowed disabled:opacity-50 sm:min-h-11 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
      >
        {isPending && (
          <span
            aria-hidden="true"
            className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white dark:border-zinc-900/40 dark:border-t-zinc-900"
          />
        )}
        {isPending ? "Calcul en cours…" : "Calculer l'itinéraire"}
      </button>

      <div className="mt-2.5 overflow-hidden rounded-card">
        <RouteMap route={data?.geometry ?? null} />
      </div>

      {error && (
        <div
          role="alert"
          className="mt-4 rounded-standard border border-border bg-surface-low p-4 dark:border-zinc-700 dark:bg-zinc-900"
        >
          <p className="text-sm text-muted dark:text-zinc-300">
            Le calcul d&apos;itinéraire est momentanément indisponible. Appelez pour connaître
            votre tarif.
          </p>
          <a
            href={telHref(BUSINESS.phone)}
            className="mt-3 inline-flex min-h-11 items-center gap-2 rounded-standard bg-primary px-5 text-xs font-semibold tracking-widest text-white uppercase transition-colors hover:bg-deep-midnight dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            <span aria-hidden="true" className="material-symbols-outlined text-base!">
              call
            </span>
            Appeler pour réserver
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
