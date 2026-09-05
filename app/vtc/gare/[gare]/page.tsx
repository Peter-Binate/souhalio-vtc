import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import garesData from "@/data/gares.json";
import { AEROPORTS } from "@/data/aeroports";
import type { Gare } from "@/data/gare";
import { AIRPORT_FARES, BUSINESS, SITE_URL } from "@/lib/constants";
import { breadcrumbJsonLd, faqJsonLd, placeArea, serviceJsonLd } from "@/lib/jsonld";
import { Breadcrumb } from "@/components/seo/breadcrumb";
import { CtaButtons, CtaCall } from "@/components/seo/cta-buttons";

const gares = garesData as Gare[];
const bySlug = new Map(gares.map((g) => [g.slug, g]));

// SSG : une page statique par gare curatée, 404 pour tout autre slug.
export const dynamicParams = false;

export function generateStaticParams() {
  return gares.map((g) => ({ gare: g.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ gare: string }>;
}): Promise<Metadata> {
  const { gare } = await params;
  const g = bySlug.get(gare);
  if (!g) return {};

  const url = `${SITE_URL}/vtc/gare/${g.slug}`;
  const title = `VTC ${g.nomCourt} — chauffeur privé ${g.commune} 24h/24 | ${BUSINESS.name}`;
  const description = g.inFixedZone
    ? `Chauffeur VTC à ${g.nomCourt} (${g.commune}) : dépose et prise en charge à l'heure, transfert aéroport à prix fixe (Orly ${AIRPORT_FARES.ORLY} €, CDG ${AIRPORT_FARES.CDG} €), 24h/24 et 7j/7. Réservez en direct.`
    : `Chauffeur VTC à ${g.nomCourt} (${g.commune}) : dépose et prise en charge à l'heure, transferts aéroport et Paris, 24h/24 et 7j/7. Estimation sur devis, réservez en direct.`;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: { title, description, url, siteName: BUSINESS.name, locale: "fr_FR", type: "website" },
  };
}

export default async function GarePage({ params }: { params: Promise<{ gare: string }> }) {
  const { gare } = await params;
  const g = bySlug.get(gare);
  if (!g) notFound();

  const autresGares = [...g.versGares]
    .sort((a, b) => a.min - b.min)
    .map((leg) => ({ leg, gare: bySlug.get(leg.slug) }))
    .filter((x): x is { leg: (typeof g.versGares)[number]; gare: Gare } => x.gare !== undefined);

  const crumbs = [
    { name: "Accueil", path: "/" },
    { name: "Zones desservies", path: "/vtc" },
    { name: "Transferts gare", path: "/vtc/gare" },
    { name: g.nomCourt, path: `/vtc/gare/${g.slug}` },
  ];

  const faq = [
    {
      question: `Combien coûte un VTC entre ${g.nomCourt} et l'aéroport ?`,
      answer: g.inFixedZone
        ? `${g.nomCourt} est située à ${g.commune}, dans la zone de tarif fixe : ${AIRPORT_FARES.ORLY} € vers Orly, ${AIRPORT_FARES.CDG} € vers Roissy-Charles de Gaulle et ${AIRPORT_FARES.BEAUVAIS} € vers Beauvais, quelle que soit l'heure.`
        : `${g.nomCourt} se situe à ${g.commune}, au-delà de la zone de tarif fixe (Paris et proche banlieue). Le prix est établi sur devis et confirmé au téléphone avant la réservation.`,
    },
    {
      question: `Où le chauffeur prend-il en charge à ${g.nomCourt} ?`,
      answer: `Au point de dépose-minute de la gare, ou à l'endroit que vous indiquez à la réservation. Précisez votre hall ou votre sortie : c'est ce qui évite de se chercher au milieu du flux de voyageurs.`,
    },
    {
      question: `Peut-on réserver un VTC à ${g.nomCourt} pour un train très tôt ou très tard ?`,
      answer: `Oui. ${BUSINESS.name} intervient ${BUSINESS.hours}, y compris avant l'ouverture et après la fermeture des transports en commun. Réservation par téléphone au ${BUSINESS.phone} ou par WhatsApp.`,
    },
    {
      question: `Le chauffeur attend-il si mon train a du retard ?`,
      answer: `Oui : l'heure de prise en charge est ajustée sur l'arrivée réelle de votre train, sans que le tarif annoncé change.`,
    },
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([
            serviceJsonLd({
              name: `VTC ${g.nomCourt}`,
              areaServed: placeArea(g.nom),
              url: `${SITE_URL}/vtc/gare/${g.slug}`,
              offers: g.inFixedZone
                ? AEROPORTS.map((a) => ({
                    name: `Transfert ${a.nom} depuis ${g.nomCourt}`,
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
          {g.nom} · {g.commune}
        </p>
        <h1 className="font-headline mt-2 max-w-3xl text-3xl font-semibold tracking-tight text-primary md:text-5xl md:font-bold md:tracking-tighter dark:text-zinc-50">
          VTC {g.nomCourt} — chauffeur privé 24h/24 et 7j/7
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-muted dark:text-zinc-400">
          {g.presentation}
        </p>
        <p className="mt-4 max-w-2xl text-lg text-muted dark:text-zinc-400">
          Votre chauffeur privé, basé à {BUSINESS.city}, vous dépose et vous récupère à{" "}
          {g.nomCourt} {BUSINESS.hours} — départ matinal, arrivée tardive et jours fériés
          compris. Réservation en direct, sans plateforme intermédiaire.
        </p>

        <div className="mt-8">
          <CtaButtons
            label="Appeler pour réserver"
            waText={`Bonjour, je souhaite réserver un VTC pour ${g.nomCourt}.`}
          />
        </div>

        <div className="mt-10 rounded-card border border-border bg-surface p-6 ambient-shadow md:p-8 dark:border-zinc-800 dark:bg-zinc-950">
          <h2 className="text-xs font-semibold tracking-widest text-muted uppercase dark:text-zinc-400">
            Destinations desservies depuis {g.nomCourt}
          </h2>
          <ul className="mt-4 space-y-3">
            {g.dessertes.map((d) => (
              <li key={d} className="flex items-start gap-3">
                <span aria-hidden="true" className="material-symbols-outlined text-accent">
                  train
                </span>
                <span className="text-sm text-foreground dark:text-zinc-300">{d}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="border-y border-border bg-surface-low py-12 md:py-20 dark:border-zinc-800 dark:bg-zinc-900/40">
        <div className="mx-auto max-w-3xl px-6">
          <h2 className="font-headline text-2xl font-semibold text-primary md:text-3xl dark:text-zinc-50">
            De {g.nomCourt} aux aéroports parisiens
          </h2>
          <p className="mt-4 text-lg text-muted dark:text-zinc-400">
            {g.inFixedZone ? (
              <>
                {g.nomCourt} étant située à {g.commune}, vos transferts aéroport sont facturés à
                un <strong>prix fixe connu à l&apos;avance</strong>, quelle que soit
                l&apos;heure.
              </>
            ) : (
              <>
                {g.nomCourt} se situe hors de la zone à tarif fixe (Paris et proche banlieue) :
                votre transfert fait l&apos;objet d&apos;une{" "}
                <strong>estimation confirmée en un appel</strong>, arrêtée avant la réservation.
              </>
            )}
          </p>

          <div className="mt-8 rounded-card border border-border bg-surface p-6 ambient-shadow md:p-8 dark:border-zinc-800 dark:bg-zinc-950">
            {AEROPORTS.map((a, index) => {
              const leg = g.airports[a.key];
              return (
                <div
                  key={a.slug}
                  className={`flex items-center justify-between py-4 ${
                    index < AEROPORTS.length - 1
                      ? "border-b border-border dark:border-zinc-800"
                      : ""
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span aria-hidden="true" className="material-symbols-outlined text-accent">
                      flight_takeoff
                    </span>
                    <Link
                      href={`/vtc/aeroport/${a.slug}`}
                      className="font-semibold text-primary underline-offset-4 hover:underline dark:text-zinc-50"
                    >
                      {a.nomCourt}
                    </Link>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted dark:text-zinc-400">
                      ~{leg.km} km · ~{leg.min} min
                    </p>
                    {g.inFixedZone && (
                      <p className="font-headline text-lg font-bold text-primary dark:text-zinc-50">
                        {AIRPORT_FARES[a.fareKey]} €
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
            {!g.inFixedZone && (
              <p className="mt-4 text-sm text-muted dark:text-zinc-400">
                Tarif sur devis pour les transferts aéroport depuis {g.nomCourt} — appelez pour
                confirmer votre prix avant de réserver.
              </p>
            )}
          </div>

          <CtaCall label={`Réservez votre transfert depuis ${g.nomCourt}`} />
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-12 md:py-20">
        {autresGares.length > 0 && (
          <>
            <h2 className="font-headline text-2xl font-semibold text-primary md:text-3xl dark:text-zinc-50">
              Correspondances de gare à gare depuis {g.nomCourt}
            </h2>
            <p className="mt-4 max-w-2xl text-muted dark:text-zinc-400">
              Un billet qui change de gare à Paris ? Voici le temps de route réel entre{" "}
              {g.nomCourt} et les autres grandes gares, bagages compris et sans changement de
              métro.
            </p>
            <div className="mt-6 overflow-x-auto rounded-card border border-border bg-surface ambient-shadow dark:border-zinc-800 dark:bg-zinc-950">
              <table className="w-full border-collapse text-left text-sm">
                <caption className="sr-only">
                  Distance et durée de trajet en voiture depuis {g.nomCourt} vers les autres
                  gares desservies
                </caption>
                <thead>
                  <tr className="border-b border-border dark:border-zinc-800">
                    <th scope="col" className="px-4 py-3 font-semibold text-primary dark:text-zinc-50">
                      Gare
                    </th>
                    <th scope="col" className="px-4 py-3 text-right font-semibold text-primary dark:text-zinc-50">
                      Distance
                    </th>
                    <th scope="col" className="px-4 py-3 text-right font-semibold text-primary dark:text-zinc-50">
                      Durée estimée
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {autresGares.map(({ leg, gare: other }) => (
                    <tr
                      key={other.slug}
                      className="border-b border-border last:border-b-0 dark:border-zinc-800"
                    >
                      <th scope="row" className="px-4 py-3 font-medium">
                        <Link
                          href={`/vtc/gare/${other.slug}`}
                          className="text-primary underline-offset-4 hover:underline dark:text-zinc-50"
                        >
                          {other.nomCourt}
                        </Link>
                      </th>
                      <td className="px-4 py-3 text-right whitespace-nowrap text-muted dark:text-zinc-400">
                        ~{leg.km} km
                      </td>
                      <td className="px-4 py-3 text-right whitespace-nowrap text-muted dark:text-zinc-400">
                        ~{leg.min} min
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        <h2 className="font-headline mt-12 text-2xl font-semibold text-primary md:text-3xl dark:text-zinc-50">
          Questions fréquentes
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
          <Link href="/vtc/gare" className="underline hover:text-primary dark:hover:text-zinc-50">
            Toutes les gares desservies
          </Link>
          {" · "}
          <Link href="/vtc" className="underline hover:text-primary dark:hover:text-zinc-50">
            Toutes les communes desservies
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
