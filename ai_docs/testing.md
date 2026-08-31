# Stratégie de tests

> **Stack de test supposé :** **Vitest** + **React Testing Library** (unitaire/composant), **Playwright** (e2e), **MSW** (mock des API externes). À confirmer/adapter selon `package.json`. Le lint et le build/type-check sont, eux, toujours disponibles et font partie de la barrière minimale.

## Barrière minimale (toujours)

```bash
npm run lint      # ESLint
npm run build     # build + type-check TS (échoue sur toute erreur de type)
```

Un ticket n'est pas « done » si ces deux commandes ne passent pas.

## Quoi tester, et à quel niveau

| Couche                    | Cible                                                                   | Outil                | Priorité        |
| ------------------------- | ----------------------------------------------------------------------- | -------------------- | --------------- |
| `lib/` (fonctions pures)  | `pricing.ts` : estimation, min de course, majoration, override aéroport | Vitest               | **Haute (TDD)** |
| `schemas/`                | parsing Zod : entrées valides/invalides                                 | Vitest               | Moyenne         |
| `app/api/*/route.ts`      | Route Handler : 200 / 400 / 502, ORS **mocké**                          | Vitest + MSW         | Haute           |
| `components/` interactifs | états du simulateur (bouton désactivé, `isPending`, repli sur erreur)   | RTL                  | Moyenne         |
| Carte MapLibre            | **plomberie** (props → source de données), pas les internes de MapLibre | RTL (MapLibre mocké) | Basse           |
| Parcours complet          | happy path simulateur, liens CTA, mobile, un seul `<h1>`                | Playwright           | Moyenne         |

## Règle d'or : appels externes toujours mockés

ORS et MapTiler ne sont **jamais** appelés réellement en test (quota, réseau, non-déterminisme). Les mocker avec MSW (ou `vi.mock`). Si un test « manuel » réel n'a pas pu être fait, le **dire explicitement** — ne jamais présumer qu'il a été fait.

## TDD sur la logique de prix (exemple)

Écrire la table de cas limites **avant** le code :

```ts
// lib/pricing.test.ts
import { describe, it, expect } from "vitest";
import { estimatePrice } from "./pricing";

describe("estimatePrice", () => {
  it("applique le minimum de course sur un trajet très court", () => {
    // 8 + 1×2,2 + 2×0,45 = 11,10 → plancher 20
    expect(estimatePrice(1, 2)).toBe(20);
  });

  it("calcule un trajet standard (arrondi à l'euro)", () => {
    // 8 + 10×2,2 + 15×0,45 = 36,75 → 37
    expect(estimatePrice(10, 15)).toBe(37);
  });

  it("applique la majoration nuit/férié (+15%)", () => {
    // 36,75 × 1,15 = 42,26 → 42
    expect(estimatePrice(10, 15, { isNightOrHoliday: true })).toBe(42);
  });
});
```

> L'**override tarif fixe aéroport** ne vit pas dans `estimatePrice` (qui ne fait que la grille) mais dans la logique de sélection en amont : le tester là où il est implémenté, avec un cas « départ ou arrivée = Orly/CDG/Beauvais → prix fixe, l'estimation calculée est ignorée ».

## Route Handler (exemple d'intégration)

```ts
// tests : POST /api/route
// - coordonnées valides + ORS mocké → 200 { geometry, distanceKm, durationMin }
// - body invalide (coord manquante) → 400
// - ORS renvoie une erreur → 502 avec message générique (pas l'erreur brute)
```

## Sécurité — test non négociable

- [ ] `ORS_API_KEY` **absente du bundle client** : vérifier qu'aucun chunk JS ni réponse réseau côté navigateur ne la contient (grep du build / inspection réseau).

## Tests manuels (checklist)

```bash
npm run dev
# http://localhost:3000
```

- [ ] **Simulateur** : saisir départ/destination (autocomplétion), calculer → tracé + distance/durée + estimation.
- [ ] **Route Handler** :
  ```bash
  curl -X POST http://localhost:3000/api/route \
    -H "Content-Type: application/json" \
    -d '{"from":[2.35,48.85],"to":[2.55,49.01]}'
  ```
- [ ] **Cas limites** : coordonnées manquantes/invalides (400), départ = arrivée, trajet aéroport (override), longue distance.
- [ ] **Erreur externe** (ORS/MapTiler simulé en échec) → message générique + repli CTA téléphone.
- [ ] **Conversion & a11y** : liens `tel:`/`wa.me` cliquables, bouton d'appel flottant mobile, rendu ≤ 380px, contrastes AA, focus visibles, un seul `<h1>`.

## Couverture

Prioriser `lib/` (surtout `pricing.ts`) et les Route Handlers. Ne pas viser 100 % sur l'UI ; viser des tests utiles sur les états et les frontières.

```bash
npm test -- --coverage    # si Vitest configuré avec couverture
```

## Si un test échoue

→ Revenir à la phase **Plan** (`/epct`) et repenser le découpage — ne pas empiler des rustines sur une mauvaise structure.
