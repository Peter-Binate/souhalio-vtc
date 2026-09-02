// Turbopack (next dev) ne résout pas correctement l'URL du Web Worker que
// maplibre-gl déduit en interne via `import.meta.url` : le serveur Next.js
// répond alors avec sa page HTML de fallback (MIME type text/html) au lieu
// du script du worker, et le chargement des tuiles échoue silencieusement.
// On sert donc le worker comme asset statique et on fixe son URL
// explicitement via `setWorkerUrl()` dans components/itinerary/route-map.tsx.
//
// `maplibre-gl-worker.mjs` importe à son tour `./maplibre-gl-shared.mjs`
// (chemin relatif) : les deux fichiers doivent être copiés côte à côte
// à la racine de `public/` pour que cette résolution fonctionne une fois
// le worker servi depuis `/maplibre-gl-worker.mjs`.
import { copyFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const distDir = join(__dirname, "..", "node_modules", "maplibre-gl", "dist");
const destDir = join(__dirname, "..", "public");

mkdirSync(destDir, { recursive: true });
for (const file of ["maplibre-gl-worker.mjs", "maplibre-gl-shared.mjs"]) {
  const src = join(distDir, file);
  const dest = join(destDir, file);
  copyFileSync(src, dest);
  console.log(`[copy-maplibre-worker] ${src} -> ${dest}`);
}
