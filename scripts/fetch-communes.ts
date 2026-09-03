// One-off : récupère les communes d'Île-de-France depuis geo.api.gouv.fr, filtre celles
// de plus de 10 000 habitants, écrit data/communes.raw.json (committé, source pour
// scripts/enrich-communes.ts). Ne pas exécuter au build/CI.
//
//   node --import ./scripts/register-ts-paths.mjs scripts/fetch-communes.ts
//
// cf. programmatic-seo.md §2-3 et PRPs/LP-19-seo-programmatique-villes.md.
import ky from "ky";
import { writeFileSync } from "node:fs";
import { z } from "zod";
import { communeApiSchema, type CommuneApi } from "@/schemas/commune";

const IDF_REGION_CODE = "11"; // Île-de-France
const POPULATION_MIN = 10_000;
const OUT_PATH = new URL("../data/communes.raw.json", import.meta.url);

async function main() {
  console.log(`[fetch-communes] récupération des communes région ${IDF_REGION_CODE}…`);

  const json = await ky
    .get("https://geo.api.gouv.fr/communes", {
      searchParams: {
        codeRegion: IDF_REGION_CODE,
        fields: "nom,code,codesPostaux,population,centre,departement",
        format: "json",
        geometry: "centre",
      },
      timeout: 30_000,
      retry: 2,
    })
    .json();

  const all = z.array(communeApiSchema).parse(json);
  const filtered: CommuneApi[] = all.filter((c) => c.population > POPULATION_MIN);

  console.log(
    `[fetch-communes] ${all.length} communes IDF, ${filtered.length} > ${POPULATION_MIN} habitants.`,
  );

  writeFileSync(OUT_PATH, `${JSON.stringify(filtered, null, 2)}\n`, "utf-8");
  console.log(`[fetch-communes] écrit ${OUT_PATH.pathname}`);
}

main().catch((err) => {
  console.error("[fetch-communes] échec :", err);
  process.exitCode = 1;
});
