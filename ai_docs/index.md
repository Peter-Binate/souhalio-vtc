# Documentation de référence — Jhon Doe VTC

Ce dossier `ai_docs/` regroupe la documentation destinée à un agent de codage (Claude Code) pour livrer du code cohérent avec le projet dès la première passe. **À consulter avant toute implémentation.**

> Les **règles absolues** du projet vivent dans `CLAUDE.md` (racine) et priment sur tout le reste. Ce dossier apporte le contexte technique ; `CLAUDE.md` apporte les contraintes.

## Ordre de lecture recommandé

1. **`CLAUDE.md`** (racine) — règles, conventions, gestion des clés, « à ne pas faire ».
2. **`architecture.md`** — vue d'ensemble, flux de données, arbitrage sécurité des clés.
3. **`content-reference.md`** — ce qu'il faut construire (sections, contenu, SEO) : fait foi sur le périmètre.
4. **`itinerary-feature.md`** — la feature centrale (simulateur) : contrats, Zod, pricing, TanStack Query.
5. **`patterns.md`** — formes canoniques à répliquer (ky, Zod aux frontières, Route Handler, sections, CTA).
6. **`openrouteservice.md`** / **`maplibre-maptiler.md`** — contrats des API externes, à ouvrir au moment d'implémenter la carte/l'itinéraire.
7. **`testing.md`** — stratégie de tests, à ouvrir au moment de la phase TEST.

## Les documents

| Fichier                | Rôle                                                                                                                                                              | Quand le consulter                                                           |
| ---------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| `architecture.md`      | Architecture Next.js sans back-end, flux carte/itinéraire, portée des clés API (MapTiler client / ORS serveur).                                                   | Toujours, avant de coder une feature qui touche au réseau ou à la structure. |
| `content-reference.md` | Structure des sections, faits business réels vs placeholders, règles CTA, SEO/JSON-LD. **Source de vérité du périmètre contenu.**                                 | Pour toute section de la page ou tout wording.                               |
| `itinerary-feature.md` | Spec détaillée du simulateur : contrat `/api/route`, schémas Zod, grille tarifaire (fictive), `estimatePrice()`, hook TanStack Query, découpage des composants.   | Pour toute la feature d'itinéraire/estimation.                               |
| `openrouteservice.md`  | Contrat des API ORS Directions **et Matrix** (⚠️ ordre `[lon, lat]`), client serveur, Route Handler proxy, schémas Zod de réponse.                                | Au moment d'implémenter/modifier `app/api/route/route.ts`, `lib/ors.ts` ou un script d'enrichissement de données. |
| `maplibre-maptiler.md` | Intégration MapLibre dans Next.js (client-only, `dynamic ssr:false`, CSS), tracé GeoJSON, géocodage MapTiler.                                                     | Au moment d'implémenter la carte ou l'autocomplétion d'adresses.             |
| `patterns.md`          | Snippets canoniques transverses : client ky, Zod aux frontières, provider TanStack Query, Route Handler, Server Component de section, helpers CTA, anti-patterns. | Avant de coder, pour répliquer la forme existante au lieu d'improviser.      |
| `testing.md`           | Stratégie de tests (Vitest + RTL + Playwright + MSW), quoi tester par couche, exemple TDD pricing, checklist manuelle, test « clé ORS absente du client ».        | Phase TEST de tout ticket.                                                   |

## Fichiers projet liés (hors `ai_docs/`)

- `CLAUDE.md` — instructions et règles absolues pour l'agent.
- `README.md` — install, variables d'env, scripts, déploiement.
- `.env.local.example` — clés attendues (`NEXT_PUBLIC_MAPTILER_KEY`, `ORS_API_KEY`, `RESEND_API_KEY`, `RESEND_FROM_EMAIL`).
- `wording.md` — deck de copywriting complet (accroches, textes, CTA par section) : **source des textes**.

## Workflows Claude Code (`.claude/commands/`)

| Commande            | Usage                                                                                                     |
| ------------------- | --------------------------------------------------------------------------------------------------------- |
| `/create-prp`       | Rédige un **PRP** (Product Requirement Prompt) complet pour un ticket `LP-XX` avant de coder.             |
| `/epct`             | Workflow rigoureux **Explore → Plan → Code → Test**. À privilégier quand un PRP existe déjà dans `PRPs/`. |
| `/explore-and-plan` | Version courte du même workflow, pour les tickets simples sans PRP.                                       |

## Conventions de dépôt attendues

```
CLAUDE.md              # règles absolues
README.md
.env.local.example
.claude/commands/      # slash-commands ci-dessus
ai_docs/               # ce dossier
PRPs/                  # PRPs générés (LP-XX-nom-de-la-feature.md)
docs/
  BACKLOG.md           # tickets LP-XX (user story + critères d'acceptation + DoD) — seedé
  adr/                 # Architecture Decision Records
    0000-template.md   # gabarit
    0001-…             # proxy ORS via Route Handler (décision actée)
    0002-…             # stack front-end & cartographie (décision actée)
    0003-…             # proxy Resend via Route Handler (décision actée, LP-20)
wording.md
```

Le backlog (`docs/BACKLOG.md`) est déjà découpé en tickets `LP-01` → `LP-16` (fondations → simulateur → sections → SEO/finitions) avec une Definition of Done globale. Deux ADR de départ actent les décisions déjà prises (voir `docs/adr/`).

## Rappels clés (les erreurs les plus probables)

- 🔒 **Clé ORS = serveur uniquement**, via `app/api/route`. Jamais `NEXT_PUBLIC_`, jamais d'appel ORS depuis un composant.
- 🔒 **Clé Resend = serveur uniquement**, via `app/api/contact` (`lib/resend.ts`). Même règle : jamais `NEXT_PUBLIC_`, jamais d'appel Resend depuis un composant (LP-20).
- 🧭 **Ordre des coordonnées `[lon, lat]`** partout (ORS **et** MapLibre) — piège n°1.
- 🗺️ **MapLibre est client-only** : `dynamic(..., { ssr: false })` + import du CSS, sinon crash SSR.
- ✅ **Valider aux frontières avec Zod** : formulaire **et** réponses ORS/MapTiler.
- 🧩 **Logique métier dans `lib/`** (ex. `pricing.ts`), jamais dans le JSX.
- 📞 **Chaque section finit par un CTA**, l'appel (`tel:`) prioritaire, WhatsApp (`wa.me`) en secondaire.
- 🏷️ **Placeholders centralisés** dans `lib/constants.ts` — ne rien coder en dur.
