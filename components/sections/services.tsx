import { BUSINESS, telHref } from "@/lib/constants";

const SERVICES = [
  {
    title: "Réservation immédiate ou anticipée",
    text: "Un besoin urgent ou un déplacement planifié de longue date : réservez en quelques secondes par téléphone ou WhatsApp, à toute heure.",
    icon: "bolt",
  },
  {
    title: "Transferts aéroports",
    text: "Orly, Roissy-Charles de Gaulle et Beauvais à prix fixe, avec suivi des vols et prise en charge ponctuelle.",
    icon: "flight",
  },
  {
    title: "Transferts gares",
    text: "Desserte des gares parisiennes, Massy-Palaiseau, Marne-la-Vallée Chessy et de la gare TGV de l'aéroport Roissy-CDG. Un chauffeur qui vous attend, sans stress de correspondance.",
    icon: "train",
  },
  {
    title: "Déplacements affaires",
    text: "Ponctualité, discrétion et confort pour vos rendez-vous professionnels en Île-de-France. Un chauffeur privé fiable sur qui compter au quotidien.",
    icon: "work",
  },
  {
    title: "Longue distance & province",
    text: "Au-delà de l'Île-de-France, votre chauffeur vous accompagne partout en France pour vos trajets longue distance, en toute sérénité.",
    icon: "map",
  },
  {
    title: "Disponibilité 24h/24 & 7j/7",
    text: "Jour et nuit, week-ends et jours fériés : le service ne s'arrête jamais.",
    icon: "schedule",
  },
] as const;

export function Services() {
  return (
    <section
      id="services"
      aria-labelledby="services-heading"
      className="border-t border-border bg-surface py-12 md:py-[80px] dark:border-zinc-800 dark:bg-zinc-950"
    >
      <div className="mx-auto max-w-[1280px] px-6">
        <h2
          id="services-heading"
          className="font-headline mb-12 text-center text-2xl font-semibold text-primary md:text-3xl dark:text-zinc-50"
        >
          Des trajets de qualité, pour chaque besoin
        </h2>

        <ul className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {SERVICES.map((service) => (
            <li key={service.title} className="group flex flex-col gap-4">
              <span
                aria-hidden="true"
                className="flex h-12 w-12 items-center justify-center rounded-standard bg-surface-low text-primary transition-colors group-hover:bg-primary group-hover:text-white dark:bg-zinc-900 dark:text-zinc-50"
              >
                <span className="material-symbols-outlined">{service.icon}</span>
              </span>
              <strong className="font-headline text-lg font-bold text-primary dark:text-zinc-50">
                {service.title}
              </strong>
              <span className="text-sm text-muted dark:text-zinc-400">{service.text}</span>
            </li>
          ))}
        </ul>

        <div className="mt-12 text-center">
          <a
            href={telHref(BUSINESS.phone)}
            className="inline-flex min-h-11 items-center gap-2 rounded-standard bg-primary px-6 text-xs font-semibold tracking-widest text-white uppercase transition-colors hover:bg-deep-midnight dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            <span aria-hidden="true" className="material-symbols-outlined text-base!">
              call
            </span>
            Un trajet en tête ? Appelez le {BUSINESS.phone}
          </a>
        </div>
      </div>
    </section>
  );
}
