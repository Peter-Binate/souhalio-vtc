# [LP-17] Vérification & fiabilisation des estimations de durée de trajet — PRP

## Résultats de mesure (2026-09-02, trafic « maintenant »)

| # | Trajet | Distance ORS | Durée ORS | Distance Google | Durée Google | Écart | Remarque |
|---|---|---|---|---|---|---|---|
| 1 | Gare de Lyon → Gare du Nord (urbain court) | 6,26 km | 18,4 min | 5,3 km | 28 min | **−34 %** | Chemins différents (ORS plus long en distance mais plus rapide en temps) |
| 2 | L'Haÿ-les-Roses → Châtelet (banlieue→Paris) | 10,68 km | 26,9 min | 11,2 km | 39 min | **−31 %** | ⚠️ Google signale une fermeture de route (Pont de l'Archevêché) sur son itinéraire au moment du test — comparaison possiblement biaisée |
| 3 | L'Haÿ-les-Roses → Orly (aéroport) | 10,86 km | 21,5 min | 11,7 km | 23 min | **−7 %** | Comparé à l'itinéraire Google réaliste (le plus rapide passe par des voies privées, écarté) |
| 4 | Châtelet → CDG (aéroport) | 27,64 km | 38,1 min | 37,7 km | 46 min | *non comparable* | ⚠️ Google évite le Périphérique en raison d'un accident en cours au moment du test → chemin totalement différent (37,7 km vs 27,6 km), écart non imputable à ORS |
| 5 | Châtelet → Orléans (longue distance) | 133,32 km | 101 min | 133 km | 104 min | **−3 %** | Distances quasi identiques (même itinéraire A10/A6B) |

**Constat** : l'écart n'est pas uniforme. Il est **faible sur autoroute/longue distance (−3 % à −7 %)** et **fort sur trajets urbains courts (−31 % à −34 %)** — cohérent avec la limite connue d'ORS (pas de trafic temps réel, vitesses moyennes statiques par type de route) : ORS sous-estime surtout la congestion et les feux en ville, mais reste proche de Google Maps sur autoroute où les vitesses sont plus prévisibles. Deux mesures (#2 et #4) sont en plus perturbées par des incidents temps réel ponctuels (fermeture de route, accident) côté Google, non imputables à ORS.

**Implication** : un facteur de correction **unique et global** (appliqué à tous les trajets) corrigerait correctement les trajets urbains mais **sur-corrigerait** les trajets autoroutiers/longue distance, qui sont déjà fiables. Le critère de décision initial du PRP (écart uniforme → facteur simple) ne s'applique pas tel quel ici.

## Goal

Vérifier, sur un jeu de trajets réels représentatifs d'Île-de-France, que la durée de trajet renvoyée par `/api/route` (calculée par OpenRouteService, profil `driving-car`) correspond à un temps de trajet en voiture réaliste par rapport à Google Maps ; documenter l'écart mesuré et, s'il est significatif et systématique, appliquer un facteur de correction calibré (et non arbitraire) dans `lib/ors.ts`.

## Why

Retour utilisateur : *« lorsque je calcule le temps de trajet il paraît plus court que le trajet en voiture sur Google Maps »*. Deux conséquences directes sur l'objectif n°1 du site (déclencher des appels) :

- **Prix sous-estimé** : `durationMin` entre dans `estimatePrice()` (`lib/pricing.ts`, coefficient `PRICING.perMin`) — une durée trop courte fait afficher un prix indicatif trop bas, créant un écart désagréable au moment de la réservation par téléphone (mauvais pour la confiance, donc pour la conversion).
- **Crédibilité du simulateur** : le simulateur est l'élément central du hero (`ai_docs/itinerary-feature.md`) ; un visiteur qui compare mentalement avec Google Maps et constate un écart peut douter de l'estimation de prix elle-même, et donc hésiter à appeler.

Recherche effectuée sur le comportement connu d'ORS : le moteur `driving-car` d'OpenRouteService **n'utilise pas de données de trafic temps réel** — il s'appuie sur des vitesses moyennes statiques par type de route (issues du tagging OpenStreetMap), contrairement à Google Maps qui agrège du trafic temps réel. Les retours communautaires documentent des écarts **dans les deux sens** selon la région et le type de route (ORS parfois plus optimiste, parfois plus pessimiste que Google Maps) — ce n'est donc pas un biais universel à corriger à l'aveugle, d'où la nécessité de **mesurer avant de corriger**.

Sources :
- [Open Route Service Directions returns unrealistic travel duration (forum officiel ORS)](https://ask.openrouteservice.org/t/open-route-service-directions-returns-unrealistic-travel-duration-inflated-travel-time-for-car-profile/4641)
- [Variation in duration (forum officiel ORS)](https://ask.openrouteservice.org/t/variation-in-duration/2206)
- [Drivetime Isochrones vs. google maps (issue GitHub GIScience/openrouteservice)](https://github.com/GIScience/openrouteservice/issues/185)

## What

### Inclus

1. **Mesure** : constituer un jeu d'au moins 5 trajets réels représentatifs des cas d'usage de l'app (voir `Implementation Details`), interroger `/api/route` pour chacun, relever la durée retournée, et la comparer à l'estimation « en voiture » de Google Maps pour le même trajet (hors trafic exceptionnel — préciser l'horaire de mesure).
2. **Documentation** : consigner les résultats dans un tableau (écart en % et en minutes par trajet) et une conclusion explicite : écart négligeable / écart significatif et cohérent (même sens sur tous les trajets) / écart significatif mais incohérent (pas de correction simple possible).
3. **Correctif conditionnel** — uniquement si l'écart est significatif **et** cohérent : appliquer un facteur de correction multiplicatif calibré sur la moyenne mesurée, dans `lib/ors.ts`, juste après la conversion `s → min`. Le facteur vit dans `lib/constants.ts` (constante nommée, commentée avec la méthodologie et la date de calibration — pas de valeur magique en dur).
4. **Tests** : si un facteur est appliqué, couvrir sa présence dans `lib/ors.test.ts` (assertion sur la valeur convertie).

### Exclus (hors périmètre de ce ticket)

- **Changer de fournisseur de routing** (ex. Google Directions API, Mapbox Directions) : la stack (`CLAUDE.md` § Stack) fixe OpenRouteService pour les directions, et `docs/adr/0001` a déjà tranché ce choix pour des raisons de sécurité de clé (ORS n'expose pas de restriction par domaine fiable, donc doit rester derrière le proxy serveur — un fournisseur alternatif redemanderait la même analyse). Un changement de fournisseur nécessiterait une demande explicite de l'utilisateur et un nouvel ADR.
- **Passer à une offre ORS payante avec trafic temps réel** : hors périmètre budgétaire présumé d'une landing page sans back-end ; à évoquer seulement si la mesure révèle un écart trop important/incohérent pour être corrigé par un simple facteur.
- **Revoir les coefficients `€/km` / `€/min` de `PRICING`** (LP-05) : seule la donnée d'entrée (`durationMin`) est concernée ici, pas la grille tarifaire elle-même.
- **Modifier l'UI du simulateur** : `components/itinerary/price-estimate.tsx` n'a pas besoin de changer (le format d'affichage reste `Math.round(durationMin)` en minutes).

### Point d'arrêt

❓ **Avant d'appliquer un facteur de correction** (étape 3), présenter le tableau de mesures à l'utilisateur et obtenir sa confirmation explicite — ce facteur modifie une donnée montrée aux visiteurs et injectée dans le prix affiché : c'est une décision produit, pas seulement technique. Ne jamais appliquer un facteur choisi arbitrairement sans mesure.

## Technical Context

### Fichiers à référencer (lecture seule)

- `lib/ors.ts` — `getDirections()` : c'est ici que la conversion `s → min` a lieu aujourd'hui (`feature.properties.summary.duration / 60`) ; le facteur de correction, s'il est retenu, s'insère juste après cette ligne.
- `lib/pricing.ts` — `estimatePrice()` consomme `durationMin` via `PRICING.perMin` ; confirme que corriger la durée à la source (dans `lib/ors.ts`) suffit à corriger aussi le prix, sans toucher `pricing.ts`.
- `lib/constants.ts` — emplacement des constantes business/calibration existantes (`PRICING`, `AIRPORT_FARES`) ; pattern à répliquer pour la nouvelle constante de correction.
- `ai_docs/openrouteservice.md` — contrat ORS Directions, section « Limites & bonnes pratiques » (quota) à compléter avec la limite « pas de trafic temps réel » si un correctif est retenu.
- `lib/ors.test.ts` — tests existants de `getDirections()` (conversion m→km, s→min, rejet de réponses invalides) ; pattern à suivre pour tester le facteur de correction.
- `docs/adr/0001 proxy openrouteservice route handler.md` — justifie pourquoi ORS reste le fournisseur ; à ne pas recontredire silencieusement dans ce ticket.

### Fichiers à créer/modifier (si le point d'arrêt confirme un correctif)

- `lib/constants.ts` — nouvelle constante, ex. `ROUTE_DURATION_CORRECTION_FACTOR` (nombre, commenté avec la méthodologie et la date de calibration).
- `lib/ors.ts` — application du facteur dans `getDirections()`, juste après `feature.properties.summary.duration / 60`.
- `lib/ors.test.ts` — cas de test couvrant la valeur corrigée.
- `ai_docs/openrouteservice.md` — documentation de la limite ORS (pas de trafic temps réel) et du facteur appliqué.
- `CHANGELOG.md` — entrée décrivant la mesure effectuée, les chiffres, et la décision.

Pas de nouveau schéma Zod, pas de nouveau Route Handler, pas de nouveau composant : ce ticket touche une seule ligne de transformation de donnée dans `lib/ors.ts`.

### Patterns existants à suivre

- Toute constante de calibration/business va dans `lib/constants.ts`, jamais en dur dans `lib/ors.ts` (cf. `CLAUDE.md` § À NE PAS faire : « Coder en dur des valeurs fictives dans les composants »).
- La conversion d'unité déjà présente dans `getDirections()` (m→km, s→min) est le seul endroit qui transforme la réponse ORS brute avant qu'elle ne soit renvoyée au client — le facteur de correction doit rester à cet endroit unique pour ne pas dupliquer la logique ailleurs (client, pricing).
- TDD déjà pratiqué sur `lib/ors.ts` (`lib/ors.test.ts`) et `lib/pricing.ts` (`lib/pricing.test.ts`) : tout ajout de logique passe par un test écrit en premier.

## Implementation Details

### Méthodologie de mesure (étape 1 — à exécuter avant tout code)

Jeu de trajets à tester (adresses réelles, représentatives des cas d'usage décrits dans `ai_docs/itinerary-feature.md` et `wording.md`) :

1. **Urbain court** — un trajet intra-Paris (ex. Gare de Lyon → Gare du Nord).
2. **Proche banlieue → Paris** — ex. L'Haÿ-les-Roses (zone de base du chauffeur, cf. `content-reference.md`) → Paris centre.
3. **Transfert aéroport Orly** — proche banlieue → Orly.
4. **Transfert aéroport CDG** — Paris → Roissy-CDG (trajet plus long, majoritairement autoroutier).
5. **Longue distance** — un trajet régional (ex. Paris → une ville à ~1–2h, si pertinent pour l'app).

Pour chaque trajet :

- Relever `durationMin` via un appel réel à `/api/route` (`curl -X POST http://localhost:3000/api/route -H "Content-Type: application/json" -d '{"from":[...],"to":[...]}'`) — **appel réel, hors suite automatisée** (les tests unitaires/CI continuent de mocker ORS, cf. `ai_docs/testing.md`).
- Relever le temps « en voiture » indiqué par Google Maps pour le même trajet, en notant l'horaire de la mesure (éviter une heure de pointe pour une comparaison équitable, ORS n'ayant pas de trafic temps réel).
- Calculer l'écart en minutes et en % : `(google - ors) / google`.

Consolider dans un tableau (trajet · distance · durée ORS · durée Google Maps · écart % · sens de l'écart).

### Décision de correctif

- **Écart < ~10 % et incohérent en sens** (parfois ORS plus court, parfois plus long) → pas de correctif : documenter la limite connue d'ORS dans `ai_docs/openrouteservice.md`, conclure le ticket sans changement de code.
- **Écart systématique dans le même sens (ORS plus court que Google Maps) et significatif (> ~10–15 %)** → calculer le facteur moyen mesuré, le proposer à l'utilisateur (point d'arrêt), puis l'appliquer si confirmé.

### Logique métier (si correctif retenu)

```ts
// lib/ors.ts — après la conversion existante
durationMin: (feature.properties.summary.duration / 60) * ROUTE_DURATION_CORRECTION_FACTOR,
```

`ROUTE_DURATION_CORRECTION_FACTOR` dans `lib/constants.ts`, typé `number`, avec un commentaire indiquant : la méthodologie (comparaison ORS vs Google Maps sur N trajets Île-de-France), la date de calibration, et un rappel qu'il faudra la revalider périodiquement (les vitesses moyennes OSM/ORS évoluent).

### Sécurité & clés API

Aucun changement de portée : `ORS_API_KEY` reste serveur uniquement (`lib/ors.ts`), aucune nouvelle donnée secrète introduite. Le facteur de correction n'est pas une donnée sensible (peut vivre en clair dans `lib/constants.ts`, potentiellement même côté client si un jour cette constante devait être partagée — mais elle reste utilisée uniquement côté serveur ici, dans `lib/ors.ts`).

## Validation Criteria

### Exigences fonctionnelles

- [x] Un tableau de mesures (≥ 5 trajets réels Île-de-France) comparant `durationMin` (ORS) et le temps « en voiture » Google Maps est produit et documenté.
- [x] Une conclusion explicite est formulée : correctif nécessaire ou non, avec justification chiffrée.
- [x] Si correctif : le facteur appliqué est calibré à partir des mesures réelles (pas une valeur arbitraire), et l'utilisateur a explicitement confirmé avant application (point d'arrêt).
- [x] Le prix affiché (`price-estimate.tsx`) reflète automatiquement la durée corrigée, sans modification de `lib/pricing.ts` ni du composant.

### Exigences techniques

- [x] `npm run lint` et `npm run build` (type-check inclus) passent sans erreur.
- [x] Si correctif appliqué : `lib/ors.test.ts` couvre la nouvelle valeur corrigée ; `npm test` passe (aucune régression sur les tests `pricing`/`ors` existants).
- [x] Aucun secret ni clé API concerné par ce ticket.
- [x] `ROUTE_DURATION_CORRECTION` (créée) vit dans `lib/constants.ts`, commentée (méthodologie + date), jamais codée en dur dans `lib/ors.ts`.
- [x] `ai_docs/openrouteservice.md` mis à jour avec la limite ORS constatée (et le facteur, si appliqué).

### Étapes de test

1. `npm run dev`, exécuter les appels `curl` réels décrits dans « Méthodologie de mesure » pour les 5 trajets, consigner les résultats.
2. Comparer manuellement chaque durée à Google Maps (capture d'écran ou relevé texte, horaire noté).
3. Documenter le tableau et la conclusion (dans ce PRP ou une note de suivi liée).
4. **Point d'arrêt** : soumettre le tableau et la conclusion à l'utilisateur avant d'écrire du code.
5. Si correctif confirmé : TDD sur `lib/ors.test.ts` (écrire le cas de test avec la valeur corrigée attendue avant d'implémenter), puis `lib/ors.ts` et `lib/constants.ts`.
6. `npm run lint`, `npm test`, `npm run build`.
7. Re-tester `curl POST /api/route` sur au moins un des 5 trajets pour confirmer que la durée corrigée sort bien de l'API.
8. Mettre à jour `docs/BACKLOG.md` (`[x] LP-17`), `ai_docs/openrouteservice.md`, `CHANGELOG.md`.
