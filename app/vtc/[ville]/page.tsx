import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import communesData from "@/data/communes.json";
import { AEROPORTS } from "@/data/aeroports";
import type { Commune } from "@/data/commune";
import { departementLe, departementSlug } from "@/lib/communes";
import { AIRPORT_FARES, BUSINESS, IDF_DEPARTEMENTS, SITE_URL } from "@/lib/constants";
import { breadcrumbJsonLd, cityArea, faqJsonLd, serviceJsonLd } from "@/lib/jsonld";
import { Breadcrumb } from "@/components/seo/breadcrumb";
import { CtaButtons, CtaCall } from "@/components/seo/cta-buttons";
import { CommuneLinks } from "@/components/seo/commune-links";

const communes = communesData as Commune[];
const bySlug = new Map(communes.map((c) => [c.slug, c]));

// Un département n'a de page dédiée qu'à partir de 2 communes couvertes
// (cf. app/vtc/departement/[departement]/page.tsx).
const MIN_COMMUNES = 2;

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

  const url = `${SITE_URL}/vtc/${c.slug}`;
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

function AirportLeg({
  label,
  href,
  leg,
  fixedFare,
}: {
  label: string;
  href?: string;
  leg: Commune["airports"]["orly"];
  fixedFare?: number;
}) {
  return (
    <div className="flex items-center justify-between border-b border-border py-4 last:border-b-0 dark:border-zinc-800">
      <div className="flex items-center gap-3">
        <span aria-hidden="true" className="material-symbols-outlined text-accent">
          flight_takeoff
        </span>
        {href ? (
          <Link
            href={href}
            className="font-semibold text-primary underline-offset-4 hover:underline dark:text-zinc-50"
          >
            {label}
          </Link>
        ) : (
          <span className="font-semibold text-primary dark:text-zinc-50">{label}</span>
        )}
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

  const departementNom = IDF_DEPARTEMENTS[c.departement] ?? c.departement;
  const nearbyCommunes = c.nearby
    .map((slug) => bySlug.get(slug))
    .filter((x): x is Commune => x !== undefined);
  const departementHasPage =
    communes.filter((x) => x.departement === c.departement).length >= MIN_COMMUNES;

  const crumbs = [
    { name: "Accueil", path: "/" },
    { name: "Zones desservies", path: "/vtc" },
    ...(departementHasPage
      ? [{ name: departementNom, path: `/vtc/departement/${departementSlug(c.departement)}` }]
      : []),
    { name: c.nom, path: `/vtc/${c.slug}` },
  ];

  const faq = [
    {
      question: `Combien coûte un VTC de ${c.nom} à l'aéroport ?`,
      answer: c.inFixedZone
        ? `${c.nom} est en zone de tarif fixe : ${AIRPORT_FARES.ORLY} € vers Orly, ${AIRPORT_FARES.CDG} € vers Roissy-Charles de Gaulle et ${AIRPORT_FARES.BEAUVAIS} € vers Beauvais, quelle que soit l'heure — nuit, week-end et jours fériés compris.`
        : `${c.nom} se situe au-delà de la zone de tarif fixe (Paris et proche banlieue). Le prix de votre transfert est établi sur devis et confirmé au téléphone avant la réservation, sans surprise à l'arrivée.`,
    },
    {
      question: `Combien de temps faut-il pour aller de ${c.nom} à Paris ?`,
      answer: `Comptez environ ${c.parisCentre.min} minutes de route pour rejoindre le centre de Paris depuis ${c.nom}, soit à peu près ${c.parisCentre.km} km. Prévoyez une marge aux heures de pointe.`,
    },
    {
      question: `Peut-on réserver un VTC à ${c.nom} la nuit ou un jour férié ?`,
      answer: `Oui. ${BUSINESS.name} intervient ${BUSINESS.hours}, en réservation immédiate comme anticipée. Appelez le ${BUSINESS.phone} ou écrivez sur WhatsApp : vous parlez directement à votre chauffeur.`,
    },
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([
            serviceJsonLd({
              name: `VTC à ${c.nom}`,
              areaServed: cityArea(c.nom),
              url: `${SITE_URL}/vtc/${c.slug}`,
              // Le tarif fixe n'est annoncé que dans la zone où il s'applique
              // (Paris et proche banlieue) — ailleurs, le prix est sur devis.
              offers: c.inFixedZone
                ? AEROPORTS.map((a) => ({
                    name: `Transfert ${a.nom} depuis ${c.nom}`,
                    price: AIRPORT_FARES[a.fareKey],
                  }))
                : undefined,
            }),
            breadcrumbJsonLd(crumbs),
            faqJsonLd(faq),
          ]),
        }}
      />

      <section className="mx-auto max-w-7xl px-6 py-12 md:py-20">
        <Breadcrumb items={crumbs} />
        <p className="mt-6 text-xs font-semibold tracking-widest text-muted uppercase dark:text-zinc-400">
          {c.nom} ({c.codePostal}) · {departementNom} · Île-de-France
        </p>
        <h1 className="font-headline mt-2 max-w-2xl text-3xl font-semibold tracking-tight text-primary md:text-5xl md:font-bold md:tracking-tighter dark:text-zinc-50">
          VTC à {c.nom} — chauffeur privé 24h/24 et 7j/7
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-muted dark:text-zinc-400">
          Basé à {BUSINESS.city}, votre chauffeur privé dessert {c.nom} et l&apos;ensemble du
          département{" "}
          {departementHasPage ? (
            <Link
              href={`/vtc/departement/${departementSlug(c.departement)}`}
              className="underline underline-offset-4 hover:text-primary dark:hover:text-zinc-50"
            >
              {departementNom}
            </Link>
          ) : (
            departementNom
          )}
          . Réservation immédiate ou anticipée, en direct avec votre chauffeur, disponible{" "}
          {BUSINESS.hours}.
        </p>

        <div className="mt-8">
          <CtaButtons
            label="Appeler pour réserver"
            waText={`Bonjour, je souhaite réserver un VTC à ${c.nom}.`}
          />
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
            {AEROPORTS.map((a) => (
              <AirportLeg
                key={a.slug}
                label={a.nom}
                href={`/vtc/aeroport/${a.slug}`}
                leg={c.airports[a.key]}
                fixedFare={c.inFixedZone ? AIRPORT_FARES[a.fareKey] : undefined}
              />
            ))}
            <AirportLeg label="Paris centre" leg={c.parisCentre} />

            {!c.inFixedZone && (
              <p className="mt-4 text-sm text-muted dark:text-zinc-400">
                Tarif sur devis pour les transferts aéroport depuis {c.nom} — appelez pour
                confirmer votre prix avant de réserver.
              </p>
            )}
          </div>

          <CtaCall label={`Réservez votre trajet depuis ${c.nom}`} />
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-12 md:py-20">
        {nearbyCommunes.length > 0 && (
          <>
            <h2 className="font-headline text-2xl font-semibold text-primary md:text-3xl dark:text-zinc-50">
              Communes proches également desservies
            </h2>
            <CommuneLinks communes={nearbyCommunes} prefix="VTC " />
          </>
        )}

        <h2 className="font-headline mt-12 text-2xl font-semibold text-primary md:text-3xl dark:text-zinc-50">
          Questions fréquentes sur le VTC à {c.nom}
        </h2>
        <dl className="mt-6 max-w-3xl space-y-6">
          {faq.map((item) => (
            <div key={item.question}>
              <dt className="font-semibold text-primary dark:text-zinc-50">{item.question}</dt>
              <dd className="mt-2 text-muted dark:text-zinc-400">{item.answer}</dd>
            </div>
          ))}
        </dl>

        <p className="mt-10 text-sm text-muted dark:text-zinc-400">
          {departementHasPage && (
            <>
              <Link
                href={`/vtc/departement/${departementSlug(c.departement)}`}
                className="underline hover:text-primary dark:hover:text-zinc-50"
              >
                VTC dans {departementLe(c.departement)}
              </Link>
              {" · "}
            </>
          )}
          <Link href="/vtc/aeroport" className="underline hover:text-primary dark:hover:text-zinc-50">
            Transferts aéroport
          </Link>
          {" · "}
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
