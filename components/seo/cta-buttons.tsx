import { BUSINESS, telHref, waHref } from "@/lib/constants";

/**
 * Paire de CTA (appel prioritaire + WhatsApp secondaire) des pages SEO programmatiques.
 * Server Component pur : ces pages ne chargent aucun JS applicatif.
 */
export function CtaButtons({ label, waText }: { label: string; waText?: string }) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row">
      <a
        href={telHref(BUSINESS.phone)}
        className="inline-flex min-h-11 items-center justify-center gap-2 rounded-standard bg-primary px-6 py-3 text-xs font-semibold tracking-widest text-white uppercase transition-colors hover:bg-deep-midnight dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
      >
        <span aria-hidden="true" className="material-symbols-outlined text-base!">
          call
        </span>
        {label} — {BUSINESS.phone}
      </a>
      <a
        href={waHref(BUSINESS.whatsapp, waText)}
        className="inline-flex min-h-11 items-center justify-center gap-2 rounded-standard border border-border-input px-6 py-3 text-xs font-semibold tracking-widest text-primary uppercase transition-colors hover:bg-surface-low dark:border-zinc-600 dark:text-zinc-50 dark:hover:bg-zinc-800"
      >
        <span aria-hidden="true" className="material-symbols-outlined text-base!">
          chat
        </span>
        Réserver par WhatsApp
      </a>
    </div>
  );
}

/** CTA d'appel unique, centré, pour clore une section (cf. CLAUDE.md § Conversion). */
export function CtaCall({ label }: { label: string }) {
  return (
    <div className="mt-8 text-center">
      <a
        href={telHref(BUSINESS.phone)}
        className="inline-flex min-h-11 items-center gap-2 rounded-standard bg-accent px-8 py-4 text-xs font-semibold tracking-widest text-primary uppercase transition-colors hover:opacity-90"
      >
        <span aria-hidden="true" className="material-symbols-outlined text-base!">
          call
        </span>
        {label}
      </a>
    </div>
  );
}
