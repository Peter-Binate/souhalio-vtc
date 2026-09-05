// Constructeurs de données structurées schema.org, partagés par le layout et les pages SEO
// programmatiques (ville, département, aéroport, gare). Fonctions pures : le JSON produit
// est vérifié par lib/jsonld.test.ts plutôt qu'à l'œil dans le JSX.
import { AIRPORT_FARES, BUSINESS, SITE_URL } from "@/lib/constants";

type Json = Record<string, unknown>;

// Identifiant unique de l'entreprise sur tout le site : le layout décrit l'entité une fois,
// chaque page programmatique s'y rattache via `provider` plutôt que de redéclarer un
// LocalBusiness concurrent avec une zone différente (deux entités contradictoires).
export const BUSINESS_ID = `${SITE_URL}/#business`;

const OPENING_HOURS_24_7 = {
  "@type": "OpeningHoursSpecification",
  dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
  opens: "00:00",
  closes: "23:59",
} as const;

/** L'entité entreprise — à émettre UNE fois par page, depuis le layout racine. */
export function localBusinessJsonLd(): Json {
  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": BUSINESS_ID,
    name: BUSINESS.name,
    telephone: BUSINESS.phone,
    url: SITE_URL,
    address: {
      "@type": "PostalAddress",
      addressLocality: BUSINESS.city,
      postalCode: BUSINESS.postalCode,
      addressCountry: "FR",
    },
    areaServed: ["Île-de-France", "France"],
    openingHoursSpecification: OPENING_HOURS_24_7,
    makesOffer: [
      { label: "Paris-Orly", fare: AIRPORT_FARES.ORLY },
      { label: "Paris-Charles de Gaulle / Roissy", fare: AIRPORT_FARES.CDG },
      { label: "Paris-Beauvais", fare: AIRPORT_FARES.BEAUVAIS },
    ].map((a) => ({
      "@type": "Offer",
      name: `Transfert aéroport ${a.label} (prix fixe)`,
      price: a.fare,
      priceCurrency: "EUR",
    })),
  };
}

/**
 * Le service rendu sur une zone donnée (la commune, le département, l'aéroport ou la gare
 * de la page). C'est `areaServed` qui différencie une page programmatique de la suivante.
 */
export function serviceJsonLd(options: {
  name: string;
  areaServed: Json | readonly Json[];
  url: string;
  offers?: readonly { name: string; price: number }[];
}): Json {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    serviceType: "Chauffeur privé VTC",
    name: options.name,
    url: options.url,
    provider: { "@id": BUSINESS_ID },
    areaServed: options.areaServed,
    hoursAvailable: OPENING_HOURS_24_7,
    ...(options.offers
      ? {
          offers: options.offers.map((o) => ({
            "@type": "Offer",
            name: o.name,
            price: o.price,
            priceCurrency: "EUR",
          })),
        }
      : {}),
  };
}

export function cityArea(nom: string): Json {
  return { "@type": "City", name: nom };
}

export function adminArea(nom: string): Json {
  return { "@type": "AdministrativeArea", name: nom };
}

export function placeArea(nom: string): Json {
  return { "@type": "Place", name: nom };
}

export function faqJsonLd(items: readonly { question: string; answer: string }[]): Json {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };
}

/** `path` est relatif à la racine du site ("/vtc/orly"), l'URL absolue est dérivée de SITE_URL. */
export function breadcrumbJsonLd(items: readonly { name: string; path: string }[]): Json {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: `${SITE_URL}${item.path}`,
    })),
  };
}
