import { BUSINESS, telHref } from "@/lib/constants";

const ADVANTAGES = [
  {
    title: "Tarif transparent, sans majoration dynamique",
    text: "le prix ne s'envole pas selon la demande.",
  },
  {
    title: "Un interlocuteur unique",
    text: "vous joignez directement Jhon Doe, avant, pendant et après votre trajet.",
  },
  {
    title: "La ponctualité comme règle d'or",
    text: "anticipation des horaires et suivi des vols pour des départs sereins.",
  },
  {
    title: "Disponible 24h/24, 7j/7 et jours fériés",
    text: "un dernier train manqué, un vol de nuit, un imprévu : votre chauffeur répond.",
  },
  {
    title: "Un véhicule dédié, soigné et confortable",
    text: "vous voyagez dans les meilleures conditions.",
  },
] as const;

export function DirectBooking() {
  return (
    <section
      aria-labelledby="direct-booking-heading"
      className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16"
    >
      <h2
        id="direct-booking-heading"
        className="text-2xl font-semibold tracking-tight text-zinc-900 sm:text-3xl dark:text-zinc-50"
      >
        Réservez en direct avec votre chauffeur
      </h2>
      <p className="mt-4 max-w-2xl text-base text-zinc-600 dark:text-zinc-400">
        En réservant directement, vous parlez à votre chauffeur — pas à un algorithme. Un seul
        interlocuteur, un tarif stable et un service pensé pour votre tranquillité.
      </p>

      <ul className="mt-6 grid gap-4 sm:grid-cols-2">
        {ADVANTAGES.map((advantage) => (
          <li
            key={advantage.title}
            className="rounded-lg border border-zinc-200 p-4 text-sm text-zinc-700 dark:border-zinc-800 dark:text-zinc-300"
          >
            <strong className="block text-zinc-900 dark:text-zinc-50">{advantage.title}</strong>
            {advantage.text}
          </li>
        ))}
      </ul>

      <a
        href={telHref(BUSINESS.phone)}
        className="mt-6 inline-flex min-h-11 items-center justify-center rounded-full bg-zinc-900 px-6 text-sm font-medium text-white transition-colors hover:bg-zinc-700 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
      >
        📞 Appelez maintenant pour réserver — {BUSINESS.phone}
      </a>
    </section>
  );
}
