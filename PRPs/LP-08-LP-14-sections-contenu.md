# [LP-08 → LP-14] Sections de contenu — PRP

> PRP combiné : les 7 tickets partagent exactement le même pattern technique (Server Component statique, une section = un fichier, CTA en fin de section, texte issu de `wording.md`). Chaque ticket a sa propre sous-section Goal/What/Critères ci-dessous ; le Technical Context, les patterns et les critères de validation techniques sont communs et ne sont décrits qu'une fois.

## Goal

Construire les 7 sections de contenu de la landing page qui suivent le hero (LP-07) — tarifs aéroport, réserver en direct, services, zones & gares, à propos, avis clients, contact — et les assembler dans `app/page.tsx` dans l'ordre défini par `ai_docs/content-reference.md`.

## Why

Le hero + simulateur (LP-07) capte et engage ; ces 7 sections font descendre le visiteur dans l'entonnoir de conversion en levant ses objections dans un ordre pensé pour ça (`ai_docs/content-reference.md`, `wording.md`) :

1. Le prix est l'objection n°1 pour les trajets aéroport → tarif fixe affiché tout de suite après le hero (LP-08).
2. Pourquoi réserver en direct plutôt que via une appli → réassurance (LP-09).
3. Étendue de l'offre → chaque segment de clientèle se reconnaît (LP-10).
4. Couverture géographique → SEO local + réassurance (LP-11).
5. Confiance humaine (chauffeur, véhicule) → réassurance (LP-12).
6. Preuve sociale juste avant la conversion → avis (LP-13).
7. Conversion finale → contact (LP-14).

Chaque section se termine par un CTA, l'appel (`tel:`) restant prioritaire partout, conformément à l'objectif n°1 du projet (déclencher des appels téléphoniques).

## What

### Périmètre commun (s'applique aux 7 tickets)

- Chaque section = **un Server Component** (pas de `"use client"`, sauf LP-14 qui a un formulaire interactif).
- Une section = un fichier dans `components/sections/`.
- Texte repris de `wording.md` **quasiment verbatim** (seule adaptation : markdown → JSX — gras → `<strong>`, listes → `<ul>/<li>`). `wording.md` et `ai_docs/content-reference.md` font foi sur le contenu ; ne pas réécrire ou résumer la copie.
- Chaque section : `<section aria-labelledby="...">`, un seul `<h2>` (jamais de second `<h1>` — celui du hero dans `hero-itinerary.tsx` reste l'unique `<h1>` de la page), CTA en fin de section (`tel:` prioritaire, `wa.me` quand `wording.md` le prévoit).
- Toute valeur fictive ou donnée business vient de `lib/constants.ts` (`BUSINESS`, `AIRPORT_FARES`, `REVIEWS`) — jamais codée en dur dans le JSX.
- Points « à confirmer avec le client » listés dans `ai_docs/content-reference.md` (intitulé exact de la gare Marne-la-Vallée Chessy, version précise de la Kia Niro, vrais avis/coordonnées) : **ne pas inventer** — garder le texte de `wording.md` tel quel, avec sa propre réserve le cas échéant.
- **Exclus** (hors périmètre de ces 7 tickets) : SEO technique/JSON-LD détaillé (déjà posé en LP-03, audit complet en LP-15), audit a11y/responsive/perf poussé (LP-16), vraies photos du véhicule (aucun asset fourni — ne pas halluciner un chemin d'image).

### LP-08 — Tarifs aéroports (prix fixes)

- **Fichier :** `components/sections/airport-pricing.tsx`
- **H2 :** « Transferts aéroport à prix fixe, sans mauvaise surprise »
- **Contenu :** texte de `wording.md` §2 + tableau Orly/CDG/Beauvais, valeurs lues depuis `AIRPORT_FARES` (`lib/constants.ts`), pas de montant codé en dur dans le JSX.
- **Mention obligatoire :** tarif valable **au départ de Paris et de la proche banlieue** (déjà dans le texte de `wording.md`).
- **CTA :** 📞 « Réservez votre transfert aéroport — {téléphone} »
- **Critère d'acceptation (`docs/BACKLOG.md`) :** tableau Orly 50 € / CDG 65 € / Beauvais 120 € + mention « départ Paris & proche banlieue » + CTA.

### LP-09 — Réserver en direct (engagements)

- **Fichier :** `components/sections/direct-booking.tsx`
- **H2 :** « Réservez en direct avec votre chauffeur »
- **Contenu :** texte d'intro + liste des 5 avantages de `wording.md` §3 (tarif transparent, interlocuteur unique, ponctualité, disponible 24/7, véhicule dédié).
- **Exclu explicitement :** le bloc optionnel « note/avis Uber » mentionné en note d'édition dans `wording.md` (« *dites-le-moi* ») — ne pas l'ajouter sans demande explicite du client.
- **CTA :** 📞 « Appelez maintenant pour réserver — {téléphone} »
- **Critère d'acceptation :** 5 avantages + CTA appel.

### LP-10 — Services

- **Fichier :** `components/sections/services.tsx`
- **H2 :** « Des trajets de qualité, pour chaque besoin »
- **Contenu :** grille de 6 cartes (`wording.md` §4) : réservation immédiate/anticipée, transferts aéroports, transferts gares, déplacements affaires, longue distance & province, disponibilité 24h/24 & 7j/7.
- **CTA :** « Un trajet en tête ? 📞 Appelez le {téléphone} »
- **Critère d'acceptation :** grille de services par segment + CTA.

### LP-11 — Zones & gares desservies

- **Fichier :** `components/sections/zones.tsx`
- **H2 :** « Une couverture complète, de L'Haÿ-les-Roses à toute la France »
- **Contenu :** texte de `wording.md` §5 (base L'Haÿ-les-Roses/Val-de-Marne, Île-de-France + province) + liste des gares desservies (gares de Paris, Massy-Palaiseau, Marne-la-Vallée Chessy, gare TGV Roissy-CDG).
- **Point ouvert conservé tel quel :** `wording.md` signale que l'intitulé « Marne-la-Vallée Chessy » est à vérifier auprès du chauffeur avant publication — ne pas trancher, garder la note.
- **CTA :** « Votre adresse est-elle desservie ? 📞 Vérifiez en un appel — {téléphone} »
- **Critère d'acceptation :** base + IDF + province + liste des gares, wording SEO local, CTA.

### LP-12 — À propos & véhicule

- **Fichier :** `components/sections/about.tsx`
- **H2 :** « Jhon Doe, votre chauffeur privé depuis 4 ans »
- **Contenu :** texte de `wording.md` §6 (expérience, engagement, véhicule Kia Niro hybride gris foncé, infos pratiques : langue/paiement/disponibilité).
- **Placeholders vs faits réels :** langue, paiement et disponibilité viennent de `BUSINESS` (`lib/constants.ts`, déjà présents). « 4 ans d'expérience » et le modèle du véhicule sont des **faits réels non fictifs** (`ai_docs/content-reference.md` § Faits business) propres à cette seule section — ils peuvent rester en texte littéral dans `about.tsx` (pas d'obligation de les faire remonter dans `lib/constants.ts`, qui est réservé aux placeholders et données réutilisées ailleurs).
- **Photo du véhicule :** aucun asset fourni → ne pas ajouter d'`<img>` avec un chemin inventé. Prévoir la place dans la structure JSX (ex. commentaire ou `<div>` réservé) mais ne pas halluciner un fichier. Le SEO `alt` définitif (« Kia Niro hybride gris foncé chauffeur VTC Île-de-France ») s'appliquera quand une vraie photo sera fournie (LP-15).
- **CTA :** « 📞 Réservez votre chauffeur — {téléphone} »
- **Critère d'acceptation :** 4 ans d'expérience, Kia Niro hybride gris foncé, paiement espèces, langue français + CTA.

### LP-13 — Avis clients

- **Fichier :** `components/sections/reviews.tsx`
- **H2 :** « Ils ont choisi la sérénité »
- **Contenu :** bandeau d'avertissement « avis fictifs » + liste mappée depuis `REVIEWS` (`lib/constants.ts`, déjà construit en LP-02 — chaque `author` porte déjà le suffixe « (avis fictif) »).
- **Emplacement lien Google (`wording.md` : « prévoir un lien "Voir tous nos avis" »)** : **aucune URL Google Business Profile réelle n'existe** → ne pas générer/deviner d'URL. Afficher un **texte non cliquable** du type « Lien vers l'ensemble de nos avis Google (à ajouter dès que la fiche sera disponible) » plutôt qu'un `<a href="#">` trompeur.
- **CTA :** « Rejoignez des clients sereins — 📞 {téléphone} »
- **Critère d'acceptation :** avis fictifs balisés depuis `REVIEWS`, emplacement prévu pour lien Google, CTA.

### LP-14 — Contact & formulaire (RGPD)

- **Fichier :** `components/sections/contact.tsx` (`"use client"` — seule section interactive des 7).
- **H2 :** « Réservez votre trajet dès maintenant »
- **Bloc coordonnées** (`wording.md` §8) : téléphone (le plus rapide), WhatsApp, email, base + adresse, disponibilité 24/7, paiement — tout depuis `BUSINESS`.
- **Formulaire** (`react-hook-form` + `zodResolver`, schéma `schemas/contact.ts`) : Nom · Téléphone · Email · Date souhaitée · Heure souhaitée · Lieu de départ · Destination · Message · **case à cocher de consentement RGPD** (obligatoire).
- **CTA principal :** bouton « 📞 Appeler maintenant » (le bloc coordonnées agit comme CTA prioritaire, avant même le formulaire) ; **CTA secondaire :** « 💬 Réserver par WhatsApp ». Le formulaire est la conversion tertiaire, conforme à la hiérarchie du projet (appel > WhatsApp > formulaire).
- **Micro-réassurance** sous les boutons : « Réponse rapide · Tarifs aéroport fixes · Chauffeur ponctuel » (`wording.md`).
- **Critères d'acceptation (`docs/BACKLOG.md`) :**
  - [ ] Téléphone (prioritaire), WhatsApp, email, horaires 24/7
  - [ ] Formulaire validé par Zod ; RGPD : pas de persistance de PII, mention de consentement/traitement
  - [ ] Cible du formulaire documentée (mailto ou service tiers) — pas de back-end

#### Décision confirmée : cible du formulaire = Formspree

**Confirmé par l'utilisateur : service tiers Formspree.** Formspree expose un endpoint public par formulaire (`https://formspree.io/f/{FORM_ID}`) — ce n'est pas un secret à protéger (même nature que `NEXT_PUBLIC_MAPTILER_KEY`, restreint côté dashboard Formspree plutôt que par domaine), donc **pas de Route Handler proxy nécessaire** : le client peut poster directement.

**Prérequis avant l'implémentation :** l'utilisateur doit créer un compte Formspree et un formulaire, puis fournir l'ID (`FORM_ID`). Tant que cet ID n'existe pas, utiliser un placeholder explicite (ex. `NEXT_PUBLIC_FORMSPREE_FORM_ID=your_formspree_form_id` dans `.env.local.example`, à l'image de `ORS_API_KEY`/`NEXT_PUBLIC_MAPTILER_KEY`) — ne jamais inventer un ID de formulaire.

Mécanique proposée :

```ts
// lib/ky.ts — ajouter une instance dédiée (endpoint absolu, hors API interne)
export const formspreeApi = ky.create({ timeout: 10_000, retry: 1 });
```

```ts
// hook (TanStack Query), colocalisé avec le formulaire ou dans lib/use-contact-form.ts
useMutation<void, Error, ContactFormValues>({
  mutationFn: async (values) => {
    await formspreeApi.post(
      `https://formspree.io/f/${process.env.NEXT_PUBLIC_FORMSPREE_FORM_ID}`,
      { json: values, headers: { Accept: "application/json" } },
    );
  },
});
```

- Variable d'environnement : `NEXT_PUBLIC_FORMSPREE_FORM_ID` (publique, comme `NEXT_PUBLIC_MAPTILER_KEY`) — à ajouter dans `.env.local.example` et documenter dans `README.md`.
- États UI : `isPending` (spinner sur le bouton, même pattern que `itinerary-simulator.tsx`), succès (message de confirmation, formulaire réinitialisé), erreur (message générique + **repli sur CTA téléphone**, cohérent avec la règle du projet « erreur → repli CTA appel »).
- **Implication RGPD à ne pas passer sous silence** : contrairement à un `mailto:`, les données du formulaire transitent désormais par un **service tiers** (Formspree, hébergé hors UE selon leur politique) et y sont stockées. La mention de consentement doit donc être plus précise qu'un simple « aucune donnée n'est conservée » : indiquer explicitement que les informations sont transmises à Formspree pour traiter la demande, et lier vers leur politique de confidentialité si disponible. Toujours **aucune persistance côté site lui-même** (toujours pas de back-end, pas de DB, pas de `localStorage`) — la contrainte « pas de back-end » du projet reste respectée puisque Formspree agit comme un service externe, pas comme un back-end qu'on héberge.

## Technical Context

### Fichiers à référencer (lecture seule — patterns à répliquer)

- `components/sections/hero-itinerary.tsx` — pattern de section RSC déjà en place (structure `<section aria-labelledby>`, CTA appel + WhatsApp, micro-réassurance) : répliquer cette forme pour LP-08 → LP-13.
- `components/layout/footer.tsx` — autre exemple de bloc coordonnées (ville, horaires, paiement, langue) lisant `BUSINESS` : base pour le bloc coordonnées de LP-14.
- `ai_docs/patterns.md` §6 (Server Component de section) et §7 (formulaire `react-hook-form` + Zod) — formes canoniques.
- `lib/constants.ts` — `BUSINESS`, `AIRPORT_FARES`, `REVIEWS`, `telHref`, `waHref` (tous déjà construits, LP-02).
- `schemas/itinerary.ts` — exemple de schéma Zod déjà en place dans le projet, à prendre comme référence de style pour `schemas/contact.ts`.

### Fichiers à créer

- `components/sections/airport-pricing.tsx` (LP-08)
- `components/sections/direct-booking.tsx` (LP-09)
- `components/sections/services.tsx` (LP-10)
- `components/sections/zones.tsx` (LP-11)
- `components/sections/about.tsx` (LP-12)
- `components/sections/reviews.tsx` (LP-13)
- `components/sections/contact.tsx` (LP-14, `"use client"`)
- `schemas/contact.ts` (LP-14) — schéma Zod du formulaire de contact

### Fichiers à modifier

- `app/page.tsx` — insérer les 7 sections après `<HeroItinerary />`, dans l'ordre : `AirportPricing` → `DirectBooking` → `Services` → `Zones` → `About` → `Reviews` → `Contact`.
- `package.json` — ajouter `react-hook-form` et `@hookform/resolvers` (absents actuellement, nécessaires pour LP-14 uniquement).
- `.env.local.example` et `README.md` — documenter `NEXT_PUBLIC_FORMSPREE_FORM_ID` (variable publique, à l'image de `NEXT_PUBLIC_MAPTILER_KEY`).

### Patterns existants à suivre

- RSC par défaut ; `"use client"` uniquement sur `contact.tsx` (formulaire interactif).
- CTA : toujours `telHref(BUSINESS.phone)` / `waHref(BUSINESS.whatsapp)`, jamais de lien construit à la main.
- Une section = un fichier, un seul `<h2>` par section, jamais de second `<h1>`.
- Aucune valeur fictive codée en dur — tout vient de `lib/constants.ts`.
- `react-hook-form` + `zodResolver` pour le formulaire (§7 de `ai_docs/patterns.md`) ; validation Zod, jamais de validation « à la main ».

## Implementation Details

### Contrats d'API / Route Handlers

Aucun Route Handler interne. Un seul appel réseau : `POST https://formspree.io/f/${NEXT_PUBLIC_FORMSPREE_FORM_ID}` (client → Formspree directement, `Accept: application/json`) via l'instance `ky` dédiée — pas de clé secrète, donc pas de proxy serveur nécessaire (cf. § Sécurité & clés API).

### Schémas & données

`schemas/contact.ts` :

```ts
import { z } from "zod";

export const contactSchema = z.object({
  nom: z.string().trim().min(2, "Votre nom est requis."),
  telephone: z.string().trim().min(6, "Un numéro de téléphone est requis."),
  email: z.string().trim().email("Adresse email invalide."),
  date: z.string().trim().optional(),
  heure: z.string().trim().optional(),
  depart: z.string().trim().optional(),
  destination: z.string().trim().optional(),
  message: z.string().trim().optional(),
  consentement: z.literal(true, {
    errorMap: () => ({ message: "Le consentement est requis pour envoyer votre demande." }),
  }),
});

export type ContactFormValues = z.infer<typeof contactSchema>;
```

Aucune nouvelle donnée business à ajouter à `lib/constants.ts` (tout ce qu'il faut — `BUSINESS`, `AIRPORT_FARES`, `REVIEWS` — existe déjà depuis LP-02).

### Logique métier

Aucune logique de pricing/override/géocodage concernée par ces 7 tickets (déjà couverte par LP-05/LP-06/LP-07). La soumission Formspree passe par un hook `useMutation` (TanStack Query), pas par une fonction `lib/` pure — c'est un simple appel réseau, pas une règle métier à isoler.

### Sécurité & clés API

`NEXT_PUBLIC_FORMSPREE_FORM_ID` : publique par nature (endpoint Formspree conçu pour un appel direct depuis le navigateur), donc **client autorisé**, contrairement à `ORS_API_KEY`. Ne pas la confondre avec un secret : elle n'a pas besoin de passer par un Route Handler. RGPD (LP-14) : le formulaire ne doit **jamais** écrire les valeurs saisies dans `localStorage`/`sessionStorage` ; les données transitent uniquement vers Formspree (service tiers explicitement choisi par l'utilisateur, cf. décision ci-dessus) — la mention de consentement doit le préciser.

## Validation Criteria

### Exigences fonctionnelles (reprises de `docs/BACKLOG.md`)

- [ ] LP-08 : tableau Orly 50 € / CDG 65 € / Beauvais 120 € (lu depuis `AIRPORT_FARES`) + mention « départ Paris & proche banlieue » + CTA
- [ ] LP-09 : 5 avantages + CTA appel
- [ ] LP-10 : grille de services par segment + CTA
- [ ] LP-11 : base L'Haÿ-les-Roses (94), IDF + province, liste des gares, wording SEO local + CTA
- [ ] LP-12 : 4 ans d'expérience, Kia Niro hybride gris foncé, paiement espèces, langue français + CTA
- [ ] LP-13 : avis fictifs balisés depuis `REVIEWS`, emplacement (non cliquable) prévu pour lien Google + CTA
- [ ] LP-14 : téléphone (prioritaire) + WhatsApp + email + horaires 24/7 ; formulaire validé par Zod ; case de consentement RGPD obligatoire (mentionnant explicitement la transmission à Formspree) ; aucune persistance de PII côté site ; cible du formulaire documentée (Formspree, `NEXT_PUBLIC_FORMSPREE_FORM_ID`)

### Exigences techniques (communes)

- [ ] `npm run lint` et `npm run build` passent sans erreur
- [ ] Un seul `<h1>` sur la page entière (celui du hero) — les 7 sections n'utilisent que `<h2>`
- [ ] CTA présents et fonctionnels sur les 7 sections (`tel:` prioritaire, `wa.me` quand prévu par `wording.md`)
- [ ] Placeholders lus depuis `lib/constants.ts` — aucune valeur fictive codée en dur
- [ ] RSC par défaut ; `"use client"` uniquement sur `contact.tsx`
- [ ] Formulaire de contact validé par Zod (`schemas/contact.ts`) via `zodResolver`, jamais de validation manuelle
- [ ] Aucune écriture dans `localStorage`/`sessionStorage` pour le formulaire
- [ ] Accessibilité : cibles tactiles ≥ 44px, contrastes AA, labels associés à chaque champ du formulaire, message d'erreur relié par `aria-describedby`

### Étapes de test

1. `npm run lint` et `npm run build` (type-check inclus).
2. `npm test` — tests unitaires du schéma `contactSchema` (valide/invalide : email malformé, consentement absent, champs optionnels omis) ; appel Formspree **mocké** (`vi.mock("ky")`, jamais d'appel réseau réel en test — cf. `ai_docs/testing.md`) pour vérifier `isPending`/succès/erreur du hook.
3. Test manuel (`npm run dev`, `http://localhost:3000`) : parcourir la page dans l'ordre des 7 sections, vérifier CTA `tel:`/`wa.me` cliquables, un seul `<h1>` (DevTools), rendu mobile ≤ 380px, contrastes.
4. Test manuel du formulaire : tant que `NEXT_PUBLIC_FORMSPREE_FORM_ID` n'est pas une vraie valeur fournie par l'utilisateur, l'appel réel à Formspree échouera (comportement attendu, à documenter explicitement — ne jamais présumer un envoi réussi) ; vérifier que ce cas déclenche bien le message générique + repli CTA téléphone. Vérifier aussi le rejet Zod (email invalide, consentement non coché) sans navigation ni appel réseau.
5. Vérifier qu'aucune valeur saisie dans le formulaire n'apparaît dans `localStorage`/`sessionStorage` (DevTools → Application).

## Confirmation utilisateur

- ✅ **Cible du formulaire LP-14** : confirmé — **Formspree**. L'utilisateur devra créer le compte/formulaire et fournir `NEXT_PUBLIC_FORMSPREE_FORM_ID` avant que l'envoi réel fonctionne (placeholder documenté en attendant, cf. § Sécurité & clés API).
- ✅ **Lien avis Google (LP-13)** : confirmé — texte non cliquable, pas de lien factice.

Points restants, à valider avant ou pendant l'exécution de `/epct LP-14` / `/epct LP-12` (non bloquants pour lancer les autres tickets LP-08/09/10/11/13) :

1. **Champs du formulaire** : date/heure en deux champs séparés (`date` + `heure`) plutôt qu'un seul `datetime-local` — proposition par défaut, à ajuster si préférence contraire.
2. **Photo véhicule (LP-12)** : par défaut, aucune image n'est ajoutée tant qu'un vrai asset n'est pas fourni (pas de chemin halluciné) — à confirmer ou à fournir la photo avant l'implémentation de LP-12.

Ce PRP fait foi pour l'exécution via `/epct LP-08`, `/epct LP-09`, … `/epct LP-14` (un ticket à la fois, dans l'ordre, chacun se référant à ce document).
