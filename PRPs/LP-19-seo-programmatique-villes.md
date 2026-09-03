# [LP-19] SEO programmatique — pages ville Île-de-France (SSG) — PRP

## Goal

Générer, en SSG (Server Components purs, pré-rendues au build), une page SEO dédiée par commune d'Île-de-France de plus de 10 000 habitants (`/vtc/{slug-ville}`), avec du contenu réellement différenciant par ville (distances/durées vers Orly/CDG/Beauvais/Paris précalculées via ORS), un maillage interne et une page hub, pour capter les recherches locales (« VTC Nanterre », « chauffeur privé Créteil »…) — conformément à la spécification `programmatic-seo.md` (racine du repo, **fait foi sur l'approche technique** de ce ticket).

## Why

Le site actuel (LP-01 → LP-18) ne cible qu'une seule requête locale (« VTC L'Haÿ-les-Roses »). `programmatic-seo.md` documente une opportunité de SEO local à fort volume : une page par commune desservie, chacune capable de se positionner sur ses propres recherches (« VTC {ville} », « transfert aéroport depuis {ville} »). Plus de pages d'entrée locales pertinentes → plus de trafic organique qualifié → plus d'appels (objectif n°1 du site).

Le document lui-même alerte sur le risque **doorway pages** (pages satellites sanctionnées par Google si le contenu est mince/dupliqué) et pose trois garde-fous obligatoires (zone réellement desservie, données propres à chaque ville via ORS, exactitude des tarifs fixes) — ce PRP les reprend intégralement, ils ne sont pas négociables.

## What

### Décisions de périmètre (confirmées avec l'utilisateur)

- **Volume** : communes d'Île-de-France de **plus de 10 000 habitants** (~400 communes estimées), pas la totalité des ~1287 communes IDF. Raison : le plan gratuit ORS (~2000 requêtes/jour) ne permet pas d'enrichir ~1287 communes × 4 trajets (~5150 appels) en une seule exécution ; ~400 communes × 4 = ~1600 appels tient dans le quota journalier en un seul passage du script d'enrichissement.
- **Extension province** (trajets longue distance) : **hors périmètre de ce ticket** — reportée, conformément à la recommandation de `programmatic-seo.md` (« démarrer avec l'Île-de-France, mesurer via Search Console, puis étendre »).

### Inclus

1. **Données** : `data/communes.json` (committé), généré par deux scripts one-off (non exécutés au build) :
   - récupération des communes IDF > 10 000 habitants depuis `geo.api.gouv.fr` → `data/communes.raw.json`.
   - enrichissement ORS (throttlé) : distance/durée vers Orly, CDG, Beauvais, Paris centre, pour chaque commune → `data/communes.json`.
2. **Routing SSG** : `app/vtc/[ville]/page.tsx` (`generateStaticParams` + `dynamicParams = false`) — une page statique par commune, 404 pour tout slug inconnu.
3. **Page hub** : `app/vtc/page.tsx` — liste toutes les communes couvertes, groupées par département.
4. **Contenu par page ville** : `<h1>` unique localisé, intro, bloc trajets (tarifs fixes si `inFixedZone`, sinon estimation), gares proches si renseignées, CTA tel/WhatsApp, maillage vers communes proches (`nearby`) + hub + accueil, JSON-LD `LocalBusiness` avec `areaServed` = la commune.
5. **SEO technique** : `generateMetadata` par ville (title/description/canonical), extension de `app/sitemap.ts` (URLs villes + hub), lien discret vers le hub dans le footer global.

### Exclus (hors périmètre — cf. `CLAUDE.md` § À NE PAS faire et garde-fous de `programmatic-seo.md`)

- **Simulateur interactif sur les pages ville** : `programmatic-seo.md` §5 le déconseille explicitement (composant client, alourdit des pages censées rester 100 % Server Components). Les pages ville n'ont que des données statiques + CTA.
- **Toutes les communes de France / toute la province** : générerait des pages hors zone réellement desservie → risque doorway pages caractérisé, explicitement proscrit par le document.
- **Tarif fixe aéroport hors zone `inFixedZone`** (départements 75/92/93/94) : les autres communes IDF affichent une estimation/« tarif sur devis », jamais le prix fixe — cf. ADR-0001 et `wording.md` (le tarif fixe ne vaut qu'« au départ de Paris et proche banlieue »).
- **Appel ORS au build ou à la requête** : l'enrichissement est **précalculé une fois** par un script one-off, jamais dans `generateStaticParams`/`page.tsx` (respect du quota, cohérent avec `ai_docs/openrouteservice.md` § Limites).
- **`output: 'export'`** : casserait `/api/route` (Route Handler serveur nécessaire au simulateur de la home) — cf. ADR-0001 et `programmatic-seo.md` §9.
- **Vraies coordonnées/avis/tarifs kilométriques réels** : toujours des placeholders `lib/constants.ts` tant que le client ne les a pas fournis (cf. `ai_docs/content-reference.md` § À confirmer avec le client) — ce ticket ne change pas ce statut, il consomme les mêmes constantes.

### Critères d'acceptation

- [ ] `data/communes.json` commité, contient les communes IDF > 10 000 habitants avec distances/durées ORS réelles vers Orly/CDG/Beauvais/Paris.
- [ ] `npm run build` pré-rend une page statique par commune (`app/vtc/{slug}`) + la page hub (`app/vtc`).
- [ ] Chaque page ville a un contenu unique (données de trajet propres à la ville), un seul `<h1>`, `generateMetadata` (title/description/canonical), JSON-LD `LocalBusiness`.
- [ ] Tarif fixe affiché uniquement si `inFixedZone` ; sinon estimation/sur devis — jamais le prix fixe hors zone.
- [ ] Maillage interne : liens `nearby` + lien hub + lien accueil sur chaque page ville ; lien hub dans le footer.
- [ ] `app/sitemap.ts` inclut toutes les URLs villes + hub ; `app/robots.ts` inchangé (déjà correct).
- [ ] Aucune régression sur la home (`npm test` inchangé et vert) ; `/api/route` toujours fonctionnel.

## Technical Context

### Fichiers à référencer (lecture seule)

- `programmatic-seo.md` (racine) — spécification complète de ce ticket, fait foi sur l'approche (schéma de données, routing, contenu, SEO technique, déploiement). Suivre ses snippets de près.
- `lib/ors.ts` — `getDirections(from, to)` déjà implémentée et testée (avec correction de durée `ROUTE_DURATION_CORRECTION`) : **réutiliser cette même fonction** dans le script d'enrichissement plutôt que de dupliquer l'appel ORS.
- `lib/constants.ts` — `BUSINESS` (nom, téléphone, ville, horaires réels), `AIRPORTS` (coordonnées `[lon, lat]` Orly/CDG/Beauvais déjà présentes — mêmes valeurs à utiliser comme destinations ORS), `AIRPORT_FARES`, `telHref`/`waHref`.
- `app/layout.tsx` — pattern JSON-LD `LocalBusiness` existant (`localBusinessJsonLd`) à répliquer/adapter (`areaServed` par commune) pour chaque page ville.
- `app/sitemap.ts` / `app/robots.ts` — base actuelle (simple, non chunkée) à étendre.
- `ai_docs/openrouteservice.md` — contrat ORS Directions, ⚠️ ordre `[lon, lat]`, limites de quota.
- `ai_docs/content-reference.md` § SEO — conventions title/description/JSON-LD de la home, à garder cohérentes (pas de contradiction entre la home et les pages ville).
- `docs/adr/0001 proxy openrouteservice route handler.md` — pourquoi `/api/route` doit rester un Route Handler serveur (contrainte de déploiement Vercel, jamais `output: 'export'`).
- `schemas/itinerary.ts` — `orsDirectionsSchema`, pattern de validation Zod des réponses ORS, déjà utilisé par `getDirections`.

### Fichiers à créer/modifier

- `data/commune.ts` — types `Commune`/`Leg` (cf. `programmatic-seo.md` §2).
- `data/communes.raw.json` — export brut `geo.api.gouv.fr` filtré IDF + population > 10 000 (généré par le script, committé pour reproductibilité).
- `data/communes.json` — données enrichies ORS (committé, **source de vérité au build**, jamais régénéré automatiquement).
- `scripts/fetch-communes.mjs` — one-off : interroge `geo.api.gouv.fr`, filtre IDF (75/77/78/91/92/93/94/95) + population > 10 000, écrit `data/communes.raw.json`.
- `scripts/enrich-communes.mjs` — one-off : pour chaque commune, appelle `getDirections` (réutilise `lib/ors.ts`) vers `AIRPORTS.ORLY`/`CDG`/`BEAUVAIS`/Paris centre, throttlé pour respecter le quota ORS ; calcule `inFixedZone` (département ∈ {75,92,93,94}) et `nearby` (communes les plus proches à vol d'oiseau) ; écrit `data/communes.json`.
- `app/vtc/[ville]/page.tsx` — page ville SSG (`generateStaticParams`, `dynamicParams = false`, `generateMetadata`).
- `app/vtc/page.tsx` — page hub (liste groupée par département).
- `app/sitemap.ts` — étendu pour inclure les URLs villes + hub (volume ~400+2 URLs : **pas besoin de `generateSitemaps()` chunké**, largement sous la limite de 50 000 URL/sitemap — garder la forme simple actuelle, juste étendue).
- `components/layout/footer.tsx` — ajout d'un lien discret vers `/vtc` (hub).
- `package.json` — deux scripts npm dédiés (`data:fetch-communes`, `data:enrich-communes`) pour documenter/lancer les scripts one-off explicitement (jamais dans `predev`/`prebuild`, à la différence de `copy-maplibre-worker.mjs`).

### Patterns existants à suivre

- Pages ville = **Server Components purs**, aucun `"use client"` (cohérent avec `about.tsx`/`services.tsx`/etc., et explicitement requis par `programmatic-seo.md` §5).
- CTA `tel:`/`wa.me` via `telHref`/`waHref` de `lib/constants.ts` — jamais de lien construit à la main.
- Un seul `<h1>` par page (déjà une règle stricte du site ; ici, un `<h1>` par page ville, différent de celui de la home).
- Validation Zod aux frontières : les données `geo.api.gouv.fr` et les réponses ORS dans les scripts one-off doivent être validées avant d'écrire `data/communes.json` — réutiliser `orsDirectionsSchema` existant pour la partie ORS ; ajouter un schéma Zod léger pour la réponse `geo.api.gouv.fr`.
- `ky` pour tout appel HTTP dans les scripts (cohérent avec le reste du repo, pas de `fetch` brut).

## Implementation Details

### 1. Schéma de données (`data/commune.ts`)

Reprendre tel quel le modèle de `programmatic-seo.md` §2 :

```ts
export type Leg = { km: number; min: number };
export type Commune = {
  insee: string;
  slug: string;
  nom: string;
  codePostal: string;
  departement: string;
  population: number;
  lat: number; lon: number;
  inFixedZone: boolean; // département ∈ {75, 92, 93, 94}
  airports: { orly: Leg; cdg: Leg; beauvais: Leg };
  parisCentre: Leg;
  gares: string[];
  nearby: string[]; // slugs
};
```

Zod : ajouter `schemas/commune.ts` avec un schéma miroir de `Commune` (et un schéma pour la réponse brute `geo.api.gouv.fr`), validé à l'écriture de `data/communes.raw.json` et `data/communes.json` par les scripts — cohérent avec la règle « valider aux frontières » du projet, même pour des données one-off committées.

### 2. Script `scripts/fetch-communes.mjs`

- Source : `geo.api.gouv.fr` (API Découpage administratif), endpoint communes filtré par départements IDF (`75,77,78,91,92,93,94,95`), champs `nom,code,codesPostaux,population,centre,departement`.
- Filtrer `population > 10000` côté script après réception (l'API ne garantit pas ce filtre serveur).
- Slug : kebab-case du nom, accents retirés (ex. « L'Haÿ-les-Roses » → `l-hay-les-roses`) ; désambiguïser les homonymes par le code INSEE en id de secours (cf. §2 du document).
- Écrit `data/communes.raw.json`, committé.

### 3. Script `scripts/enrich-communes.mjs`

- Lit `data/communes.raw.json`.
- Pour chaque commune : `getDirections([lon, lat]_commune, AIRPORTS.ORLY.coord)`, idem CDG/BEAUVAIS, idem Paris centre (coordonnée à ajouter si absente — Notre-Dame ou Châtelet, `[2.3522, 48.8566]` déjà utilisé ailleurs dans le repo comme repère Paris).
- **Throttling obligatoire** : respecter le quota ORS gratuit (~40 req/min) — pause entre appels (ex. `setTimeout` ~1,5–2 s), log de progression, reprise possible si interrompu (ne pas re-fetcher une commune déjà enrichie si le script est relancé).
- `inFixedZone = ["75","92","93","94"].includes(c.departement)`.
- `nearby` = N (3–5) communes les plus proches par distance euclidienne lat/lon (pas besoin d'ORS pour ça, calcul local).
- Écrit `data/communes.json`, committé. **Doit être exécuté avec `ORS_API_KEY` disponible** — via `node --env-file=.env.local scripts/enrich-communes.mjs` (flag natif Node ≥ 20.6, pas de nouvelle dépendance `dotenv`).
- ⚠️ Ce script consomme du quota ORS réel — action manuelle et délibérée du développeur, jamais automatisée dans `predev`/`prebuild`/CI.

### 4. Routing SSG (`app/vtc/[ville]/page.tsx`)

Reprendre le squelette de `programmatic-seo.md` §4 :

```tsx
import { notFound } from "next/navigation";
import communes from "@/data/communes.json";
import type { Commune } from "@/data/commune";

export const dynamicParams = false;
export function generateStaticParams() {
  return (communes as Commune[]).map((c) => ({ ville: c.slug }));
}

export default async function VillePage({
  params,
}: { params: Promise<{ ville: string }> }) {
  const { ville } = await params;
  const c = (communes as Commune[]).find((x) => x.slug === ville);
  if (!c) notFound();
  // contenu §5
}
```

### 5. Contenu d'une page ville

- `<h1>` : « VTC à {c.nom} — chauffeur privé 24h/24 et 7j/7 ».
- Intro localisée (commune, département, disponibilité, réservation en direct) — ton professionnel/fiable, cohérent avec `CLAUDE.md` § Projet (« ne pas rendre les textes chaleureux/familiers »).
- Bloc trajets : distances/durées vers Orly/CDG/Beauvais/Paris (`c.airports`, `c.parisCentre`). Si `c.inFixedZone` → tarifs fixes `AIRPORT_FARES` (mêmes constantes que la home, pas de valeur dupliquée) ; sinon → texte d'estimation + « tarif sur devis, appelez pour confirmer ».
- Gares proches (`c.gares`) si non vide.
- CTA `tel:` (prioritaire) + `wa.me` (secondaire) via `BUSINESS`/`telHref`/`waHref`.
- Maillage : liens vers `c.nearby` (résolus en noms de communes), lien « Toutes les villes desservies » → `/vtc`, lien accueil.
- JSON-LD `LocalBusiness` (répliquer `localBusinessJsonLd` de `app/layout.tsx`, avec `areaServed: { "@type": "City", "name": c.nom }`).

### 6. Page hub (`app/vtc/page.tsx`)

Liste toutes les communes de `data/communes.json`, groupées par département (75/77/78/91/92/93/94/95), chaque nom lié à sa page (`/vtc/{slug}`). `<h1>` du hub distinct de celui de la home et des pages ville (ex. « Nos zones d'intervention en Île-de-France »).

### 7. SEO technique

- `generateMetadata` par ville (title/description/canonical) — reprendre le format `programmatic-seo.md` §7, adapté aux vraies valeurs `BUSINESS`/`AIRPORT_FARES` du repo.
- `app/sitemap.ts` : étendre le tableau existant avec une entrée par commune (`changeFrequency: "monthly"`, `priority: 0.7`) + une entrée pour `/vtc` (hub, `priority: 0.5`) — **pas de `generateSitemaps()` chunké** (volume ~400 URLs, très en dessous de la limite de 50 000/sitemap ; le chunking de `programmatic-seo.md` §7 est prévu pour un volume bien plus grand que le nôtre, ne pas le reproduire inutilement).
- `app/robots.ts` : déjà correct (autorise tout, référence le sitemap), **aucun changement nécessaire**.
- `components/layout/footer.tsx` : ajouter un lien discret « Nos zones d'intervention » → `/vtc`.

### Sécurité & clés API

- Aucun changement de portée pour `ORS_API_KEY` (toujours serveur uniquement) ni `NEXT_PUBLIC_MAPTILER_KEY` — les scripts one-off tournent en local sur la machine du développeur, jamais côté client, jamais dans le bundle.
- `NEXT_PUBLIC_SITE_URL` reste un placeholder (`https://your-domain.example` dans `.env.local.example`) tant que le domaine de production n'est pas choisi — `app/sitemap.ts`/`generateMetadata` doivent lire cette variable comme le fait déjà `app/sitemap.ts` actuel, jamais une URL en dur.

## Validation Criteria

### Exigences fonctionnelles

- [ ] `data/communes.json` contient les communes IDF > 10 000 habitants avec `airports`/`parisCentre` renseignés (distance/durée réelles, pas de valeur à zéro/placeholder).
- [ ] `npm run build` génère une page statique par commune + la page hub, sans appel réseau au build (données lues depuis `data/communes.json`).
- [ ] Page ville : `<h1>` unique localisé, tarif fixe affiché **seulement** si `inFixedZone`, CTA tel/WhatsApp présents, maillage `nearby` + hub + accueil fonctionnel.
- [ ] Page hub : toutes les communes listées, groupées par département, chaque lien mène à une page valide (pas de 404).
- [ ] Slug inconnu (`/vtc/ville-inexistante`) → 404 (`dynamicParams = false`).

### Exigences techniques

- [ ] `npm run lint` et `npm run build` (type-check inclus) passent sans erreur.
- [ ] `npm test` reste vert **sans modification** des tests existants (aucune logique home/simulateur touchée).
- [ ] Pages ville et hub en Server Components purs, aucun `"use client"` ajouté.
- [ ] Aucun appel ORS dans `generateStaticParams`/`page.tsx`/au build — uniquement dans `scripts/enrich-communes.mjs` (one-off, hors build).
- [ ] `ORS_API_KEY` jamais exposée côté client ; scripts one-off exécutés localement uniquement.
- [ ] `output: 'export'` **jamais activé** dans `next.config.ts` (casserait `/api/route`).
- [ ] Validation Zod des données `geo.api.gouv.fr` et ORS dans les scripts (réutilisation d'`orsDirectionsSchema`, nouveau schéma léger pour `geo.api.gouv.fr`).
- [ ] `ky` utilisé dans les scripts (pas de `fetch` brut).
- [ ] Placeholders (`AIRPORT_FARES`, `BUSINESS`) lus depuis `lib/constants.ts`, jamais dupliqués/recodés en dur dans les pages ville.
- [ ] `git diff` du `next build` de production ne contient aucune régression sur les routes existantes (`/`, `/api/route`, `/robots.txt`, `/sitemap.xml`, `/opengraph-image`).

### Étapes de test

1. `node --env-file=.env.local scripts/fetch-communes.mjs` puis `node --env-file=.env.local scripts/enrich-communes.mjs` — vérifier `data/communes.json` généré, échantillon de communes avec des distances/durées plausibles (comparer 2-3 valeurs à Google Maps, dans l'esprit de la vérification LP-17).
2. `npm run build` — vérifier dans la sortie qu'une page est bien générée par commune (`○ /vtc/[ville]` ou liste des routes statiques), et que le build reste raisonnablement rapide (~400 pages, pas de régression majeure de temps de build).
3. `npm run lint`, `npm test` (doit rester vert sans modification).
4. Test manuel navigateur : ouvrir 2-3 pages ville (une `inFixedZone`, une hors zone), vérifier `<h1>` unique, tarif fixe vs estimation selon la zone, CTA fonctionnels, liens `nearby` menant à de vraies pages, lien hub, lien accueil.
5. Ouvrir `/vtc` (hub) : toutes les communes listées et groupées par département, aucun lien mort.
6. Vérifier `/sitemap.xml` : contient bien les URLs villes + hub, avec l'URL de base issue de `NEXT_PUBLIC_SITE_URL`.
7. Vérifier `curl -I http://localhost:3000/vtc/ville-inexistante` → 404.
8. Vérifier que `/api/route` et le simulateur de la home fonctionnent toujours (non-régression) — reprendre le test manuel `curl POST /api/route` déjà documenté dans `ai_docs/openrouteservice.md`.
9. Mettre à jour `docs/BACKLOG.md` (ajouter et cocher `LP-19`), `CHANGELOG.md`, et `ai_docs/index.md` (référencer `programmatic-seo.md` dans la liste des docs si pertinent).
