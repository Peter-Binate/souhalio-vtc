"use client";

import { useForm, type FieldError, type UseFormRegister } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { contactSchema, type ContactFormValues } from "@/schemas/contact";
import { useContactForm } from "@/lib/use-contact-form";
import { BUSINESS, telHref, waHref } from "@/lib/constants";

const inputClassName =
  "mt-1 min-h-11 w-full rounded-lg border border-zinc-300 px-4 py-2 text-base text-zinc-900 outline-none focus:border-zinc-900 focus-visible:ring-2 focus-visible:ring-zinc-900 focus-visible:ring-offset-2 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:focus:border-zinc-100 dark:focus-visible:ring-zinc-100 dark:focus-visible:ring-offset-zinc-950";

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
      <label htmlFor={fieldId} className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
        {label} {optional && <span className="font-normal text-zinc-500 dark:text-zinc-400">(optionnel)</span>}
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
      aria-labelledby="contact-heading"
      className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16"
    >
      <h2
        id="contact-heading"
        className="text-2xl font-semibold tracking-tight text-zinc-900 sm:text-3xl dark:text-zinc-50"
      >
        Réservez votre trajet dès maintenant
      </h2>
      <p className="mt-4 max-w-2xl text-base text-zinc-600 dark:text-zinc-400">
        Réservation immédiate ou anticipée, 24h/24 et 7j/7. Le plus rapide reste l&apos;appel :
        votre chauffeur vous confirme le tarif et l&apos;horaire en direct.
      </p>

      <dl className="mt-6 grid gap-3 text-sm text-zinc-600 sm:grid-cols-2 dark:text-zinc-400">
        <div>
          <dt className="font-medium text-zinc-900 dark:text-zinc-50">
            📞 Téléphone (le plus rapide)
          </dt>
          <dd>{BUSINESS.phone}</dd>
        </div>
        <div>
          <dt className="font-medium text-zinc-900 dark:text-zinc-50">💬 WhatsApp</dt>
          <dd>{BUSINESS.whatsapp}</dd>
        </div>
        <div>
          <dt className="font-medium text-zinc-900 dark:text-zinc-50">✉️ Email</dt>
          <dd>{BUSINESS.email}</dd>
        </div>
        <div>
          <dt className="font-medium text-zinc-900 dark:text-zinc-50">📍 Base</dt>
          <dd>
            {BUSINESS.city} ({BUSINESS.postalCode}) — {BUSINESS.address}
          </dd>
        </div>
        <div>
          <dt className="font-medium text-zinc-900 dark:text-zinc-50">🕐 Disponibilité</dt>
          <dd>{BUSINESS.hours}</dd>
        </div>
        <div>
          <dt className="font-medium text-zinc-900 dark:text-zinc-50">💶 Paiement</dt>
          <dd>{BUSINESS.payment}</dd>
        </div>
      </dl>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <a
          href={telHref(BUSINESS.phone)}
          className="inline-flex min-h-11 items-center justify-center rounded-full bg-zinc-900 px-6 text-sm font-medium text-white transition-colors hover:bg-zinc-700 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          📞 Appeler maintenant
        </a>
        <a
          href={waHref(BUSINESS.whatsapp)}
          className="inline-flex min-h-11 items-center justify-center rounded-full border border-zinc-300 px-6 text-sm font-medium text-zinc-900 transition-colors hover:bg-zinc-100 dark:border-zinc-600 dark:text-zinc-50 dark:hover:bg-zinc-800"
        >
          💬 Réserver par WhatsApp
        </a>
      </div>
      <p className="mt-3 text-sm text-zinc-500 dark:text-zinc-400">
        Réponse rapide · Tarifs aéroport fixes · Chauffeur ponctuel
      </p>

      <form
        onSubmit={handleSubmit(onSubmit)}
        noValidate
        className="mt-8 max-w-2xl rounded-xl border border-zinc-200 bg-white p-4 shadow-sm sm:p-6 dark:border-zinc-800 dark:bg-zinc-950"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField id="nom" label="Nom" register={register} error={errors.nom} />
          <TextField
            id="telephone"
            label="Téléphone"
            type="tel"
            register={register}
            error={errors.telephone}
          />
          <TextField id="email" label="Email" type="email" register={register} error={errors.email} />
          <TextField id="date" label="Date souhaitée" optional type="date" register={register} error={errors.date} />
          <TextField id="heure" label="Heure souhaitée" optional type="time" register={register} error={errors.heure} />
          <TextField id="depart" label="Lieu de départ" optional register={register} error={errors.depart} />
          <TextField
            id="destination"
            label="Destination"
            optional
            register={register}
            error={errors.destination}
          />
        </div>

        <div className="mt-4">
          <label htmlFor="contact-message" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Message <span className="font-normal text-zinc-500 dark:text-zinc-400">(optionnel)</span>
          </label>
          <textarea
            id="contact-message"
            rows={4}
            {...register("message")}
            className={inputClassName}
          />
        </div>

        <div className="mt-4 flex items-start gap-2">
          <input
            id="contact-consentement"
            type="checkbox"
            aria-invalid={!!errors.consentement}
            aria-describedby={errors.consentement ? "contact-consentement-error" : undefined}
            {...register("consentement")}
            className="mt-1 h-5 w-5 shrink-0 rounded border-zinc-300 dark:border-zinc-700"
          />
          <label htmlFor="contact-consentement" className="text-sm text-zinc-600 dark:text-zinc-400">
            J&apos;accepte que les informations de ce formulaire soient transmises à{" "}
            <strong>Formspree</strong> (service tiers utilisé pour le traitement des demandes de
            réservation) dans le seul but de traiter ma demande. Aucune donnée n&apos;est
            conservée par ce site.
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
          className="mt-6 flex min-h-11 w-full items-center justify-center gap-2 rounded-full bg-zinc-900 px-5 text-sm font-medium text-white transition-colors hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
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
          <p role="status" className="mt-4 text-sm text-emerald-700 dark:text-emerald-400">
            Votre demande a bien été envoyée. Nous vous recontactons rapidement.
          </p>
        )}

        {isError && (
          <div
            role="alert"
            className="mt-4 rounded-lg border border-zinc-300 bg-zinc-50 p-4 dark:border-zinc-700 dark:bg-zinc-900"
          >
            <p className="text-sm text-zinc-700 dark:text-zinc-300">
              L&apos;envoi du formulaire est momentanément indisponible. Appelez pour réserver
              directement.
            </p>
            <a
              href={telHref(BUSINESS.phone)}
              className="mt-3 inline-flex min-h-11 items-center justify-center rounded-full bg-zinc-900 px-5 text-sm font-medium text-white transition-colors hover:bg-zinc-700 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
            >
              📞 Appeler pour réserver — {BUSINESS.phone}
            </a>
          </div>
        )}
      </form>
    </section>
  );
}
