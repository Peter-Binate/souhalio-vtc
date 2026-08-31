# Contenu de référence — sections & textes

Source de vérité pour le **contenu** de la landing page. Le fichier de copywriting détaillé (accroches, textes, CTA par section) est `wording.md`. Ce document résume la structure pour l'implémentation.

> ⚠️ Toutes les valeurs fictives (téléphone, WhatsApp, email, adresse, avis) sont des **placeholders** centralisés dans `lib/constants.ts`. Ne pas les coder en dur dans les composants JSX.

## Ordre des sections (`app/page.tsx`)

1. **Hero + simulateur d'itinéraire** — `components/sections/hero-itinerary.tsx` (contient le simulateur, feature centrale).
2. **Tarifs aéroports (prix fixes)** — `airport-pricing.tsx` — Orly 50 €, CDG 65 €, Beauvais 120 € (départ Paris & proche banlieue).
3. **Réserver en direct (engagements)** — `direct-booking.tsx` — tarif stable, interlocuteur unique, ponctualité, 24/7, véhicule dédié.
4. **Services** — `services.tsx` — réservation immédiate/anticipée, aéroports, gares, affaires, longue distance/province, 24/7.
5. **Zones & gares desservies** — `zones.tsx` — base L'Haÿ-les-Roses (94), toute l'Île-de-France, province ; gares : Paris, Massy-Palaiseau, Marne-la-Vallée Chessy, gare TGV Roissy-CDG.
6. **À propos + véhicule** — `about.tsx` — 4 ans d'expérience ; Kia Niro hybride gris foncé ; paiement espèces ; langue français.
7. **Avis clients** — `reviews.tsx` — ⚠️ avis **fictifs** (placeholders), à remplacer par de vrais avis Google.
8. **Contact / Réservation** — `contact.tsx` — téléphone (prioritaire), WhatsApp, email, formulaire, horaires 24/7.

Plus, dans `components/layout/` : `header`, `footer`, et **`sticky-call-button`** (bouton d'appel flottant mobile).

## Faits business (réels, non fictifs)

- Chauffeur VTC depuis **4 ans**, base **L'Haÿ-les-Roses (Val-de-Marne, 94)**.
- Disponibilité **24h/24, 7j/7, jours fériés**. Zone : **Île-de-France + province** (longue distance).
- Véhicule : **Kia Niro hybride gris foncé** (argument faibles émissions).
- **Paiement en espèces**. **Langue : français**.
- **Tarifs fixes aéroport** (départ Paris & proche banlieue) : Orly **50 €**, CDG **65 €**, Beauvais **120 €**.
- **Gares** : gares de Paris, Massy-Palaiseau, Marne-la-Vallée Chessy, gare TGV de l'aéroport Roissy-CDG.
- Réservation **en direct** (téléphone/WhatsApp) — pas d'outil de réservation en ligne.

## Placeholders (`lib/constants.ts`)

```ts
export const BUSINESS = {
  name: "Jhon Doe VTC",
  phone: "[NUMÉRO DE TÉLÉPHONE]", // format tel: à normaliser (+33…)
  whatsapp: "[NUMÉRO WHATSAPP]", // format wa.me (33XXXXXXXXX)
  email: "[ADRESSE EMAIL]",
  address: "[ADRESSE POSTALE COMPLÈTE]",
  city: "L'Haÿ-les-Roses",
  postalCode: "94240",
  hours: "24h/24, 7j/7, jours fériés",
  payment: "Espèces",
  language: "Français",
} as const;

// Avis FICTIFS — à remplacer par de vrais avis avant mise en ligne
export const REVIEWS = [
  {
    author: "Marc D. (avis fictif)",
    text: "Chauffeur ponctuel et très professionnel…",
  },
  {
    author: "Sophie L. (avis fictif)",
    text: "Réservation simple, véhicule propre et confortable…",
  },
  {
    author: "Karim B. (avis fictif)",
    text: "Appelé à 23h pour Roissy : réponse immédiate…",
  },
  {
    author: "Élodie M. (avis fictif)",
    text: "Ponctuel et rassurant, prix fixe aéroport très appréciable…",
  },
] as const;
```

## CTA (règles)

- Chaque section se termine par un CTA. **Appel prioritaire** partout.
- Appel : lien `tel:` construit depuis `BUSINESS.phone` normalisé.
- WhatsApp : `https://wa.me/<numéro>` depuis `BUSINESS.whatsapp`.
- Micro-réassurance sous les boutons du hero/contact : « Réponse rapide · Tarifs aéroport fixes · Chauffeur ponctuel ».

## SEO

- **Un seul `<h1>`** : titre du hero — « Votre chauffeur VTC en Île-de-France, 24h/24 et 7j/7 ».
- `<title>` : `Chauffeur VTC L'Haÿ-les-Roses & Île-de-France 24h/24 | Jhon Doe`
- Meta description : `Chauffeur privé VTC à L'Haÿ-les-Roses et en Île-de-France, 24h/24 et 7j/7. Transferts aéroport à prix fixe (Orly, CDG, Beauvais), gares, affaires, province. Réservez en direct.`
- Mots-clés : chauffeur privé VTC Île-de-France, VTC L'Haÿ-les-Roses, chauffeur VTC 24h/24 7j/7, transfert aéroport Orly/CDG/Beauvais prix fixe, transfert gare Massy-Palaiseau/Marne-la-Vallée, réservation VTC, VTC longue distance province, VTC hybride Île-de-France.
- **JSON-LD `LocalBusiness`** dans `app/layout.tsx` (metadata) : `name`, `telephone`, `address` (ville + CP), `areaServed` (Île-de-France + France), `openingHours` (24/7), tarifs aéroport en `makesOffer`.
- `alt` images véhicule : « Kia Niro hybride gris foncé chauffeur VTC Île-de-France ».

## À confirmer avec le client (ne pas inventer)

- Intitulé exact de la gare « Marne-la-Vallée Chessy ».
- Version précise de la Kia Niro (hybride simple / rechargeable) si un wording plus précis est voulu.
- Vraies coordonnées de contact et vrais avis (remplacent les placeholders).
- Vraie grille tarifaire kilométrique (remplace la grille fictive de `itinerary-feature.md`).
