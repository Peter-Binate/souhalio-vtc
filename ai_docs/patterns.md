# Patterns canoniques

Formes de référence à **répliquer** dans tout le codebase — ne pas réinventer une variante pour un problème déjà résolu ici. Les snippets détaillés propres à l'itinéraire vivent dans `itinerary-feature.md`, `openrouteservice.md` et `maplibre-maptiler.md` ; ce document couvre les patterns transverses.

## 1. Client HTTP (ky) — une seule façon de faire du réseau

```ts
// lib/ky.ts
import ky from "ky";

// API interne (Route Handlers), côté client — chemins relatifs
export const internalApi = ky.create({ timeout: 12_000, retry: 0 });
```

- Côté serveur (Route Handler → ORS), voir `lib/ors.ts` dans `openrouteservice.md`.
- ❌ Jamais de `fetch` brut ni `axios`.

## 2. Validation aux frontières (Zod) — ne jamais faire confiance à une I/O

```ts
// Toute réponse externe est parsée avant usage
const data = mySchema.parse(
  await internalApi.post("api/route", { json }).json(),
);
```

- Schémas dans `schemas/`. Valider **entrée ET sortie** d'un Route Handler, et **toute** réponse ORS/MapTiler.
- Formulaires : `react-hook-form` + `zodResolver` (voir §7).

## 3. Provider TanStack Query

```tsx
// lib/query-client.tsx
"use client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, type ReactNode } from "react";

export function Providers({ children }: { children: ReactNode }) {
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: { queries: { staleTime: 60_000, retry: 1 } },
      }),
  );
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}
```

```tsx
// app/layout.tsx — monter le provider une fois
import { Providers } from "@/lib/query-client";
// <body><Providers>{children}</Providers></body>
```

## 4. Data-fetching côté client

- **Action déclenchée** (calcul d'itinéraire au submit) → `useMutation` (voir `useRoute` dans `itinerary-feature.md`).
- **Lecture réactive** (autocomplétion selon la saisie) → `useQuery` avec `enabled`.

```ts
useQuery({
  queryKey: ["geocode", query],
  queryFn: () => geocode(query),
  enabled: query.trim().length >= 3,
});
```

- ❌ Jamais de `useEffect` de fetch manuel.

## 5. Route Handler (proxy sécurisé)

```ts
// app/api/<nom>/route.ts
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const parsed = schema.safeParse(await req.json());
  if (!parsed.success)
    return NextResponse.json({ error: "Entrée invalide." }, { status: 400 });
  try {
    const result = await callExternalService(parsed.data); // clé secrète lue ici, côté serveur
    return NextResponse.json(result);
  } catch {
    return NextResponse.json(
      { error: "Service indisponible." },
      { status: 502 },
    );
  }
}
```

- Clé secrète (`ORS_API_KEY`) lue **uniquement** dans ce fichier. Message d'erreur **générique**, jamais l'erreur brute du service externe.
- Second exemple : `app/api/contact/route.ts` + `lib/resend.ts` (LP-20) — même forme exacte, `RESEND_API_KEY` lue uniquement dans `lib/resend.ts`, réutilise `contactSchema` (`schemas/contact.ts`) déjà utilisé côté client.

## 6. Server Component de section (contenu statique)

```tsx
// components/sections/<section>.tsx  (pas de "use client")
import { BUSINESS, telHref } from "@/lib/constants";

export function AirportPricing() {
  return (
    <section aria-labelledby="tarifs-heading">
      <h2 id="tarifs-heading">Transferts aéroport à prix fixe</h2>
      {/* … contenu issu de wording.md … */}
      <a href={telHref(BUSINESS.phone)}>Réserver par téléphone</a>
    </section>
  );
}
```

- Une section = un fichier. RSC par défaut. `"use client"` **seulement** si interactif.
- Chaque section se termine par un **CTA** (appel prioritaire).

## 7. Formulaire validé (react-hook-form + Zod)

```tsx
"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

const form = useForm({ resolver: zodResolver(contactSchema) });
// <button disabled={form.formState.isSubmitting}>…</button>
```

- Formulaire de contact : **RGPD** — pas de persistance de données personnelles, mention de consentement/traitement (cf. `LP-14`).

## 8. Placeholders & helpers CTA (source unique de vérité)

```ts
// lib/constants.ts (voir content-reference.md pour le contenu complet)
export const telHref = (raw: string) => `tel:${raw.replace(/[^\d+]/g, "")}`;
export const waHref = (raw: string) =>
  `https://wa.me/${raw.replace(/\D/g, "")}`;
```

- Toute valeur fictive (téléphone, email, adresse, avis) vient de `lib/constants.ts`. ❌ Jamais en dur dans un composant.

## 9. Carte MapLibre (client-only)

- Toujours via `dynamic(..., { ssr: false })` + import du CSS. Détail et composant complet : `maplibre-maptiler.md`.
- ⚠️ Ordre des coordonnées **`[lon, lat]`** partout (MapLibre **et** ORS).

## 10. shadcn/ui

- Ajouter les composants via `npx shadcn@latest add <composant>`. ❌ Ne pas réécrire `components/ui/*` à la main — composer par-dessus.

## Anti-patterns (rappel)

- ❌ Clé ORS côté client / appel ORS depuis un composant.
- ❌ `fetch`/`axios` au lieu de `ky` ; réponse externe non parsée par Zod.
- ❌ Logique métier dans le JSX (elle va dans `lib/`).
- ❌ MapLibre rendu en SSR.
- ❌ `localStorage`/`sessionStorage` pour de l'état applicatif.
- ❌ Valeurs fictives codées en dur.
