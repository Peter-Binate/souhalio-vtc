# SEO programmatique — une page par ville (SSG)

Objectif : capter les recherches locales (« VTC Nanterre », « chauffeur privé Créteil », « transfert aéroport depuis Vincennes ») avec **une page dédiée par commune**, générée statiquement (SSG) et optimisée SEO. Adapté au stack du projet (Next.js **App Router**, RSC, ORS déjà intégré).

## ⚠️ À lire avant de se lancer : périmètre honnête & risque « doorway pages »

La technique est puissante mais encadrée. Google sanctionne les **pages satellites** (doorway pages) : contenu mince, dupliqué d'une ville à l'autre, ou zones non réellement desservies. Trois garde-fous **obligatoires** :

1. **Ne couvrir que la zone réellement desservie.** Cœur = **communes d'Île-de-France** (service local honnête). En option, une liste **curatée** de villes de province pour la « longue distance {ville} ↔ Paris/aéroport ». Ne pas générer « toutes les communes de France » pour un chauffeur unique.
2. **Rendre chaque page unique et utile.** Le gabarit ne suffit pas : injecter des **données propres à la commune** (distance/temps réels vers Orly/CDG/Beauvais/Paris via ORS, gares proches, département). Voir §3.
3. **Rester exact sur les tarifs.** Les tarifs fixes aéroport ne valent qu'« au départ de Paris et proche banlieue » (cf. `docs/wording.md`, ADR-0001). Une page hors de cette zone affiche une **estimation / sur devis**, jamais le prix fixe.

Recommandation : démarrer avec l'Île-de-France, mesurer (Search Console), puis étendre. Qualité > volume.

---

## 1. Périmètre & mots-clés ciblés

- **Zone :** communes d'Île-de-France (75, 77, 78, 91, 92, 93, 94, 95). Filtre optionnel population > 10 000 pour limiter le volume, ou toutes les communes IDF si le contenu enrichi le justifie.
- **Patrons de mots-clés par ville :** `VTC {ville}`, `chauffeur privé VTC {ville}`, `transfert aéroport {ville}` (Orly/CDG/Beauvais), `réservation VTC {ville}`, `chauffeur 24h/24 {ville}`.
- **Route publique :** `/vtc/{slug-ville}` (ex. `/vtc/nanterre`).

---

## 2. Source de données des villes

Utiliser un jeu de données officiel, **téléchargé une fois** et **commité** dans le repo (ne pas dépendre d'une API à chaque build).

- Source : `geo.api.gouv.fr` (API Découpage administratif) ou export INSEE/data.gouv.fr. Champs utiles : code INSEE, nom, code postal, département, population, coordonnées (lat/lon).
- Script de récupération (one-off) → écrit `data/communes.json`. Filtrer par région Île-de-France (et population si souhaité).

```ts
// data/commune.ts — modèle
export type Leg = { km: number; min: number };
export type Commune = {
  insee: string;          // id stable (désambiguïse les homonymes)
  slug: string;           // kebab-case du nom, ex. "l-hay-les-roses"
  nom: string;            // "L'Haÿ-les-Roses"
  codePostal: string;     // "94240"
  departement: string;    // "94"
  population: number;
  lat: number; lon: number;
  inFixedZone: boolean;   // Paris + petite couronne (75/92/93/94)
  airports: { orly: Leg; cdg: Leg; beauvais: Leg };
  parisCentre: Leg;
  gares: string[];        // gares/points proches, si pertinent
  nearby: string[];       // slugs de communes proches (maillage interne)
};
```

> Slug : kebab-case du nom, accents retirés. En cas d'homonymes entre départements, suffixer par le département ou garder l'`insee` comme id de secours.

---

## 3. Enrichissement (le différenciateur) — précalcul via ORS

Pour éviter le contenu dupliqué, chaque commune reçoit des **données de trajet réelles**, calculées **une fois** par un script, puis stockées dans `data/communes.json`. **Ne pas** appeler ORS au build à chaque fois (quota + lenteur).

- **Utiliser l'endpoint ORS Matrix, pas Directions** (`getMatrix`, cf. `ai_docs/openrouteservice.md`) : une requête calcule N×M trajets. Un appel Directions par trajet demande ~1 000 requêtes pour l'IDF et **épuise le quota gratuit avant la fin** — l'erreur a été commise deux fois (LP-19 puis LP-21), avec des runs bloqués à 36 puis 84 communes. Avec Matrix : **5 requêtes** pour les 266 communes. Les valeurs sont identiques (même graphe de routage).
- Destinations : Orly, CDG, Beauvais et le centre de Paris → distance/durée.
- Matrix n'accepte pas l'option `radiuses` et **échoue en bloc** si un point n'est pas routable : `scripts/ors-throttle.ts` dichotomise le lot en échec puis retombe sur Directions à rayon élargi pour la source fautive.
- `inFixedZone` = département ∈ {75, 92, 93, 94} (proche banlieue) → la page peut afficher les tarifs fixes aéroport ; sinon estimation/sur devis.
- `nearby` = N communes les plus proches (distance à vol d'oiseau sur lat/lon), pour le maillage interne (§6).

```ts
// scripts/enrich-communes.ts (one-off, exécuté hors build)
// 1. lit data/communes.raw.json
// 2. pour chaque commune : appelle ORS (throttlé) vers les 3 aéroports + Paris
// 3. calcule inFixedZone + nearby
// 4. écrit data/communes.json  (commité)
```

---

## 4. Routing App Router — génération statique

Route dynamique **App Router** (l'équivalent moderne de `pages/covoiturage/[id].tsx`) : `app/vtc/[ville]/page.tsx`, entièrement pré-rendue via `generateStaticParams`.

```tsx
// app/vtc/[ville]/page.tsx
import { notFound } from "next/navigation";
import communes from "@/data/communes.json";

// Pré-génère une page statique par commune ; 404 pour tout slug inconnu
export const dynamicParams = false;
export function generateStaticParams() {
  return (communes as Commune[]).map((c) => ({ ville: c.slug }));
}

export default async function VillePage({
  params,
}: { params: Promise<{ ville: string }> }) {
  const { ville } = await params; // Next 15 : params est asynchrone
  const c = (communes as Commune[]).find((x) => x.slug === ville);
  if (!c) notFound();
  return (/* voir §5 */);
}
```

---

## 5. Contenu d'une page ville

Page **100 % Server Component** (aucun composant client → HTML léger, JS minimal — respecte l'esprit « un HTML + un CSS »). Réutiliser les constantes et helpers existants (`lib/constants.ts`, `telHref`/`waHref`) et les sections génériques quand c'est pertinent.

Structure recommandée :
- **`<h1>` unique** : « VTC à {Ville} — chauffeur privé 24h/24 et 7j/7 ».
- **Intro localisée** : mentionne la commune, le département, la disponibilité, la réservation en direct.
- **Bloc trajets depuis {Ville}** (le contenu unique) : distances/temps vers Orly, CDG, Beauvais, Paris (données ORS précalculées). Si `inFixedZone` → afficher les **tarifs fixes** (Orly 50 € / CDG 65 € / Beauvais 120 €) ; sinon → estimation + « tarif sur devis ».
- **Gares / points proches** si renseignés.
- **CTA** appel (primaire) + WhatsApp (secondaire), depuis `BUSINESS`.
- **Maillage interne** (§6) : communes proches + lien vers l'accueil et la page hub.
- **JSON-LD** : un `Service` rattaché à l'entreprise, `areaServed` = la commune, + `BreadcrumbList` et `FAQPage` (§7).

> Éviter le simulateur interactif sur ces pages (composant client, alourdit) : garder le simulateur sur la home, et sur les pages ville se contenter des données statiques + CTA.

---

## 6. Maillage interne & page hub

Le maillage est décisif en SEO programmatique.

- **Sur chaque page ville :** liens vers `nearby` (communes proches) + lien « Toutes les villes desservies » (hub) + lien vers l'accueil.
- **Page hub** `app/vtc/page.tsx` : liste toutes les communes couvertes, **groupées par département**, chacune liée à sa page. Sert de point d'entrée et distribue le PageRank interne.
- Ajouter un lien discret vers le hub depuis le **footer** global.

### Familles de pages livrées (état actuel)

| Famille | Route | Nombre | Contenu unique |
| --- | --- | --- | --- |
| Ville | `/vtc/{ville}` | 266 | Distances/durées ORS vers les 3 aéroports et Paris, tarif fixe conditionnel, communes proches, FAQ |
| Département | `/vtc/departement/{dep}` | 7 | Agrégats réels (communes, population, durées moyennes), table commune par commune |
| Aéroport | `/vtc/aeroport/{aeroport}` | 3 | Tarif fixe, terminaux, deux tables de durées (zone tarif fixe / hors zone) |
| Gare | `/vtc/gare/{gare}` | 9 | Destinations desservies, durées vers les aéroports, correspondances de gare à gare |
| Hubs | `/vtc`, `/vtc/departement`, `/vtc/aeroport`, `/vtc/gare` | 4 | Points d'entrée et distribution du maillage |

**Deux exclusions volontaires**, au nom du garde-fou « pas de contenu mince » :
- **Département de Paris (75)** : une seule commune couverte → la page ferait doublon avec `/vtc/paris`. Le hub renvoie directement vers la page ville.
- **Gare TGV de Roissy-CDG** : couverte par la page aéroport CDG ; une page gare dédiée créerait une ambiguïté tarifaire (la gare est dans l'aéroport, mais son département la placerait en « zone tarif fixe »).

Le footer liste les **4 hubs** sur toutes les pages du site.

---

## 7. SEO technique

### Metadata par page
```tsx
// app/vtc/[ville]/page.tsx
import type { Metadata } from "next";

export async function generateMetadata(
  { params }: { params: Promise<{ ville: string }> }
): Promise<Metadata> {
  const { ville } = await params;
  const c = (communes as Commune[]).find((x) => x.slug === ville);
  if (!c) return {};
  const url = `https://www.exemple.fr/vtc/${c.slug}`;
  return {
    title: `VTC ${c.nom} (${c.departement}) — Chauffeur privé 24h/24 | Jhon Doe VTC`,
    description: `Chauffeur VTC à ${c.nom} : transfert aéroport (Orly ~${c.airports.orly.min} min), gares, trajets affaires et longue distance, 24h/24 et 7j/7. Réservez en direct.`,
    alternates: { canonical: url },
    openGraph: { title: `VTC ${c.nom} | Jhon Doe VTC`, url, type: "website" },
  };
}
```

### JSON-LD (dans la page)

⚠️ **Ne pas ré-émettre un `LocalBusiness` par page.** Le layout racine en émet déjà un ; un second avec un `areaServed` différent décrit *deux entreprises contradictoires*. Modèle retenu (`lib/jsonld.ts`) :

- Layout : **un** `LocalBusiness` avec un `@id` stable (`{SITE_URL}/#business`).
- Chaque page programmatique : un **`Service`** (`serviceType: "Chauffeur privé VTC"`) rattaché par `provider: { "@id": … }`, portant sa propre zone (`City` / `AdministrativeArea` / `Place`) et — **seulement là où le tarif fixe s'applique** — ses `Offer`.
- Plus un `BreadcrumbList` (doublé d'un fil d'Ariane visible) et une `FAQPage`.

### Sitemap (volumineux → chunké)
```ts
// app/sitemap.ts
import type { MetadataRoute } from "next";
import communes from "@/data/communes.json";

// Pour de gros volumes, découper avec generateSitemaps() (≤ 50 000 URL/sitemap)
export async function generateSitemaps() {
  const size = 5000;
  return Array.from({ length: Math.ceil(communes.length / size) }, (_, i) => ({ id: i }));
}

export default function sitemap({ id }: { id: number }): MetadataRoute.Sitemap {
  const size = 5000;
  const base = "https://www.exemple.fr";
  return (communes as Commune[])
    .slice(id * size, (id + 1) * size)
    .map((c) => ({ url: `${base}/vtc/${c.slug}`, changeFrequency: "monthly", priority: 0.7 }));
}
```

### robots
```ts
// app/robots.ts
import type { MetadataRoute } from "next";
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: "https://www.exemple.fr/sitemap.xml",
  };
}
```

### Autres
- **Un seul `<h1>`** par page (le titre localisé).
- CSS unique et minimal (Tailwind purgé — déjà le cas).
- Balises `alt` descriptives sur toute image.

---

## 8. Build & performance

- `next build` pré-rend une page statique par commune (SSG). Pour l'IDF, on est loin des 8 600 pages de l'exemple → build rapide, sortie légère.
- Pages ville en **Server Components purs** → HTML statique + JS quasi nul (bon Core Web Vitals).
- Si le volume grossit beaucoup (extension province) et que le build devient long, envisager l'**ISR** (`export const revalidate = <secondes>`) pour générer à la demande + revalider, au lieu du tout-statique.

---

## 9. Déploiement — Vercel (⚠️ ne pas casser le Route Handler)

Le projet se déploie sur **Vercel** (cf. `docs/adr/0001` et `0002`, `README.md`) : rien à changer ici. Les pages ville (SSG) sont servies en statique **et** `/api/route` tourne en serverless, sans configuration particulière. Il suffit de définir `NEXT_PUBLIC_MAPTILER_KEY` et `ORS_API_KEY` dans les variables d'environnement du projet Vercel.

Le seul piège, cohérent avec **ADR-0001** : le site a un **Route Handler** (`/api/route`, proxy ORS) qui nécessite un runtime serveur.

- ❌ **Ne pas activer `output: 'export'`** (export 100 % statique) : cela désactive les Route Handlers → le simulateur de la home casserait. La génération statique des pages ville (SSG via `generateStaticParams`) n'a **pas** besoin de cet export — elle fonctionne nativement sur Vercel aux côtés du Route Handler.

> Note : le déploiement Docker/auto-hébergé évoqué dans la méthode d'origine n'a pas lieu d'être ici — le front n'est pas dockerisé et Vercel couvre le besoin.

---

## 10. Checklist

- [x] `data/communes.json` généré (IDF), enrichi ORS **via Matrix** (trajets aéroports/Paris), commité — 266/266
- [x] `app/vtc/[ville]/page.tsx` : `generateStaticParams` + `dynamicParams = false`
- [x] Pages ville en Server Components purs (pas de composant client)
- [x] Contenu unique par ville (données ORS) ; tarifs fixes seulement si `inFixedZone`
- [x] `generateMetadata` (title/description/canonical) par page
- [x] Maillage : `nearby` + hubs (`/vtc`, département, aéroport, gare) + liens footer
- [x] JSON-LD : un `LocalBusiness` (layout) + `Service`/`BreadcrumbList`/`FAQPage` par page
- [x] `app/sitemap.ts` (290 URLs) + `app/robots.ts`
- [x] Un seul `<h1>` par page (vérifié sur le HTML généré)
- [x] Familles aéroport / gare / département livrées, avec exclusions volontaires (Paris 75, gare CDG)
- [ ] `NEXT_PUBLIC_SITE_URL` renseigné avec le vrai domaine (canonical/OpenGraph/sitemap en dépendent)
- [ ] Déploiement Vercel (jamais `output: 'export'` à cause de `/api/route`)
- [ ] Suivi Search Console (indexation, requêtes par famille de pages) avant toute nouvelle extension
