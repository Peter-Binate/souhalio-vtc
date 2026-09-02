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

- Pour chaque commune : `getDirections` (cf. `ai_docs/openrouteservice.md`) vers Orly, CDG, Beauvais et le centre de Paris → distance/durée.
- **Respecter le quota ORS** (plan gratuit ~40 req/min, ~2 000/jour) : throttling + reprise ; ~communes IDF × 4 trajets. Étaler si besoin.
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
- **JSON-LD** `LocalBusiness` avec `areaServed` = la commune (§7).

> Éviter le simulateur interactif sur ces pages (composant client, alourdit) : garder le simulateur sur la home, et sur les pages ville se contenter des données statiques + CTA.

---

## 6. Maillage interne & page hub

Le maillage est décisif en SEO programmatique.

- **Sur chaque page ville :** liens vers `nearby` (communes proches) + lien « Toutes les villes desservies » (hub) + lien vers l'accueil.
- **Page hub** `app/vtc/page.tsx` : liste toutes les communes couvertes, **groupées par département**, chacune liée à sa page. Sert de point d'entrée et distribue le PageRank interne.
- Ajouter un lien discret vers le hub depuis le **footer** global.

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
`LocalBusiness`/`TaxiService` avec `name`, `telephone`, `areaServed: { "@type": "City", "name": c.nom }`, `openingHours` 24/7. Injecté via `<script type="application/ld+json">`.

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

- [ ] `data/communes.json` généré (IDF), enrichi ORS (trajets aéroports/Paris), commité
- [ ] `app/vtc/[ville]/page.tsx` : `generateStaticParams` + `dynamicParams = false`
- [ ] Pages ville en Server Components purs (pas de composant client)
- [ ] Contenu unique par ville (données ORS) ; tarifs fixes seulement si `inFixedZone`
- [ ] `generateMetadata` (title/description/canonical) par ville
- [ ] Maillage : `nearby` + page hub `app/vtc/page.tsx` + lien footer
- [ ] JSON-LD `LocalBusiness` avec `areaServed` = la commune
- [ ] `app/sitemap.ts` (chunké) + `app/robots.ts`
- [ ] Un seul `<h1>` par page
- [ ] Déploiement Vercel (jamais `output: 'export'` à cause de `/api/route`)
- [ ] Périmètre honnête (zone réellement desservie) ; suivi Search Console
