# CLAUDE.md

Instructions destinées à Claude Code pour ce dépôt. À lire avant toute génération de code.

## Projet

Landing page de conversion pour un chauffeur VTC (Jhon Doe), en Île-de-France.
**But n°1 : déclencher des appels téléphoniques.** But secondaire : WhatsApp, puis formulaire.
Élément central : un **simulateur d'itinéraire** (carte + estimation de prix) dans le hero.

Le ton du contenu est **professionnel, fiable, business** (réassurance par la sérénité et l'efficacité). Ne pas rendre les textes chaleureux/familiers.

## Stack (ne pas dévier sans demande explicite)

- **Next.js** — App Router, React Server Components par défaut.
- **TypeScript** strict.
- **shadcn/ui** + **Tailwind CSS v4** (config CSS-first via `@theme` dans `globals.css`).
- **Zod** pour toute validation (formulaires **et** réponses d'API externes).
- **TanStack Query** pour le fetching/cache côté client.
- **ky** comme client HTTP (jamais `fetch` brut ni `axios`).
- **MapLibre GL JS** + **MapTiler** pour la carte et le géocodage.
- **OpenRouteService** pour le calcul d'itinéraire.
- **Pas de back-end dédié, pas de base de données.** Uniquement des Route Handlers Next.js comme proxy.

## Commandes

```bash
npm run dev
npm run build
npm run lint
npx shadcn@latest add <composant>   # NE PAS écrire les composants ui/ à la main
```

## Règle critique : clés API

- `NEXT_PUBLIC_MAPTILER_KEY` → **client**, publique, restreinte par domaine. Utilisable dans les composants carte/géocodage.
- `ORS_API_KEY` → **serveur uniquement**. Utilisée **exclusivement** dans `app/api/route/route.ts`.
  - ❌ Ne JAMAIS l'exposer côté client, ne jamais la préfixer `NEXT_PUBLIC_`, ne jamais appeler `api.openrouteservice.org` depuis un composant.
  - ✅ Le client appelle toujours `/api/route`, qui appelle ORS côté serveur.

## Architecture & principes

- **RSC par défaut.** Ajouter `"use client"` uniquement pour les composants interactifs (carte, formulaire, hooks). Garder les sections statiques en Server Components.
- **MapLibre est strictement client-side.** L'importer via `next/dynamic` avec `{ ssr: false }` et importer son CSS. Voir `ai_docs/maplibre-maptiler.md`.
- **Séparation des responsabilités :** géocodage/carte (MapTiler, client) vs directions (ORS, serveur) vs tarification (`lib/pricing.ts`, pur, testable).
- **Aucune donnée secrète ni logique métier sensible côté client** — mais la grille tarifaire n'est pas secrète et peut vivre côté client.

## Structure des dossiers

```
app/            layout, page, globals.css, api/route/route.ts
components/ui/       shadcn (générés par CLI)
components/sections/ une section = un fichier (hero, tarifs, services, zones, about, avis, contact)
components/itinerary/ simulateur (map, autocomplete, form, estimation)
components/layout/    header, footer, sticky-call-button
lib/            constants, pricing, ky, ors, query-client
schemas/        schémas Zod
ai_docs/        documentation de référence (LIRE avant d'implémenter une feature)
```

## Conventions

- **Imports absolus** via l'alias `@/` (ex. `@/lib/pricing`, `@/components/ui/button`).
- **Validation systématique avec Zod** : entrées de formulaire (via `zodResolver` si react-hook-form) et **réponses d'API externes** (`schema.parse(await res.json())`). Ne jamais faire confiance à une réponse ORS/MapTiler sans la parser.
- **TanStack Query** : `useMutation` pour le calcul d'itinéraire déclenché au submit ; clés de query stables ; pas de `useEffect` de fetching manuel.
- **ky** : instances centralisées dans `lib/ky.ts` (une pour l'API interne, une côté serveur pour ORS). Gérer les timeouts et le retry via ky.
- **shadcn/ui** : ajouter les composants via la CLI, ne pas réécrire `components/ui/*`. Composer par-dessus.
- **Tailwind** : classes utilitaires ; tokens de thème dans `globals.css`. Pas de CSS-in-JS.
- **Accessibilité & mobile-first** : cibles tactiles ≥ 44px, contrastes AA, la carte ne doit pas piéger le scroll mobile.
- **Placeholders** : toutes les valeurs fictives (téléphone, email, adresse, avis) proviennent de `lib/constants.ts`. Ne pas les coder en dur dans les composants.
- **CTA** : chaque section se termine par un CTA. L'appel (`tel:`) est prioritaire, WhatsApp (`https://wa.me/…`) en secondaire.
- **Bouton d'appel flottant** fixe en bas d'écran sur mobile (levier de conversion n°1).

## Conversion & SEO (à respecter en implémentant)

- Un seul `<h1>` (titre du hero) ; hiérarchie `h2/h3` ensuite.
- Liens `tel:` et `wa.me` sur tous les CTA.
- Données structurées **JSON-LD `LocalBusiness`** dans le layout (nom, téléphone, ville, horaires 24/7, zone, tarifs).
- Balises `alt` descriptives sur les visuels du véhicule.
- `<title>` et meta description : voir `ai_docs/content-reference.md`.

## À NE PAS faire

- ❌ Exposer `ORS_API_KEY` côté client ou appeler ORS depuis un composant.
- ❌ Utiliser `fetch`/`axios` au lieu de `ky`, ou zapper la validation Zod des réponses.
- ❌ Rendre MapLibre côté serveur (erreurs SSR) — toujours `ssr: false`.
- ❌ Utiliser `localStorage`/`sessionStorage` pour de l'état applicatif — préférer l'état React / TanStack Query.
- ❌ Réécrire à la main les composants `components/ui/*` générés par shadcn.
- ❌ Coder en dur des valeurs fictives dans les composants (passer par `lib/constants.ts`).
- ❌ Introduire un back-end, une DB ou un ORM.

## Documentation de référence (`ai_docs/`)

Consulter avant d'implémenter :

- `ai_docs/architecture.md` — architecture, flux de données, gestion des clés.
- `ai_docs/itinerary-feature.md` — spec détaillée du simulateur (contrats, Zod, pricing).
- `ai_docs/openrouteservice.md` — API ORS directions.
- `ai_docs/maplibre-maptiler.md` — intégration carte & géocodage dans Next.js.
- `ai_docs/content-reference.md` — sections et textes de la page.
