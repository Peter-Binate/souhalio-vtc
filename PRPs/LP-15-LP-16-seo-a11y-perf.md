# [LP-15 → LP-16] SEO technique & audit responsive/accessibilité/performance — PRP

> PRP combiné : les deux derniers tickets de la Phase 4 (« Conversion, SEO & finitions ») portent sur la même page déjà entièrement construite (LP-01 → LP-14) et s'exécutent dans le même contexte (audit + correction ponctuelle, pas de nouvelle feature). Contrairement au PRP LP-08→LP-14, ce ne sont pas 7 unités identiques mais deux audits de nature différente — chacun garde sa propre sous-section complète.

## Goal

Finaliser le SEO technique de la landing page (OpenGraph, `robots.txt`, `sitemap.xml`, `metadataBase` — le `<title>`/description/JSON-LD `LocalBusiness` étant déjà conformes depuis LP-03) et auditer/corriger le rendu mobile, l'accessibilité et la performance de l'ensemble des sections déjà livrées.

## Why

- **LP-15** : le SEO local est le principal canal d'acquisition organique pour un VTC sans budget pub (`ai_docs/content-reference.md`) — un partage sur les réseaux (WhatsApp, Facebook local) sans aperçu OpenGraph, ou un site non indexable (pas de sitemap), c'est de la conversion perdue avant même le premier appel.
- **LP-16** : le bouton d'appel flottant, les CTA et le formulaire sont les leviers de conversion n°1 du projet — un problème de contraste, un focus invisible au clavier, ou un débordement horizontal sur mobile cassent directement l'objectif business (générer des appels), pas juste un défaut cosmétique.

## What

### Périmètre commun

- Ce sont des tickets d'**audit + correction**, pas de nouvelle section de contenu : aucun texte de `wording.md` n'est modifié, seule l'infrastructure technique (metadata, fichiers spéciaux Next.js, classes Tailwind de focus/contraste) est touchée.
- **Exclu** (hors périmètre) : réécrire le contenu des sections LP-08→LP-14, ajouter une vraie photo du véhicule (aucun asset fourni — cf. LP-12), refonte visuelle/design system.

### LP-15 — SEO & données structurées (audit final)

**Déjà conforme (vérifié, ne pas retoucher sans raison) :**
- `<title>` et meta description : déjà exacts par rapport à `ai_docs/content-reference.md` (posés en LP-03).
- JSON-LD `LocalBusiness` : déjà complet selon le périmètre défini par `content-reference.md` (`name`, `telephone`, `address`, `areaServed`, `openingHoursSpecification`, `makesOffer` avec les 3 tarifs aéroport) — posé en LP-03, rien à ajouter sauf nouvelle exigence produit.
- `alt` images véhicule : **toujours sans objet** — aucune photo du véhicule n'existe (LP-12 l'a explicitement documenté, pas d'asset à inventer). Rien à faire ici tant qu'une vraie photo n'est pas fournie ; le jour où elle le sera, utiliser le texte déjà défini dans `content-reference.md` (« Kia Niro hybride gris foncé chauffeur VTC Île-de-France »).

**À ajouter (gaps réels, vérifiés absents du code) :**
- `metadataBase` dans `app/layout.tsx` — absent actuellement.
- `openGraph` (title, description, url, siteName, locale, type, image) — absent actuellement.
- Image OpenGraph — **aucune photo disponible** (même contrainte que le véhicule) → **générée dynamiquement** via `app/opengraph-image.tsx` (API `ImageResponse` de Next.js, JSX/CSS simple à partir de `BUSINESS`, pas de photo requise). Remplaçable facilement par une vraie photo plus tard.
- `app/robots.ts` et `app/sitemap.ts` — absents actuellement (fichiers spéciaux Next.js App Router, pas de `public/robots.txt`/`public/sitemap.xml` statiques à écrire à la main).

**Critère d'acceptation (`docs/BACKLOG.md`) :** `<title>`/description, JSON-LD `LocalBusiness` complet, `alt` images véhicule, OpenGraph, `robots`/`sitemap`.

### LP-16 — Audit responsive, accessibilité & performance

**Findings déjà identifiés avant l'audit complet** (constatés en explorant le code existant — à corriger dans ce ticket, pas à re-découvrir) :

1. **Focus clavier insuffisant** : `components/sections/contact.tsx` et `components/itinerary/address-autocomplete.tsx` utilisent `outline-none` sur les champs, avec pour seul remplacement `focus:border-zinc-900` — un simple changement de couleur de bordure est un indicateur de focus trop faible (WCAG 2.2 SC 2.4.7 Focus Visible). À remplacer par un anneau de focus visible (`focus-visible:ring-2 focus-visible:ring-offset-2`).
2. **Contrastes à vérifier en conditions réelles** : plusieurs endroits utilisent `text-zinc-500 dark:text-zinc-500` sur fond sombre (`zinc-900`/`zinc-950`) — à mesurer (pas supposer) ; ajuster vers `zinc-400` si le ratio AA (4.5:1 texte normal / 3:1 grand texte) n'est pas atteint.
3. **Cibles tactiles ≥44px** : déjà appliqué via `min-h-11` sur tous les CTA/boutons construits depuis LP-03 — à **confirmer par mesure réelle** (DevTools), pas juste relire le code.
4. **Scroll mobile piégé par la carte** : `cooperativeGestures: true` déjà posé dans `components/itinerary/route-map.tsx` (LP-06) — à revérifier en conditions réelles sur un viewport mobile, pas à ré-implémenter.
5. **Débordement horizontal ≤380px** : jamais vérifié en conditions réelles depuis LP-07 (assemblage complet de la page) — à tester avec le viewport DevTools, pas supposer que ça passe.

**Lighthouse (perf/a11y/SEO/best-practices)** : aucun outil de mesure n'est installé (`ai_docs/testing.md` suppose Playwright, absent du projet — cf. `package.json`). Utiliser `npx lighthouse` en ponctuel (pas d'ajout permanent à `package.json`) contre un **build de production** (`next build && next start`), jamais contre le serveur de dev (scores de perf faussés en mode dev).

**Critères d'acceptation (`docs/BACKLOG.md`) :**
- [ ] Passe mobile (≤ 380px), contrastes AA, focus visibles, la carte ne piège pas le scroll mobile
- [ ] Lighthouse (perf/a11y/SEO) relevé et écarts traités ou consignés

## Technical Context

### Fichiers à référencer (lecture seule)

- `app/layout.tsx` — metadata/JSON-LD existants (LP-03), point d'ajout de `metadataBase`/`openGraph`.
- `lib/constants.ts` — `BUSINESS`, à réutiliser pour l'image OG dynamique et le sitemap.
- `components/itinerary/route-map.tsx` — `cooperativeGestures` déjà en place (LP-06), pattern de référence si un ajustement mobile s'avère nécessaire ailleurs.
- `ai_docs/testing.md` — checklist manuelle a11y/responsive déjà écrite (« conversion & a11y »), à réutiliser comme trame d'audit plutôt qu'en réinventer une.

### Fichiers à créer

- `app/opengraph-image.tsx` — image OG générée via `ImageResponse`.
- `app/robots.ts` — génère `robots.txt` (convention Next.js App Router).
- `app/sitemap.ts` — génère `sitemap.xml` (une seule URL, le site étant one-page : `/`).

### Fichiers à modifier

- `app/layout.tsx` — ajouter `metadataBase` et `openGraph` ; **ne pas toucher** `title`/`description`/JSON-LD existants (déjà conformes).
- `.env.local.example`, `README.md` — documenter `NEXT_PUBLIC_SITE_URL`.
- `components/sections/contact.tsx`, `components/itinerary/address-autocomplete.tsx` — remplacer `outline-none` isolé par un anneau de focus visible.
- Toute classe de contraste insuffisante trouvée pendant l'audit réel (liste non exhaustive avant exécution — c'est le principe même d'un audit).

### Patterns existants à suivre

- Next.js App Router : fichiers spéciaux `app/robots.ts` (retourne `MetadataRoute.Robots`) et `app/sitemap.ts` (retourne `MetadataRoute.Sitemap`) — générés au build, jamais de fichier statique écrit à la main dans `public/`.
- `ImageResponse` (`next/og`, inclus nativement dans Next.js 16, aucune dépendance à ajouter) pour l'image OG dynamique — cohérent avec la règle « ne jamais halluciner un asset ».
- Variables d'environnement publiques déjà établies (`NEXT_PUBLIC_MAPTILER_KEY`, `NEXT_PUBLIC_FORMSPREE_FORM_ID`) : même convention pour `NEXT_PUBLIC_SITE_URL` (placeholder explicite dans `.env.local.example`, jamais un domaine inventé).

## Implementation Details

### Contrats d'API / Route Handlers

Aucun. Ces deux tickets ne touchent à aucune API externe ni Route Handler.

### `metadataBase` & OpenGraph

```ts
// app/layout.tsx — ajout, ne pas toucher au reste de metadata
export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: "Chauffeur VTC L'Haÿ-les-Roses & Île-de-France 24h/24 | Jhon Doe", // inchangé
  description: "...", // inchangé
  openGraph: {
    title: "Chauffeur VTC L'Haÿ-les-Roses & Île-de-France 24h/24 | Jhon Doe",
    description: "...", // même texte que meta description
    url: "/",
    siteName: BUSINESS.name,
    locale: "fr_FR",
    type: "website",
  },
};
```

`.env.local.example` :

```
# --- Client (publique) ---------------------------------------------------
# URL canonique du site (metadataBase, OpenGraph, robots.txt, sitemap.xml).
# Placeholder tant que le domaine de production n'est pas choisi.
NEXT_PUBLIC_SITE_URL=https://your-domain.example
```

### `app/opengraph-image.tsx`

```tsx
import { ImageResponse } from "next/og";
import { BUSINESS } from "@/lib/constants";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#18181b", // zinc-900
          color: "#fafafa",
          fontSize: 64,
          fontWeight: 600,
        }}
      >
        {BUSINESS.name}
        <div style={{ fontSize: 28, fontWeight: 400, marginTop: 16, color: "#d4d4d8" }}>
          Chauffeur VTC — Île-de-France, 24h/24 et 7j/7
        </div>
      </div>
    ),
    size,
  );
}
```

### `app/robots.ts`

```ts
import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: `${base}/sitemap.xml`,
  };
}
```

### `app/sitemap.ts`

```ts
import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  return [{ url: base, lastModified: new Date(), changeFrequency: "monthly", priority: 1 }];
}
```

### Focus visible (LP-16, finding n°1)

Remplacer, dans `contact.tsx` et `address-autocomplete.tsx` :

```diff
-outline-none focus:border-zinc-900
+outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 focus-visible:ring-offset-2 focus:border-zinc-900
```

(et l'équivalent dark : `dark:focus-visible:ring-zinc-100`.)

### Audit Lighthouse

```bash
npm run build && npm run start &   # build de production — jamais le mode dev (perf faussée)
npx lighthouse http://localhost:3000 \
  --output=json --output=html --output-path=./lighthouse-report \
  --only-categories=performance,accessibility,seo,best-practices \
  --chrome-flags="--headless"
```

Consigner les 4 scores obtenus et la liste des audits Lighthouse échoués dans le rapport final de `/epct LP-16`. Le ticket ne fixe pas de seuil chiffré (« relevé et écarts traités ou consignés ») — corriger ce qui est raisonnable dans le périmètre de ce ticket (ex. focus visible, contrastes), documenter explicitement le reste comme dette connue plutôt que de l'ignorer silencieusement.

### Sécurité & clés API

Aucune clé secrète concernée. `NEXT_PUBLIC_SITE_URL` est publique par nature (URL du site, pas un secret).

## Validation Criteria

### Exigences fonctionnelles (reprises de `docs/BACKLOG.md`)

- [ ] LP-15 : `<title>`/description conformes (déjà en place, revérifiés) ; JSON-LD `LocalBusiness` complet selon `content-reference.md` (déjà en place, revérifié) ; `alt` véhicule sans objet tant qu'aucune photo n'existe ; `openGraph` présent avec image générée dynamiquement ; `GET /robots.txt` et `GET /sitemap.xml` répondent 200 avec un contenu cohérent
- [ ] LP-16 : aucun débordement horizontal à 375–380px ; tous les éléments interactifs ont un focus visible au clavier (Tab) ; contrastes AA vérifiés (mesure réelle, pas supposée) ; la carte ne piège pas le scroll mobile (reconfirmé) ; rapport Lighthouse (perf/a11y/SEO/best-practices) consigné avec écarts traités ou explicitement documentés

### Exigences techniques (communes au projet)

- [ ] `npm run lint` et `npm run build` passent sans erreur
- [ ] Aucune valeur inventée : pas de domaine fictif, pas de photo produit halluciné — uniquement des placeholders explicites (`NEXT_PUBLIC_SITE_URL`) ou du contenu généré à partir de données déjà réelles (`BUSINESS`)
- [ ] Un seul `<h1>` sur la page (déjà acquis depuis LP-07, à revérifier après les changements de ce ticket)
- [ ] Aucune régression sur les CTA `tel:`/`wa.me` existants

### Étapes de test

1. `npm run lint` et `npm run build`.
2. Test manuel des nouveaux endpoints : `curl http://localhost:3000/robots.txt`, `curl http://localhost:3000/sitemap.xml`, et vérifier que `curl -I http://localhost:3000/opengraph-image` renvoie `content-type: image/png`.
3. Vérifier les balises `<meta property="og:...">` générées dans le HTML de `/` (`curl http://localhost:3000/ | grep og:`).
4. Audit Lighthouse (commande ci-dessus) contre un build de production — consigner les 4 scores.
5. Test manuel responsive : DevTools, viewport 375px et 380px, vérifier l'absence de scroll horizontal sur chaque section.
6. Test manuel clavier : `Tab` à travers toute la page (header → hero/simulateur → 7 sections → footer → bouton flottant), vérifier qu'un indicateur de focus visible apparaît à chaque arrêt.
7. Test manuel contraste : DevTools (panneau Accessibility / Contrast), en particulier sur les combinaisons `zinc-500`/`zinc-400` identifiées comme à risque.
8. Test manuel carte mobile : viewport mobile DevTools, vérifier que le scroll de la page n'est pas capturé par un simple geste à un doigt sur la carte (message « Use two fingers... » ou équivalent).

## Confirmation utilisateur

- ✅ **URL du site (LP-15)** : confirmé — variable d'environnement placeholder `NEXT_PUBLIC_SITE_URL`, jamais un domaine inventé.
- ✅ **Image OpenGraph (LP-15)** : confirmé — générée dynamiquement via `ImageResponse` à partir de `BUSINESS`, pas de photo requise.
- Aucun point bloquant restant : les seuils Lighthouse ne sont pas fixés par le ticket ; le rapport final de `/epct LP-16` documentera les scores obtenus et les écarts traités ou consignés, sans attendre de nouvelle confirmation.

Ce PRP fait foi pour l'exécution via `/epct LP-15` puis `/epct LP-16` (dans cet ordre — LP-16 revérifie certains éléments, dont l'OpenGraph, posés par LP-15).
