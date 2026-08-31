# Workflow EPCT — Explore, Plan, Code, Test

Suis rigoureusement ce workflow pour implémenter la tâche fournie en argument : `$ARGUMENTS`

> Si `$ARGUMENTS` référence un ticket existant (ex. `LP-03`, `LP-07`) et qu'un PRP correspondant existe dans `PRPs/`, ce PRP **fait foi** — les phases ci-dessous servent alors à l'exécuter avec rigueur, pas à redécouvrir le périmètre. S'il n'existe pas encore, lance `/create-prp` avant de coder, ou construis le plan de la Phase 2 sur le même canevas (Goal/Why/What/Technical Context/Implementation Details/Validation Criteria).

---

## Phase 1 : EXPLORE

Utilise des sous-agents parallèles (`Explore`) pour explorer le codebase. Chaque sous-agent doit retourner les chemins de fichiers pertinents, pas seulement un résumé.

### À explorer :

- `CLAUDE.md` — règles absolues du projet (elles priment sur tout le reste)
- `ai_docs/index.md` — sommaire et points d'attention récurrents
- `ai_docs/architecture.md` — architecture, flux carte/itinéraire, portée des clés API
- `ai_docs/content-reference.md` — sections, contenu, SEO, placeholders (**fait foi sur le périmètre du contenu**)
- `ai_docs/itinerary-feature.md` — contrat `/api/route`, schémas Zod, pricing, hook TanStack Query, découpage des composants
- `ai_docs/openrouteservice.md` — contrat ORS Directions (⚠️ ordre `[lon, lat]`)
- `ai_docs/maplibre-maptiler.md` — intégration carte & géocodage dans Next.js
- `docs/BACKLOG.md` et `PRPs/*.md` — le ticket `LP-XX` concerné, ses critères d'acceptation et sa Definition of Done
- `docs/adr/` — décisions structurantes déjà actées (ne pas les recontredire sans nouvel ADR)
- `components/`, `lib/`, `schemas/`, `app/` — la section/feature existante la plus proche de celle à implémenter
- `wording.md` — textes/CTA de référence si la feature concerne du contenu

### Critères de sélection :

- La section/feature la plus proche de celle à implémenter (même forme : composant + éventuel hook TanStack Query + validation Zod ; ou Server Component statique pour une section de contenu) — à répliquer, pas à réinventer
- Les fichiers de config impactés (`app/globals.css` pour un token de thème Tailwind, `app/layout.tsx` pour un provider ou la metadata SEO, `package.json` pour une nouvelle dépendance, `next.config.*`)
- Un schéma Zod ou un helper `lib/` existant similaire si le changement s'appuie sur une brique déjà en place

---

## Phase 2 : PLAN

Rédige un plan d'implémentation détaillé, structuré comme les PRP déjà écrits (`PRPs/*.md`). Ordonne du cœur (données/logique) vers la périphérie (UI) :

1. **Schémas Zod** (`schemas/`) — entrées de formulaire + réponses d'API externes ; valider **dans les deux sens**, aux frontières (cf. `ai_docs/itinerary-feature.md`)
2. **Constantes / données** (`lib/constants.ts`) — si nouvelle donnée business ou placeholder ; **source unique de vérité**, jamais de valeur fictive codée en dur ailleurs
3. **Logique pure** (`lib/pricing.ts`, `lib/ors.ts`, `lib/maptiler.ts`) — toute la logique métier (estimation, override tarif fixe aéroport, géocodage) ; **TDD, table de cas limites écrite avant le code** ; aucune I/O secrète côté client
4. **Route Handler** (`app/api/*/route.ts`) — uniquement si un appel à une API secrète (ORS) est nécessaire ; valider l'entrée et la sortie avec Zod ; clé `ORS_API_KEY` serveur uniquement (cf. `CLAUDE.md` § Règle critique : clés API) ; renvoyer un message d'erreur générique, jamais l'erreur externe brute
5. **Hooks TanStack Query** — `useMutation` pour une action déclenchée (calcul d'itinéraire), `useQuery` (avec `enabled`) pour une lecture ; jamais de `useEffect` de fetch manuel ; clés de query stables
6. **Composants** (`components/sections/`, `components/itinerary/`) — RSC par défaut, `"use client"` seulement si interactif ; le composant **orchestre** (état → hook → rendu), il ne contient jamais la règle métier elle-même
7. **Carte MapLibre** si concernée — `dynamic(..., { ssr: false })` + import du CSS + ordre `[lon, lat]` (cf. `ai_docs/maplibre-maptiler.md`)
8. **Wiring** (`app/page.tsx`, `app/layout.tsx`) — insertion de la section, providers, metadata et JSON-LD `LocalBusiness` (cf. `ai_docs/content-reference.md`)
9. **CTA & conversion** — chaque section se termine par un CTA ; appel (`tel:`) prioritaire, WhatsApp (`wa.me`) secondaire ; un seul `<h1>`

### Points d'arrêt :

❓ Si le périmètre dévie de ce qu'un ticket/PRP existant décrit, ou si une question bloquante se pose (choix de contenu non tranché, ambiguïté sur une règle de pricing, donnée business manquante), **PAUSE ICI** et demande à l'utilisateur avant de continuer — ne jamais élargir le scope silencieusement.

---

## Phase 3 : CODE

Implémente en suivant cet ordre — du cœur (données/logique) vers la périphérie (UI), jamais l'inverse :

1. **Schémas Zod** (`schemas/`)
2. **Constantes** (`lib/constants.ts`) si nouvelle donnée / placeholder
3. **Logique pure** (`lib/*.ts`) + tests unitaires — TDD : le test de la table de cas limites avant l'implémentation (cible prioritaire : `lib/pricing.ts`)
4. **Route Handler** (`app/api/*/route.ts`) si applicable — validation Zod entrée/sortie, clé serveur uniquement
5. **Hook TanStack Query** + gestion des états (`isPending`, erreur → repli sur CTA téléphone)
6. **Composant(s)** (`sections/` ou `itinerary/`) — orchestration uniquement, pas de logique métier
7. **Carte MapLibre** (`dynamic ssr:false` + CSS) si applicable
8. **Wiring** dans `app/page.tsx` / `app/layout.tsx` (section, providers, metadata/JSON-LD)

### Règles de code :

- Suivre les patterns des snippets d'`ai_docs/` et les « Conventions » de `CLAUDE.md` — ne pas improviser une forme différente pour un problème déjà résolu ailleurs (client ky centralisé, validation Zod aux frontières, estimation dans `lib/pricing.ts`, carte dynamique client-only)
- TypeScript strict ; typer les fonctions de `lib/` et les contrats de données non triviaux
- Validation aux frontières avec Zod, jamais de validation « à la main » dans un composant ou un Route Handler
- **Clé ORS = serveur uniquement**, via `/api/route` — jamais `NEXT_PUBLIC_`, jamais d'appel ORS depuis un composant
- **MapLibre = client-only** (`ssr: false`) ; ne jamais le rendre côté serveur
- **Placeholders** lus depuis `lib/constants.ts` — jamais de valeur fictive (téléphone, email, avis) en dur
- Pas de `localStorage`/`sessionStorage` pour de l'état applicatif — état React / TanStack Query
- Ne pas réécrire les composants `components/ui/*` générés par shadcn — composer par-dessus
- Commits atomiques (une brique cohérente = un commit), uniquement si l'utilisateur l'a demandé

---

## Phase 4 : TEST

> Framework de test supposé : **Vitest + React Testing Library** (unitaire/composant) et **Playwright** (e2e). Adapter aux commandes réellement configurées dans `package.json`. Le lint et le build/type-check, eux, sont toujours disponibles.

### Vérifications automatiques

```bash
npm run lint                 # ESLint
npm run build                # build + type-check (échoue sur toute erreur TS)
npm test                     # tests unitaires (Vitest) — priorité aux fonctions lib/
npm run test:e2e             # Playwright, si configuré
```

### Tests manuels

Dresse une liste des scénarios à tester et vérifie chacun (à défaut de pouvoir lancer un vrai appel, dis-le explicitement — ne jamais présumer qu'un test manuel a été fait) :

- **Cas nominal** — `npm run dev`, ouvrir `http://localhost:3000`, saisir départ/destination, calculer un itinéraire, vérifier tracé + distance/durée + estimation.
- **Route Handler** — `curl -X POST http://localhost:3000/api/route -H "Content-Type: application/json" -d '{"from":[2.35,48.85],"to":[2.55,49.01]}'`.
- **Cas limites** — coordonnées manquantes/invalides (400), départ = arrivée, trajet aéroport (override tarif fixe), très longue distance.
- **Sécurité clés** — vérifier que `ORS_API_KEY` n'apparaît **jamais** dans le bundle client (inspecter les sources du navigateur / la réponse réseau).
- **Erreurs externes** — simuler un échec ORS/MapTiler (toujours **mocké** en test, jamais d'appel réel) → message générique + repli CTA téléphone.
- **Conversion & a11y** — liens `tel:` et `wa.me` cliquables, bouton d'appel flottant mobile visible, rendu mobile (≤ 380px), contrastes AA, un seul `<h1>`.

### Si des problèmes sont détectés :

→ Retourner à la Phase 2 (Plan) et repenser l'approche — ne pas corriger en accumulant des rustines sur un mauvais découpage.

---

## Rapport Final

Rédige un résumé pouvant servir de description de PR :

- Ce qui a été implémenté (fichiers créés/modifiés, ticket `LP-XX`/PRP concerné)
- Les choix techniques et leur justification — signaler si l'un d'eux mérite un ADR (`docs/adr/`)
- Les commandes exécutées et leur résultat (lint, build, tests)
- Ce qui reste à faire, le cas échéant (tâches reportées explicitement, jamais abandonnées silencieusement)
- Mise à jour de la case `[ ]` → `[x]` dans `docs/BACKLOG.md` si le ticket est terminé, entrée CHANGELOG ajoutée
