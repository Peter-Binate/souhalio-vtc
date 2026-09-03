import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import communesData from "@/data/communes.json";
import type { Commune } from "@/data/commune";
import { AIRPORT_FARES, BUSINESS, IDF_DEPARTEMENTS, telHref, waHref } from "@/lib/constants";

const communes = communesData as Commune[];
const bySlug = new Map(communes.map((c) => [c.slug, c]));

// SSG : une page statique par commune, 404 pour tout slug inconnu (pas de rendu à la demande).
export const dynamicParams = false;

export function generateStaticParams() {
  return communes.map((c) => ({ ville: c.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ ville: string }>;
}): Promise<Metadata> {
  const { ville } = await params;
  const c = bySlug.get(ville);
  if (!c) return {};

  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const url = `${base}/vtc/${c.slug}`;
  const title = `VTC ${c.nom} (${c.departement}) — Chauffeur privé 24h/24 | ${BUSINESS.name}`;
  const description = c.inFixedZone
    ? `Chauffeur VTC à ${c.nom} : transfert aéroport à prix fixe (Orly ${AIRPORT_FARES.ORLY} €, CDG ${AIRPORT_FARES.CDG} €), gares, trajets affaires et longue distance, 24h/24 et 7j/7. Réservez en direct.`
    : `Chauffeur VTC à ${c.nom} : transfert aéroport (Orly, CDG, Beauvais), gares, trajets affaires et longue distance, 24h/24 et 7j/7. Estimation sur devis, réservez en direct.`;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: { title, description, url, siteName: BUSINESS.name, locale: "fr_FR", type: "website" },
  };
}

function AirportLeg({ label, leg, fixedFare }: { label: string; leg: Commune["airports"]["orly"]; fixedFare?: number }) {
  return (
    <div className="flex items-center justify-between border-b border-border py-4 last:border-b-0 dark:border-zinc-800">
      <div className="flex items-center gap-3">
        <span aria-hidden="true" className="material-symbols-outlined text-accent">
          flight_takeoff
        </span>
        <span className="font-semibold text-primary dark:text-zinc-50">{label}</span>
      </div>
      <div className="text-right">
        <p className="text-sm text-muted dark:text-zinc-400">
          ~{leg.km} km · ~{leg.min} min
        </p>
        {fixedFare !== undefined && (
          <p className="font-headline text-lg font-bold text-primary dark:text-zinc-50">
            {fixedFare} €
          </p>
        )}
      </div>
    </div>
  );
}

export default async function VillePage({
  params,
}: {
  params: Promise<{ ville: string }>;
}) {
  const { ville } = await params;
  const c = bySlug.get(ville);
  if (!c) notFound();

  const nearbyCommunes = c.nearby
    .map((slug) => bySlug.get(slug))
    .filter((x): x is Commune => x !== undefined);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "LocalBusiness",
            name: BUSINESS.name,
            telephone: BUSINESS.phone,
            areaServed: { "@type": "City", name: c.nom },
            openingHoursSpecification: {
              "@type": "OpeningHoursSpecification",
              dayOfWeek: [
                "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday",
              ],
              opens: "00:00",
              closes: "23:59",
            },
          }),
        }}
      />

      <section className="mx-auto max-w-7xl px-6 py-12 md:py-20">
        <p className="text-xs font-semibold tracking-widest text-muted uppercase dark:text-zinc-400">
          {c.nom} ({c.codePostal}) · {IDF_DEPARTEMENTS[c.departement] ?? c.departement} · Île-de-France
        </p>
        <h1 className="font-headline mt-2 max-w-2xl text-3xl font-semibold tracking-tight text-primary md:text-5xl md:font-bold md:tracking-tighter dark:text-zinc-50">
          VTC à {c.nom} — chauffeur privé 24h/24 et 7j/7
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-muted dark:text-zinc-400">
          Basé à {BUSINESS.city}, votre chauffeur privé dessert {c.nom} et l&apos;ensemble du
          département {IDF_DEPARTEMENTS[c.departement] ?? c.departement}. Réservation immédiate
          ou anticipée, en direct avec votre chauffeur, disponible {BUSINESS.hours}.
        </p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <a
            href={telHref(BUSINESS.phone)}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-standard bg-primary px-6 text-xs font-semibold tracking-widest text-white uppercase transition-colors hover:bg-deep-midnight dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            <span aria-hidden="true" className="material-symbols-outlined text-base!">
              call
            </span>
            Appeler pour réserver — {BUSINESS.phone}
          </a>
          <a
            href={waHref(BUSINESS.whatsapp)}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-standard border border-border-input px-6 text-xs font-semibold tracking-widest text-primary uppercase transition-colors hover:bg-surface-low dark:border-zinc-600 dark:text-zinc-50 dark:hover:bg-zinc-800"
          >
            <span aria-hidden="true" className="material-symbols-outlined text-base!">
              chat
            </span>
            Réserver par WhatsApp
          </a>
        </div>
      </section>

      <section className="border-y border-border bg-surface-low py-12 md:py-20 dark:border-zinc-800 dark:bg-zinc-900/40">
        <div className="mx-auto max-w-3xl px-6">
          <h2 className="font-headline text-2xl font-semibold text-primary md:text-3xl dark:text-zinc-50">
            Trajets depuis {c.nom}
          </h2>
          <p className="mt-4 text-lg text-muted dark:text-zinc-400">
            {c.inFixedZone ? (
              <>
                Au départ de {c.nom}, vos transferts aéroport sont facturés à un{" "}
                <strong>prix fixe, connu à l&apos;avance</strong>, quelle que soit l&apos;heure.
              </>
            ) : (
              <>
                {c.nom} se situe hors de la zone à tarif fixe (Paris et proche banlieue) :
                votre trajet fait l&apos;objet d&apos;une <strong>estimation, confirmée en un
                appel</strong>, sans mauvaise surprise.
              </>
            )}
          </p>

          <div className="mt-8 rounded-card border border-border bg-surface p-8 ambient-shadow dark:border-zinc-800 dark:bg-zinc-950">
            <AirportLeg
              label="Aéroport d'Orly"
              leg={c.airports.orly}
              fixedFare={c.inFixedZone ? AIRPORT_FARES.ORLY : undefined}
            />
            <AirportLeg
              label="Roissy-Charles de Gaulle"
              leg={c.airports.cdg}
              fixedFare={c.inFixedZone ? AIRPORT_FARES.CDG : undefined}
            />
            <AirportLeg
              label="Aéroport de Paris-Beauvais"
              leg={c.airports.beauvais}
              fixedFare={c.inFixedZone ? AIRPORT_FARES.BEAUVAIS : undefined}
            />
            <AirportLeg label="Paris centre" leg={c.parisCentre} />

            {!c.inFixedZone && (
              <p className="mt-4 text-sm text-muted dark:text-zinc-400">
                Tarif sur devis pour les transferts aéroport depuis {c.nom} — appelez pour
                confirmer votre prix avant de réserver.
              </p>
            )}
          </div>

          <div className="mt-8 text-center">
            <a
              href={telHref(BUSINESS.phone)}
              className="inline-flex min-h-11 items-center gap-2 rounded-standard bg-accent px-8 py-4 text-xs font-semibold tracking-widest text-primary uppercase transition-colors hover:opacity-90"
            >
              <span aria-hidden="true" className="material-symbols-outlined text-base!">
                call
              </span>
              Réservez votre trajet depuis {c.nom}
            </a>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-12 md:py-20">
        {nearbyCommunes.length > 0 && (
          <>
            <h2 className="font-headline text-2xl font-semibold text-primary md:text-3xl dark:text-zinc-50">
              Communes proches également desservies
            </h2>
            <ul className="mt-6 flex flex-wrap gap-3">
              {nearbyCommunes.map((n) => (
                <li key={n.slug}>
                  <Link
                    href={`/vtc/${n.slug}`}
                    className="inline-flex min-h-11 items-center rounded-standard border border-border bg-surface px-4 text-sm font-medium text-primary transition-colors hover:bg-surface-low dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50 dark:hover:bg-zinc-900"
                  >
                    VTC {n.nom}
                  </Link>
                </li>
              ))}
            </ul>
          </>
        )}
        <p className="mt-6 text-sm text-muted dark:text-zinc-400">
          <Link href="/vtc" className="underline hover:text-primary dark:hover:text-zinc-50">
            Voir toutes les villes desservies
          </Link>
          {" · "}
          <Link href="/" className="underline hover:text-primary dark:hover:text-zinc-50">
            Retour à l&apos;accueil
          </Link>
        </p>
      </section>
    </>
  );
}
