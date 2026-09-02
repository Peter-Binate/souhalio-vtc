# Configuration de `.env.local`

Tuto pour obtenir les vraies clés API MapTiler et OpenRouteService et remplir `.env.local`.

## 1. MapTiler → `NEXT_PUBLIC_MAPTILER_KEY`

Cette clé sert au fond de carte MapLibre **et** au géocodage/autocomplétion. Elle est publique (visible côté client) mais restreinte par domaine.

1. Va sur **https://www.maptiler.com/cloud/** et crée un compte (le plan gratuit suffit largement pour du dev + un petit trafic — 100k requêtes/mois).
2. Une fois connecté, va dans **Account → Keys** (ou directement `https://cloud.maptiler.com/account/keys/`).
3. Une clé par défaut est créée automatiquement (souvent nommée `Default key`). Tu peux la réutiliser ou en créer une dédiée au projet.
4. **Restreindre par domaine** (important) :
   - Clique sur la clé → onglet **"Allowed URLs"** / **"Allowed origins"**.
   - Ajoute :
     - `http://localhost:3000` (dev)
     - `https://ton-domaine-de-prod.example` (une fois le domaine choisi)
   - Sans restriction, n'importe qui pourrait réutiliser ta clé sur son propre site.
5. Copie la clé (une chaîne du type `AbCdEfGh12345...`) et colle-la dans `.env.local` :
   ```
   NEXT_PUBLIC_MAPTILER_KEY=AbCdEfGh12345...
   ```

## 2. OpenRouteService → `ORS_API_KEY`

Cette clé calcule l'itinéraire (distance, durée, tracé). Elle doit rester **strictement serveur** (utilisée uniquement dans `app/api/route/route.ts`, jamais côté client).

1. Va sur **https://openrouteservice.org/dev/#/signup** et crée un compte (gratuit).
2. Confirme ton email si demandé.
3. Une fois connecté, va sur ton **Dashboard** : `https://openrouteservice.org/dev/#/home`.
4. Clique sur **"Request a token"** (ou dans la section **API Keys**).
5. Choisis le type de token **"Standard"** (gratuit, quota "Free" — largement suffisant pour dev/petit trafic : 2000 req/jour, 40 req/min à l'écriture de ce tuto, à revérifier sur leur dashboard).
6. Donne-lui un nom (ex. `soualiho-vtc-dev`), valide.
7. Copie la clé générée (une longue chaîne du type `5b3ce3597851110001cf6248...`) et colle-la dans `.env.local` :
   ```
   ORS_API_KEY=5b3ce3597851110001cf6248...
   ```
   ⚠️ Pas de préfixe `NEXT_PUBLIC_`, pas de guillemets autour de la valeur dans `.env.local`.

## 3. Résultat attendu dans `.env.local`

```bash
NEXT_PUBLIC_MAPTILER_KEY=ta_vraie_cle_maptiler
ORS_API_KEY=ta_vraie_cle_ors
NEXT_PUBLIC_FORMSPREE_FORM_ID=your_formspree_form_id   # optionnel pour l'instant (LP-14)
NEXT_PUBLIC_SITE_URL=https://your-domain.example        # optionnel pour l'instant
```

Tu peux laisser Formspree et l'URL du site en placeholder pour tester juste le simulateur d'itinéraire.

## 4. Vérifier que ça fonctionne

```bash
npm run dev
```

Puis ouvre `http://localhost:3000` :

- **Carte visible** (tuiles MapTiler qui se chargent) → la clé MapTiler est valide.
- **Autocomplétion d'adresse** qui renvoie des suggestions → géocodage MapTiler OK.
- **Calcul d'un itinéraire** (départ + destination) qui affiche un tracé + distance/durée → `/api/route` a bien parlé à ORS.

Test direct du Route Handler (sans passer par l'UI) :

```bash
curl -X POST http://localhost:3000/api/route \
  -H "Content-Type: application/json" \
  -d '{"from":[2.3522,48.8566],"to":[2.5479,49.0097]}'
```

→ doit renvoyer un JSON `{ geometry, distanceKm, durationMin }`. Une erreur 502 signifie que `ORS_API_KEY` est absente/invalide dans `.env.local` (relance `npm run dev` après toute modif de `.env.local`, Next.js ne recharge pas les env vars à chaud).

## 5. Rappels sécurité

- Ouvre les **DevTools → Network** sur `http://localhost:3000`, filtre les requêtes : tu dois voir `api.maptiler.com` (clé publique visible, normal) mais **jamais** de requête directe vers `api.openrouteservice.org` — seulement des appels à `/api/route` en interne. Si tu vois `ORS_API_KEY` dans le bundle JS (View Source / Sources), c'est une fuite à corriger immédiatement.
- Ne commite jamais `.env.local` (déjà protégé par `.gitignore`).
- En prod (Vercel), configure les deux variables dans **Project Settings → Environment Variables** — ne les mets jamais en dur dans le code.
