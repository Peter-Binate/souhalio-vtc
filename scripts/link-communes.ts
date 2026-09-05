// Recalcule le maillage interne (`nearby`) de data/communes.json sans toucher à ORS.
// À relancer après chaque vague d'enrichissement — le voisinage change quand de
// nouvelles communes entrent dans le jeu.
//
//   npm run data:link-communes
import { readFileSync, writeFileSync } from "node:fs";
import { z } from "zod";
import { communeSchema, type Commune } from "@/schemas/commune";
import { computeNearby } from "@/scripts/nearby";

const PATH = new URL("../data/communes.json", import.meta.url);

const communes: Commune[] = z
  .array(communeSchema)
  .parse(JSON.parse(readFileSync(PATH, "utf-8")));

computeNearby(communes);
writeFileSync(PATH, `${JSON.stringify(communes, null, 2)}\n`, "utf-8");
console.log(`[link-communes] maillage recalculé pour ${communes.length} communes`);
