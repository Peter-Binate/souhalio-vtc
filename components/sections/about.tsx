import { BUSINESS, telHref } from "@/lib/constants";

// Facts réels (BUSINESS) présentés en liste à puces, au lieu du dl d'origine —
// même donnée, traitement visuel aligné sur la maquette (aucune donnée inventée :
// pas de mention WiFi/climatisation bi-zone/coffre, absentes de lib/constants.ts).
const CHAUFFEUR_HIGHLIGHTS = [
  { icon: "language", text: `Langue : ${BUSINESS.language}` },
  { icon: "payments", text: `Paiement : ${BUSINESS.payment} à bord` },
  { icon: "event_available", text: `Disponibilité : ${BUSINESS.hours}` },
] as const;

export function About() {
  return (
    <section
      id="about"
      aria-labelledby="about-heading"
      className="bg-surface py-12 md:py-[80px] dark:bg-zinc-950"
    >
      <div className="mx-auto max-w-[1280px] space-y-16 px-6 md:space-y-24">
        {/* Bloc 1 : le chauffeur */}
        <div className="grid grid-cols-1 items-center gap-8 md:grid-cols-2">
          <div
            role="img"
            aria-label="Photo du chauffeur — à ajouter"
            className="relative order-2 aspect-[4/3] overflow-hidden rounded-card bg-surface-low md:order-1 dark:bg-zinc-900"
          />
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
              Vous voyagez à bord d&apos;une <strong>Kia Niro hybride gris foncé</strong>,
              récente, spacieuse et impeccablement entretenue. Un véhicule{" "}
              <strong>hybride à faibles émissions</strong>, silencieux et confortable, pour des
              trajets plus doux et plus respectueux de l&apos;environnement — sans rien
              sacrifier au confort.
            </p>
          </div>
          <div
            role="img"
            aria-label="Photo du véhicule — à ajouter"
            className="relative aspect-[4/3] overflow-hidden rounded-card bg-surface-low dark:bg-zinc-900"
          />
        </div>

        <div className="text-center">
          <a
            href={telHref(BUSINESS.phone)}
            className="inline-flex min-h-11 items-center gap-2 rounded-standard bg-primary px-6 text-xs font-semibold tracking-widest text-white uppercase transition-colors hover:bg-deep-midnight dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            <span aria-hidden="true" className="material-symbols-outlined text-base!">
              call
            </span>
            Réservez votre chauffeur — {BUSINESS.phone}
          </a>
        </div>
      </div>
    </section>
  );
}
