# Backlog — Landing page VTC Jhon Doe

Tickets d'implémentation, ordonnés par dépendance. Un ticket = une unité livrable et testable.
Workflow : `/create-prp LP-XX` pour cadrer, puis `/epct LP-XX` (ou `/explore-and-plan` pour les tickets simples).

**Légende :** `[ ]` à faire · `[~]` en cours · `[x]` terminé.

---

## Definition of Done (globale — s'applique à chaque ticket)

- [ ] `npm run lint` et `npm run build` (type-check inclus) passent sans erreur
- [ ] Validation Zod aux frontières (formulaire **et** réponses d'API externes) là où c'est pertinent
- [ ] Logique métier dans `lib/`, testée (TDD pour les fonctions pures) ; rien de métier dans le JSX
- [ ] `ky` utilisé (pas de `fetch` brut ni `axios`) ; TanStack Query pour le fetching client
- [ ] Clé `ORS_API_KEY` jamais exposée côté client ; `NEXT_PUBLIC_MAPTILER_KEY` restreinte par domaine
- [ ] Placeholders lus depuis `lib/constants.ts` (aucune valeur fictive en dur)
- [ ] Accessibilité (cibles ≥ 44px, contrastes AA) et rendu mobile (≤ 380px) vérifiés
- [ ] CTA présents et fonctionnels quand la section en comporte (`tel:` prioritaire, `wa.me` secondaire)
- [ ] Appels externes (ORS, MapTiler) mockés en test ; aucun secret commité
- [ ] Case du backlog cochée `[x]` et entrée CHANGELOG ajoutée ; ADR créé si décision structurante

Références transverses : `CLAUDE.md`, `ai_docs/index.md`, `ai_docs/patterns.md`, `ai_docs/testing.md`.

---

## Phase 1 — Fondations

### [ ] LP-01 — Initialisation du projet & structure

**En tant que** développeur, **je veux** un squelette Next.js configuré, **afin de** partir sur des bases conformes aux conventions du repo.

- **Inclus :** app Next.js (App Router, TS strict), Tailwind v4, init shadcn/ui, ESLint, structure de dossiers (`app/`, `components/{ui,sections,itinerary,layout}`, `lib/`, `schemas/`), `.env.local.example`.
- **Exclus :** toute section de contenu, la carte, le pricing (tickets suivants).
- **Critères d'acceptation :**
  - [ ] `npm run dev` sert une page vide sans erreur
  - [ ] shadcn/ui initialisé, un composant de test (`Button`) ajouté via la CLI
  - [ ] Alias d'import `@/` fonctionnel
- **Réf. :** `ai_docs/architecture.md`, `README.md`

### [x] LP-02 — Constantes business & placeholders

**En tant que** développeur, **je veux** centraliser les données business et placeholders, **afin de** ne rien coder en dur et faciliter le remplacement du fictif.

- **Inclus :** `lib/constants.ts` (`BUSINESS`, `AIRPORT_FARES`, `PRICING`, `REVIEWS`), helpers CTA (`telHref`, `waHref`).
- **Critères d'acceptation :**
  - [x] Toutes les valeurs fictives sont balisées et proviennent de ce fichier
  - [x] `telHref`/`waHref` normalisent correctement le numéro (`+33…` / `33…`)
- **Réf. :** `ai_docs/content-reference.md`, `ai_docs/patterns.md`

### [x] LP-03 — Layout, providers & shell SEO

**En tant que** visiteur, **je veux** un en-tête, un pied de page et un accès permanent à l'appel, **afin de** pouvoir contacter le chauffeur à tout moment.

- **Inclus :** `app/layout.tsx` (metadata `<title>`/description, `QueryClientProvider`, JSON-LD `LocalBusiness`), `components/layout/{header,footer,sticky-call-button}.tsx`.
- **Critères d'acceptation :**
  - [x] Bouton d'appel flottant visible en permanence sur mobile
  - [x] `<title>`, meta description et JSON-LD conformes à `content-reference.md`
  - [x] Un seul `<h1>` sur la page (dans le hero, ajouté plus tard)
- **Réf. :** `ai_docs/content-reference.md` (SEO), `ai_docs/patterns.md`

---

## Phase 2 — Simulateur d'itinéraire

### [ ] LP-04 — Proxy OpenRouteService (Route Handler)

**En tant que** front-end, **je veux** un endpoint interne qui calcule un itinéraire, **afin de** garder la clé ORS secrète.

- **Inclus :** `app/api/route/route.ts`, `lib/ors.ts`, schémas Zod (`schemas/itinerary.ts`), instance `ky` serveur.
- **Critères d'acceptation :**
  - [ ] `POST /api/route` renvoie `{ geometry, distanceKm, durationMin }` pour des coordonnées valides
  - [ ] Entrée invalide → 400 ; échec ORS → 502 avec message générique (jamais l'erreur brute)
  - [ ] `ORS_API_KEY` utilisée uniquement côté serveur (absente du bundle client)
- **Réf. :** `ai_docs/openrouteservice.md`, `ai_docs/patterns.md`, `ai_docs/testing.md`

### [ ] LP-05 — Logique de tarification

**En tant que** visiteur, **je veux** une estimation de prix, **afin de** connaître un ordre de grandeur avant d'appeler.

- **Inclus :** `lib/pricing.ts` (`estimatePrice`), override tarif fixe aéroport, majoration nuit/férié. **TDD.**
- **Exclus :** l'UI (ticket LP-07).
- **Critères d'acceptation :**
  - [ ] Table de cas limites écrite avant le code (min de course, majoration, arrondi)
  - [ ] Trajet aéroport (Orly/CDG/Beauvais depuis Paris/proche banlieue) → tarif fixe prioritaire
- **Réf. :** `ai_docs/itinerary-feature.md`, `ai_docs/testing.md`

### [ ] LP-06 — Carte MapLibre & géocodage MapTiler

**En tant que** visiteur, **je veux** saisir des adresses et voir le tracé sur une carte, **afin de** visualiser mon trajet.

- **Inclus :** `components/itinerary/{route-map-loader,route-map,address-autocomplete}.tsx`, `lib/maptiler.ts` (géocodage debouncé).
- **Critères d'acceptation :**
  - [ ] Carte rendue en client-only (`dynamic ssr:false` + CSS), aucun crash SSR
  - [ ] Autocomplétion FR biaisée Île-de-France, ≥ 3 caractères, debounce ~300 ms
  - [ ] Tracé GeoJSON affiché avec `fitBounds` ; ordre `[lon, lat]` respecté
- **Réf. :** `ai_docs/maplibre-maptiler.md`, `ai_docs/patterns.md`

### [ ] LP-07 — Section Hero + assemblage du simulateur

**En tant que** visiteur, **je veux** un hero qui accroche et un simulateur fonctionnel, **afin d'**être incité à réserver.

- **Inclus :** `components/sections/hero-itinerary.tsx`, `components/itinerary/{itinerary-simulator,price-estimate}.tsx`, hook `useRoute` (TanStack Query).
- **Critères d'acceptation :**
  - [ ] Bouton « Calculer » désactivé tant que les 2 points ne sont pas résolus ; spinner sur `isPending`
  - [ ] Panneau « Distance · Durée · Estimation » + mention « estimation indicative » + CTA appel/WhatsApp
  - [ ] Sur erreur → message générique + repli sur CTA téléphone
- **Réf. :** `ai_docs/itinerary-feature.md`, `wording.md`

---

## Phase 3 — Sections de contenu

> Toutes ces sections sont des Server Components statiques, textes issus de `wording.md`, chacune terminée par un CTA. Réf. commune : `ai_docs/content-reference.md`.

### [ ] LP-08 — Tarifs aéroports (prix fixes)

- [ ] Tableau Orly 50 € / CDG 65 € / Beauvais 120 € + mention « départ Paris & proche banlieue » + CTA

### [ ] LP-09 — Réserver en direct (engagements)

- [ ] 5 avantages (tarif stable, interlocuteur unique, ponctualité, 24/7, véhicule dédié) + CTA appel

### [ ] LP-10 — Services

- [ ] Grille de services par segment (immédiat/anticipé, aéroports, gares, affaires, province, 24/7) + CTA

### [ ] LP-11 — Zones & gares desservies

- [ ] Base L'Haÿ-les-Roses (94), IDF + province, liste des gares ; wording SEO local + CTA

### [ ] LP-12 — À propos & véhicule

- [ ] 4 ans d'expérience, Kia Niro hybride gris foncé, paiement espèces, langue français + CTA

### [ ] LP-13 — Avis clients

- [ ] Avis **fictifs** balisés depuis `REVIEWS` (`lib/constants.ts`) ; emplacement prévu pour lien Google + CTA

### [ ] LP-14 — Contact & formulaire (RGPD)

**En tant que** visiteur, **je veux** un moyen de contact clair, **afin de** réserver.

- **Inclus :** `components/sections/contact.tsx`, formulaire (react-hook-form + `zodResolver`), coordonnées, horaires.
- **Critères d'acceptation :**
  - [ ] Téléphone (prioritaire), WhatsApp, email, horaires 24/7
  - [ ] Formulaire validé par Zod ; **RGPD** : pas de persistance de PII, mention de consentement/traitement
  - [ ] Cible du formulaire documentée (mailto ou service tiers) — pas de back-end
- **Réf. :** `ai_docs/content-reference.md`, `ai_docs/patterns.md`

---

## Phase 4 — Conversion, SEO & finitions

### [ ] LP-15 — SEO & données structurées (audit final)

- [ ] `<title>`/description, JSON-LD `LocalBusiness` complet, `alt` images véhicule, OpenGraph, `robots`/`sitemap`
- **Réf. :** `ai_docs/content-reference.md`

### [ ] LP-16 — Audit responsive, accessibilité & performance

- [ ] Passe mobile (≤ 380px), contrastes AA, focus visibles, la carte ne piège pas le scroll mobile
- [ ] Lighthouse (perf/a11y/SEO) relevé et écarts traités ou consignés
- **Réf. :** `ai_docs/testing.md`

---

## Backlog « nice-to-have » (non planifié)

- [ ] Estimation de prix chiffrée avec vraie grille tarifaire (remplacer la grille fictive)
- [ ] Affichage de la note/avis Uber comme preuve sociale (si le client le souhaite)
- [ ] Multi-langue (EN) pour la clientèle aéroport internationale
