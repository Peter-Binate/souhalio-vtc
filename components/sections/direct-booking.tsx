import { BUSINESS, telHref } from "@/lib/constants";

const ADVANTAGES = [
  {
    title: "Sécurité & Confiance",
    text: "Chauffeur professionnel agréé, véhicule régulièrement révisé pour votre tranquillité.",
    icon: "verified_user",
    span: "lg:col-span-2",
    dark: false,
    wide: false,
  },
  {
    title: "Service Personnalisé",
    text: "À l'écoute de vos besoins spécifiques.",
    icon: "person",
    span: "lg:col-span-1",
    dark: true,
    wide: false,
  },
  {
    title: "Ponctualité Absolue",
    text: "Votre temps est précieux. Nous garantissons une arrivée en avance à chaque rendez-vous.",
    icon: "schedule",
    span: "lg:col-span-2",
    dark: false,
    wide: false,
  },
  {
    title: "Tarif transparent, sans majoration dynamique",
    text: "Le prix ne s'envole pas selon la demande : tarif fixe et connu d'avance, sans mauvaise surprise.",
    icon: "payments",
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
      className="mx-auto max-w-7xl px-6 py-12 md:py-16"
    >
      <div className="mb-10 text-center">
        <h2
          id="direct-booking-heading"
          className="font-headline text-2xl font-semibold text-primary md:text-3xl dark:text-zinc-50"
        >
          Pourquoi nous choisir ?
        </h2>
      </div>

      <ul className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-5">
        {ADVANTAGES.map((advantage) => (
          <li
            key={advantage.title}
            className={`hover-lift rounded-card border p-5 ${advantage.span} ${
              advantage.dark
                ? "border-primary bg-primary text-white"
                : "border-border bg-surface dark:border-zinc-800 dark:bg-zinc-950"
            } ${advantage.wide ? "flex items-center gap-4 sm:gap-5" : "flex flex-col justify-start"}`}
          >
            {advantage.wide ? (
              <>
                <div className="hidden rounded-xl bg-surface-low p-3 md:block dark:bg-zinc-900">
                  <span
                    aria-hidden="true"
                    className="material-symbols-outlined block text-3xl text-primary dark:text-zinc-50"
                  >
                    {advantage.icon}
                  </span>
                </div>
                <div>
                  <strong className="mb-1 block text-base font-semibold text-primary sm:text-lg dark:text-zinc-50">
                    {advantage.title}
                  </strong>
                  <span className="text-sm text-muted dark:text-zinc-400">{advantage.text}</span>
                </div>
              </>
            ) : (
              <>
                <span
                  aria-hidden="true"
                  className={`material-symbols-outlined mb-3 block text-2xl ${
                    advantage.dark
                      ? "text-amber-400"
                      : "text-primary dark:text-zinc-50"
                  }`}
                  style={advantage.icon === "verified_user" ? { fontVariationSettings: "'FILL' 1" } : undefined}
                >
                  {advantage.icon}
                </span>
                <strong
                  className={`mb-1.5 block text-base font-semibold sm:text-lg ${
                    advantage.dark ? "text-white" : "text-primary dark:text-zinc-50"
                  }`}
                >
                  {advantage.title}
                </strong>
                <span
                  className={`text-sm ${
                    advantage.dark ? "text-zinc-300" : "text-muted dark:text-zinc-400"
                  }`}
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
          <span aria-hidden="true" className="material-symbols-outlined text-base!">
            call
          </span>
          Appelez maintenant pour réserver
        </a>
      </div>
    </section>
  );
}
