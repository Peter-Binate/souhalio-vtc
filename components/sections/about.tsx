import { BUSINESS, telHref } from "@/lib/constants";

export function About() {
  return (
    <section
      aria-labelledby="about-heading"
      className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16"
    >
      <h2
        id="about-heading"
        className="text-2xl font-semibold tracking-tight text-zinc-900 sm:text-3xl dark:text-zinc-50"
      >
        Jhon Doe, votre chauffeur privé depuis 4 ans
      </h2>
      <p className="mt-4 max-w-2xl text-base text-zinc-600 dark:text-zinc-400">
        Chauffeur VTC professionnel depuis 4 ans, je me consacre à une seule mission : vous
        offrir une expérience de trajet irréprochable. Passionné par l&apos;excellence du
        service, j&apos;accorde une attention particulière à chaque client et à chaque détail.
        La ponctualité est ma règle d&apos;or : elle garantit des déplacements sans stress, en
        toute sérénité. En choisissant Jhon Doe VTC, vous optez pour un chauffeur fiable,
        discret et soucieux du détail, pour une expérience de voyage supérieure.
      </p>

      {/* Photo du véhicule à ajouter dès qu'un vrai asset sera fourni (aucun placeholder inventé). */}
      <div className="mt-6">
        <h3 className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Votre véhicule</h3>
        <p className="mt-2 max-w-2xl text-base text-zinc-600 dark:text-zinc-400">
          Vous voyagez à bord d&apos;une <strong>Kia Niro hybride gris foncé</strong>, récente,
          spacieuse et impeccablement entretenue. Un véhicule <strong>hybride à faibles
          émissions</strong>, silencieux et confortable, pour des trajets plus doux et plus
          respectueux de l&apos;environnement — sans rien sacrifier au confort.
        </p>
      </div>

      <dl className="mt-6 grid gap-2 text-sm text-zinc-600 sm:grid-cols-3 dark:text-zinc-400">
        <div>
          <dt className="font-medium text-zinc-900 dark:text-zinc-50">Langue</dt>
          <dd>{BUSINESS.language}</dd>
        </div>
        <div>
          <dt className="font-medium text-zinc-900 dark:text-zinc-50">Paiement</dt>
          <dd>{BUSINESS.payment} à bord</dd>
        </div>
        <div>
          <dt className="font-medium text-zinc-900 dark:text-zinc-50">Disponibilité</dt>
          <dd>{BUSINESS.hours}</dd>
        </div>
      </dl>

      <a
        href={telHref(BUSINESS.phone)}
        className="mt-6 inline-flex min-h-11 items-center justify-center rounded-full bg-zinc-900 px-6 text-sm font-medium text-white transition-colors hover:bg-zinc-700 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
      >
        📞 Réservez votre chauffeur — {BUSINESS.phone}
      </a>
    </section>
  );
}
