import { BUSINESS, telHref } from "@/lib/constants";

const ADVANTAGES = [
  {
    title: "Tarif transparent, sans majoration dynamique",
    text: "le prix ne s'envole pas selon la demande.",
    icon: "payments",
    span: "lg:col-span-2",
    dark: false,
    wide: false,
  },
  {
    title: "Un interlocuteur unique",
    text: "vous joignez directement Jhon Doe, avant, pendant et après votre trajet.",
    icon: "person",
    span: "lg:col-span-1",
    dark: true,
    wide: false,
  },
  {
    title: "La ponctualité comme règle d'or",
    text: "anticipation des horaires et suivi des vols pour des départs sereins.",
    icon: "schedule",
    span: "lg:col-span-2",
    dark: false,
    wide: false,
  },
  {
    title: "Un véhicule dédié, soigné et confortable",
    text: "vous voyagez dans les meilleures conditions.",
    icon: "directions_car",
    span: "lg:col-span-3",
    dark: false,
    wide: true,
  },
  {
    title: "Disponible 24h/24, 7j/7 et jours fériés",
    text: "un dernier train manqué, un vol de nuit, un imprévu : votre chauffeur répond.",
    icon: "event_available",
    span: "lg:col-span-2",
    dark: false,
    wide: false,
  },
] as const;

export function DirectBooking() {
  return (
    <section
      aria-labelledby="direct-booking-heading"
      className="mx-auto max-w-[1280px] px-6 py-12 md:py-[80px]"
    >
      <div className="mb-12 text-center">
        <h2
          id="direct-booking-heading"
          className="font-headline text-2xl font-semibold text-primary md:text-3xl dark:text-zinc-50"
        >
          Réservez en direct avec votre chauffeur
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-muted dark:text-zinc-400">
          En réservant directement, vous parlez à votre chauffeur — pas à un algorithme. Un
          seul interlocuteur, un tarif stable et un service pensé pour votre tranquillité.
        </p>
      </div>

      <ul className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-5">
        {ADVANTAGES.map((advantage) => (
          <li
            key={advantage.title}
            className={`hover-lift rounded-card border p-6 ${advantage.span} ${
              advantage.dark
                ? "border-primary bg-primary text-white"
                : "border-border bg-surface dark:border-zinc-800 dark:bg-zinc-950"
            } ${advantage.wide ? "flex items-center gap-6" : ""}`}
          >
            {advantage.wide ? (
              <>
                <span
                  aria-hidden="true"
                  className="material-symbols-outlined hidden rounded-full bg-surface-low p-4 text-4xl text-primary md:block dark:bg-zinc-900 dark:text-zinc-50"
                >
                  {advantage.icon}
                </span>
                <div>
                  <strong className="mb-2 block text-lg font-semibold text-primary dark:text-zinc-50">
                    {advantage.title}
                  </strong>
                  <span className="text-sm text-muted dark:text-zinc-400">{advantage.text}</span>
                </div>
              </>
            ) : (
              <>
                <span
                  aria-hidden="true"
                  className={`material-symbols-outlined mb-4 block text-3xl ${advantage.dark ? "text-accent" : "text-primary dark:text-zinc-50"}`}
                >
                  {advantage.icon}
                </span>
                <strong className="mb-2 block text-lg font-semibold">{advantage.title}</strong>
                <span
                  className={`text-sm ${advantage.dark ? "text-zinc-300" : "text-muted dark:text-zinc-400"}`}
                >
                  {advantage.text}
                </span>
              </>
            )}
          </li>
        ))}
      </ul>

      <div className="mt-8 text-center">
        <a
          href={telHref(BUSINESS.phone)}
          className="inline-flex min-h-11 items-center gap-2 rounded-standard bg-primary px-6 text-xs font-semibold tracking-widest text-white uppercase transition-colors hover:bg-deep-midnight dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          <span aria-hidden="true" className="material-symbols-outlined text-base">
            call
          </span>
          Appelez maintenant pour réserver — {BUSINESS.phone}
        </a>
      </div>
    </section>
  );
}
