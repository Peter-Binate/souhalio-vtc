# Créer un PRP (Product Requirement Prompt)

Tu dois créer un PRP complet pour un ticket de la **landing page VTC Jhon Doe** (Next.js App Router + shadcn/ui + Tailwind + Zod + TanStack Query + ky ; carte MapLibre/MapTiler + itinéraire OpenRouteService ; **pas de back-end dédié**, seulement des Route Handlers Next.js). Les règles absolues du projet vivent dans `CLAUDE.md` (racine) et priment sur tout le reste.

## Qu'est-ce qu'un PRP ?

Un PRP (Product Requirement Prompt) est un document structuré qui donne à un agent de codage tout ce qu'il faut pour livrer du code prêt pour la production dès la première passe. Il combine :

- **Exigences produit** (quoi construire et pourquoi — souvent déjà posées par le ticket `LP-XX` de `docs/BACKLOG.md` et le contenu de `ai_docs/content-reference.md`)
- **Intelligence du codebase** (patterns existants, fichiers de référence)
- **Guidance d'implémentation** (comment construire)
- **Critères de validation** (comment vérifier que ça marche)

## Processus de recherche

Avant de rédiger le PRP, mène une recherche approfondie :

### 1. Revue de la documentation

- `CLAUDE.md` — règles absolues du projet (elles priment sur tout le reste)
- `ai_docs/index.md` — sommaire de la doc, points d'attention récurrents
- `ai_docs/architecture.md` — architecture Next.js, flux carte/itinéraire, portée des clés API (MapTiler client / ORS serveur)
- `ai_docs/content-reference.md` — sections, contenu, SEO, placeholders (**fait foi sur le périmètre du contenu**)
- `ai_docs/itinerary-feature.md` — contrat `/api/route`, schémas Zod, pricing, hook TanStack Query, découpage des composants
- `ai_docs/openrouteservice.md` — contrat ORS Directions (⚠️ ordre `[lon, lat]`)
- `ai_docs/maplibre-maptiler.md` — intégration carte & géocodage dans Next.js
- `docs/BACKLOG.md` — le ticket `LP-XX` concerné : user story, critères d'acceptation déjà écrits
- `docs/adr/` — décisions structurantes déjà actées (ne pas les recontredire sans nouvel ADR)
- `wording.md` — textes/CTA de référence si la feature concerne du contenu

### 2. Exploration du codebase

- Identifier la section/feature la plus proche déjà implémentée (même forme : composant + éventuel hook TanStack Query + validation Zod ; ou Server Component statique pour une section de contenu)
- Repérer les fichiers à référencer (schéma Zod similaire, composant de section similaire, helper `lib/` déjà écrit)
- Cartographier les modules impactés (`app/`, `components/sections/`, `components/itinerary/`, `lib/`, `schemas/`)

### 3. Recherche web (si nécessaire)

- Documentation de bibliothèque (Next.js App Router, React, shadcn/ui, Tailwind, Zod, TanStack Query, ky, MapLibre GL JS, MapTiler, OpenRouteService…)
- Bonnes pratiques pour ce type de fonctionnalité (a11y, SEO, performance)

### 4. Gabarit de référence

- Utiliser la structure ci-dessous comme guide (pas de template externe pour ce projet)

## Structure de sortie du PRP

Crée un fichier PRP dans `PRPs/` avec cette structure :

```markdown
# [LP-XX] Nom de la fonctionnalité — PRP

## Goal

[Une phrase claire décrivant ce qui est construit]

## Why

[Justification produit — reprend la user story du ticket, lien avec l'objectif de conversion : générer des appels (tel:) / WhatsApp / soumissions de formulaire]

## What

[Description détaillée]

- Limites du périmètre (inclus/exclu — vérifier la section « À NE PAS faire » de `CLAUDE.md`)
- Critères d'acceptation (repris du ticket `docs/BACKLOG.md`)

## Technical Context

### Fichiers à référencer (lecture seule)

- `components/sections/...` ou `components/itinerary/...` — pourquoi ce fichier est pertinent (pattern à répliquer)
- `lib/...`, `schemas/...` — helper/schéma similaire déjà écrit

### Fichiers à créer/modifier

- `schemas/*.ts` — schémas Zod (entrées de formulaire, réponses d'API externes)
- `lib/*.ts` — logique pure (pricing, ors, maptiler, constants) — **la logique métier vit ici, pas dans le JSX**
- `app/api/*/route.ts` — Route Handler proxy si un appel à une API secrète (ORS) est nécessaire
- `components/sections/*.tsx` ou `components/itinerary/*.tsx` — l'UI (RSC par défaut, `"use client"` si interactif)
- `app/page.tsx` / `app/layout.tsx` — wiring de la section, providers, metadata/JSON-LD SEO
- `lib/constants.ts` — si nouvelle donnée business ou placeholder à centraliser

### Patterns existants à suivre

[Patterns du codebase à répliquer — cf. sections « Conventions » et « À NE PAS faire » de `CLAUDE.md`, et les snippets d'`ai_docs/itinerary-feature.md` / `ai_docs/openrouteservice.md` / `ai_docs/maplibre-maptiler.md`]

## Implementation Details

### Contrats d'API / Route Handlers

[Spec des Route Handlers internes concernés — méthode, path (`/api/...`), request/response, codes d'erreur — cohérent avec `ai_docs/itinerary-feature.md` ; pour les API externes, cohérent avec `ai_docs/openrouteservice.md` et `ai_docs/maplibre-maptiler.md`]

### Schémas & données

[Schémas Zod (formulaire, réponses), constantes (`lib/constants.ts`), grille tarifaire — cohérent avec `ai_docs/content-reference.md` et `ai_docs/itinerary-feature.md`]

### Logique métier

[Règles concernées : estimation de prix, override tarif fixe aéroport, géocodage, matching — cas limites à couvrir en TDD dans `lib/`]

### Sécurité & clés API

[Portée des clés : `ORS_API_KEY` serveur uniquement (via Route Handler), `NEXT_PUBLIC_MAPTILER_KEY` client mais restreinte par domaine. RGPD si un formulaire collecte des données personnelles (nom/email/tél) : pas de persistance, mention légale/consentement]

## Validation Criteria

### Exigences fonctionnelles

- [ ] [Critère d'acceptation testable 1]
- [ ] [Critère d'acceptation testable 2]

### Exigences techniques

- [ ] `npm run lint` et `npm run build` (type-check inclus) passent sans erreur
- [ ] Clé `ORS_API_KEY` jamais exposée côté client ; aucun appel ORS depuis un composant
- [ ] Validation Zod aux frontières (formulaire **et** réponses ORS/MapTiler)
- [ ] Logique métier dans `lib/` (ex. `pricing.ts`), testée en TDD ; rien de métier dans le JSX
- [ ] `ky` utilisé (pas de `fetch` brut ni `axios`) ; TanStack Query pour le fetching client
- [ ] MapLibre en client-only (`dynamic ssr:false` + CSS) ; ordre `[lon, lat]` respecté
- [ ] Accessibilité (cibles ≥ 44px, contrastes AA) et rendu mobile vérifiés
- [ ] CTA présents et fonctionnels (`tel:` prioritaire, `wa.me` secondaire) ; un seul `<h1>`
- [ ] Placeholders lus depuis `lib/constants.ts`, aucune valeur fictive codée en dur
- [ ] Aucun secret commité ; appels externes (ORS, MapTiler) mockés en test

### Étapes de test

1. [Processus de vérification pas à pas — cf. la phase TEST de `/epct` : `npm run lint`/`build`, tests unitaires des fonctions `lib/`, test manuel du Route Handler (`curl` POST `/api/route`) et du parcours dans le navigateur]
```

## Confirmation utilisateur

Avant de finaliser le PRP, confirme avec l'utilisateur :

1. Le périmètre est correct (pas de dérive par rapport au ticket/contenu de référence)
2. L'approche correspond aux attentes
3. Aucune exigence manquante

Si l'utilisateur dit "continue" ou confirme, enregistre le PRP dans `PRPs/LP-XX-nom-de-la-feature.md`.

---

**Entrée :** $ARGUMENTS

Décris le ticket ou la fonctionnalité à implémenter (idéalement un identifiant `LP-XX`). Je vais explorer le codebase et rédiger un PRP complet.
