---
description: Explore codebase, create implementation plan, code, and test following EPCT workflow
---

# Explore, Plan, Code, Test Workflow

À la fin de ce message, je vais te demander de faire quelque chose.
Suis le workflow "Explore, Plan, Code, Test" ci-dessous dès le démarrage. C'est la version courte de ce workflow pour la **landing page VTC Jhon Doe** (Next.js App Router + shadcn/ui + Tailwind + Zod + TanStack Query + ky ; carte MapLibre/MapTiler + itinéraire OpenRouteService) — pour un ticket `LP-XX` avec un PRP déjà écrit dans `PRPs/`, préfère `/epct` qui l'exécute avec plus de rigueur.

## Explore

Utilise d'abord des sous-agents parallèles pour trouver et lire tous les fichiers utiles à l'implémentation du ticket, comme exemples ou comme cibles de modification. Les sous-agents doivent retourner les chemins de fichiers pertinents, et toute autre info utile. Commence par `CLAUDE.md` (règles absolues) et `ai_docs/` (`index.md`, architecture, contenu/SEO, feature itinéraire, contrats ORS et MapLibre/MapTiler).

## Plan

Ensuite, réfléchis en profondeur et rédige un plan d'implémentation détaillé. Ordonne du cœur vers la périphérie : schémas Zod → constantes/logique `lib/` → Route Handler (si API secrète) → hook TanStack Query → composants → wiring `app/`. N'oublie pas les tests (cible prioritaire : les fonctions pures de `lib/`), la metadata/JSON-LD SEO, et la documentation (entrée CHANGELOG, ADR si la décision est structurante). Utilise ton jugement pour ce qui est nécessaire, selon les standards de ce repo (cf. `CLAUDE.md`, snippets d'`ai_docs/`).

Si certains points ne sont pas clairs, utilise des sous-agents parallèles pour faire une recherche web ciblée (Next.js, React, shadcn/ui, Tailwind, Zod, TanStack Query, ky, MapLibre, MapTiler, OpenRouteService). Ils ne doivent retourner que des informations utiles, sans bruit.

Si des questions bloquantes subsistent, ou si le périmètre dévie de ce que décrit le ticket/contenu de référence (`docs/BACKLOG.md`, `ai_docs/content-reference.md`), **pause ici** et pose ces questions à l'utilisateur avant de continuer.

## Code

Quand tu as un plan d'implémentation solide, tu peux commencer à écrire le code. Suis le style du codebase existant (cf. `CLAUDE.md`, snippets d'`ai_docs/`) — logique métier dans `lib/` (ex. `pricing.ts`), jamais dans le JSX ; **clé ORS strictement serveur** (via `/api/route`), jamais côté client ; **MapLibre client-only** (`dynamic ssr:false` + CSS) ; validation Zod aux frontières ; `ky` (pas de `fetch` brut) ; placeholders lus depuis `lib/constants.ts`. Corrige les avertissements de lint qui te semblent raisonnables.

## Test

Utilise des sous-agents parallèles pour lancer les vérifications (`npm run lint`, `npm run build` pour le type-check, `npm test` si configuré) et assure-toi qu'elles passent toutes.

Si tes changements touchent le Route Handler ou le simulateur de façon significative, teste-les manuellement : `curl` POST sur `http://localhost:3000/api/route` pour le cas nominal et les cas limites (coordonnées invalides, trajet aéroport avec override tarif fixe), puis le parcours dans le navigateur (`npm run dev`). Vérifie aussi que la clé `ORS_API_KEY` n'apparaît jamais côté client. Dresse une liste de ce qu'il faut tester, et utilise un sous-agent pour cette étape. Les appels externes (ORS, MapTiler) sont toujours mockés en test.

Si tes tests révèlent des problèmes, retourne à la phase de planification et réfléchis en profondeur.

## Rédige un compte-rendu

Quand tu es satisfait de ton travail, rédige un court rapport pouvant servir de description de PR. Inclus ce que tu voulais faire, les choix effectués avec leur justification brève, et les commandes lancées au passage qui pourraient être utiles à de futurs développeurs.
