# Configuration de `.env.local`

Tuto pour obtenir les vraies clés API MapTiler, OpenRouteService et Resend et remplir `.env.local`.

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

## 3. Resend → `RESEND_API_KEY` / `RESEND_FROM_EMAIL`

Ces variables envoient l'email de notification du formulaire de contact (LP-20). `RESEND_API_KEY` doit rester **strictement serveur** (utilisée uniquement dans `lib/resend.ts`, importé uniquement par `app/api/contact/route.ts`).

1. Va sur **https://resend.com/signup** et crée un compte (gratuit — 100 emails/jour, 3000/mois sur le plan gratuit).
2. Une fois connecté, va dans **API Keys** (`https://resend.com/api-keys`) → **Create API Key**.
3. Donne-lui un nom (ex. `soualiho-vtc-dev`), permission **Sending access** suffit. Copie la clé générée (une chaîne du type `re_AbCdEfGh...`, affichée une seule fois) et colle-la dans `.env.local` :
   ```
   RESEND_API_KEY=re_AbCdEfGh...
   ```
   ⚠️ Pas de préfixe `NEXT_PUBLIC_`, pas de guillemets autour de la valeur dans `.env.local`.
4. **Adresse d'expédition (`RESEND_FROM_EMAIL`)** : Resend exige que l'adresse `from` appartienne à un domaine vérifié (**Domains** → **Add Domain**, puis ajouter les enregistrements DNS fournis).
   - En dev/test, tant qu'aucun domaine n'est vérifié, utilise le domaine sandbox fourni par Resend : `RESEND_FROM_EMAIL=onboarding@resend.dev` (envoi limité, généralement seulement vers l'adresse email du compte Resend — suffisant pour tester le circuit).
   - En prod, remplace par une adresse de ton propre domaine vérifié (ex. `contact@ton-domaine.example`).

## 4. Résultat attendu dans `.env.local`

```bash
NEXT_PUBLIC_MAPTILER_KEY=ta_vraie_cle_maptiler
ORS_API_KEY=ta_vraie_cle_ors
RESEND_API_KEY=ta_vraie_cle_resend
RESEND_FROM_EMAIL=onboarding@resend.dev                  # ou ton adresse de domaine vérifié en prod
NEXT_PUBLIC_SITE_URL=https://your-domain.example        # optionnel pour l'instant
```

Tu peux laisser l'URL du site en placeholder pour tester juste le simulateur d'itinéraire ; Resend est nécessaire dès que tu veux tester l'envoi réel du formulaire de contact.

## 5. Vérifier que ça fonctionne

```bash
npm run dev
```

Puis ouvre `http://localhost:3000` :

- **Carte visible** (tuiles MapTiler qui se chargent) → la clé MapTiler est valide.
- **Autocomplétion d'adresse** qui renvoie des suggestions → géocodage MapTiler OK.
- **Calcul d'un itinéraire** (départ + destination) qui affiche un tracé + distance/durée → `/api/route` a bien parlé à ORS.
- **Envoi du formulaire de contact** (section « Réservez votre trajet ») → message de succès affiché → `/api/contact` a bien parlé à Resend (vérifie la réception de l'email dans la boîte `BUSINESS.email`, ou dans les **Logs** du dashboard Resend).

Test direct des Route Handlers (sans passer par l'UI) :

```bash
curl -X POST http://localhost:3000/api/route \
  -H "Content-Type: application/json" \
  -d '{"from":[2.3522,48.8566],"to":[2.5479,49.0097]}'
```

→ doit renvoyer un JSON `{ geometry, distanceKm, durationMin }`. Une erreur 502 signifie que `ORS_API_KEY` est absente/invalide dans `.env.local` (relance `npm run dev` après toute modif de `.env.local`, Next.js ne recharge pas les env vars à chaud).

```bash
curl -X POST http://localhost:3000/api/contact \
  -H "Content-Type: application/json" \
  -d '{"nom":"Jean Test","telephone":"0612345678","email":"jean@example.com","consentement":true}'
```

→ doit renvoyer `{ "ok": true }`. Une erreur 502 signifie que `RESEND_API_KEY`/`RESEND_FROM_EMAIL` est absente/invalide, ou que l'adresse `from` n'appartient pas à un domaine vérifié.

## 6. Rappels sécurité

- Ouvre les **DevTools → Network** sur `http://localhost:3000`, filtre les requêtes : tu dois voir `api.maptiler.com` (clé publique visible, normal) mais **jamais** de requête directe vers `api.openrouteservice.org` ou `api.resend.com` — seulement des appels à `/api/route`/`/api/contact` en interne. Si tu vois `ORS_API_KEY` ou `RESEND_API_KEY` dans le bundle JS (View Source / Sources), c'est une fuite à corriger immédiatement.
- Ne commite jamais `.env.local` (déjà protégé par `.gitignore`).
- En prod (Vercel), configure toutes les variables dans **Project Settings → Environment Variables** — ne les mets jamais en dur dans le code.
