# Architecture

## Vue d'ensemble

Application **Next.js (App Router)** sans back-end dédié. Le code serveur se limite à deux **Route Handlers** faisant office de **proxy** vers des services externes dont la clé est secrète : OpenRouteService (itinéraire) et Resend (envoi d'email du formulaire de contact, LP-20).

```
Navigateur (RSC + composants client)
  │
  ├─ MapTiler (clé publique)  ──►  tuiles carte (MapLibre) + géocodage / autocomplétion
  │
  ├─ /api/route (Route Handler Next.js, serveur)
  │      │  (clé ORS secrète)
  │      └─►  OpenRouteService  ──►  tracé + distance + durée
  │
  └─ /api/contact (Route Handler Next.js, serveur)
         │  (clé Resend secrète)
         └─►  Resend  ──►  email de notification au chauffeur
```

## Pourquoi un Route Handler malgré « pas de back-end »

- **MapTiler** délivre des clés **publiques** restreignables par domaine → sûres côté client.
- **OpenRouteService** et **Resend** ne proposent pas de clé publique restreignable par domaine → une clé exposée dans le bundle JS est immédiatement réutilisable par un tiers (vol de quota, envoi d'emails arbitraires au nom du site).
- Un **Route Handler** (`app/api/route/route.ts`, `app/api/contact/route.ts`) s'exécute côté serveur (serverless sur Vercel), garde la clé dans `process.env.ORS_API_KEY`/`process.env.RESEND_API_KEY`, et n'ajoute **aucune infrastructure à gérer** (pas de serveur, pas de DB). Voir `docs/adr/0001-…` (ORS) et `docs/adr/0003-…` (Resend).

> Variante assumée (déconseillée) : appeler ORS ou Resend directement depuis le client avec une clé `NEXT_PUBLIC_`. À n'utiliser que pour un POC jetable — risque de vol de quota / abus d'envoi d'emails.

## Flux du simulateur d'itinéraire

1. **Saisie + autocomplétion** (client) : les champs « Départ » / « Destination » interrogent le **géocodage MapTiler** (clé publique) et renvoient des coordonnées `[lon, lat]`.
2. **Soumission** (client) : `useMutation` (TanStack Query) envoie les 2 coordonnées à `/api/route` via **ky**.
3. **Proxy** (serveur) : le Route Handler valide l'entrée (Zod), appelle **ORS Directions** avec `ORS_API_KEY`, valide la réponse (Zod), renvoie `{ geometry, distanceKm, durationMin }`.
4. **Rendu** (client) : le tracé (GeoJSON `LineString`) est affiché sur **MapLibre** (`fitBounds`), et `lib/pricing.ts` calcule l'estimation de prix.
5. **Override aéroport** : si le départ **ou** l'arrivée correspond à Orly / CDG / Beauvais (et que la zone départ est Paris/proche banlieue), on affiche le **tarif fixe** au lieu de l'estimation calculée.

## Rendu serveur vs client

| Élément | Type |
|---|---|
| Sections statiques (tarifs, services, zones, about, avis, contact) | **Server Components** |
| Providers (TanStack Query) | Client, montés dans `app/layout.tsx` |
| Simulateur (form, carte, estimation) | **Client** (`"use client"`) |
| Carte MapLibre | Client + `next/dynamic({ ssr: false })` (voir `maplibre-maptiler.md`) |
| Route Handler `/api/route` | **Serveur** |
| Formulaire de contact (`contact.tsx`) | **Client** (`"use client"`) |
| Route Handler `/api/contact` | **Serveur** |

## Gestion des variables d'environnement

| Variable | Portée | Accès |
|---|---|---|
| `NEXT_PUBLIC_MAPTILER_KEY` | Client | Composants carte/géocodage |
| `ORS_API_KEY` | Serveur | `app/api/route/route.ts` uniquement |
| `RESEND_API_KEY` | Serveur | `lib/resend.ts`, importé uniquement par `app/api/contact/route.ts` |
| `RESEND_FROM_EMAIL` | Serveur | `lib/resend.ts` — adresse d'expédition (domaine vérifié) |

## Découpage des modules `lib/`

- `lib/constants.ts` — infos business + placeholders (téléphone, email, adresse, avis) + tarifs aéroport + grille tarifaire. **Source unique de vérité** pour les valeurs fictives.
- `lib/pricing.ts` — fonction pure `estimatePrice()` (grille + override aéroport). Testable isolément.
- `lib/ky.ts` — instance ky interne (`internalApi`, Route Handlers).
- `lib/ors.ts` — appel ORS côté serveur + parsing Zod.
- `lib/resend.ts` — appel Resend côté serveur (envoi email formulaire de contact, LP-20).
- `lib/contact.ts` — poste les valeurs du formulaire vers `/api/contact` (`internalApi`).
- `lib/query-client.tsx` — `QueryClientProvider`.

## Principes

- Valider **toutes** les frontières I/O avec Zod (formulaire, réponses ORS et MapTiler).
- Isoler la logique de prix (pure, sans I/O) de la logique réseau.
- Aucune donnée persistée : l'app est stateless côté serveur.
