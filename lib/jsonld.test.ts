import { describe, it, expect } from "vitest";
import {
  adminArea,
  breadcrumbJsonLd,
  BUSINESS_ID,
  cityArea,
  faqJsonLd,
  localBusinessJsonLd,
  placeArea,
  serviceJsonLd,
} from "./jsonld";
import { AIRPORT_FARES, BUSINESS, SITE_URL } from "./constants";

describe("localBusinessJsonLd", () => {
  const ld = localBusinessJsonLd();

  it("décrit l'entreprise avec un @id stable réutilisable par les autres pages", () => {
    expect(ld["@type"]).toBe("LocalBusiness");
    expect(ld["@id"]).toBe(BUSINESS_ID);
    expect(ld.name).toBe(BUSINESS.name);
    expect(ld.telephone).toBe(BUSINESS.phone);
  });

  it("annonce une disponibilité 24h/24 7j/7", () => {
    expect(ld.openingHoursSpecification).toMatchObject({ opens: "00:00", closes: "23:59" });
    expect((ld.openingHoursSpecification as { dayOfWeek: string[] }).dayOfWeek).toHaveLength(7);
  });

  it("reprend les tarifs fixes aéroport depuis les constantes", () => {
    const prices = (ld.makesOffer as { price: number }[]).map((o) => o.price);
    expect(prices).toEqual([AIRPORT_FARES.ORLY, AIRPORT_FARES.CDG, AIRPORT_FARES.BEAUVAIS]);
  });
});

describe("serviceJsonLd", () => {
  it("rattache le service à l'entreprise plutôt que de redéclarer un LocalBusiness", () => {
    const ld = serviceJsonLd({
      name: "VTC Créteil",
      areaServed: cityArea("Créteil"),
      url: `${SITE_URL}/vtc/creteil`,
    });
    expect(ld["@type"]).toBe("Service");
    expect(ld.provider).toEqual({ "@id": BUSINESS_ID });
    expect(ld.areaServed).toEqual({ "@type": "City", name: "Créteil" });
    expect(ld.url).toBe(`${SITE_URL}/vtc/creteil`);
  });

  it("accepte plusieurs zones desservies", () => {
    const ld = serviceJsonLd({
      name: "VTC IDF",
      areaServed: [adminArea("Val-de-Marne"), adminArea("Essonne")],
      url: SITE_URL,
    });
    expect(ld.areaServed).toHaveLength(2);
  });

  it("n'ajoute `offers` que lorsqu'un tarif est fourni", () => {
    const sans = serviceJsonLd({ name: "x", areaServed: cityArea("A"), url: SITE_URL });
    expect(sans).not.toHaveProperty("offers");

    const avec = serviceJsonLd({
      name: "x",
      areaServed: placeArea("Orly"),
      url: SITE_URL,
      offers: [{ name: "Transfert Orly", price: 50 }],
    });
    expect(avec.offers).toEqual([
      { "@type": "Offer", name: "Transfert Orly", price: 50, priceCurrency: "EUR" },
    ]);
  });
});

describe("zones desservies", () => {
  it("typent correctement une ville, une zone administrative et un lieu", () => {
    expect(cityArea("Créteil")).toEqual({ "@type": "City", name: "Créteil" });
    expect(adminArea("Val-de-Marne")).toEqual({
      "@type": "AdministrativeArea",
      name: "Val-de-Marne",
    });
    expect(placeArea("Aéroport de Paris-Orly")).toEqual({
      "@type": "Place",
      name: "Aéroport de Paris-Orly",
    });
  });
});

describe("faqJsonLd", () => {
  it("produit une FAQPage avec une Question par entrée", () => {
    const ld = faqJsonLd([{ question: "Quel tarif ?", answer: "50 € depuis Paris." }]);
    expect(ld["@type"]).toBe("FAQPage");
    expect(ld.mainEntity).toEqual([
      {
        "@type": "Question",
        name: "Quel tarif ?",
        acceptedAnswer: { "@type": "Answer", text: "50 € depuis Paris." },
      },
    ]);
  });
});

describe("breadcrumbJsonLd", () => {
  it("numérote les positions à partir de 1 et absolutise les chemins", () => {
    const ld = breadcrumbJsonLd([
      { name: "Accueil", path: "/" },
      { name: "Zones", path: "/vtc" },
    ]);
    expect(ld.itemListElement).toEqual([
      { "@type": "ListItem", position: 1, name: "Accueil", item: `${SITE_URL}/` },
      { "@type": "ListItem", position: 2, name: "Zones", item: `${SITE_URL}/vtc` },
    ]);
  });
});
