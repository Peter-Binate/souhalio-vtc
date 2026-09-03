// Hook de résolution de module pour scripts/register-ts-paths.mjs : remappe l'alias `@/`
// (tsconfig.json: "@/*" -> "./*") vers la racine du repo, et retente avec l'extension
// `.ts` quand une résolution extension-less échoue — reproduit le comportement de
// résolution de Next.js/TypeScript pour ces scripts one-off exécutés hors du bundler.
import { pathToFileURL } from "node:url";

const repoRoot = pathToFileURL(`${process.cwd()}/`).href;

export async function resolve(specifier, context, nextResolve) {
  const spec = specifier.startsWith("@/") ? repoRoot + specifier.slice(2) : specifier;

  try {
    return await nextResolve(spec, context);
  } catch (err) {
    if (err?.code === "ERR_MODULE_NOT_FOUND" && !spec.endsWith(".ts")) {
      return nextResolve(`${spec}.ts`, context);
    }
    throw err;
  }
}
