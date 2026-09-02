import { BUSINESS, telHref, waHref } from "@/lib/constants";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-deep-midnight pb-24 text-zinc-300 sm:pb-[80px]">
      <div className="mx-auto grid max-w-[1280px] grid-cols-1 gap-8 px-6 py-12 sm:py-[80px] md:grid-cols-2 md:items-start">
        <div className="space-y-4">
          <p className="font-headline text-2xl font-semibold text-white">{BUSINESS.name}</p>
          <p className="text-sm">
            {BUSINESS.city} ({BUSINESS.postalCode}) — {BUSINESS.hours}
          </p>
          <p className="text-sm">
            Paiement : {BUSINESS.payment} · Langue : {BUSINESS.language}
          </p>
        </div>

        <div className="flex flex-col gap-3 md:items-end">
          <a
            href={telHref(BUSINESS.phone)}
            className="inline-flex min-h-11 items-center gap-2 rounded-standard bg-accent px-5 text-xs font-semibold tracking-widest text-primary uppercase transition-colors hover:opacity-90"
          >
            <span aria-hidden="true" className="material-symbols-outlined text-base!">
              call
            </span>
            Appeler : {BUSINESS.phone}
          </a>
          <a
            href={waHref(BUSINESS.whatsapp)}
            className="inline-flex min-h-11 items-center gap-2 rounded-standard border border-zinc-600 px-5 text-xs font-semibold tracking-widest text-white uppercase transition-colors hover:bg-zinc-800"
          >
            <span aria-hidden="true" className="material-symbols-outlined text-base!">
              chat
            </span>
            WhatsApp : {BUSINESS.whatsapp}
          </a>
        </div>

        <p className="text-xs text-zinc-400 md:col-span-2">
          © {year} {BUSINESS.name}. Tous droits réservés.
        </p>
      </div>
    </footer>
  );
}
