# Jhon Doe VTC — Landing page

Landing page de conversion pour un chauffeur privé VTC en Île-de-France.
Objectif principal : générer des **appels téléphoniques** (réservation immédiate ou anticipée).
Fonctionnalité phare : un **simulateur d'itinéraire** (carte + estimation de prix) dans la section hero.

> ⚠️ De nombreuses valeurs sont **fictives** et balisées par des placeholders (téléphone, email, adresse, avis, grille tarifaire). Voir [`ai_docs/content-reference.md`](./ai_docs/content-reference.md) et `lib/constants.ts`. À remplacer avant mise en production.

---

## Stack

| Domaine | Choix |
|---|---|
| Framework | **Next.js** (App Router, React Server Components) |
| Langage | **TypeScript** (strict) |
| UI | **shadcn/ui** + **Tailwind CSS v4** |
| Validation | **Zod** |
| Data fetching / cache | **TanStack Query** (`@tanstack/react-query`) |
| Client HTTP | **ky** |
| Carte | **MapLibre GL JS** + **MapTiler** (tuiles & géocodage) |
| Itinéraire | **OpenRouteService** (directions) |
| Back-end | **Aucun serveur dédié.** Seuls des **Route Handlers** Next.js servent de proxy sécurisé (clé ORS). |

---

## Prérequis

- Node.js ≥ 20
- Un compte **MapTiler** (clé API, restreinte par domaine)
- Un compte **OpenRouteService** (clé API)

---

## Installation

```bash
# 1. Installer les dépendances
npm install

# 2. Copier et remplir les variables d'environnement
cp .env.local.example .env.local

# 3. Lancer le serveur de dev
npm run dev
```

Ouvrir http://localhost:3000.

---

## Variables d'environnement

Voir `.env.local.example`.

| Variable | Portée | Rôle |
|---|---|---|
| `NEXT_PUBLIC_MAPTILER_KEY` | **Client** (publique) | Fond de carte MapLibre + géocodage. **À restreindre par domaine** dans le dashboard MapTiler. |
| `ORS_API_KEY` | **Serveur uniquement** | Appels OpenRouteService depuis le Route Handler. **Ne jamais préfixer `NEXT_PUBLIC_`.** |

> 🔒 La clé ORS ne doit **jamais** transiter côté navigateur. Tout appel ORS passe par `app/api/route`.

---

## Scripts

```bash
npm run dev        # développement
npm run build      # build de production
npm run start      # serveur de production
npm run lint       # ESLint
npx shadcn@latest add <composant>   # ajouter un composant shadcn/ui
```

---

## Structure

```
app/
  layout.tsx              # layout racine + providers (TanStack Query)
  page.tsx                # assemble les sections de la landing page
  globals.css             # Tailwind + tokens de thème
  api/route/route.ts      # PROXY OpenRouteService (serveur, clé secrète)
components/
  ui/                     # composants shadcn/ui
  sections/               # une section = un composant (hero, tarifs, services…)
  itinerary/              # simulateur : carte, formulaire, estimation
  layout/                 # header, footer, bouton d'appel flottant (mobile)
lib/
  constants.ts            # infos business + placeholders + grille tarifaire
  pricing.ts              # estimation de prix (grille + override aéroport)
  ky.ts                   # instances ky
  ors.ts                  # client ORS (serveur)
  query-client.tsx        # provider TanStack Query
schemas/
  itinerary.ts            # schémas Zod (formulaire + réponses API)
ai_docs/                  # documentation de référence pour Claude Code
CLAUDE.md                 # instructions projet pour Claude Code
```

---

## Fonctionnalité : simulateur d'itinéraire

1. L'utilisateur saisit un **départ** et une **destination** (autocomplétion via MapTiler).
2. Au submit, le client appelle `/api/route` (ky + TanStack Query).
3. Le Route Handler interroge **OpenRouteService** avec la clé secrète et renvoie tracé + distance + durée.
4. Le client affiche l'itinéraire sur la carte **MapLibre** et calcule une **estimation de prix** (grille tarifaire, avec **tarif fixe prioritaire** pour Orly / CDG / Beauvais).

Détails complets : [`ai_docs/itinerary-feature.md`](./ai_docs/itinerary-feature.md).

---

## Déploiement

Optimisé pour **Vercel** (Route Handlers = fonctions serverless, aucune infra à gérer).
Configurer `NEXT_PUBLIC_MAPTILER_KEY` et `ORS_API_KEY` dans les variables d'environnement du projet.

---

## Documentation

Le dossier [`ai_docs/`](./ai_docs) contient la documentation de référence :

- [`architecture.md`](./ai_docs/architecture.md) — architecture, flux de données, gestion des clés
- [`itinerary-feature.md`](./ai_docs/itinerary-feature.md) — spec du simulateur (Zod, TanStack Query, pricing)
- [`openrouteservice.md`](./ai_docs/openrouteservice.md) — contrat d'API ORS (directions)
- [`maplibre-maptiler.md`](./ai_docs/maplibre-maptiler.md) — intégration carte dans Next.js
- [`content-reference.md`](./ai_docs/content-reference.md) — sections & textes de la page
