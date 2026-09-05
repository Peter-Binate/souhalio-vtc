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

### [x] LP-04 — Proxy OpenRouteService (Route Handler)

**En tant que** front-end, **je veux** un endpoint interne qui calcule un itinéraire, **afin de** garder la clé ORS secrète.

- **Inclus :** `app/api/route/route.ts`, `lib/ors.ts`, schémas Zod (`schemas/itinerary.ts`), instance `ky` serveur.
- **Critères d'acceptation :**
  - [x] `POST /api/route` renvoie `{ geometry, distanceKm, durationMin }` pour des coordonnées valides
  - [x] Entrée invalide → 400 ; échec ORS → 502 avec message générique (jamais l'erreur brute)
  - [x] `ORS_API_KEY` utilisée uniquement côté serveur (absente du bundle client)
- **Réf. :** `ai_docs/openrouteservice.md`, `ai_docs/patterns.md`, `ai_docs/testing.md`

### [x] LP-05 — Logique de tarification

**En tant que** visiteur, **je veux** une estimation de prix, **afin de** connaître un ordre de grandeur avant d'appeler.

- **Inclus :** `lib/pricing.ts` (`estimatePrice`), override tarif fixe aéroport, majoration nuit/férié. **TDD.**
- **Exclus :** l'UI (ticket LP-07).
- **Critères d'acceptation :**
  - [x] Table de cas limites écrite avant le code (min de course, majoration, arrondi)
  - [x] Trajet aéroport (Orly/CDG/Beauvais depuis Paris/proche banlieue) → tarif fixe prioritaire
- **Réf. :** `ai_docs/itinerary-feature.md`, `ai_docs/testing.md`

### [x] LP-06 — Carte MapLibre & géocodage MapTiler

**En tant que** visiteur, **je veux** saisir des adresses et voir le tracé sur une carte, **afin de** visualiser mon trajet.

- **Inclus :** `components/itinerary/{route-map-loader,route-map,address-autocomplete}.tsx`, `lib/maptiler.ts` (géocodage debouncé).
- **Critères d'acceptation :**
  - [x] Carte rendue en client-only (`dynamic ssr:false` + CSS), aucun crash SSR
  - [x] Autocomplétion FR biaisée Île-de-France, ≥ 3 caractères, debounce ~300 ms
  - [x] Tracé GeoJSON affiché avec `fitBounds` ; ordre `[lon, lat]` respecté
- **Réf. :** `ai_docs/maplibre-maptiler.md`, `ai_docs/patterns.md`

### [x] LP-07 — Section Hero + assemblage du simulateur

**En tant que** visiteur, **je veux** un hero qui accroche et un simulateur fonctionnel, **afin d'**être incité à réserver.

- **Inclus :** `components/sections/hero-itinerary.tsx`, `components/itinerary/{itinerary-simulator,price-estimate}.tsx`, hook `useRoute` (TanStack Query).
- **Critères d'acceptation :**
  - [x] Bouton « Calculer » désactivé tant que les 2 points ne sont pas résolus ; spinner sur `isPending`
  - [x] Panneau « Distance · Durée · Estimation » + mention « estimation indicative » + CTA appel/WhatsApp
  - [x] Sur erreur → message générique + repli sur CTA téléphone
- **Réf. :** `ai_docs/itinerary-feature.md`, `wording.md`

---

## Phase 3 — Sections de contenu

> Toutes ces sections sont des Server Components statiques, textes issus de `wording.md`, chacune terminée par un CTA. Réf. commune : `ai_docs/content-reference.md`.

### [x] LP-08 — Tarifs aéroports (prix fixes)

- [x] Tableau Orly 50 € / CDG 65 € / Beauvais 120 € + mention « départ Paris & proche banlieue » + CTA

### [x] LP-09 — Réserver en direct (engagements)

- [x] 5 avantages (tarif stable, interlocuteur unique, ponctualité, 24/7, véhicule dédié) + CTA appel

### [x] LP-10 — Services

- [x] Grille de services par segment (immédiat/anticipé, aéroports, gares, affaires, province, 24/7) + CTA

### [x] LP-11 — Zones & gares desservies

- [x] Base L'Haÿ-les-Roses (94), IDF + province, liste des gares ; wording SEO local + CTA

### [x] LP-12 — À propos & véhicule

- [x] 4 ans d'expérience, Kia Niro hybride gris foncé, paiement espèces, langue français + CTA

### [x] LP-13 — Avis clients

- [x] Avis **fictifs** balisés depuis `REVIEWS` (`lib/constants.ts`) ; emplacement prévu pour lien Google + CTA

### [x] LP-14 — Contact & formulaire (RGPD)

**En tant que** visiteur, **je veux** un moyen de contact clair, **afin de** réserver.

- **Inclus :** `components/sections/contact.tsx`, formulaire (react-hook-form + `zodResolver`), coordonnées, horaires.
- **Critères d'acceptation :**
  - [x] Téléphone (prioritaire), WhatsApp, email, horaires 24/7
  - [x] Formulaire validé par Zod ; **RGPD** : pas de persistance de PII, mention de consentement/traitement
  - [x] Cible du formulaire documentée (mailto ou service tiers) — pas de back-end
- **Réf. :** `ai_docs/content-reference.md`, `ai_docs/patterns.md`

---

## Phase 4 — Conversion, SEO & finitions

### [x] LP-15 — SEO & données structurées (audit final)

- [x] `<title>`/description, JSON-LD `LocalBusiness` complet, `alt` images véhicule, OpenGraph, `robots`/`sitemap`
- **Réf. :** `ai_docs/content-reference.md`

### [x] LP-16 — Audit responsive, accessibilité & performance

- [x] Passe mobile (≤ 380px), contrastes AA, focus visibles, la carte ne piège pas le scroll mobile
- [x] Lighthouse (perf/a11y/SEO) relevé et écarts traités ou consignés
- **Réf. :** `ai_docs/testing.md`

---

## Phase 5 — Fiabilité

### [x] LP-17 — Vérification & fiabilisation des estimations de durée de trajet

**En tant que** visiteur, **je veux** une durée de trajet réaliste dans le simulateur, **afin de** faire confiance à l'estimation de prix affichée avant d'appeler.

- **Inclus :** mesure de l'écart entre `durationMin` (ORS `driving-car`) et Google Maps sur ≥ 5 trajets réels Île-de-France représentatifs ; documentation ; correctif conditionnel (facteur calibré dans `lib/ors.ts`/`lib/constants.ts`) si l'écart est significatif et systématique.
- **Exclus :** changement de fournisseur de routing, offre ORS payante avec trafic temps réel, révision de la grille tarifaire (`PRICING`).
- **Critères d'acceptation :**
  - [x] Tableau de mesures (ORS vs Google Maps) produit et documenté, avec conclusion chiffrée
  - [x] Point d'arrêt : facteur de correction éventuel confirmé avec l'utilisateur avant application (impacte le prix affiché)
  - [x] Si correctif : calibré sur mesure réelle, testé (`lib/ors.test.ts`), documenté (`ai_docs/openrouteservice.md`)
- **Réf. :** `PRPs/LP-17-verification-duree-trajet.md`, `ai_docs/openrouteservice.md`

---

## Phase 6 — Refonte visuelle

### [x] LP-18 — Intégration CSS de la maquette Stitch (mobile-first)

**En tant que** visiteur, **je veux** une landing page visuellement aboutie et professionnelle, **afin de** faire confiance au service dès la première impression et déclencher l'appel.

- **Inclus :** restylage CSS/Tailwind de toutes les sections (`app/page.tsx` + `components/layout/*`) d'après l'export exact de la maquette Google Stitch « Midnight Elite » (`stitch_plateforme_vtc_professionnelle/code.html` + `DESIGN.md`) ; tokens de thème (couleurs, typographie Montserrat/Inter, rayons, ombre) dans `globals.css` ; icônes Material Symbols ; emplacements image vides `aspect-[4/3]` (chauffeur, véhicule) dans `about.tsx` ; approche mobile-first.
- **Exclus :** toute logique métier, schéma Zod, champ de formulaire, route/API, contenu textuel, image réelle ; bloc « preuve sociale » fictif (avatars + « 1000 clients »), champs date/heure du hero (absents de l'app réelle), liens footer vers des pages inexistantes — cf. `CLAUDE.md` § À NE PAS faire et PRP § Exclus.
- **Critères d'acceptation :**
  - [x] Chaque section reflète fidèlement `code.html` (couleurs exactes, typographie, icônes, ombres) — vérifié visuellement en desktop (1440px)
  - [x] `about.tsx` : 2 emplacements image vides `aspect-[4/3]`
  - [x] Aucune régression fonctionnelle (`npm test` inchangé et vert, 45/45)
  - [~] Mobile-first : classes Tailwind vérifiées par relecture de code (base non préfixée = mobile partout, `sm:`/`md:`/`lg:` pour le desktop) ; **rendu ≤ 380px non capturé visuellement** — le viewport du navigateur automatisé de cette session est resté bloqué à 1470px (`resize_window` sans effet sur `window.innerWidth`), à revérifier dans un vrai navigateur
  - [x] `zones.tsx`/`reviews.tsx` restylés avec les mêmes tokens (confirmé : absents de la maquette)
- **Réf. :** `PRPs/LP-18-integration-maquette-stitch.md`, `stitch_plateforme_vtc_professionnelle/`

---

## Phase 7 — SEO programmatique

### [~] LP-19 — Pages ville Île-de-France (SSG)

**En tant que** visiteur cherchant un VTC dans sa commune, **je veux** trouver une page dédiée à ma ville, **afin de** vérifier rapidement la desserte et le tarif avant d'appeler.

- **Inclus :** `data/communes.json` (communes IDF > 10 000 habitants, enrichi ORS : distances/durées Orly/CDG/Beauvais/Paris) ; `app/vtc/[ville]/page.tsx` (SSG, `generateStaticParams`) ; page hub `app/vtc/page.tsx` ; maillage interne + lien footer ; `generateMetadata`/JSON-LD par ville ; extension `app/sitemap.ts`.
- **Exclus (ce ticket) :** extension province/longue distance (reportée) ; simulateur interactif sur les pages ville ; tarif fixe hors zone `inFixedZone` (75/92/93/94) ; `output: 'export'`.
- **Critères d'acceptation :**
  - [~] `data/communes.json` committé, données ORS réelles — **36/266 communes enrichies** ; le reste est bloqué par un incident externe ORS (« 403 Quota exceeded » persistant malgré quota tableau de bord disponible — bug documenté côté ORS, cf. rapport final). Reprendre avec `npm run data:enrich-communes` (reprise automatique par code INSEE) une fois l'incident résorbé.
  - [x] `npm run build` pré-rend une page statique par commune (36) + le hub, vérifié
  - [x] Tarif fixe affiché seulement si `inFixedZone`, sinon estimation/sur devis — vérifié (Paris vs Avon)
  - [x] Maillage hub + accueil fonctionnel sur chaque page ville ; maillage `nearby` (communes proches) pas encore calculé (dépend de l'enrichissement complet), vide sans casser la page
  - [x] Aucune régression : `npm test` vert (47/47, dont 2 nouveaux tests pour l'option `radiuses` de `getDirections`), `/api/route` inchangé
- **Réf. :** `PRPs/LP-19-seo-programmatique-villes.md`, `programmatic-seo.md`

---

## Phase 8 — Fiabilité (fournisseurs externes)

### [~] LP-20 — Migration formulaire de contact : Formspree → Resend

**En tant que** chauffeur, **je veux** recevoir les demandes du formulaire de contact par email via Resend, **afin de** ne plus dépendre de Formspree pour traiter les réservations.

- **Inclus :** `app/api/contact/route.ts` (Route Handler proxy, sur le modèle `/api/route`), `lib/resend.ts` (client serveur), `lib/contact.ts` mis à jour pour poster vers `/api/contact`, suppression de `formspreeApi` (`lib/ky.ts`), mise à jour de la mention RGPD (`components/sections/contact.tsx`).
- **Exclus :** email de confirmation au visiteur, template HTML (`@react-email/components`), toute persistance de données.
- **Critères d'acceptation :**
  - [~] `POST /api/contact` envoie un email à `BUSINESS.email` via Resend pour une soumission valide — logique testée et validée par tests unitaires (SDK Resend mocké) ; **envoi réel non vérifié** faute de clé Resend valide disponible pendant l'implémentation. À confirmer avec une vraie clé `RESEND_API_KEY`/`RESEND_FROM_EMAIL` (cf. `SETUP-ENV.md`).
  - [x] `RESEND_API_KEY` utilisée uniquement côté serveur (absente du bundle client) — vérifié en navigateur (HTML + bundle JS)
  - [x] Entrée invalide → 400 ; échec Resend → 502 avec message générique (jamais l'erreur brute) — vérifié par tests + `curl` + navigateur (clé placeholder)
  - [x] Comportement UI existant inchangé (succès/erreur, repli CTA téléphone) — repli erreur vérifié en navigateur ; chemin succès inchangé dans le code (`contact.tsx` non modifié hors mention RGPD)
  - [x] Aucune trace résiduelle de Formspree dans le code (`.ts`/`.tsx`) — seules des mentions historiques subsistent dans `CHANGELOG.md`/`docs/adr/`/PRPs archivés
- **Réf. :** `PRPs/LP-20-migration-formspree-resend.md`, `docs/adr/0003-proxy-resend-route-handler.md`, `ai_docs/patterns.md`

---

## Backlog « nice-to-have » (non planifié)

- [ ] Estimation de prix chiffrée avec vraie grille tarifaire (remplacer la grille fictive)
- [ ] Affichage de la note/avis Uber comme preuve sociale (si le client le souhaite)
- [ ] Multi-langue (EN) pour la clientèle aéroport internationale
