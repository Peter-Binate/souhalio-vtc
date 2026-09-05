// Données de référence des 3 aéroports parisiens desservis (LP-21).
// Faits publics et stables (implantation, terminaux, code IATA, typologie de trafic) —
// aucun placeholder business ici : tarifs, téléphone et engagements viennent de lib/constants.ts.
import type { AirportKey } from "@/lib/communes";

export type Aeroport = {
  /** Clé du trajet correspondant dans data/communes.json (`airports.<key>`). */
  key: AirportKey;
  /** Clé du tarif fixe dans AIRPORT_FARES (lib/constants.ts). */
  fareKey: "ORLY" | "CDG" | "BEAUVAIS";
  slug: string;
  nom: string;
  nomCourt: string;
  /** `nomCourt` précédé de sa préposition, élision comprise ("d'Orly", "de Beauvais"). */
  deNomCourt: string;
  iata: string;
  /** Commune(s) d'implantation, telle qu'on l'écrirait dans une phrase. */
  implantation: string;
  /** Position par rapport à Paris, en toutes lettres. */
  situation: string;
  terminaux: readonly string[];
  /** 1 à 2 phrases factuelles sur l'aéroport (trafic, desserte). */
  presentation: string;
};

export const AEROPORTS: readonly Aeroport[] = [
  {
    key: "orly",
    fareKey: "ORLY",
    slug: "orly",
    nom: "Aéroport de Paris-Orly",
    nomCourt: "Orly",
    deNomCourt: "d'Orly",
    iata: "ORY",
    implantation: "les communes d'Orly (94) et de Paray-Vieille-Poste (91)",
    situation: "au sud de Paris, à une quinzaine de kilomètres du centre",
    terminaux: ["Orly 1", "Orly 2", "Orly 3", "Orly 4"],
    presentation:
      "Deuxième aéroport français, Orly concentre les vols intérieurs, l'Europe, le Maghreb et l'Outre-mer. Ses quatre terminaux sont contigus et reliés entre eux à pied.",
  },
  {
    key: "cdg",
    fareKey: "CDG",
    slug: "roissy-charles-de-gaulle",
    nom: "Aéroport de Paris-Charles de Gaulle (Roissy)",
    nomCourt: "Roissy-CDG",
    deNomCourt: "de Roissy-CDG",
    iata: "CDG",
    implantation: "la commune de Roissy-en-France (95)",
    situation: "au nord-est de Paris, à environ 25 kilomètres du centre",
    terminaux: ["Terminal 1", "Terminal 2 (halls 2A à 2G)", "Terminal 3"],
    presentation:
      "Premier aéroport français et principal hub long-courrier du pays. Les terminaux sont éloignés les uns des autres : connaître le vôtre à la réservation évite un transfert interne inutile. Une gare TGV dessert le Terminal 2.",
  },
  {
    key: "beauvais",
    fareKey: "BEAUVAIS",
    slug: "beauvais-tille",
    nom: "Aéroport de Paris-Beauvais (Beauvais-Tillé)",
    nomCourt: "Beauvais",
    deNomCourt: "de Beauvais",
    iata: "BVA",
    implantation: "la commune de Tillé, près de Beauvais (60, Oise)",
    situation: "au nord de Paris, à environ 85 kilomètres du centre",
    terminaux: ["Terminal 1", "Terminal 2"],
    presentation:
      "Aéroport des compagnies low-cost desservant l'Europe. Il se situe hors d'Île-de-France : comptez largement plus d'une heure de route depuis Paris, ce qui rend l'anticipation de la réservation indispensable.",
  },
] as const;

export const aeroportBySlug = new Map(AEROPORTS.map((a) => [a.slug, a]));
