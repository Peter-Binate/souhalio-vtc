import { BUSINESS, telHref } from "@/lib/constants";

const NAV_LINKS = [
  { href: "#services", label: "Services" },
  { href: "#pricing", label: "Tarifs" },
  { href: "#about", label: "À propos" },
  { href: "#contact", label: "Contact" },
] as const;

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-surface/90 backdrop-blur-md supports-backdrop-blur:bg-surface/80 dark:border-zinc-800 dark:bg-zinc-950/90">
      <div className="mx-auto flex h-16 max-w-[1280px] items-center justify-between gap-4 px-6">
        <span className="font-headline text-xl font-bold tracking-tight text-primary dark:text-zinc-50">
          {BUSINESS.name}
        </span>
        <nav className="hidden items-center gap-8 md:flex">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-xs font-semibold tracking-widest text-muted uppercase transition-opacity hover:opacity-80 dark:text-zinc-400"
            >
              {link.label}
            </a>
          ))}
        </nav>
        <a
          href={telHref(BUSINESS.phone)}
          className="hidden min-h-11 items-center gap-2 rounded-standard bg-primary px-5 text-xs font-semibold tracking-widest text-white uppercase transition-colors hover:bg-deep-midnight sm:inline-flex dark:bg-white dark:text-zinc-900"
        >
          <span aria-hidden="true" className="material-symbols-outlined text-base">
            call
          </span>
          Appeler
        </a>
      </div>
    </header>
  );
}
