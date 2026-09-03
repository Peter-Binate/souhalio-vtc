// Permet aux scripts one-off (fetch-communes.ts, enrich-communes.ts) d'importer le code
// applicatif (lib/, schemas/) avec l'alias `@/` et sans extension, comme dans le reste du
// repo — Node exécute nativement le TypeScript (Node ≥ 22.6) mais ne connaît ni l'alias
// `@/*` de tsconfig.json ni la résolution d'extension implicite. Usage :
//   node --import ./scripts/register-ts-paths.mjs scripts/enrich-communes.ts
import { register } from "node:module";
import { pathToFileURL } from "node:url";

register("./resolve-ts-paths-hook.mjs", pathToFileURL(`${process.cwd()}/scripts/`));
