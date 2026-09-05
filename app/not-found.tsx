import type { Metadata } from "next";
import Link from "next/link";
import { BUSINESS } from "@/lib/constants";
import { CtaButtons } from "@/components/seo/cta-buttons";

// Sans ce fichier, Next sert son 404 par défaut : texte anglais (« 404: This page could not
// be found. ») et, surtout, metadata héritée du layout — la page 404 se décrivait donc avec
// le titre et la meta description de l'accueil. `follow: true` laisse les robots suivre les
// liens de secours ci-dessous, sans indexer la page elle-même.
export const metadata: Metadata = {
  title: `Page introuvable | ${BUSINESS.name}`,
  description:
    "Cette page n'existe pas ou a été déplacée. Retrouvez nos zones desservies en Île-de-France, nos transferts aéroport et gare, ou appelez directement votre chauffeur.",
  robots: { index: false, follow: true },
};

const RESCUE_LINKS = [
  { href: "/", label: "Accueil" },
  { href: "/vtc", label: "Communes desservies" },
  { href: "/vtc/departement", label: "VTC par département" },
  { href: "/vtc/aeroport", label: "Transferts aéroport" },
  { href: "/vtc/gare", label: "Transferts gare" },
] as const;

export default function NotFound() {
  return (
    <section className="mx-auto flex max-w-3xl flex-col px-6 py-16 md:py-28">
      <p className="text-xs font-semibold tracking-widest text-muted uppercase dark:text-zinc-400">
        Erreur 404
      </p>
      <h1 className="font-headline mt-2 text-3xl font-semibold tracking-tight text-primary md:text-5xl md:font-bold md:tracking-tighter dark:text-zinc-50">
        Cette page n&apos;existe pas
      </h1>
      <p className="mt-4 text-lg text-muted dark:text-zinc-400">
        Le lien est peut-être erroné ou la page a été déplacée. Votre chauffeur reste
        joignable {BUSINESS.hours} — le plus rapide reste l&apos;appel direct.
      </p>

      <div className="mt-8">
        <CtaButtons
          label="Appeler pour réserver"
          waText="Bonjour, je souhaite réserver un VTC."
        />
      </div>

      <h2 className="font-headline mt-12 text-xl font-semibold text-primary dark:text-zinc-50">
        Où aller ensuite
      </h2>
      <ul className="mt-4 flex flex-wrap gap-3">
        {RESCUE_LINKS.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className="inline-flex min-h-11 items-center rounded-standard border border-border bg-surface px-4 text-sm font-medium text-primary transition-colors hover:bg-surface-low dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50 dark:hover:bg-zinc-900"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
