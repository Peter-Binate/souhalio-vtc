// One-off : construit data/gares.raw.json à partir de l'API SNCF Open Data
// (jeu « gares-de-voyageurs », coordonnées officielles) et d'une liste curatée de gares.
//
//   npm run data:fetch-gares
//
// La liste est volontairement COURTE et curatée : uniquement les gares réellement
// pertinentes pour un transfert VTC (grandes gares parisiennes + 2 gares TGV franciliennes).
// Générer une page par gare de France produirait exactement le contenu mince que Google
// sanctionne (cf. programmatic-seo.md § garde-fous).
import { writeFileSync } from "node:fs";
import { z } from "zod";
import { gareApiSchema, gareRawSchema, type GareRaw } from "@/schemas/gare";

const OUT_PATH = new URL("../data/gares.raw.json", import.meta.url);
const API = "https://ressources.data.sncf.com/api/explore/v2.1/catalog/datasets/gares-de-voyageurs/records";
const FIXED_ZONE_DEPARTEMENTS = new Set(["75", "92", "93", "94"]);

// Éditorial curaté : `query` sert à retrouver la gare dans le jeu SNCF ; le reste est du
// fait public (arrondissement, destinations desservies) qui rend chaque page unique.
type Curated = Pick<GareRaw, "slug" | "nomCourt" | "commune" | "dessertes" | "presentation"> & {
  query: string;
};

const GARES: readonly Curated[] = [
  {
    query: "Paris Gare de Lyon",
    slug: "paris-gare-de-lyon",
    nomCourt: "Gare de Lyon",
    commune: "Paris 12e",
    dessertes: [
      "TGV Sud-Est : Lyon, Marseille, Nice, Montpellier",
      "Alpes et stations de ski (Chambéry, Bourg-Saint-Maurice)",
      "International : Genève, Turin, Milan",
    ],
    presentation:
      "Deuxième gare de France par la fréquentation, la Gare de Lyon dessert tout le sud-est du pays et l'Italie. Ses deux halls (1 et 2) et le hall Méditerranée sont distants de plusieurs centaines de mètres : indiquer son hall à la réservation fait gagner un temps précieux avec des bagages.",
  },
  {
    query: "Paris Nord",
    slug: "paris-gare-du-nord",
    nomCourt: "Gare du Nord",
    commune: "Paris 10e",
    dessertes: [
      "Eurostar : Londres, Bruxelles, Amsterdam",
      "TGV Nord : Lille, Dunkerque, Calais",
      "TER Hauts-de-France et RER B / D",
    ],
    presentation:
      "Première gare d'Europe par le trafic voyageurs, et le point de départ des liaisons internationales vers Londres, Bruxelles et Amsterdam. L'enregistrement Eurostar impose d'arriver largement en avance : c'est la gare où une prise en charge à l'heure compte le plus.",
  },
  {
    query: "Paris Montparnasse",
    slug: "paris-montparnasse",
    nomCourt: "Gare Montparnasse",
    commune: "Paris 15e",
    dessertes: [
      "TGV Atlantique : Bordeaux, Nantes, Rennes, Brest",
      "Toulouse et le Sud-Ouest via Bordeaux",
      "Le Mans, Angers, Laval",
    ],
    presentation:
      "Porte d'entrée de l'ouest et du sud-ouest de la France. La gare s'étend sur plusieurs niveaux et deux ensembles (Montparnasse 1-2-3 et Pasteur) ; connaître son point de dépose évite une longue traversée à pied.",
  },
  {
    query: "Paris Saint-Lazare",
    slug: "paris-saint-lazare",
    nomCourt: "Gare Saint-Lazare",
    commune: "Paris 8e",
    dessertes: [
      "Normandie : Rouen, Le Havre, Caen, Cherbourg",
      "Deauville-Trouville et la côte normande",
      "Transilien lignes J et L",
    ],
    presentation:
      "Gare des liaisons normandes, au cœur du quartier d'affaires de l'Opéra et des grands magasins. Très fréquentée aux heures de pointe, elle demande d'anticiper le trajet retour vers un rendez-vous professionnel.",
  },
  {
    query: "Paris Est",
    slug: "paris-gare-de-l-est",
    nomCourt: "Gare de l'Est",
    commune: "Paris 10e",
    dessertes: [
      "TGV Est : Strasbourg, Nancy, Metz, Reims",
      "International : Luxembourg, Francfort, Stuttgart, Munich",
      "Trains de nuit vers les Alpes et les Pyrénées",
    ],
    presentation:
      "Gare des liaisons vers le Grand Est, le Luxembourg et l'Allemagne. Elle jouxte la Gare du Nord (une dizaine de minutes à pied), ce qui en fait un point de correspondance fréquent entre deux trajets longue distance.",
  },
  {
    query: "Paris Austerlitz",
    slug: "paris-gare-d-austerlitz",
    nomCourt: "Gare d'Austerlitz",
    commune: "Paris 13e",
    dessertes: [
      "Ligne POLT : Orléans, Limoges, Brive, Toulouse",
      "Trains de nuit : Pyrénées, Alpes, Nice, Briançon",
      "RER C et Transilien",
    ],
    presentation:
      "Gare du centre de la France et point de départ des trains de nuit. Les départs et arrivées nocturnes, hors des horaires de transports en commun, en font une gare où le VTC est souvent la seule option praticable.",
  },
  {
    query: "Paris Bercy",
    slug: "paris-gare-de-bercy",
    nomCourt: "Gare de Bercy",
    commune: "Paris 12e",
    dessertes: [
      "Bourgogne et Auvergne : Dijon, Nevers, Clermont-Ferrand",
      "Certains départs Ouigo",
      "Service auto-train (véhicules accompagnés)",
    ],
    presentation:
      "Gare Bercy Bourgogne-Pays d'Auvergne, à quelques centaines de mètres de la Gare de Lyon. Plus petite et moins bien signalée, elle est régulièrement confondue avec sa grande voisine : vérifier laquelle figure sur son billet évite une correspondance en catastrophe.",
  },
  {
    query: "Massy TGV",
    slug: "massy-tgv",
    nomCourt: "Massy TGV",
    commune: "Massy (91)",
    dessertes: [
      "Liaisons province-province sans passer par Paris",
      "Lille, Lyon, Bordeaux, Marseille, Rennes, Nantes",
      "Correspondance RER B et C à Massy-Palaiseau",
    ],
    presentation:
      "Gare d'interconnexion du sud francilien : elle permet de rejoindre la province sans traverser Paris. Elle est distincte de la gare de Massy-Palaiseau (RER), située à quelques centaines de mètres — une confusion fréquente au moment de la dépose.",
  },
  {
    query: "Marne la Vallee Chessy",
    slug: "marne-la-vallee-chessy",
    nomCourt: "Marne-la-Vallée Chessy",
    commune: "Chessy (77)",
    dessertes: [
      "Gare de Disneyland Paris",
      "TGV directs depuis Lille, Lyon, Bordeaux, Rennes",
      "RER A vers Paris",
    ],
    presentation:
      "Gare de Disneyland Paris, à l'est de l'Île-de-France, desservie en direct par des TGV de province. Le trajet depuis Paris dépasse largement la demi-heure : c'est une destination à réserver à l'avance, notamment pour un départ tôt le matin.",
  },
] as const;

async function fetchGare(query: string) {
  const url = new URL(API);
  url.searchParams.set("limit", "1");
  url.searchParams.set("where", `search(nom,"${query}")`);
  url.searchParams.set("select", "nom,codeinsee,codes_uic,position_geographique");

  const res = await fetch(url);
  if (!res.ok) throw new Error(`SNCF Open Data ${res.status} pour « ${query} »`);
  const body = z.object({ results: z.array(gareApiSchema) }).parse(await res.json());
  const hit = body.results[0];
  if (!hit) throw new Error(`Aucune gare trouvée pour « ${query} »`);
  return hit;
}

async function main() {
  const out: GareRaw[] = [];

  for (const curated of GARES) {
    const hit = await fetchGare(curated.query);
    const departement = hit.codeinsee.slice(0, 2);
    console.log(`[fetch-gares] ${curated.nomCourt} → ${hit.nom} (${hit.codeinsee})`);

    out.push(
      gareRawSchema.parse({
        uic: hit.codes_uic.split(";")[0],
        slug: curated.slug,
        nom: hit.nom,
        nomCourt: curated.nomCourt,
        commune: curated.commune,
        codeInsee: hit.codeinsee,
        departement,
        lat: hit.position_geographique.lat,
        lon: hit.position_geographique.lon,
        inFixedZone: FIXED_ZONE_DEPARTEMENTS.has(departement),
        dessertes: curated.dessertes,
        presentation: curated.presentation,
      }),
    );
  }

  writeFileSync(OUT_PATH, `${JSON.stringify(out, null, 2)}\n`, "utf-8");
  console.log(`[fetch-gares] terminé : ${out.length} gares écrites dans ${OUT_PATH.pathname}`);
}

main().catch((err) => {
  console.error("[fetch-gares] échec :", err);
  process.exitCode = 1;
});
