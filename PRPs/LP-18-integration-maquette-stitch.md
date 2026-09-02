# [LP-18] Intégration CSS de la maquette Stitch (mobile-first) — PRP

## Goal

Restyler intégralement la landing page existante (`app/page.tsx` et l'ensemble de ses sections) pour qu'elle corresponde visuellement à la maquette Google Stitch **« Plateforme VTC Professionnelle »** (design system « Midnight Elite », export `stitch_plateforme_vtc_professionnelle/code.html` + `DESIGN.md`), **en ne touchant qu'au CSS/JSX de présentation** — aucune logique métier, donnée, ou comportement ne change — avec une approche **mobile-first**, et des **emplacements vides (placeholders) aux dimensions de la maquette** pour toutes les images qui n'existent pas encore comme assets réels.

## Why

Demande explicite de l'utilisateur : *« je souhaite que tu m'intègre intégralement cette maquette sans toucher à la logique métier ne fais que du css. Adopte le mobile first. Pour les images laisse des emplacement vide placeholder mais avec les mêmes dimensions que les images sur la maquette. »*

La landing page actuelle est fonctionnelle (simulateur, pricing, formulaire, SEO — LP-01 à LP-17) mais visuellement minimaliste (palette `zinc` monochrome, aucune photo, cartes bordées simples). La maquette Stitch (« Midnight Elite ») propose une identité **Corporate Modern / Premium Minimalist** cohérente pour un service VTC haut de gamme : noir profond + accent or, typographie Montserrat/Inter, cartes à ombre douce, icônes Material Symbols. Un design plus crédible et engageant sert directement l'objectif n°1 du site (déclencher l'appel) : la première impression conditionne la confiance, donc la conversion.

## What

### Source de vérité

L'export complet de la maquette est disponible dans le repo : `stitch_plateforme_vtc_professionnelle/` (`code.html` — HTML/Tailwind CDN généré par Stitch, `DESIGN.md` — spec de design system, `screen.png` — capture). **`code.html` fait foi pour la structure/les classes**, `DESIGN.md` pour l'intention (quand les deux divergent légèrement, cf. note sur `rounded-full` ci-dessous).

⚠️ Ce dossier n'est **pas** du code à copier tel quel : c'est un export HTML statique généré par IA (Tailwind CDN, jQuery-like vanilla JS, faux formulaire avec `setTimeout`, contenu en partie fictif). Il sert de **référence visuelle exacte**, à retranscrire dans les composants React/Tailwind v4 existants du projet, dans le respect des conventions `CLAUDE.md`.

### Inclus

- Restylage **CSS/Tailwind uniquement** de toutes les sections listées dans `app/page.tsx` + `components/layout/*`, en suivant fidèlement la structure et les classes de `code.html` (adaptées à Tailwind v4 CSS-first et aux composants existants).
- Nouveaux **tokens de thème** dans `app/globals.css` (`@theme`) : couleurs, typographie, rayons, ombre — valeurs exactes ci-dessous (§ Design tokens).
- **Polices** Montserrat (headlines) + Inter (corps/contrôles) via `next/font/google` (comme `Geist` actuellement — pas de `<link>` Google Fonts brut, cf. conventions Next.js du projet) + **Material Symbols Outlined** pour les icônes (via `next/font/google` si disponible, sinon balise `<link>` dédiée aux polices d'icônes, seule exception tolérée car ce n'est pas une police de texte).
- **Emplacements image vides** (placeholders, sans `src`, dimensions/ratio de la maquette) dans `components/sections/about.tsx` (photo chauffeur + photo véhicule, ratio `aspect-[4/3]`, actuellement absentes — cf. commentaire existant "aucun placeholder inventé").
- Mobile-first : classes Tailwind de base = mise en page mobile (`grid-cols-1`, empilé), `md:`/`lg:` ajoutent les grilles multi-colonnes desktop — exactement le pattern déjà utilisé dans `code.html` (`grid-cols-1 md:grid-cols-2 lg:grid-cols-5`, etc.).

### Exclus (hors périmètre — cf. `CLAUDE.md` § À NE PAS faire)

- **Aucune logique métier** : `lib/pricing.ts`, `lib/ors.ts`, `lib/maptiler.ts`, `lib/use-route.ts`, `lib/use-contact-form.ts` ne changent pas.
- **Aucun schéma Zod, aucun champ de formulaire ajouté/retiré** :
  - `schemas/contact.ts` inchangé. Le formulaire réel (`contact.tsx`, 7 champs + consentement RGPD) garde **tous ses champs actuels** ; seul le style s'aligne sur le formulaire « Demande de devis » de la maquette (labels `uppercase` en majuscules capitales, inputs `bg-surface-container-lowest`/bordure fine, carte à ombre douce).
  - Le formulaire du **hero simulateur** dans `code.html` inclut des champs `time`/`date` qui **n'existent pas** dans `itinerary-simulator.tsx` actuel (LP-07 : uniquement départ/destination). **Ne pas les ajouter** — ce serait une nouvelle fonctionnalité, pas du CSS. On restyle uniquement les champs réellement présents (autocomplete départ/destination, bouton, panneau résultat, carte).
- **Contenu fabriqué à ne pas reprendre** : le bloc « preuve sociale » du hero dans `code.html` (2 avatars circulaires + *« Plus de 1000 clients satisfaits »*) est un **chiffre inventé** par l'IA de Stitch. Cf. `CLAUDE.md` : ne jamais coder en dur une valeur fictive non balisée. **Ne pas intégrer ce bloc** (ni le chiffre, ni les photos placeholder associées) — il n'a pas d'équivalent dans `lib/constants.ts` et n'a pas été demandé par l'utilisateur pour ce ticket.
- **Liens de pied de page fictifs** : `code.html` référence des liens `Privacy Policy` / `Terms of Service` / `Legal Notice` / `Fleet` / `Airport Transfers` en `href="#"` (pages inexistantes). Ne pas les ajouter — créer ces pages serait une nouvelle fonctionnalité (nouvelles routes), hors périmètre CSS. Le footer garde sa structure actuelle (infos + CTA tel/WhatsApp), restylée visuellement.
- **Nav ancrée** (`#services`, `#pricing`, `#about`, `#contact`) dans le header : acceptable en CSS pur (ancres internes vers des sections déjà présentes sur la même page, aucune nouvelle route) — **à inclure**, contrairement aux deux points ci-dessus.
- **Aucune image réelle** : uniquement des emplacements vides (placeholder visuel), jamais d'URL d'image externe (les `src` de `code.html` pointent vers des images générées par IA hébergées par Google — à ne surtout pas réutiliser, ni comme image réelle ni en `background-image`).
- **Aucun changement de route/API**, aucun changement de MapLibre au-delà de son conteneur visuel.

## Technical Context

### Fichiers à référencer (lecture seule)

- `stitch_plateforme_vtc_professionnelle/code.html` — structure et classes Tailwind exactes de chaque section (référence principale).
- `stitch_plateforme_vtc_professionnelle/DESIGN.md` — intention du design system (palette commentée, typographie, philosophie d'espacement, composants).
- `app/globals.css` — unique fichier de tokens de thème (Tailwind v4 CSS-first via `@theme`) ; c'est ici que toutes les nouvelles valeurs (§ Design tokens) doivent être déclarées, jamais en valeur arbitraire répétée dans les composants.
- `app/layout.tsx` — pattern d'intégration de police actuel (`next/font/google` pour `Geist`/`Geist_Mono`, variables CSS `--font-geist-sans`) à répliquer pour Montserrat/Inter.
- `CLAUDE.md` § Conventions — « Tailwind : classes utilitaires ; tokens de thème dans `globals.css`. Pas de CSS-in-JS. » et § À NE PAS faire.
- Toutes les sections actuelles (`components/sections/*.tsx`, `components/layout/*.tsx`, `components/itinerary/*.tsx`) — pattern sémantique à préserver : `<section aria-labelledby="…-heading">`, un seul `<h1>`, CTA `tel:` prioritaire / `wa.me` secondaire, cibles ≥ 44px.
- `components/sections/about.tsx` — commentaire existant : « Photo du véhicule à ajouter dès qu'un vrai asset sera fourni (aucun placeholder inventé). » Ce ticket **change cette règle** à la demande explicite de l'utilisateur : on ajoute désormais un placeholder vide dimensionné.

### Fichiers à créer/modifier

- `app/layout.tsx` — ajout des polices Montserrat/Inter via `next/font/google`.
- `app/globals.css` — tokens de thème (§ Design tokens).
- `components/layout/header.tsx` — nav sticky + liens ancrés + bouton d'appel (structure `code.html` lignes 119-139).
- `components/layout/footer.tsx` — fond `deep-midnight`, structure 2 colonnes (structure `code.html` lignes 499-517, **sans** les liens fictifs).
- `components/layout/sticky-call-button.tsx` — devient un FAB circulaire couleur accent (structure `code.html` lignes 495-497), au lieu de la barre pleine largeur actuelle.
- `components/sections/hero-itinerary.tsx` + `components/itinerary/itinerary-simulator.tsx` + `components/itinerary/price-estimate.tsx` — hero 2 colonnes (texte à gauche, carte simulateur à droite en desktop ; empilé en mobile), carte simulateur `ambient-shadow` + `rounded-xl` (structure `code.html` lignes 141-213, **sans** le bloc preuve sociale ni les champs date/heure).
- `components/sections/airport-pricing.tsx` — carte « reçu » avec icône décorative, lignes séparées par bordure fine, CTA couleur accent (structure `code.html` lignes 214-257).
- `components/sections/direct-booking.tsx` — grille bento asymétrique (structure `code.html` lignes 258-301) ; **5 avantages existants conservés tels quels** (le 4ᵉ argument de `code.html`, sur la carte foncée, sert de gabarit visuel — le contenu textuel reste celui de `ADVANTAGES` dans le fichier actuel).
- `components/sections/services.tsx` — grille 3 colonnes avec icône par carte (structure `code.html` lignes 302-357) ; correspondance 1:1 confirmée entre les 6 `SERVICES` existants et les 6 cartes de la maquette (mêmes intitulés : Départ Immédiat, Transferts Aéroports, Gares Parisiennes, Déplacements Affaires, Longue Distance/Province, Service 24/7).
- `components/sections/about.tsx` — layout alterné 2 blocs (chauffeur puis véhicule), **2 placeholders image** `aspect-[4/3]` (structure `code.html` lignes 358-418).
- `components/sections/zones.tsx`, `components/sections/reviews.tsx` — **absentes de la maquette** (confirmé : `code.html` ne contient que Nav/Hero/Pricing/Bento/Services/About/Contact/Footer). Restyler avec le même système de tokens (couleurs, cartes, typographie) que les sections voisines, par cohérence — pas de gabarit direct à copier.
- `components/sections/contact.tsx` — layout « split » 2 colonnes (infos en cartes cliquables à gauche, carte formulaire à droite ; structure `code.html` lignes 419-493), **tous les champs et la logique de soumission inchangés**.

## Design tokens (source : `code.html` + `DESIGN.md`)

### Couleurs

À déclarer dans `app/globals.css` (`@theme`). Noms de tokens Tailwind v4 proposés entre parenthèses.

| Rôle | Hex | Usage observé |
|---|---|---|
| `primary` (`--color-primary`) | `#000000` | Fond boutons primaires, header/footer text, icônes principales |
| `deep-midnight` (`--color-deep-midnight`) | `#0f1115` | Fond du footer |
| `muted-gold` / accent (`--color-accent`) | `#bfa15a` | CTA secondaires (Appeler/WhatsApp), FAB mobile, icônes de mise en avant, prix aéroport |
| `surface` / fond principal (`--color-background`, déjà existant) | `#fdf8f8` (quasi blanc) | Fond de page — **note** : le blanc pur `#ffffff` (`surface-white`) est utilisé pour les cartes, `#fdf8f8` pour le fond de page ; distinction subtile à conserver |
| `surface-container-low` | `#f7f3f2` | Fond de section alterné (tarifs aéroport, contact) |
| `surface-container-lowest` / blanc carte | `#ffffff` | Fond des inputs, cartes |
| `surface-variant` / bordures (`--color-border`) | `#e5e2e1` | Bordures de carte, séparateurs |
| `outline-variant` | `#c4c7c7` | Bordures d'input |
| `on-surface-variant` (texte secondaire) | `#444748` | Texte de corps secondaire |
| `on-background` (`--color-foreground`, déjà existant) | `#1c1b1b` | Texte principal |
| WhatsApp (couleur de marque, pas un token du design system) | `#25D366` | Icône WhatsApp uniquement |

⚠️ **Incohérence à corriger** dans la config `tailwind.config` de `code.html` : `borderRadius.full` y est fixé à `0.75rem` (12px) au lieu d'un rayon complet, ce qui casserait les avatars/boutons circulaires (`w-12 h-12 rounded-full`) censés être des cercles parfaits. `DESIGN.md` confirme l'intention réelle : `full: 9999px`. **Utiliser 9999px** (ou le `rounded-full` natif de Tailwind, déjà correct) pour tout élément circulaire/pilule.

### Typographie

Polices via `next/font/google` (comme `Geist` actuellement) :

| Token | Police | Taille / interligne / graisse / tracking | Usage |
|---|---|---|---|
| `headline-xl` | Montserrat 700 | 48px / 56px / -0.02em | Hero desktop (`md:` et plus) |
| `headline-lg-mobile` | Montserrat 600 | 28px / 34px | Hero mobile, titres `h2` mobile |
| `headline-lg` | Montserrat 600 | 32px / 40px / -0.01em | Titres `h2` desktop |
| `body-lg` | Inter 400 | 18px / 28px | Paragraphes d'intro de section |
| `body-md` | Inter 400 | 16px / 24px | Corps de texte, labels de champs |
| `label-caps` | Inter 600 | 12px / 16px / +0.05em, **uppercase** | Labels de formulaire, badges, nav |
| `price-display` | Montserrat 700 | 24px / 32px | Prix (tarifs aéroport, estimation) |

### Espacement, rayons, ombres

| Token | Valeur | Usage |
|---|---|---|
| `container-max` | 1280px | Largeur max des sections (remplace `max-w-6xl` = 1152px actuel — **à harmoniser**, cf. note ci-dessous) |
| `gutter` | 24px | Padding horizontal des sections |
| `section-padding` | 80px | Padding vertical desktop des sections |
| `section-padding-mobile` | 48px | Padding vertical mobile |
| Radius carte/simulateur | `rounded-xl` (8px selon `DESIGN.md`, `0.5rem` dans `code.html`) | Cartes, simulateur, images |
| Radius input/bouton standard | `rounded` / `rounded-DEFAULT` (4px selon `DESIGN.md` ; `0.125rem` dans `code.html` — **suivre `DESIGN.md`, 4px**, la valeur `code.html` semble trop faible pour être perceptible) | Boutons, champs de formulaire |
| Ombre carte (`ambient-shadow`) | `0px 10px 30px rgba(0,0,0,0.04)` | Cartes interactives (simulateur, tarifs, contact) |
| Hover carte (`hover-lift`) | `translateY(-2px)` + `0px 15px 40px rgba(0,0,0,0.08)` | Cartes du bento « Pourquoi nous choisir » |

Note `container-max` : le codebase actuel utilise `max-w-6xl` (1152px) uniformément. La maquette vise 1280px. **Décision à trancher pendant l'implémentation** (pas bloquant) : soit introduire `max-w-[1280px]` de façon cohérente sur toutes les sections restylées, soit garder `max-w-6xl` pour rester cohérent avec le reste du site (différence mineure, 128px). Recommandation : adopter 1280px partout pour coller fidèlement à la maquette, comme demandé (« intégralement »).

### Icônes

`code.html` utilise **Material Symbols Outlined** (Google Fonts) pour toutes les icônes (`call`, `location_on`, `near_me`, `schedule`, `event`, `flight_takeoff`, `verified_user`, `person`, `directions_car`, `event_available`, `bolt`, `flight`, `train`, `work`, `map`, `check_circle`, `eco`, `wifi`, `ac_unit`, `luggage`, `mail`, `chat`, `menu`, `star`, `swap_vert`, `calculate`, `progress_activity`). À charger via `next/font/google` (`Material Symbols Outlined` y est disponible) et utiliser en `<span className="material-symbols-outlined">nom_icone</span>`, cohérent avec l'approche déjà 100% textuelle/emoji du site actuel (qui utilise des emojis `📞`/`💬` dans les CTA) — **remplacer les emojis actuels par ces icônes** pour coller à la maquette, tout en gardant le texte associé identique (pas de changement de contenu, seulement l'icône).

## Implementation Details

### Mobile-first

Pour chaque section restylée, reproduire exactement la logique de `code.html`, qui est déjà mobile-first par construction (`grid-cols-1` de base, `md:`/`lg:` pour les grilles desktop) :

1. Classes sans préfixe = rendu mobile (une colonne, empilé, `section-padding-mobile` = 48px).
2. `md:`/`lg:` pour les adaptations desktop (colonnes multiples, `section-padding` = 80px, tailles de police `headline-xl`/`headline-lg`).
3. Revérifier chaque section à ≤ 380px de large (contrainte déjà actée dans `docs/BACKLOG.md` LP-16) après restylage.

### Emplacements image (placeholders)

Dans `about.tsx`, remplacer le commentaire « aucun placeholder inventé » par deux blocs `<div>` vides reprenant exactement le ratio de `code.html` (`aspect-[4/3] rounded-xl overflow-hidden bg-surface-container-high`), par exemple :

```tsx
<div
  role="img"
  aria-label="Photo du chauffeur — à ajouter"
  className="relative aspect-[4/3] overflow-hidden rounded-xl bg-zinc-100 dark:bg-zinc-900"
/>
```

- Ratio `4:3` confirmé pour les deux photos (chauffeur et véhicule) — c'est la seule dimension d'image présente dans la maquette (les avatars circulaires `w-12 h-12` du hero sont exclus, cf. § Exclus).
- `role="img"` + `aria-label` descriptif pour l'accessibilité tant qu'aucune vraie image n'existe.
- Quand un vrai asset sera fourni, ce placeholder sera remplacé par un `<Image>` Next.js (hors périmètre de ce ticket).

### Sécurité & clés API

Aucun changement — ce ticket ne touche à aucune clé, aucun appel réseau, aucune donnée. Portée `ORS_API_KEY`/`NEXT_PUBLIC_MAPTILER_KEY` inchangée.

## Validation Criteria

### Exigences fonctionnelles

- [x] Chaque section de `app/page.tsx` (+ header/footer/sticky-call-button) reflète fidèlement la section correspondante de `code.html` (structure, couleurs exactes, typographie, icônes, ombres) — vérifié visuellement en desktop (1440px).
- [x] `about.tsx` affiche deux emplacements image vides `aspect-[4/3]`, avec `aria-label` descriptif.
- [~] Toutes les sections utilisent des classes mobile-first (vérifié par relecture de code : base non préfixée = mobile, `sm:`/`md:`/`lg:` pour le desktop). **Rendu ≤ 380px non capturé visuellement** — le navigateur automatisé de cette session est resté bloqué à 1470px de large (`resize_window` sans effet sur `window.innerWidth`) ; à revérifier dans un vrai navigateur.
- [x] `zones.tsx` et `reviews.tsx` restylés avec les mêmes tokens (couleurs, cartes, typographie) que le reste, en cohérence visuelle.
- [x] Bloc « preuve sociale » (avatars + « 1000 clients ») **non intégré**. Champs `date`/`heure` du hero simulateur **non ajoutés**. Liens footer fictifs (Privacy/Terms/Legal/Fleet) **non ajoutés**.
- [x] Nav du header avec ancres `#services`/`#about`/`#contact` fonctionnelles vers les sections existantes.

### Exigences techniques

- [x] `npm run lint` et `npm run build` (type-check inclus) passent sans erreur.
- [x] **Aucune régression fonctionnelle** : `npm test` passe sans modification (45/45, aucun test changé).
- [x] Aucun champ de formulaire ajouté/retiré dans `contact.tsx` ni `itinerary-simulator.tsx` ; `schemas/contact.ts` et `schemas/itinerary.ts` inchangés.
- [x] Aucune modification de `lib/pricing.ts`, `lib/ors.ts`, `lib/maptiler.ts`, `lib/use-route.ts`, `lib/use-contact-form.ts`, `app/api/route/route.ts`.
- [x] Tokens de thème (couleurs, typographie, rayons, ombre) déclarés dans `app/globals.css` (`@theme`), pas de valeur arbitraire dupliquée dans les composants (`bg-accent` utilisé partout).
- [x] Polices Montserrat/Inter intégrées via `next/font/google`. Material Symbols intégré via le package self-hosted `material-symbols` (`outlined.css`) plutôt que `next/font/google` (non disponible pour cette police d'icônes) — aucune balise `<link>` Google Fonts brute.
- [x] Cibles tactiles ≥ 44px (`min-h-11` conservé) et contrastes vérifiés par calcul (ratio WCAG) : noir sur or #bfa15a → 8,46:1 ; blanc sur `deep-midnight` #0f1115 → 18,90:1 ; texte `muted` sur fond → 8,91:1 ; tous largement au-dessus du seuil AA (4,5:1), certains au niveau AAA.
- [x] Un seul `<h1>` toujours présent (hero) ; CTA `tel:`/`wa.me` toujours présents et dans le même ordre de priorité.
- [x] Aucune image réelle codée en dur (ni les URLs `lh3.googleusercontent.com` de `code.html`, ni aucune autre) ; uniquement des placeholders vides.
- [x] `git diff` limité aux fichiers de présentation (`components/`, `app/globals.css`, `app/layout.tsx`, `package.json`/`pnpm-lock.yaml` pour la dépendance `material-symbols`) — aucun fichier `lib/`, `schemas/`, `app/api/` modifié.

### Étapes de test

1. Implémenter section par section, dans l'ordre du DOM (`header` → `hero-itinerary` → `airport-pricing` → `direct-booking` → `services` → `about` → `zones` → `reviews` → `contact` → `footer`/`sticky-call-button`), en comparant à chaque étape `stitch_plateforme_vtc_professionnelle/screen.png` (ou `code.html` ouvert dans un navigateur) et `npm run dev` au même breakpoint.
2. `npm run lint`, `npm test` (doit rester vert sans modification), `npm run build`.
3. Test manuel navigateur : parcours complet mobile (≤ 380px) puis desktop, vérifier qu'aucun comportement (simulateur, calcul de prix, formulaire, CTA) n'a changé — seul l'aspect visuel diffère.
4. Vérifier `ORS_API_KEY` toujours absente du bundle client (inchangé par ce ticket, mais à revérifier par principe après tout build).
5. Vérifier les contrastes AA sur les nouvelles combinaisons de couleurs (texte sur `muted-gold`, texte sur `deep-midnight`) avec un outil de contraste (cf. méthode déjà utilisée en LP-16).
6. Mettre à jour `docs/BACKLOG.md` (cocher `LP-18`) et `CHANGELOG.md` une fois terminé.
