import Link from "next/link";
import { BUSINESS, telHref, waHref } from "@/lib/constants";

// Maillage interne global vers les hubs SEO (LP-19 à LP-23) : le footer distribue le
// PageRank vers les familles de pages programmatiques depuis toutes les pages du site.
const FOOTER_LINKS = [
  { href: "/vtc", label: "Nos zones d'intervention" },
  { href: "/vtc/departement", label: "VTC par département" },
  { href: "/vtc/aeroport", label: "Transferts aéroport" },
  { href: "/vtc/gare", label: "Transferts gare" },
] as const;

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-primary pb-24 text-zinc-300 sm:pb-20">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 px-6 py-12 sm:py-20 md:grid-cols-2 md:items-start">
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

        <nav aria-label="Pages du site" className="md:col-span-2">
          <ul className="flex flex-wrap gap-x-5 gap-y-2 text-sm">
            {FOOTER_LINKS.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="underline-offset-4 hover:text-white hover:underline">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <p className="text-xs text-zinc-400 md:col-span-2">
          © {year} {BUSINESS.name}. Tous droits réservés.
        </p>
      </div>
    </footer>
  );
}
