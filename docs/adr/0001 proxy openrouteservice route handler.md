# ADR-0001 — Pas de back-end dédié : proxy OpenRouteService via Route Handler Next.js

- **Statut :** Accepté
- **Date :** 2026-08-31
- **Décideurs :** Équipe projet

## Contexte

Le projet est une landing page **front-end** sans back-end dédié ni base de données. Le simulateur d'itinéraire nécessite deux services externes :

- **MapTiler** — tuiles de carte (MapLibre) et géocodage. Ses clés sont **publiques et restreignables par domaine** (Allowed origins) → utilisables sans risque côté navigateur.
- **OpenRouteService (ORS)** — calcul d'itinéraire. Sa clé **n'est pas restreignable par domaine** de façon fiable → une clé présente dans le bundle JS est immédiatement réutilisable par un tiers (vol de quota).

Il faut donc appeler ORS sans exposer sa clé, tout en respectant la contrainte « pas de back-end dédié ».

## Décision

- **Aucun serveur applicatif ni base de données.**
- Les appels ORS passent par un **Route Handler Next.js** (`app/api/route/route.ts`) faisant office de **proxy** : il s'exécute côté serveur (fonction serverless sur Vercel), lit `ORS_API_KEY` depuis l'environnement, et n'expose au client qu'un contrat minimal (`{ geometry, distanceKm, durationMin }`).
- **MapTiler** reste appelé **côté client** avec `NEXT_PUBLIC_MAPTILER_KEY`, **restreinte par domaine** dans le dashboard.
- La logique de tarification n'étant pas secrète, elle vit côté client (`lib/pricing.ts`).

## Alternatives envisagées

- **Appel ORS direct depuis le navigateur** avec une clé `NEXT_PUBLIC_` — écartée : expose la clé, risque de vol de quota. Tolérable seulement pour un POC jetable.
- **Back-end/API séparé (Express, FastAPI…)** — écarté : sur-dimensionné pour une landing page, ajoute de l'infra à gérer.

## Conséquences

**Positives**

- Clé ORS jamais exposée ; déploiement simple (Vercel, zéro infra à administrer).
- Frontière nette : géocodage/carte (MapTiler, client) vs directions (ORS, serveur) vs tarification (`lib/`, client).

**Négatives / coûts assumés**

- Le proxy protège la clé mais **pas le quota** ORS → prévoir un throttling léger côté client (bouton désactivé pendant le calcul).
- Un Route Handler reste du code serveur à tester (cas 400/502, mock ORS).

**Suites**

- Règle inscrite dans `CLAUDE.md` (§ Règle critique : clés API) et `ai_docs/architecture.md`.
- Tickets impactés : `LP-04` (proxy), `LP-06` (MapTiler client).
