"use client";

import { useState } from "react";
import { BUSINESS, telHref, waHref } from "@/lib/constants";
import { ItinerarySimulator } from "@/components/itinerary/itinerary-simulator";
import type { AddressValue } from "@/components/itinerary/address-autocomplete";
import { RouteMap } from "@/components/itinerary/route-map-loader";
import { useRoute } from "@/lib/use-route";
import { getFareEstimate } from "@/lib/pricing";

export function HeroItinerary() {
  const [from, setFrom] = useState<AddressValue | null>(null);
  const [to, setTo] = useState<AddressValue | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  const { mutate, data, error, isPending, reset } = useRoute();

  const canCalculate = from !== null && to !== null;

  function handleCalculate() {
    if (!from || !to) return;
    setIsEditing(false);
    mutate({ from: from.coord, to: to.coord });
  }

  function handleFromChange(value: AddressValue | null) {
    setFrom(value);
    reset();
  }

  function handleToChange(value: AddressValue | null) {
    setTo(value);
    reset();
  }

  const fare =
    data && from && to
      ? getFareEstimate(from.coord, to.coord, data.distanceKm, data.durationMin)
      : null;

  const showRecap = Boolean(data && fare && from && to && !isEditing);

  const waMessage =
    fare && from && to && data
      ? `Bonjour, je souhaite réserver une course VTC :
• Départ : ${from.label}
• Destination : ${to.label}
• ${fare.isFixedAirportFare ? "Tarif fixe" : "Estimation"} : ${fare.amount} € (${data.distanceKm.toFixed(1)} km, ~${Math.round(data.durationMin)} min).`
      : undefined;

  return (
    <section
      aria-labelledby="hero-heading"
      className="flex min-h-[calc(100dvh-4rem)] w-full items-center justify-center px-4 py-8 sm:px-6 lg:py-10"
    >
      <div className="mx-auto w-full max-w-7xl">
        <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-2 lg:gap-12 xl:gap-16">
          {showRecap && fare && data && from && to ? (
            /* ============================================================ */
            /* ÉTAT RÉCAPITULATIF : Colonne gauche (Détails course & CTAs) */
            /* ============================================================ */
            <div className="flex flex-col justify-center space-y-4 animate-in fade-in duration-300">
              <div className="inline-flex items-center gap-2 self-start rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold tracking-widest text-emerald-800 uppercase dark:bg-emerald-400/15 dark:text-emerald-300">
                <span className="h-2 w-2 rounded-full bg-emerald-600 dark:bg-emerald-400 animate-pulse" />
                Itinéraire calculé • {fare.isFixedAirportFare ? "Tarif fixe garanti" : "Estimation immédiate"}
              </div>

              <h1
                id="hero-heading"
                className="font-headline text-2xl font-semibold tracking-tight text-balance text-primary sm:text-3xl lg:text-[34px] lg:leading-[1.2] md:font-bold dark:text-zinc-50"
              >
                Votre estimation de trajet
              </h1>

              {/* Fiche trajet : Départ & Destination */}
              <div className="rounded-card border border-border bg-surface p-4 text-sm ambient-shadow dark:border-zinc-800 dark:bg-zinc-950">
                <div className="flex items-start gap-3">
                  <span
                    aria-hidden="true"
                    className="material-symbols-outlined text-primary dark:text-zinc-300 text-lg mt-0.5"
                  >
                    radio_button_checked
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-muted dark:text-zinc-400">
                      Point de départ
                    </p>
                    <p className="font-medium text-primary dark:text-zinc-100 line-clamp-2 text-sm">
                      {from.label}
                    </p>
                  </div>
                </div>

                <div className="my-1.5 ml-2.25 h-3.5 border-l-2 border-dashed border-border dark:border-zinc-700" />

                <div className="flex items-start gap-3">
                  <span
                    aria-hidden="true"
                    className="material-symbols-outlined text-accent text-lg mt-0.5"
                  >
                    location_on
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-muted dark:text-zinc-400">
                      Destination
                    </p>
                    <p className="font-medium text-primary dark:text-zinc-100 line-clamp-2 text-sm">
                      {to.label}
                    </p>
                  </div>
                </div>
              </div>

              {/* Bloc Prix & Métriques */}
              <div className="rounded-card border border-border bg-surface-low p-4 sm:p-5 dark:border-zinc-800 dark:bg-zinc-900">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <div>
                    <span className="block text-xs font-semibold tracking-widest text-muted uppercase dark:text-zinc-400">
                      {fare.isFixedAirportFare ? "Tarif fixe aéroport" : "Prix estimé"}
                    </span>
                    <span className="font-headline text-3xl font-bold text-primary sm:text-4xl dark:text-zinc-50">
                      {fare.amount} €
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-xs font-medium text-muted sm:text-sm dark:text-zinc-300">
                    <span className="inline-flex items-center gap-1">
                      <span aria-hidden="true" className="material-symbols-outlined text-base text-primary dark:text-zinc-200">
                        distance
                      </span>
                      {data.distanceKm.toFixed(1)} km
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <span aria-hidden="true" className="material-symbols-outlined text-base text-primary dark:text-zinc-200">
                        schedule
                      </span>
                      ~{Math.round(data.durationMin)} min
                    </span>
                  </div>
                </div>

                <p className="mt-2 text-xs text-muted dark:text-zinc-400">
                  {fare.isFixedAirportFare
                    ? "Transfert aéroport : tarif fixe garanti, prioritaire sur l'estimation calculée (au départ de Paris et proche banlieue)."
                    : "Estimation indicative sans engagement — votre tarif est confirmé instantanément lors de la réservation."}
                </p>
              </div>

              {/* CTAs de réservation directe */}
              <div className="flex flex-col gap-3 pt-1 sm:flex-row">
                <a
                  href={telHref(BUSINESS.phone)}
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-standard bg-primary px-5 text-xs font-semibold tracking-widest text-white uppercase transition-colors hover:bg-deep-midnight dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
                >
                  <span aria-hidden="true" className="material-symbols-outlined text-base!">
                    call
                  </span>
                  Appeler pour réserver
                </a>
                <a
                  href={waHref(BUSINESS.whatsapp, waMessage)}
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-standard border border-border-input px-5 text-xs font-semibold tracking-widest text-primary uppercase transition-colors hover:bg-surface-low dark:border-zinc-600 dark:text-zinc-50 dark:hover:bg-zinc-800"
                >
                  <span aria-hidden="true" className="material-symbols-outlined text-base!">
                    chat
                  </span>
                  Réserver par WhatsApp
                </a>
              </div>

              {/* Bouton pour modifier / recalculer */}
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="inline-flex items-center gap-1.5 self-start text-xs font-medium text-muted hover:text-primary dark:text-zinc-400 dark:hover:text-zinc-200 cursor-pointer pt-1 transition-colors"
              >
                <span aria-hidden="true" className="material-symbols-outlined text-base">
                  arrow_back
                </span>
                Modifier les adresses ou faire un autre calcul
              </button>
            </div>
          ) : (
            /* ============================================================ */
            /* ÉTAT INITIAL / ÉDITION : Colonne gauche (Pitch Hero)         */
            /* ============================================================ */
            <div className="flex flex-col justify-center space-y-3.5 md:space-y-4 animate-in fade-in duration-300">
              <p className="inline-flex items-center gap-2 self-start rounded-full bg-surface-low px-3 py-1 text-xs font-semibold tracking-widest text-muted uppercase dark:bg-zinc-900 dark:text-zinc-400">
                Chauffeur privé VTC — {BUSINESS.city} &amp; toute l&apos;Île-de-France
              </p>
              <h1
                id="hero-heading"
                className="font-headline text-3xl font-semibold tracking-tight text-balance text-primary md:text-4xl lg:text-[42px] lg:leading-[1.15] md:font-bold md:tracking-tighter dark:text-zinc-50"
              >
                Votre chauffeur VTC en Île-de-France, 24h/24 et 7j/7
              </h1>
              <p className="max-w-lg text-base text-muted dark:text-zinc-400">
                Déplacements professionnels, transferts aéroports ou trajets quotidiens. Fiabilité, discrétion et confort haut de gamme pour chacune de vos courses.
              </p>

              <div className="flex flex-col gap-3 pt-2 sm:flex-row">
                <a
                  href={telHref(BUSINESS.phone)}
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-standard bg-primary px-5 text-xs font-semibold tracking-widest text-white uppercase transition-colors hover:bg-deep-midnight dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
                >
                  <span aria-hidden="true" className="material-symbols-outlined text-base!">
                    call
                  </span>
                  Appeler pour réserver
                </a>
                <a
                  href={waHref(BUSINESS.whatsapp)}
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-standard border border-border-input px-5 text-xs font-semibold tracking-widest text-primary uppercase transition-colors hover:bg-surface-low dark:border-zinc-600 dark:text-zinc-50 dark:hover:bg-zinc-800"
                >
                  <span aria-hidden="true" className="material-symbols-outlined text-base!">
                    chat
                  </span>
                  Réserver par WhatsApp
                </a>
              </div>
              <p className="text-xs text-muted md:text-sm dark:text-zinc-400">
                Réponse rapide · Tarifs aéroport fixes · Chauffeur ponctuel
              </p>
            </div>
          )}

          {/* ============================================================ */
          /* COLONNE DROITE : Grande Carte (Récap) OU Formulaire (Initial) */
          /* ============================================================ */}
          <div className="relative z-10 w-full">
            {showRecap && data?.geometry ? (
              <div className="h-[360px] sm:h-[420px] lg:h-[480px] xl:h-[500px] w-full overflow-hidden rounded-card border border-border bg-surface ambient-shadow dark:border-zinc-800 dark:bg-zinc-950 animate-in fade-in duration-300">
                <RouteMap route={data.geometry} className="h-full w-full" />
              </div>
            ) : (
              <ItinerarySimulator
                from={from}
                to={to}
                onFromChange={handleFromChange}
                onToChange={handleToChange}
                onCalculate={handleCalculate}
                isPending={isPending}
                canCalculate={canCalculate}
                error={error}
                standalone={false}
              />
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
