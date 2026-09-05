import { describe, it, expect } from "vitest";
import {
  averageMinutes,
  byPopulationDesc,
  departementCodeFromSlug,
  departementDe,
  departementLe,
  departementSlug,
  departementStats,
  fastestTo,
  groupByDepartement,
  legOf,
  slugify,
  sortByNom,
} from "./communes";
import type { Commune } from "@/schemas/commune";

function makeCommune(over: Partial<Commune> & Pick<Commune, "slug" | "nom">): Commune {
  return {
    insee: over.insee ?? over.slug,
    codePostal: "94000",
    departement: "94",
    population: 10_000,
    lat: 48.8,
    lon: 2.3,
    inFixedZone: true,
    airports: {
      orly: { km: 10, min: 20 },
      cdg: { km: 30, min: 40 },
      beauvais: { km: 90, min: 80 },
    },
    parisCentre: { km: 8, min: 25 },
    gares: [],
    nearby: [],
    ...over,
  };
}

describe("slugify", () => {
  it("retire les diacritiques et met en kebab-case", () => {
    expect(slugify("L'Haÿ-les-Roses")).toBe("l-hay-les-roses");
    expect(slugify("Val-d'Oise")).toBe("val-d-oise");
    expect(slugify("Seine-Saint-Denis")).toBe("seine-saint-denis");
  });

  it("ne laisse ni tiret en tête ni en fin", () => {
    expect(slugify("  Évry-Courcouronnes  ")).toBe("evry-courcouronnes");
  });
});

describe("legOf", () => {
  const c = makeCommune({ slug: "x", nom: "X" });

  it("lit le trajet aéroport correspondant", () => {
    expect(legOf(c, "cdg")).toEqual({ km: 30, min: 40 });
  });

  it("traite parisCentre comme un point de référence à part", () => {
    expect(legOf(c, "parisCentre")).toEqual({ km: 8, min: 25 });
  });
});

describe("sortByNom", () => {
  it("trie selon la collation française (accents non prioritaires)", () => {
    const list = [
      makeCommune({ slug: "z", nom: "Zola" }),
      makeCommune({ slug: "e", nom: "Évry" }),
      makeCommune({ slug: "a", nom: "Antony" }),
    ];
    expect(sortByNom(list).map((c) => c.nom)).toEqual(["Antony", "Évry", "Zola"]);
  });

  it("ne mute pas la liste d'entrée", () => {
    const list = [makeCommune({ slug: "z", nom: "Zola" }), makeCommune({ slug: "a", nom: "Antony" })];
    sortByNom(list);
    expect(list[0].nom).toBe("Zola");
  });
});

describe("groupByDepartement", () => {
  it("regroupe par code département et trie chaque groupe par nom", () => {
    const groups = groupByDepartement([
      makeCommune({ slug: "vitry", nom: "Vitry-sur-Seine", departement: "94" }),
      makeCommune({ slug: "antony", nom: "Antony", departement: "92" }),
      makeCommune({ slug: "creteil", nom: "Créteil", departement: "94" }),
    ]);
    expect([...groups.keys()].sort()).toEqual(["92", "94"]);
    expect(groups.get("94")!.map((c) => c.nom)).toEqual(["Créteil", "Vitry-sur-Seine"]);
  });

  it("renvoie une map vide pour une liste vide", () => {
    expect(groupByDepartement([]).size).toBe(0);
  });
});

describe("byPopulationDesc", () => {
  const list = [
    makeCommune({ slug: "b", nom: "B", population: 5_000 }),
    makeCommune({ slug: "a", nom: "A", population: 50_000 }),
    makeCommune({ slug: "c", nom: "C", population: 5_000 }),
  ];

  it("classe de la plus peuplée à la moins peuplée", () => {
    expect(byPopulationDesc(list).map((c) => c.nom)).toEqual(["A", "B", "C"]);
  });

  it("départage les populations égales par nom (rendu stable au build)", () => {
    const tied = byPopulationDesc([list[2], list[0]]).map((c) => c.nom);
    expect(tied).toEqual(["B", "C"]);
  });

  it("tronque à `count` quand il est fourni", () => {
    expect(byPopulationDesc(list, 2).map((c) => c.nom)).toEqual(["A", "B"]);
  });
});

describe("fastestTo", () => {
  const proche = makeCommune({
    slug: "proche",
    nom: "Proche",
    airports: { orly: { km: 5, min: 12 }, cdg: { km: 40, min: 55 }, beauvais: { km: 95, min: 85 } },
  });
  const loin = makeCommune({
    slug: "loin",
    nom: "Loin",
    airports: { orly: { km: 35, min: 48 }, cdg: { km: 12, min: 18 }, beauvais: { km: 70, min: 62 } },
  });

  it("classe par durée croissante vers l'aéroport demandé", () => {
    expect(fastestTo([loin, proche], "orly").map((c) => c.nom)).toEqual(["Proche", "Loin"]);
    expect(fastestTo([proche, loin], "cdg").map((c) => c.nom)).toEqual(["Loin", "Proche"]);
  });

  it("tronque à `count` quand il est fourni", () => {
    expect(fastestTo([loin, proche], "beauvais", 1).map((c) => c.nom)).toEqual(["Loin"]);
  });

  it("renvoie une liste vide sans planter sur une entrée vide", () => {
    expect(fastestTo([], "orly", 5)).toEqual([]);
  });
});

describe("averageMinutes", () => {
  it("arrondit la moyenne des durées", () => {
    const list = [
      makeCommune({ slug: "a", nom: "A", parisCentre: { km: 5, min: 20 } }),
      makeCommune({ slug: "b", nom: "B", parisCentre: { km: 9, min: 31 } }),
    ];
    expect(averageMinutes(list, "parisCentre")).toBe(26); // 25,5 → 26
  });

  it("renvoie null sur une liste vide (pas de NaN affiché)", () => {
    expect(averageMinutes([], "orly")).toBeNull();
  });
});

describe("departementStats", () => {
  it("agrège compte, population et moyennes", () => {
    const stats = departementStats([
      makeCommune({ slug: "a", nom: "A", population: 30_000, parisCentre: { km: 5, min: 15 } }),
      makeCommune({ slug: "b", nom: "B", population: 20_000, parisCentre: { km: 9, min: 25 } }),
    ]);
    expect(stats.communeCount).toBe(2);
    expect(stats.population).toBe(50_000);
    expect(stats.averageMinutes.parisCentre).toBe(20);
    expect(stats.closestToParis?.nom).toBe("A");
  });

  it("n'est en zone tarif fixe que si TOUTES les communes le sont", () => {
    const mixte = departementStats([
      makeCommune({ slug: "a", nom: "A", inFixedZone: true }),
      makeCommune({ slug: "b", nom: "B", inFixedZone: false }),
    ]);
    expect(mixte.inFixedZone).toBe(false);

    const toutes = departementStats([
      makeCommune({ slug: "a", nom: "A", inFixedZone: true }),
      makeCommune({ slug: "b", nom: "B", inFixedZone: true }),
    ]);
    expect(toutes.inFixedZone).toBe(true);
  });

  it("ne déclare pas la zone tarif fixe sur un département sans commune", () => {
    const vide = departementStats([]);
    expect(vide.inFixedZone).toBe(false);
    expect(vide.closestToParis).toBeNull();
    expect(vide.averageMinutes.orly).toBeNull();
  });
});

describe("departementSlug / departementCodeFromSlug", () => {
  it("slugifie le nom du département", () => {
    expect(departementSlug("94")).toBe("val-de-marne");
    expect(departementSlug("95")).toBe("val-d-oise");
    expect(departementSlug("75")).toBe("paris");
  });

  it("fait l'aller-retour sur les 8 départements franciliens", () => {
    for (const code of ["75", "77", "78", "91", "92", "93", "94", "95"]) {
      expect(departementCodeFromSlug(departementSlug(code))).toBe(code);
    }
  });

  it("renvoie undefined pour un slug inconnu", () => {
    expect(departementCodeFromSlug("rhone")).toBeUndefined();
  });
});

describe("departementLe / departementDe", () => {
  it("accorde l'article au genre et au nombre du département", () => {
    expect(departementLe("94")).toBe("le Val-de-Marne");
    expect(departementLe("77")).toBe("la Seine-et-Marne");
    expect(departementLe("78")).toBe("les Yvelines");
    expect(departementLe("91")).toBe("l'Essonne"); // élision : jamais « le Essonne »
  });

  it("contracte correctement l'article avec « de »", () => {
    expect(departementDe("94")).toBe("du Val-de-Marne");
    expect(departementDe("78")).toBe("des Yvelines");
    expect(departementDe("91")).toBe("de l'Essonne");
    expect(departementDe("93")).toBe("de la Seine-Saint-Denis");
  });

  it("couvre les 8 départements franciliens", () => {
    for (const code of ["75", "77", "78", "91", "92", "93", "94", "95"]) {
      expect(departementLe(code)).not.toBe(code);
      expect(departementDe(code)).not.toBe(`de ${code}`);
    }
  });

  it("retombe sur un repli lisible pour un code inconnu", () => {
    expect(departementLe("99")).toBe("99");
    expect(departementDe("99")).toBe("de 99");
  });
});
