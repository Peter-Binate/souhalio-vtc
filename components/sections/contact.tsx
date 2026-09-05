"use client";

import { useForm, type FieldError, type UseFormRegister } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { contactSchema, type ContactFormValues } from "@/schemas/contact";
import { useContactForm } from "@/lib/use-contact-form";
import { BUSINESS, telHref, waHref } from "@/lib/constants";

const inputClassName =
  "mt-1 min-h-10 sm:min-h-11 w-full rounded-standard border border-border-input bg-surface px-3.5 py-2 text-sm text-foreground outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:focus:border-zinc-100";

const CONTACT_CHANNELS = [
  {
    href: telHref(BUSINESS.phone),
    icon: "call",
    label: "Téléphone Direct",
    value: BUSINESS.phone,
    iconBg: "bg-primary text-white",
  },
  {
    href: waHref(BUSINESS.whatsapp),
    icon: "chat",
    label: "WhatsApp",
    value: BUSINESS.whatsapp,
    iconBg: "bg-[#25D366] text-white",
  },
  {
    href: `mailto:${BUSINESS.email}`,
    icon: "mail",
    label: "Email",
    value: BUSINESS.email,
    iconBg: "bg-surface-low text-primary dark:bg-zinc-900 dark:text-zinc-50",
  },
] as const;

function TextField({
  id,
  label,
  optional,
  type = "text",
  register,
  error,
}: {
  id: "nom" | "telephone" | "email" | "date" | "heure" | "depart" | "destination";
  label: string;
  optional?: boolean;
  type?: string;
  register: UseFormRegister<ContactFormValues>;
  error?: FieldError;
}) {
  const fieldId = `contact-${id}`;
  return (
    <div>
      <label
        htmlFor={fieldId}
        className="block text-xs font-semibold tracking-widest text-muted uppercase dark:text-zinc-300"
      >
        {label} {optional && <span className="font-normal text-muted normal-case dark:text-zinc-400">(optionnel)</span>}
      </label>
      <input
        id={fieldId}
        type={type}
        aria-invalid={!!error}
        aria-describedby={error ? `${fieldId}-error` : undefined}
        {...register(id)}
        className={inputClassName}
      />
      {error && (
        <p id={`${fieldId}-error`} className="mt-1 text-xs text-red-600 dark:text-red-400">
          {error.message}
        </p>
      )}
    </div>
  );
}

export function Contact() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      nom: "",
      telephone: "",
      email: "",
      date: "",
      heure: "",
      depart: "",
      destination: "",
      message: "",
      consentement: false,
    },
  });
  const { mutateAsync, isPending, isSuccess, isError } = useContactForm();

  async function onSubmit(values: ContactFormValues) {
    try {
      await mutateAsync(values);
      reset();
    } catch {
      // isError (useContactForm) affiche déjà le repli — rien à faire ici.
    }
  }

  return (
    <section
      id="contact"
      aria-labelledby="contact-heading"
      className="flex min-h-[calc(100dvh-4rem)] w-full scroll-mt-16 items-center justify-center border-t border-border bg-surface-low px-6 py-6 lg:h-[calc(100dvh-4rem)] lg:py-4 dark:border-zinc-800 dark:bg-zinc-900/40"
    >
      <div className="mx-auto w-full max-w-7xl">
        <div className="grid grid-cols-1 items-center gap-8 md:grid-cols-2 lg:gap-16 xl:gap-24">
          {/* Colonne gauche : infos */}
          <div className="flex flex-col justify-center space-y-4 md:space-y-6">
            <div>
              <h2
                id="contact-heading"
                className="font-headline mb-2 text-2xl font-semibold text-primary md:text-3xl dark:text-zinc-50"
              >
                Réservez votre trajet dès maintenant
              </h2>
              <p className="text-sm md:text-base text-muted dark:text-zinc-400">
                Réservation immédiate ou anticipée, 24h/24 et 7j/7. Le plus rapide reste
                l&apos;appel : votre chauffeur vous confirme le tarif et l&apos;horaire en direct.
              </p>
            </div>

            <div className="space-y-2.5">
              {CONTACT_CHANNELS.map((channel) => (
                <a
                  key={channel.label}
                  href={channel.href}
                  className="hover-lift flex items-center gap-3.5 rounded-standard border border-border bg-surface p-3 sm:p-3.5 dark:border-zinc-800 dark:bg-zinc-950"
                >
                  <span
                    aria-hidden="true"
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${channel.iconBg}`}
                  >
                    <span className="material-symbols-outlined text-lg">{channel.icon}</span>
                  </span>
                  <span>
                    <span className="block text-xs font-semibold tracking-widest text-muted uppercase dark:text-zinc-400">
                      {channel.label}
                    </span>
                    <span className="block font-semibold text-primary dark:text-zinc-50">
                      {channel.value}
                    </span>
                  </span>
                </a>
              ))}
            </div>

            <dl className="grid gap-2 text-xs sm:text-sm text-muted sm:grid-cols-2 dark:text-zinc-400">
              <div>
                <dt className="font-medium text-primary dark:text-zinc-50">Base</dt>
                <dd>
                  {BUSINESS.city} ({BUSINESS.postalCode}) — {BUSINESS.address}
                </dd>
              </div>
              <div>
                <dt className="font-medium text-primary dark:text-zinc-50">Disponibilité</dt>
                <dd>{BUSINESS.hours}</dd>
              </div>
              <div>
                <dt className="font-medium text-primary dark:text-zinc-50">Paiement</dt>
                <dd>{BUSINESS.payment}</dd>
              </div>
            </dl>

            <p className="text-xs text-muted md:text-sm dark:text-zinc-400">
              Réponse rapide · Tarifs aéroport fixes · Chauffeur ponctuel
            </p>
          </div>

          {/* Colonne droite : formulaire */}
          <div className="rounded-card border border-border bg-surface p-5 sm:p-6 ambient-shadow dark:border-zinc-800 dark:bg-zinc-950">
            <h3 className="font-headline mb-3 text-base sm:text-lg font-bold text-primary dark:text-zinc-50">
              Demande de devis
            </h3>
            <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-2.5 sm:space-y-3">
              <div className="grid gap-2.5 sm:gap-3 sm:grid-cols-2">
                <TextField id="nom" label="Nom" register={register} error={errors.nom} />
                <TextField
                  id="telephone"
                  label="Téléphone"
                  type="tel"
                  register={register}
                  error={errors.telephone}
                />
                <TextField id="email" label="Email" type="email" register={register} error={errors.email} />
                <div className="grid grid-cols-2 gap-2">
                  <TextField id="date" label="Date" optional type="date" register={register} error={errors.date} />
                  <TextField id="heure" label="Heure" optional type="time" register={register} error={errors.heure} />
                </div>
                <TextField id="depart" label="Lieu de départ" optional register={register} error={errors.depart} />
                <TextField
                  id="destination"
                  label="Destination"
                  optional
                  register={register}
                  error={errors.destination}
                />
              </div>

              <div>
                <label
                  htmlFor="contact-message"
                  className="block text-xs font-semibold tracking-widest text-muted uppercase dark:text-zinc-300"
                >
                  Message <span className="font-normal text-muted normal-case dark:text-zinc-400">(optionnel)</span>
                </label>
                <textarea
                  id="contact-message"
                  rows={2}
                  {...register("message")}
                  className={`${inputClassName} resize-none`}
                />
              </div>

              <div className="flex items-start gap-2 py-1">
                <input
                  id="contact-consentement"
                  type="checkbox"
                  aria-invalid={!!errors.consentement}
                  aria-describedby={errors.consentement ? "contact-consentement-error" : undefined}
                  {...register("consentement")}
                  className="mt-0.5 h-4 w-4 shrink-0 rounded border-border-input text-primary focus:ring-primary dark:border-zinc-700"
                />
                <label htmlFor="contact-consentement" className="text-xs leading-relaxed text-muted dark:text-zinc-400">
                  J&apos;accepte que les informations de ce formulaire soient utilisées
                  uniquement pour traiter ma demande de réservation (envoi d&apos;un email à
                  votre chauffeur). Aucune donnée n&apos;est conservée par ce site.
                </label>
              </div>
              {errors.consentement && (
                <p id="contact-consentement-error" className="mt-1 text-xs text-red-600 dark:text-red-400">
                  {errors.consentement.message}
                </p>
              )}

              <button
                type="submit"
                disabled={isSubmitting || isPending}
                className="flex min-h-10 sm:min-h-11 w-full items-center justify-center gap-2 rounded-standard bg-primary py-2.5 sm:py-3 text-xs font-semibold tracking-widest text-white uppercase transition-colors hover:bg-deep-midnight disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
              >
                {isPending && (
                  <span
                    aria-hidden="true"
                    className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white dark:border-zinc-900/40 dark:border-t-zinc-900"
                  />
                )}
                {isPending ? "Envoi en cours…" : "Envoyer ma demande"}
              </button>

              {isSuccess && (
                <p role="status" className="text-sm text-emerald-700 dark:text-emerald-400">
                  Votre demande a bien été envoyée. Nous vous recontactons rapidement.
                </p>
              )}

              {isError && (
                <div
                  role="alert"
                  className="rounded-standard border border-border bg-surface-low p-4 dark:border-zinc-700 dark:bg-zinc-900"
                >
                  <p className="text-sm text-muted dark:text-zinc-300">
                    L&apos;envoi du formulaire est momentanément indisponible. Appelez pour
                    réserver directement.
                  </p>
                  <a
                    href={telHref(BUSINESS.phone)}
                    className="mt-3 inline-flex min-h-11 items-center gap-2 rounded-standard bg-primary px-5 text-xs font-semibold tracking-widest text-white uppercase transition-colors hover:bg-deep-midnight dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
                  >
                    <span aria-hidden="true" className="material-symbols-outlined text-base!">
                      call
                    </span>
                    Appeler pour réserver — {BUSINESS.phone}
                  </a>
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
