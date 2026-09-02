import { BUSINESS, telHref } from "@/lib/constants";

const SERVICES = [
  {
    title: "Réservation immédiate ou anticipée",
    text: "Un besoin urgent ou un déplacement planifié de longue date : réservez en quelques secondes par téléphone ou WhatsApp, à toute heure.",
  },
  {
    title: "Transferts aéroports",
    text: "Orly, Roissy-Charles de Gaulle et Beauvais à prix fixe, avec suivi des vols et prise en charge ponctuelle.",
  },
  {
    title: "Transferts gares",
    text: "Desserte des gares parisiennes, Massy-Palaiseau, Marne-la-Vallée Chessy et de la gare TGV de l'aéroport Roissy-CDG. Un chauffeur qui vous attend, sans stress de correspondance.",
  },
  {
    title: "Déplacements affaires",
    text: "Ponctualité, discrétion et confort pour vos rendez-vous professionnels en Île-de-France. Un chauffeur privé fiable sur qui compter au quotidien.",
  },
  {
    title: "Longue distance & province",
    text: "Au-delà de l'Île-de-France, votre chauffeur vous accompagne partout en France pour vos trajets longue distance, en toute sérénité.",
  },
  {
    title: "Disponibilité 24h/24 & 7j/7",
    text: "Jour et nuit, week-ends et jours fériés : le service ne s'arrête jamais.",
  },
] as const;

export function Services() {
  return (
    <section
      aria-labelledby="services-heading"
      className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16"
    >
      <h2
        id="services-heading"
        className="text-2xl font-semibold tracking-tight text-zinc-900 sm:text-3xl dark:text-zinc-50"
      >
        Des trajets de qualité, pour chaque besoin
      </h2>

      <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {SERVICES.map((service) => (
          <li
            key={service.title}
            className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800"
          >
            <strong className="block text-zinc-900 dark:text-zinc-50">{service.title}</strong>
            <span className="mt-1 block text-sm text-zinc-600 dark:text-zinc-400">
              {service.text}
            </span>
          </li>
        ))}
      </ul>

      <a
        href={telHref(BUSINESS.phone)}
        className="mt-6 inline-flex min-h-11 items-center justify-center rounded-full bg-zinc-900 px-6 text-sm font-medium text-white transition-colors hover:bg-zinc-700 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
      >
        Un trajet en tête ? 📞 Appelez le {BUSINESS.phone}
      </a>
    </section>
  );
}
