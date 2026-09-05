import Link from "next/link";
import { BUSINESS, telHref } from "@/lib/constants";

/*
 * Liens absolus (préfixés "/"), pas de simples ancres : le header est monté par le layout
 * racine, donc rendu sur les ~300 pages du site. Une ancre nue (#services) ne pointe vers
 * rien depuis une page ville/aéroport/gare — la navigation y était muette. Avec "/#services"
 * et next/link, le lien ramène à l'accueil puis défile, et depuis l'accueil il défile
 * simplement (sans rechargement de page).
 *
 * « Zones » ouvre le hub /vtc : c'est le seul point d'entrée de l'en-tête vers les pages
 * SEO programmatiques (villes, départements, aéroports, gares), qui ne sont sinon
 * atteignables que par le footer ou les moteurs de recherche.
 */
const NAV_LINKS = [
  { href: "/#services", label: "Services" },
  { href: "/#pricing", label: "Tarifs" },
  { href: "/vtc", label: "Zones" },
  { href: "/#about", label: "À propos" },
  { href: "/#contact", label: "Contact" },
] as const;

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-surface/90 backdrop-blur-md supports-backdrop-blur:bg-surface/80 dark:border-zinc-800 dark:bg-zinc-950/90">
      <div className="mx-auto flex h-16 max-w-[1280px] items-center justify-between gap-4 px-6">
        <Link
          href="/"
          className="font-headline text-xl font-bold tracking-tight text-primary transition-opacity hover:opacity-80 dark:text-zinc-50"
        >
          {BUSINESS.name}
        </Link>
        <nav aria-label="Navigation principale" className="hidden items-center gap-6 md:flex lg:gap-8">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-xs font-semibold tracking-widest text-muted uppercase transition-opacity hover:opacity-80 dark:text-zinc-400"
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <a
          href={telHref(BUSINESS.phone)}
          className="hidden min-h-11 items-center gap-2 rounded-standard bg-primary px-5 text-xs font-semibold tracking-widest text-white uppercase transition-colors hover:bg-deep-midnight sm:inline-flex dark:bg-white dark:text-zinc-900"
        >
          <span aria-hidden="true" className="material-symbols-outlined text-base!">
            call
          </span>
          Appeler
        </a>
      </div>
    </header>
  );
}
