import { BUSINESS, telHref, waHref } from "@/lib/constants";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-zinc-200 bg-zinc-900 pb-24 text-zinc-300 sm:pb-10 dark:border-zinc-800">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-lg font-semibold text-white">{BUSINESS.name}</p>
            <p className="mt-2 text-sm">
              {BUSINESS.city} ({BUSINESS.postalCode}) — {BUSINESS.hours}
            </p>
            <p className="text-sm">
              Paiement : {BUSINESS.payment} · Langue : {BUSINESS.language}
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:items-end">
            <a
              href={telHref(BUSINESS.phone)}
              className="inline-flex min-h-11 items-center rounded-full bg-white px-5 text-sm font-medium text-zinc-900 transition-colors hover:bg-zinc-200"
            >
              Appeler : {BUSINESS.phone}
            </a>
            <a
              href={waHref(BUSINESS.whatsapp)}
              className="inline-flex min-h-11 items-center rounded-full border border-zinc-600 px-5 text-sm font-medium text-white transition-colors hover:bg-zinc-800"
            >
              WhatsApp : {BUSINESS.whatsapp}
            </a>
          </div>
        </div>

        <p className="mt-10 text-xs text-zinc-400">
          © {year} {BUSINESS.name}. Tous droits réservés.
        </p>
      </div>
    </footer>
  );
}
