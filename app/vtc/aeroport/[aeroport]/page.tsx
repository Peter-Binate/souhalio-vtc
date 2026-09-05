import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import communesData from "@/data/communes.json";
import { AEROPORTS, aeroportBySlug } from "@/data/aeroports";
import type { Commune } from "@/data/commune";
import { departementSlug, fastestTo, legOf } from "@/lib/communes";
import { AIRPORT_FARES, BUSINESS, IDF_DEPARTEMENTS, SITE_URL } from "@/lib/constants";
import { breadcrumbJsonLd, faqJsonLd, placeArea, serviceJsonLd } from "@/lib/jsonld";
import { Breadcrumb } from "@/components/seo/breadcrumb";
import { CtaButtons, CtaCall } from "@/components/seo/cta-buttons";
import { CommuneTable } from "@/components/seo/commune-table";

const communes = communesData as Commune[];

// Nombre de lignes affichées par tableau : assez pour couvrir les départs les plus
// fréquents sans transformer la page en annuaire (le maillage complet passe par /vtc).
const TABLE_ROWS = 15;

// SSG : une page statique par aéroport, 404 pour tout autre slug.
export const dynamicParams = false;

export function generateStaticParams() {
  return AEROPORTS.map((a) => ({ aeroport: a.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ aeroport: string }>;
}): Promise<Metadata> {
  const { aeroport } = await params;
  const a = aeroportBySlug.get(aeroport);
  if (!a) return {};

  const url = `${SITE_URL}/vtc/aeroport/${a.slug}`;
  const title = `VTC ${a.nomCourt} — transfert aéroport à prix fixe ${AIRPORT_FARES[a.fareKey]} € | ${BUSINESS.name}`;
  const description = `Chauffeur privé pour vos transferts vers et depuis ${a.nom} (${a.iata}) : ${AIRPORT_FARES[a.fareKey]} € au départ de Paris et de la proche banlieue, suivi des vols, 24h/24 et 7j/7. Réservez en direct.`;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: { title, description, url, siteName: BUSINESS.name, locale: "fr_FR", type: "website" },
  };
}

export default async function AeroportPage({
  params,
}: {
  params: Promise<{ aeroport: string }>;
}) {
  const { aeroport } = await params;
  const a = aeroportBySlug.get(aeroport);
  if (!a) notFound();

  const fare = AIRPORT_FARES[a.fareKey];
  const enZone = fastestTo(
    communes.filter((c) => c.inFixedZone),
    a.key,
    TABLE_ROWS,
  );
  const horsZone = fastestTo(
    communes.filter((c) => !c.inFixedZone),
    a.key,
    TABLE_ROWS,
  );
  const plusProche = enZone[0] ?? horsZone[0];
  const autresAeroports = AEROPORTS.filter((x) => x.slug !== a.slug);

  const crumbs = [
    { name: "Accueil", path: "/" },
    { name: "Zones desservies", path: "/vtc" },
    { name: "Transferts aéroport", path: "/vtc/aeroport" },
    { name: a.nomCourt, path: `/vtc/aeroport/${a.slug}` },
  ];

  const faq = [
    {
      question: `Combien coûte un VTC pour ${a.nomCourt} ?`,
      answer: `Au départ de Paris et de la proche banlieue (75, 92, 93, 94), le transfert vers ${a.nom} est à prix fixe : ${fare} €, quelle que soit l'heure, y compris la nuit, le week-end et les jours fériés. Au-delà de cette zone, le prix est établi sur devis et confirmé au téléphone avant la réservation.`,
    },
    {
      question: `À quel terminal de ${a.nomCourt} la prise en charge a-t-elle lieu ?`,
      answer: `${a.nom} compte ${a.terminaux.length} terminaux : ${a.terminaux.join(", ")}. Indiquez le vôtre — ou votre numéro de vol — lors de la réservation : votre chauffeur s'y présente directement, à l'arrivée comme au départ.`,
    },
    {
      question: `Que se passe-t-il si mon vol arrive en retard à ${a.nomCourt} ?`,
      answer: `Les vols sont suivis : en cas de retard, l'heure de prise en charge est ajustée sans que vous ayez à rappeler. Le tarif fixe annoncé reste celui que vous payez.`,
    },
    {
      question: `Peut-on réserver un VTC pour ${a.nomCourt} à la dernière minute ?`,
      answer: `Oui, en réservation immédiate comme anticipée, ${BUSINESS.hours}. Le plus rapide reste l'appel direct au ${BUSINESS.phone} : vous parlez à votre chauffeur, pas à une plateforme.`,
    },
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([
serviceJsonLd({
              name: `Transfert VTC ${a.nom}`,
              areaServed: placeArea(a.nom),
              url: `${SITE_URL}/vtc/aeroport/${a.slug}`,
              offers: [
                {
                  name: `Transfert VTC ${a.nom} (prix fixe, départ Paris et proche banlieue)`,
                  price: fare,
                },
              ],
            }),
            breadcrumbJsonLd(crumbs),
            faqJsonLd(faq),
          ]),
        }}
      />

      <section className="mx-auto max-w-7xl px-6 py-12 md:py-20">
        <Breadcrumb items={crumbs} />
        <p className="mt-6 text-xs font-semibold tracking-widest text-muted uppercase dark:text-zinc-400">
          {a.nom} · Code {a.iata}
        </p>
        <h1 className="font-headline mt-2 max-w-3xl text-3xl font-semibold tracking-tight text-primary md:text-5xl md:font-bold md:tracking-tighter dark:text-zinc-50">
          VTC {a.nomCourt} — transfert aéroport à prix fixe, 24h/24
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-muted dark:text-zinc-400">
          {a.presentation} L&apos;aéroport est implanté sur {a.implantation}, {a.situation}.
          Votre chauffeur privé, basé à {BUSINESS.city}, vous y conduit et vous y récupère{" "}
          {BUSINESS.hours}, avec suivi des vols et prise en charge ponctuelle.
        </p>

        <div className="mt-8 flex flex-col gap-6 rounded-card border border-border bg-surface p-8 ambient-shadow sm:flex-row sm:items-center sm:justify-between dark:border-zinc-800 dark:bg-zinc-950">
          <div>
            <p className="text-xs tracking-widest text-muted uppercase dark:text-zinc-400">
              Prix fixe · départ Paris &amp; proche banlieue
            </p>
            <p className="font-headline mt-1 text-4xl font-bold text-primary dark:text-zinc-50">
              {fare} €
            </p>
            <p className="mt-2 max-w-md text-sm text-muted dark:text-zinc-400">
              Quelle que soit l&apos;heure — nuit, week-end et jours fériés compris. Au-delà de
              la proche banlieue, tarif sur devis confirmé avant la réservation.
            </p>
          </div>
          <CtaButtons
            label={`Réserver pour ${a.nomCourt}`}
            waText={`Bonjour, je souhaite réserver un transfert VTC vers ${a.nom}.`}
          />
        </div>
      </section>

      <section className="border-y border-border bg-surface-low py-12 md:py-20 dark:border-zinc-800 dark:bg-zinc-900/40">
        <div className="mx-auto max-w-4xl px-6">
          <h2 className="font-headline text-2xl font-semibold text-primary md:text-3xl dark:text-zinc-50">
            Combien de temps pour rejoindre {a.nomCourt} ?
          </h2>
          {plusProche && (
            <p className="mt-4 text-lg text-muted dark:text-zinc-400">
              Parmi les communes que nous desservons, {plusProche.nom} est la plus proche{" "}
              {a.deNomCourt} : environ {legOf(plusProche, a.key).min} minutes de route pour{" "}
              {legOf(plusProche, a.key).km} km. Les durées ci-dessous proviennent
              d&apos;itinéraires routiers réels et servent de repère pour choisir votre heure
              de départ — prévoyez une marge aux heures de pointe.
            </p>
          )}

          {enZone.length > 0 && (
            <>
              <h3 className="font-headline mt-10 text-xl font-semibold text-primary dark:text-zinc-50">
                Depuis Paris et la proche banlieue — {fare} € à prix fixe
              </h3>
              <CommuneTable
                communes={enZone}
                columns={[{ key: a.key, label: a.nomCourt }]}
                caption={`Distance et durée de trajet vers ${a.nom} depuis les communes de Paris et de la proche banlieue`}
              />
            </>
          )}

          {horsZone.length > 0 && (
            <>
              <h3 className="font-headline mt-10 text-xl font-semibold text-primary dark:text-zinc-50">
                Depuis le reste de l&apos;Île-de-France — tarif sur devis
              </h3>
              <CommuneTable
                communes={horsZone}
                columns={[{ key: a.key, label: a.nomCourt }]}
                caption={`Distance et durée de trajet vers ${a.nom} depuis les communes franciliennes hors zone de tarif fixe`}
              />
            </>
          )}

          <CtaCall label={`Confirmez votre tarif pour ${a.nomCourt}`} />
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-12 md:py-20">
        <div className="grid gap-12 md:grid-cols-2">
          <div>
            <h2 className="font-headline text-2xl font-semibold text-primary md:text-3xl dark:text-zinc-50">
              Terminaux de {a.nomCourt}
            </h2>
            <p className="mt-4 text-muted dark:text-zinc-400">
              Précisez votre terminal ou votre numéro de vol à la réservation : votre chauffeur
              s&apos;y présente directement, sans transfert interne inutile.
            </p>
            <ul className="mt-6 space-y-3">
              {a.terminaux.map((t) => (
                <li key={t} className="flex items-center gap-3">
                  <span aria-hidden="true" className="material-symbols-outlined text-accent">
                    flight_takeoff
                  </span>
                  <span className="text-sm text-foreground dark:text-zinc-300">{t}</span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="font-headline text-2xl font-semibold text-primary md:text-3xl dark:text-zinc-50">
              Questions fréquentes
            </h2>
            <dl className="mt-6 space-y-6">
              {faq.map((item) => (
                <div key={item.question}>
                  <dt className="font-semibold text-primary dark:text-zinc-50">{item.question}</dt>
                  <dd className="mt-2 text-sm text-muted dark:text-zinc-400">{item.answer}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>

        <h2 className="font-headline mt-12 text-2xl font-semibold text-primary md:text-3xl dark:text-zinc-50">
          Autres transferts
        </h2>
        <ul className="mt-6 flex flex-wrap gap-3">
          {autresAeroports.map((x) => (
            <li key={x.slug}>
              <Link
                href={`/vtc/aeroport/${x.slug}`}
                className="inline-flex min-h-11 items-center rounded-standard border border-border bg-surface px-4 text-sm font-medium text-primary transition-colors hover:bg-surface-low dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50 dark:hover:bg-zinc-900"
              >
                Transfert {x.nomCourt} — {AIRPORT_FARES[x.fareKey]} €
              </Link>
            </li>
          ))}
          {Object.keys(IDF_DEPARTEMENTS)
            .sort()
            .filter((code) => communes.filter((c) => c.departement === code).length >= 2)
            .map((code) => (
              <li key={code}>
                <Link
                  href={`/vtc/departement/${departementSlug(code)}`}
                  className="inline-flex min-h-11 items-center rounded-standard border border-border bg-surface px-4 text-sm font-medium text-primary transition-colors hover:bg-surface-low dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50 dark:hover:bg-zinc-900"
                >
                  VTC {IDF_DEPARTEMENTS[code]}
                </Link>
              </li>
            ))}
        </ul>
      </section>
    </>
  );
}
