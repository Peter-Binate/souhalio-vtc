# Changelog

## LP-18 — Intégration CSS de la maquette Stitch « Midnight Elite »

- Restylage CSS/Tailwind intégral de toutes les sections (header, hero+simulateur, tarifs aéroport, « Pourquoi nous choisir » en grille bento, services, à propos, zones, avis, contact, footer, bouton d'appel flottant) d'après l'export exact `stitch_plateforme_vtc_professionnelle/code.html` + `DESIGN.md` — **aucune logique métier touchée** (confirmé : `lib/`, `schemas/`, `app/api/` inchangés, `npm test` 45/45 sans modification).
- Nouveaux tokens de thème dans `app/globals.css` (`@theme`) : couleurs (`primary` #000000, `accent`/or #bfa15a, `deep-midnight` #0f1115, `surface`/`surface-low`/`border`…), rayons (`rounded-standard`, `rounded-card`), ombre `ambient-shadow`/`hover-lift`.
- Polices Montserrat (headlines) + Inter (corps) via `next/font/google` (remplace Geist), package `material-symbols` (self-hosted, `outlined.css`) pour les icônes — remplace les emojis des CTA.
- `about.tsx` : 2 emplacements image vides (`role="img"`, `aspect-[4/3]`) pour la photo chauffeur et véhicule, dimensionnés d'après la maquette — toujours aucune image réelle codée en dur.
- `address-autocomplete.tsx` : nouvelle prop optionnelle `icon` (purement visuelle) pour afficher une icône Material Symbols dans les champs départ/destination du simulateur.
- **Exclusions délibérées** (contenu fabriqué présent dans l'export Stitch mais non repris) : bloc « preuve sociale » du hero (avatars + « 1000 clients satisfaits », chiffre inventé par l'IA) ; champs `date`/`heure` du formulaire hero (absents du simulateur réel — les ajouter aurait été une nouvelle fonctionnalité) ; liens footer vers des pages inexistantes (Privacy Policy, Terms, Legal Notice, Fleet).
- `direct-booking.tsx` : les 5 avantages existants (`ADVANTAGES`) reformatés en grille bento asymétrique reprenant la structure de la maquette, contenu inchangé.
- `contact.tsx` : mise en page « split » 2 colonnes (cartes de contact cliquables + carte formulaire), **les 7 champs et toute la logique `react-hook-form`/Zod/Formspree restent strictement identiques**.
- Nouvelle dépendance : `material-symbols` (icônes, self-hosted).
- Vérifié : `npm run lint`, `npm test` (45/45, aucun test modifié), `npm run build` passent. Rendu visuel comparé section par section à la maquette en desktop (1440px) via navigateur — très fidèle. **Rendu mobile ≤ 380px non vérifié visuellement** (limite de l'environnement de test : le viewport du navigateur automatisé est resté bloqué à 1470px malgré `resize_window`) ; le mobile-first a été vérifié par relecture de code (classes Tailwind non préfixées = mobile, `sm:`/`md:`/`lg:` pour le desktop, cohérent sur tout le diff) — à confirmer visuellement dans un vrai navigateur.

## LP-17 — Vérification & fiabilisation des estimations de durée de trajet

- **Mesure** (2026-09-02, PRP `PRPs/LP-17-verification-duree-trajet.md`) : comparaison réelle ORS (`/api/route`) vs Google Maps sur 5 trajets Île-de-France (`curl` réel, hors suite automatisée). Constat : ORS reste proche de Google Maps sur autoroute/longue distance (écart −3 % à −7 %), mais sous-estime fortement les trajets urbains courts (−31 % à −34 %) — cohérent avec l'absence de trafic temps réel dans le profil `driving-car` (vitesses moyennes statiques OSM). Deux mesures (banlieue→Paris, Paris→CDG) partiellement biaisées par des incidents temps réel ponctuels côté Google (fermeture de route, accident), non imputables à ORS.
- **Correctif** : `lib/constants.ts` — nouvelle constante `ROUTE_DURATION_CORRECTION` (facteur par palier de distance : ×1,5 < 8 km, ×1,1 entre 8 et 20 km, ×1,0 au-delà — pas de régression continue, seulement 3 points de mesure fiables). Appliquée dans `lib/ors.ts` (`correctDurationMin()`) juste après la conversion `s → min`, donc propagée automatiquement au prix affiché (`lib/pricing.ts` consomme `durationMin`) sans modification de la formule de pricing ni de l'UI.
- Tests : `lib/ors.test.ts` (TDD, 4 nouveaux cas couvrant les 3 paliers + la frontière à 8 km) ; `ai_docs/openrouteservice.md` mis à jour (nouvelle limite documentée dans « Limites & bonnes pratiques »).
- Vérifié : re-test réel des 5 trajets après correctif — l'urbain court (Gare de Lyon → Gare du Nord) passe de 18,4 à 27,6 min (Google : 28 min) ; L'Haÿ-les-Roses → Orly passe de 21,5 à 23,6 min (Google : 23 min). `npm run lint`/`npm test` (45/45)/`npm run build` passent.
- `docs/BACKLOG.md` : `LP-17` coché `[x]`.

## Fix — la carte MapLibre n'apparaît jamais (dev, Turbopack)

- Cause identifiée via la console navigateur de l'utilisateur : `Failed to load module script: The server responded with a non-JavaScript MIME type of "text/html"`. `maplibre-gl` v6 déduit l'URL de son Web Worker (module ES) via `import.meta.url` au runtime ; Turbopack (`next dev`) ne la résout pas en une URL `http(s)` exploitable, Next.js répond alors avec sa page de fallback HTML, et le chargement des tuiles échoue silencieusement (aucune erreur `map.on("error")`, `style.json`/`sprite`/`tiles.json` chargent normalement mais aucune requête `.pbf` n'est jamais émise).
- Correctif : l'URL du worker est désormais fixée explicitement via `setWorkerUrl("/maplibre-gl-worker.mjs")` dans `components/itinerary/route-map.tsx`, vers des assets statiques générés par `scripts/copy-maplibre-worker.mjs` (copie de `maplibre-gl-worker.mjs` **et** `maplibre-gl-shared.mjs` — importé en relatif par le worker — depuis `node_modules/maplibre-gl/dist/` vers `public/`), câblé en `predev`/`prebuild`/`postinstall` dans `package.json`. Les fichiers générés sont gitignorés et exclus du lint (`eslint.config.mjs`).
- `ai_docs/maplibre-maptiler.md` mis à jour (nouvelle section « ⚠️ Carte qui n'apparaît jamais (tuiles jamais chargées) sous Turbopack ») pour éviter la régression.
- Vérifié en conditions réelles (capture d'écran) : le worker et son import relatif se chargent avec `Content-Type: application/javascript` (200), les tuiles `.pbf` sont bien requêtées, et la carte s'affiche (routes, villes, aéroport CDG visibles). `npm run lint`/`npm test`/`npm run build` passent.

## Fix — 502 « Calcul d'itinéraire indisponible » sur `/api/route`

- Cause identifiée en local (log serveur temporaire) : `lib/ors.ts` appelait `https://api.openrouteservice.org/v2/directions/driving-car/geojson` sans header `Accept` explicite → ORS répondait **406 Not Acceptable** (le `Content-Type: application/json` posé automatiquement par `ky` via l'option `json` ne suffit pas), capturé par le `catch` générique du Route Handler et renvoyé en 502.
- Correctif : ajout de `Accept: "application/json, application/geo+json"` aux headers de la requête ORS dans `lib/ors.ts`.
- `ai_docs/openrouteservice.md` mis à jour (snippet + nouvelle section « ⚠️ Header `Accept` obligatoire ») pour éviter la régression.
- `lib/ors.test.ts` mis à jour (assertion sur les headers envoyés).
- Vérifié manuellement : `POST /api/route` avec des coordonnées réelles → 200 avec `geometry`/`distanceKm`/`durationMin` ; cas `400` (coordonnées invalides) toujours correct.

## LP-15 → LP-16 — SEO technique & audit responsive/accessibilité/performance (PRP `PRPs/LP-15-LP-16-seo-a11y-perf.md`)

- **LP-15** : `app/layout.tsx` — ajout de `metadataBase` (`NEXT_PUBLIC_SITE_URL`) et `openGraph` (title/description/url/siteName/locale/type) ; `<title>`, description et JSON-LD `LocalBusiness` déjà conformes depuis LP-03, revérifiés sans modification.
- `app/opengraph-image.tsx` — image OG générée dynamiquement via `ImageResponse` (nom + accroche depuis `BUSINESS`), aucune photo requise.
- `app/robots.ts` et `app/sitemap.ts` — fichiers spéciaux Next.js App Router, testés (`GET /robots.txt`, `GET /sitemap.xml` → 200).
- `NEXT_PUBLIC_SITE_URL` documentée dans `.env.local.example` et `README.md` (placeholder, aucun domaine inventé).
- **LP-16** — corrections issues de l'audit :
  - Focus clavier : remplacement de `outline-none` isolé par un anneau `focus-visible:ring-2` dans `components/sections/contact.tsx` et `components/itinerary/address-autocomplete.tsx` (vérifié réellement au clavier : `:focus-visible` actif, anneau visible).
  - Contraste : `text-zinc-500` en mode sombre remplacé par `text-zinc-400` dans `hero-itinerary.tsx`, `airport-pricing.tsx`, `reviews.tsx`, `contact.tsx` (calcul réel : 4.12:1 → 7.73:1) ; `footer.tsx` passé de `text-zinc-500` à `text-zinc-400` (3.69:1 → 6.92:1, fond `zinc-900` fixe) ; libellés « (optionnel) » du formulaire passés à `text-zinc-500 dark:text-zinc-400` (2.56:1 → 4.81:1 en mode clair).
  - Rendu ≤380px vérifié sans débordement horizontal (simulation via iframe 380px, la fenêtre Chrome ayant une largeur minimale ~735px empêchant un test direct).
  - Cibles tactiles mesurées réellement (30 éléments interactifs) : seuls les contrôles natifs MapLibre (zoom/rotation, 29px) et l'attribution légale (14px) sont sous 44px — non modifiables sans casser la bibliothèque tierce ou l'obligation de licence ; la case à cocher RGPD (20px visuel) a une cible effective de 282×120px via son `<label>`.
  - `cooperativeGestures` reconfirmé : un scroll sur la carte fait défiler la page plutôt que zoomer.
  - Audit Lighthouse (build de production, `npx lighthouse`) : **Accessibilité 100/100, SEO 100/100, Bonnes pratiques 96/100, Performance 68/100.**

## LP-08 → LP-14 — Sections de contenu (PRP `PRPs/LP-08-LP-14-sections-contenu.md`)

- Ajout des 6 sections statiques (`components/sections/{airport-pricing,direct-booking,services,zones,about,reviews}.tsx`) : Server Components, texte de `wording.md`, CTA `tel:`/`wa.me`, un seul `<h2>` chacune.
- LP-08 : tarifs Orly/CDG/Beauvais lus depuis `AIRPORT_FARES`/`AIRPORTS` (`lib/constants.ts`), aucun montant en dur.
- LP-11 : liste des gares desservies conservée telle quelle (« Marne-la-Vallée Chessy » à vérifier — note conservée en commentaire de code, pas affichée aux visiteurs).
- LP-12 : aucune photo du véhicule ajoutée (aucun asset fourni) ; emplacement réservé en commentaire.
- LP-13 : avis mappés depuis `REVIEWS` (déjà balisés « avis fictif » depuis LP-02) ; lien vers les avis Google affiché en texte non cliquable (aucune URL réelle n'existe).
- LP-14 : `components/sections/contact.tsx` (`"use client"`) — bloc coordonnées (`BUSINESS`), formulaire `react-hook-form` + `zodResolver` (`schemas/contact.ts`), soumission vers **Formspree** (`lib/contact.ts`, `lib/use-contact-form.ts`, instance `formspreeApi` dans `lib/ky.ts`), mention de consentement RGPD nommant explicitement Formspree, repli générique + CTA téléphone sur échec réseau.
- Nouvelles dépendances : `react-hook-form`, `@hookform/resolvers`.
- `NEXT_PUBLIC_FORMSPREE_FORM_ID` documentée dans `.env.local.example` et `README.md` (variable publique, comme `NEXT_PUBLIC_MAPTILER_KEY`) — placeholder tant que l'utilisateur n'a pas créé son compte Formspree.
- Wiring définitif dans `app/page.tsx` : `Hero → AirportPricing → DirectBooking → Services → Zones → About → Reviews → Contact`.
- Tests : `schemas/contact.test.ts` (6 tests, validation Zod) et `lib/contact.test.ts` (2 tests, Formspree mocké via `vi.mock("@/lib/ky")`).
- Écart voulu par rapport au PRP : `consentement` implémenté en `z.boolean().refine(...)` plutôt que `z.literal(true)` (incompatible avec une case à cocher décochée par défaut dans `react-hook-form`).

## LP-07 — Section Hero + assemblage du simulateur

- Ajout de `lib/ky.ts` (`internalApi`, instance ky client pour l'API interne) et `lib/use-route.ts` (hook `useRoute`, `useMutation` vers `POST /api/route`, réponse validée par `routeResponseSchema`).
- Ajout de `getFareEstimate` dans `lib/pricing.ts` : combine `getAirportFareOverride` (prioritaire) et `estimatePrice`, avec 2 tests dédiés (13/13 sur `pricing.test.ts`).
- Ajout de `components/itinerary/price-estimate.tsx` (panneau Distance/Durée/Estimation, mention « estimation indicative » ou tarif fixe aéroport, CTA appel + WhatsApp) et `components/itinerary/itinerary-simulator.tsx` (orchestrateur : 2 `AddressAutocomplete`, bouton « Calculer l'itinéraire » désactivé tant que les 2 points ne sont pas résolus, spinner sur `isPending`, carte, repli générique + CTA téléphone sur erreur).
- Ajout de `components/sections/hero-itinerary.tsx` (Server Component, unique `<h1>` de la page, sur-titre/accroche de `wording.md`, CTA appel/WhatsApp + micro-réassurance).
- Wiring définitif dans `app/page.tsx` (remplace le `return null` de LP-03/LP-06) : la page rend désormais `<HeroItinerary />`.
- Tests manuels réels (mock de `window.fetch` pour le géocodage et `/api/route`, dans un navigateur réel, faute de vraies clés API) : bouton désactivé → activé une fois les 2 adresses résolues, spinner + « Calcul en cours… » pendant `isPending`, panneau de résultat correct (« Distance : 10.0 km · Durée estimée : 15 min · Estimation : 37 € »), repli générique + CTA téléphone sur échec ORS réel (sans clé), `cooperativeGestures` actif sur la carte.

## LP-06 — Carte MapLibre & géocodage MapTiler

- Ajout de `schemas/itinerary.ts` : `geocodeFeatureSchema`, `geocodeSchema` (réponse MapTiler).
- Ajout de `lib/maptiler.ts` (client) : `geocode(query)`, biais Île-de-France, `country=fr`, court-circuit sous 3 caractères, réponse parsée avec `geocodeSchema`.
- Ajout de `components/itinerary/route-map.tsx` (MapLibre, tracé GeoJSON + `fitBounds`, `cooperativeGestures: true` pour ne pas piéger le scroll mobile) et `route-map-loader.tsx` (`dynamic(..., { ssr: false })` + squelette de chargement).
- Ajout de `components/itinerary/address-autocomplete.tsx` : combobox accessible (label, `role="combobox"`/`listbox`, clavier Entrée/Échap), debounce ~300 ms de la saisie, `useQuery` avec `enabled` sur la valeur débouncée.
- Ajout de `@types/geojson` en devDependency (dépendance transitive de `maplibre-gl` non hoistée par pnpm — nécessaire pour que le namespace `GeoJSON` soit résolu par `tsc`).
- Tests (`lib/maptiler.test.ts`, 4 tests) : géocodage mocké via `vi.mock("ky")`, court-circuit sous 3 caractères, biais de proximité, réponse non conforme rejetée.
- **Adaptation à la version installée de `maplibre-gl` (6.6.0)** : la doc `ai_docs/maplibre-maptiler.md` suppose un export par défaut (`import maplibregl from "maplibre-gl"`), mais cette version n'expose plus que des exports nommés (`Map` aliasé `MapLibreMap`, `NavigationControl`, `LngLatBounds`, …). Adapté en conséquence.

## LP-05 — Logique de tarification

- Ajout de `lib/pricing.ts` : `estimatePrice` (grille + minimum de course + majoration nuit/férié, arrondi à l'euro) et `getAirportFareOverride` (tarif fixe prioritaire si départ ou arrivée à proximité d'Orly/CDG/Beauvais).
- Ajout de `AIRPORTS` dans `lib/constants.ts` (coordonnées réelles des 3 aéroports, pas un placeholder) et de `Coord` dans `schemas/itinerary.ts` (type partagé `[lon, lat]`).
- TDD : table de cas limites (`lib/pricing.test.ts`, 11 tests) écrite et vérifiée en échec avant l'implémentation — minimum de course, arrondi à `.5`, majoration appliquée après le plancher, détection aéroport par rayon (~3 km), priorité de l'override sur l'estimation.

## LP-04 — Proxy OpenRouteService (Route Handler)

- Ajout de `schemas/itinerary.ts` : `coordSchema`, `routeRequestSchema`, `routeResponseSchema`, `orsDirectionsSchema`.
- Ajout de `lib/ors.ts` (`getDirections`, serveur uniquement) : appelle ORS Directions, parse la réponse avec `orsDirectionsSchema`, convertit mètres→km et secondes→min.
- Ajout de `app/api/route/route.ts` : `POST /api/route`, valide l'entrée et la sortie avec Zod, 400 sur JSON/coordonnées invalides, 502 avec message générique si ORS échoue (jamais l'erreur brute).
- Tests (`lib/ors.test.ts`, `app/api/route/route.test.ts`) : ORS mocké via `vi.mock` (aucun appel réseau réel), conversion d'unités, réponse ORS non conforme rejetée, 200/400/502 du Route Handler, non-fuite du message d'erreur externe.

## LP-03 — Layout, providers & shell SEO

- Ajout de `lib/query-client.tsx` (`Providers`, `QueryClientProvider` monté dans `app/layout.tsx`).
- Ajout de `components/layout/{header,footer,sticky-call-button}.tsx` : en-tête avec CTA appel (desktop), pied de page avec récap business + CTA appel/WhatsApp, bouton d'appel flottant fixe en bas d'écran sur mobile (`sm:hidden`).
- `app/layout.tsx` : `lang="fr"`, `<title>`/meta description conformes à `content-reference.md`, JSON-LD `LocalBusiness` (nom, téléphone, adresse, zone desservie, horaires 24/7, tarifs aéroport en `makesOffer`).
- Nettoyage du boilerplate `create-next-app` dans `app/page.tsx` (retrait du `<h1>` par défaut — le futur et unique `<h1>` sera celui du hero, LP-07) et suppression des SVG désormais inutilisés (`next.svg`, `vercel.svg`).

## LP-02 — Constantes business & placeholders

- Ajout de `lib/constants.ts` : `BUSINESS`, `AIRPORT_FARES`, `PRICING`, `REVIEWS`, et les helpers CTA `telHref`/`waHref`.
- Ajout de Vitest (config `vitest.config.mts`, script `pnpm test`) pour couvrir la normalisation de `telHref`/`waHref` (`lib/constants.test.ts`).
