import Image from "next/image";
import { BUSINESS, telHref } from "@/lib/constants";

// Facts réels (BUSINESS) présentés en liste à puces, au lieu du dl d'origine —
// même donnée, traitement visuel aligné sur la maquette (aucune donnée inventée :
// pas de mention WiFi/climatisation bi-zone/coffre, absentes de lib/constants.ts).
const CHAUFFEUR_HIGHLIGHTS = [
  { icon: "language", text: `Langue : ${BUSINESS.language}` },
  { icon: "payments", text: `Paiement : ${BUSINESS.payment} à bord` },
  { icon: "event_available", text: `Disponibilité : ${BUSINESS.hours}` },
] as const;

const VEHICLE_FEATURES = [
  {
    icon: "eco",
    label: "Motorisation Hybride",
  },
  {
    icon: "wifi",
    label: "Wi-Fi & Chargeurs",
  },
  {
    icon: "ac_unit",
    label: "Climatisation Bi-zone",
  },
  {
    icon: "luggage",
    label: "Coffre Spacieux",
  },
] as const;

export function About() {
  return (
    <section
      id="about"
      aria-labelledby="about-heading"
      className="bg-surface py-12 md:py-20 dark:bg-zinc-950"
    >
      <div className="mx-auto max-w-7xl space-y-16 px-6 md:space-y-24">
        {/* Bloc 1 : le chauffeur */}
        <div className="grid grid-cols-1 items-center gap-8 md:grid-cols-2">
          <div className="relative order-2 aspect-4/3 overflow-hidden rounded-card bg-surface-low md:order-1 dark:bg-zinc-900">
            <Image
              src="/images/chauffeur.jpg"
              alt={`Chauffeur privé VTC ${BUSINESS.city}`}
              fill
              sizes="(min-width: 768px) 50vw, 100vw"
              className="object-cover"
            />
          </div>
          <div className="order-1 space-y-6 md:order-2 md:pl-12">
            <h2
              id="about-heading"
              className="font-headline text-2xl font-semibold text-primary md:text-3xl dark:text-zinc-50"
            >
              Jhon Doe, votre chauffeur privé depuis 4 ans
            </h2>
            <p className="text-lg text-muted dark:text-zinc-400">
              Chauffeur VTC professionnel depuis 4 ans, je me consacre à une seule mission :
              vous offrir une expérience de trajet irréprochable. Passionné par l&apos;excellence
              du service, j&apos;accorde une attention particulière à chaque client et à chaque
              détail. La ponctualité est ma règle d&apos;or : elle garantit des déplacements
              sans stress, en toute sérénité. En choisissant Jhon Doe VTC, vous optez pour un
              chauffeur fiable, discret et soucieux du détail, pour une expérience de voyage
              supérieure.
            </p>
            <ul className="space-y-3">
              {CHAUFFEUR_HIGHLIGHTS.map((item) => (
                <li key={item.text} className="flex items-center gap-3">
                  <span aria-hidden="true" className="material-symbols-outlined text-primary dark:text-zinc-50">
                    {item.icon}
                  </span>
                  <span className="text-sm text-foreground dark:text-zinc-300">{item.text}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bloc 2 : le véhicule */}
        <div className="grid grid-cols-1 items-center gap-8 md:grid-cols-2">
          <div className="space-y-6 md:pr-12">
            <h3 className="font-headline text-2xl font-semibold text-primary md:text-3xl dark:text-zinc-50">
              Le Véhicule : Kia Niro Hybride
            </h3>
            <p className="text-lg text-muted dark:text-zinc-400">
              Voyagez à bord d&apos;un SUV moderne, spacieux et éco-responsable. Le Kia Niro Hybride
              gris foncé offre une isolation acoustique premium et un confort d&apos;assise idéal
              pour se détendre ou travailler pendant le trajet.
            </p>
            <div className="grid grid-cols-2 gap-3 pt-2 sm:gap-4">
              {VEHICLE_FEATURES.map((item) => (
                <div
                  key={item.label}
                  className="flex flex-col items-center justify-center rounded-standard border border-border bg-surface p-4 text-center dark:border-zinc-800 dark:bg-zinc-900"
                >
                  <span
                    aria-hidden="true"
                    className="material-symbols-outlined mb-2 text-2xl text-primary dark:text-zinc-50"
                  >
                    {item.icon}
                  </span>
                  <p className="text-xs font-semibold tracking-wider text-foreground uppercase dark:text-zinc-300">
                    {item.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
          <div className="relative aspect-4/3 overflow-hidden rounded-card bg-surface-low dark:bg-zinc-900">
            <Image
              src="/images/kia-niro.jpg"
              alt="Kia Niro hybride gris foncé chauffeur VTC Île-de-France"
              fill
              sizes="(min-width: 768px) 50vw, 100vw"
              className="object-cover"
            />
          </div>
        </div>

        <div className="text-center">
          <a
            href={telHref(BUSINESS.phone)}
            className="inline-flex min-h-11 items-center gap-2 rounded-standard bg-primary px-6 text-xs font-semibold tracking-widest text-white uppercase transition-colors hover:bg-deep-midnight dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            <span aria-hidden="true" className="material-symbols-outlined text-base!">
              call
            </span>
            Réservez votre chauffeur
          </a>
        </div>
      </div>
    </section>
  );
}
