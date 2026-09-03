# Tutoriel Resend — configuration, test local et mise en production

Ce tutoriel explique comment configurer un compte **Resend**, le connecter au site, tester l'envoi d'email en local, puis passer en production. Il documente le circuit déjà implémenté (ticket `LP-20`, voir `PRPs/LP-20-migration-formspree-resend.md` et `docs/adr/0003-proxy-resend-route-handler.md`) : Resend envoie l'email de **notification au chauffeur** quand un visiteur soumet le formulaire de contact de la landing page.

> Rappel architecture (déjà en place, rien à coder) : le navigateur ne parle jamais à Resend directement. Il poste vers le Route Handler interne `POST /api/contact` (`app/api/contact/route.ts`), qui valide les données avec `contactSchema` puis appelle `sendContactNotification` (`lib/resend.ts`) côté serveur, où vit la clé secrète `RESEND_API_KEY`.

---

## Partie 1 — Configuration locale

### 1.1 Créer le compte Resend

1. Va sur **https://resend.com/signup** et crée un compte (gratuit — plan Free : 100 emails/jour, 3 000/mois, largement suffisant pour du dev et une landing page à faible volume).
2. Confirme ton adresse email si Resend te le demande.
3. Tu arrives sur le dashboard : **https://resend.com/overview**.

### 1.2 Générer une clé API

1. Dans le menu de gauche, va dans **API Keys** (`https://resend.com/api-keys`).
2. Clique sur **Create API Key**.
3. Donne-lui un nom explicite, par exemple `soualiho-vtc-dev`.
4. Permission : **Sending access** suffit (pas besoin de Full access pour ce projet — le site n'a besoin que d'envoyer des emails, jamais de lire/gérer des domaines par API).
5. Copie la clé générée immédiatement — elle a la forme `re_AbCdEfGh...` et **n'est affichée qu'une seule fois**. Si tu la perds, il faudra en régénérer une.

⚠️ Cette clé est un **secret**. Ne la commite jamais, ne la mets jamais dans un fichier préfixé `NEXT_PUBLIC_`, ne l'écris jamais dans un composant `"use client"`. C'est justement pour ça que le projet passe par `app/api/contact/route.ts` plutôt que d'appeler Resend depuis le navigateur (cf. `docs/adr/0003-proxy-resend-route-handler.md`).

### 1.3 Choisir une adresse d'expédition pour le dev

Resend exige que l'adresse `from` d'un envoi appartienne à un domaine **vérifié** dans ton compte. Tant que tu n'as pas encore vérifié de domaine (ce qui vient en Partie 2), utilise le domaine sandbox fourni par Resend :

```
RESEND_FROM_EMAIL=onboarding@resend.dev
```

Limite du sandbox : les emails envoyés depuis `onboarding@resend.dev` n'arrivent généralement que sur l'adresse email associée à ton compte Resend (celle utilisée à l'inscription) — ce qui est suffisant pour valider que le circuit fonctionne de bout en bout en local, mais pas pour un vrai test destinataire multiple.

### 1.4 Connecter la clé au site

Le projet lit déjà `RESEND_API_KEY` et `RESEND_FROM_EMAIL` dans `lib/resend.ts` — il n'y a **aucun code à écrire**, seulement le fichier d'environnement local à remplir.

1. Si ce n'est pas déjà fait : `cp .env.local.example .env.local`
2. Ouvre `.env.local` et renseigne :
   ```bash
   RESEND_API_KEY=re_ta_vraie_cle...
   RESEND_FROM_EMAIL=onboarding@resend.dev
   ```
3. Vérifie aussi que `BUSINESS.email` dans `lib/constants.ts` pointe vers une adresse que tu peux consulter (c'est l'adresse **destinataire** de la notification, pas l'adresse d'expédition) :
   ```ts
   // lib/constants.ts
   export const BUSINESS = {
     // ...
     email: "[EMAIL_ADDRESS]", // ← à remplacer par une vraie adresse pour tester
   };
   ```
   En dev avec le domaine sandbox Resend, l'email arrivera de toute façon sur l'adresse de ton compte Resend, indépendamment de ce que tu mets ici — mais autant renseigner une vraie adresse dès maintenant, ce sera nécessaire en production.

4. Relance le serveur de dev après toute modification de `.env.local` (Next.js ne recharge pas les variables d'environnement à chaud) :
   ```bash
   npm run dev
   ```

### 1.5 Tester l'envoi en local

**Option A — via l'interface (parcours réel)**

1. Ouvre `http://localhost:3000` et descends jusqu'à la section « Réservez votre trajet » (`components/sections/contact.tsx`).
2. Remplis le formulaire (nom, téléphone, email, consentement obligatoire) et soumets.
3. Résultat attendu : message de succès affiché, formulaire réinitialisé.
4. Va vérifier la réception dans la boîte mail associée à ton compte Resend (domaine sandbox), **ou** consulte l'onglet **Logs** du dashboard Resend (`https://resend.com/emails`) : chaque tentative d'envoi y apparaît avec son statut (`delivered`, `bounced`, etc.), même si l'email n'atterrit pas physiquement dans une boîte.

**Option B — via `curl` (contourne l'UI, teste directement le Route Handler)**

```bash
curl -i -X POST http://localhost:3000/api/contact \
  -H "Content-Type: application/json" \
  -d '{"nom":"Jean Test","telephone":"0612345678","email":"jean@example.com","consentement":true}'
```

- Succès attendu : `200` avec `{"ok":true}`.
- `400` : payload invalide (vérifie que `consentement` est bien `true` et que les champs obligatoires sont présents — schéma `schemas/contact.ts`).
- `502` : l'appel à Resend a échoué côté serveur (`{"error":"Envoi du formulaire indisponible."}`, message générique volontaire, jamais l'erreur brute — cf. `app/api/contact/route.ts`). Causes les plus fréquentes :
  - `RESEND_API_KEY` absente ou invalide dans `.env.local` (as-tu relancé `npm run dev` après l'avoir ajoutée ?).
  - `RESEND_FROM_EMAIL` pointant vers un domaine non vérifié (en dehors du sandbox `onboarding@resend.dev`).

**Option C — tests automatisés (déjà en place, à relancer si tu modifies le code)**

```bash
npm test              # inclut lib/resend.test.ts et app/api/contact/route.test.ts (Resend mocké)
npm run lint
npm run build
```

Ces tests ne font **aucun appel réseau réel** vers Resend (le SDK est mocké) — ils valident la mise en forme de l'email et la gestion des erreurs, pas la délivrabilité réelle. Seules les Options A et B ci-dessus testent un vrai envoi.

### 1.6 Vérifier qu'aucune clé ne fuit côté client

1. Ouvre les **DevTools → Network** sur `http://localhost:3000`, filtre les requêtes.
2. Soumets le formulaire : tu dois voir une seule requête vers `/api/contact` (chemin relatif, interne) — **jamais** de requête directe vers `api.resend.com` depuis le navigateur.
3. Dans **DevTools → Sources**, cherche `RESEND_API_KEY` ou la valeur de ta clé (`re_...`) dans le bundle JS chargé côté client : elle ne doit apparaître **nulle part**. Si c'est le cas, il y a une fuite à corriger immédiatement (import de `lib/resend.ts` depuis un fichier `"use client"`, par exemple).

---

## Partie 2 — Mise en production

En local, le domaine sandbox `onboarding@resend.dev` suffit. En production, il ne suffit **plus** : il est limité en volume, en délivrabilité, et n'inspire pas confiance aux clients qui reçoivent l'email (expéditeur `resend.dev` au lieu du nom de domaine du chauffeur). La Partie 2 couvre la vérification d'un domaine réel et le déploiement sur Vercel (plateforme cible du projet, cf. `README.md` § Déploiement).

### 2.1 Prérequis

- Un **nom de domaine** que tu contrôles (ex. `jhondoe-vtc.fr`), avec accès à la zone DNS (chez le registrar — OVH, Gandi, Cloudflare, etc.).
- Le projet déployé sur **Vercel** (ou en cours de déploiement) avec accès aux **Project Settings**.

### 2.2 Vérifier ton domaine dans Resend

1. Dashboard Resend → **Domains** (`https://resend.com/domains`) → **Add Domain**.
2. Renseigne ton domaine (ex. `jhondoe-vtc.fr`). Tu peux vérifier le domaine racine ou un sous-domaine dédié à l'envoi (ex. `mail.jhondoe-vtc.fr` — recommandé si le domaine principal sert aussi pour des emails classiques, pour isoler la réputation d'envoi).
3. Resend génère une liste d'enregistrements DNS à ajouter (généralement) :
   - Un enregistrement **MX** (pour la réception des bounces).
   - Un ou plusieurs enregistrements **TXT** pour **SPF** et **DKIM** (authentification de l'expéditeur).
   - Optionnellement un enregistrement pour **DMARC** (recommandé pour la délivrabilité, réduit le risque d'atterrir en spam).
4. Va chez ton registrar / gestionnaire DNS, et ajoute chaque enregistrement **exactement** comme indiqué par Resend (nom d'hôte, type, valeur, TTL).
5. Reviens sur le dashboard Resend, clique sur **Verify**. La propagation DNS peut prendre de quelques minutes à 24-48h selon le registrar — si la vérification échoue immédiatement, réessaie plus tard plutôt que de modifier les enregistrements en boucle.
6. Une fois le domaine marqué **Verified**, tu peux envoyer depuis n'importe quelle adresse `@ton-domaine.fr` (ex. `contact@jhondoe-vtc.fr`, `noreply@jhondoe-vtc.fr`).

### 2.3 Choisir l'adresse d'expédition de production

Mets à jour la variable pour pointer vers ton domaine vérifié, par exemple :

```
RESEND_FROM_EMAIL=contact@jhondoe-vtc.fr
```

Recommandation : n'utilise **pas** l'adresse personnelle du chauffeur comme expéditeur technique — préfère une adresse dédiée type `noreply@` ou `contact@`, et laisse le `replyTo` (déjà géré dans `lib/resend.ts`, réglé sur l'email du visiteur) permettre au chauffeur de répondre directement depuis son client mail.

### 2.4 Configurer les variables d'environnement sur Vercel

Le code ne change pas entre dev et prod — seules les valeurs d'environnement diffèrent. Sur Vercel :

1. Ouvre le projet sur **https://vercel.com** → **Settings → Environment Variables**.
2. Ajoute (ou vérifie la présence de) :

   | Variable | Environnement(s) | Valeur |
   |---|---|---|
   | `RESEND_API_KEY` | Production (+ Preview si tu veux tester avant merge) | Ta clé Resend — tu peux réutiliser la clé de dev, ou en créer une dédiée `soualiho-vtc-prod` dans **API Keys** pour séparer les logs/quotas dev vs prod (recommandé) |
   | `RESEND_FROM_EMAIL` | Production | `contact@ton-domaine-verifie.fr` |
   | `ORS_API_KEY` | Production | déjà documentée dans `README.md` — sans rapport avec Resend mais nécessaire au bon fonctionnement du site |
   | `NEXT_PUBLIC_MAPTILER_KEY` | Production | idem, penser à ajouter le domaine de prod dans les *Allowed origins* MapTiler |

   ⚠️ Ne mets jamais ces valeurs en dur dans le code ou dans un fichier commité — uniquement dans le dashboard Vercel (ou `.env.local`, gitignored, pour le dev).

3. Redéploie (un `git push` sur la branche liée au projet Vercel suffit à déclencher un nouveau build ; les variables d'environnement ne sont prises en compte qu'au build/déploiement suivant, pas à chaud sur un déploiement déjà en ligne).

### 2.5 Tester en production

1. Une fois le déploiement terminé, ouvre le site en prod et soumets le formulaire de contact avec une vraie adresse email de test.
2. Vérifie la réception dans la boîte `BUSINESS.email` (celle configurée dans `lib/constants.ts`).
3. Contrôle le dashboard Resend → **Logs** (`https://resend.com/emails`) pour confirmer le statut `delivered` (et repérer un éventuel `bounced`/`complained`).
4. Refais la même vérification réseau qu'en local (DevTools → Network/Sources) sur le domaine de prod : aucune clé ne doit fuiter côté client, seule la requête vers `/api/contact` (chemin relatif) doit apparaître.
5. Teste aussi le cas d'échec : temporairement, retire ou invalide `RESEND_API_KEY` sur un déploiement **Preview** (jamais sur Production) et vérifie que l'UI bascule bien sur le repli CTA téléphone (`isError` dans `components/sections/contact.tsx`) plutôt que d'afficher une erreur brute.

### 2.6 Suivi et bonnes pratiques après mise en ligne

- **Logs Resend** (`https://resend.com/emails`) : première source de vérité en cas de doute sur un envoi (« le client dit ne pas avoir reçu l'email »/« le chauffeur ne l'a pas reçu ») — bien plus fiable que d'essayer de reproduire en local.
- **DMARC** : si tu n'as pas encore ajouté d'enregistrement DMARC en 2.2, envisage de le faire une fois les envois stabilisés (améliore la délivrabilité et protège la réputation du domaine contre l'usurpation).
- **Rotation de clé** : si une clé API a pu fuiter (ex. commit accidentel), révoque-la immédiatement dans **API Keys** et régénères-en une nouvelle, à remettre à jour dans Vercel.
- **Quota** : le plan Free (100/jour, 3000/mois) suffit largement pour un formulaire de contact à faible volume. Si le trafic augmente, surveille l'onglet **Usage** du dashboard Resend et passe sur un plan payant avant d'atteindre la limite (au-delà, les envois échouent et déclenchent le repli 502 → CTA téléphone).

---

## Résumé express (checklist)

**Local**
- [ ] Compte Resend créé, clé API générée (`re_...`)
- [ ] `.env.local` : `RESEND_API_KEY` + `RESEND_FROM_EMAIL=onboarding@resend.dev`
- [ ] `npm run dev` relancé après modification de `.env.local`
- [ ] Formulaire testé via l'UI et/ou `curl` → `200 {"ok":true}`
- [ ] Vérification DevTools : aucune clé Resend visible côté client

**Production**
- [ ] Domaine vérifié dans Resend (SPF/DKIM/DMARC en DNS)
- [ ] `RESEND_FROM_EMAIL` mis à jour sur une adresse du domaine vérifié
- [ ] `RESEND_API_KEY` (idéalement dédiée prod) + `RESEND_FROM_EMAIL` ajoutées dans Vercel → Environment Variables
- [ ] Déploiement redéclenché, formulaire testé en prod
- [ ] Logs Resend consultés pour confirmer `delivered`

## Voir aussi

- `SETUP-ENV.md` — configuration de toutes les clés du projet (MapTiler, ORS, Resend), version condensée.
- `docs/adr/0003-proxy-resend-route-handler.md` — pourquoi le passage par un Route Handler est obligatoire.
- `PRPs/LP-20-migration-formspree-resend.md` — spec complète de la migration Formspree → Resend.
