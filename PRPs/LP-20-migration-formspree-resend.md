# [LP-20] Migration Formspree → Resend — PRP

## Goal

Remplacer l'envoi du formulaire de contact (LP-14), aujourd'hui posté directement du navigateur vers Formspree, par un envoi d'email via **Resend**, déclenché par un nouveau **Route Handler interne** `POST /api/contact` qui garde `RESEND_API_KEY` côté serveur.

## Why

Formspree fonctionnait avec un identifiant de formulaire public (`NEXT_PUBLIC_FORMSPREE_FORM_ID`, pas un secret) posté directement depuis le client — ce qui explique pourquoi LP-14 n'avait pas eu besoin de Route Handler à l'époque (justification documentée dans `PRPs/LP-08-LP-14-sections-contenu.md`). Cette justification tombe avec Resend : sa clé API est un **secret** (`RESEND_API_KEY`), donc — exactement comme pour ORS (ADR-0001) — l'appel doit obligatoirement transiter par un Route Handler côté serveur.

Le formulaire de contact est le levier de conversion secondaire du site (après l'appel `tel:`, cf. `CLAUDE.md`) : toute demande de devis manquée à cause d'un fournisseur d'email en échec est un client perdu. Resend est retenu ici comme remplacement direct de Formspree pour la notification email au chauffeur — sans changement du parcours visiteur (mêmes champs, même UX de succès/erreur).

## What

### Inclus

- Un nouveau Route Handler `app/api/contact/route.ts` qui reçoit les valeurs du formulaire, les valide avec `contactSchema` (déjà existant), et déclenche l'envoi d'un email de **notification** au chauffeur via Resend.
- `lib/resend.ts` — client Resend serveur uniquement (pattern `lib/ors.ts`), lit `RESEND_API_KEY`, construit le corps d'email en texte brut et l'envoie à l'adresse de contact du chauffeur (`BUSINESS.email`, `lib/constants.ts`).
- `lib/contact.ts` modifié pour poster vers `internalApi` (`/api/contact`, chemin relatif) au lieu de `formspreeApi`/l'URL Formspree absolue.
- `lib/ky.ts` : suppression de l'instance `formspreeApi`, devenue inutile.
- `components/sections/contact.tsx` : mise à jour de la mention RGPD (retrait de la mention explicite « Formspree », remplacée par une formulation neutre décrivant le traitement — cf. § Sécurité & RGPD).
- Nouvelle variable d'env serveur `RESEND_API_KEY` (secrète), documentée dans `.env.local.example`, `README.md`, `SETUP-ENV.md`.
- Tests : `app/api/contact/route.test.ts` (200/400/502, Resend mocké, calqué sur `app/api/route/route.test.ts`) ; mise à jour de `lib/contact.test.ts` (mock `internalApi` au lieu de `formspreeApi`).
- Dépendance ajoutée : `resend` (pnpm).
- Documentation : ticket `LP-20` dans `docs/BACKLOG.md` (ce ticket), `docs/adr/0003-proxy-resend-route-handler.md` (décision), mise à jour de `ai_docs/architecture.md` / `ai_docs/index.md` / `ai_docs/patterns.md` pour mentionner le proxy contact au même titre que le proxy ORS.

### Exclus (hors périmètre de ce ticket, cf. `CLAUDE.md` § À NE PAS faire)

- Email de confirmation automatique envoyé au visiteur (notification unique au chauffeur seulement — décision confirmée avec l'utilisateur).
- Template HTML stylé (`@react-email/components`) — le corps d'email reste en texte brut, généré directement dans `lib/resend.ts`, sans nouvelle dépendance de templating (décision confirmée avec l'utilisateur).
- Toute persistance des données du formulaire (pas de base de données — contrainte du projet inchangée).
- Changement du domaine d'expédition Resend au-delà de ce qui est strictement nécessaire pour livrer (le sandbox Resend / domaine par défaut suffit tant que le domaine de production n'est pas vérifié — cf. § Sécurité & clés API).
- Retouche visuelle du formulaire au-delà de la mention RGPD (champs, mise en page, validation Zod inchangés).

### Critères d'acceptation

- [ ] Soumettre le formulaire avec des données valides envoie un email à `BUSINESS.email` via Resend, contenant tous les champs saisis (nom, téléphone, email, date, heure, départ, destination, message).
- [ ] `RESEND_API_KEY` n'est utilisée que côté serveur (`lib/resend.ts`, importé uniquement par `app/api/contact/route.ts`) — absente du bundle client.
- [ ] Entrée invalide côté Route Handler → `400` avec message générique ; échec Resend → `502` avec message générique (jamais l'erreur brute exposée), exactement comme `/api/route`.
- [ ] Le comportement UI existant (succès → message + reset du formulaire ; erreur → repli sur CTA téléphone) est inchangé — seul le mécanisme sous-jacent change.
- [ ] La mention RGPD ne nomme plus « Formspree » et reste conforme (pas de persistance de PII, mention du traitement).
- [ ] Aucune trace de Formspree dans le code (`formspreeApi`, `NEXT_PUBLIC_FORMSPREE_FORM_ID`) une fois la migration terminée.

## Technical Context

### Fichiers à référencer (lecture seule — patterns à répliquer)

- `app/api/route/route.ts` — **pattern exact à suivre** pour `app/api/contact/route.ts` : parse JSON défensif (400 si invalide) → `schema.safeParse` (400 si échec) → appel service externe dans un try/catch dédié → 502 générique si échec, jamais l'erreur brute.
- `app/api/route/route.test.ts` — pattern de test à répliquer (200 succès, 400×3 cas, 502 avec vérification que le message d'erreur original n'est jamais exposé au client).
- `lib/ors.ts` — pattern de client serveur pour un service externe secret : commentaire d'en-tête explicite (« SERVEUR uniquement — n'importer que dans un Route Handler »), lecture de la clé via `process.env.X!`, fonction pure qui retourne un contrat typé.
- `lib/contact.ts` (existant) — fonction `submitContactForm` à modifier : remplace l'appel `formspreeApi.post(url absolue, ...)` par `internalApi.post("api/contact", { json: values })`.
- `lib/ky.ts` (existant) — deux instances : `internalApi` (Route Handlers internes, chemins relatifs, `retry: 0`) à réutiliser, `formspreeApi` à supprimer.
- `lib/use-contact-form.ts` (existant) — hook TanStack Query `useMutation`, **ne change pas** (découplé de l'implémentation réseau via `submitContactForm`).
- `schemas/contact.ts` (existant) — `contactSchema` **ne change pas**, réutilisé tel quel côté serveur dans le Route Handler.
- `components/sections/contact.tsx` (existant) — seule la mention RGPD (lignes 232-237) est à modifier ; le reste (champs, gestion `isPending`/`isSuccess`/`isError`) reste identique.
- `docs/adr/0001 proxy openrouteservice route handler.md` — modèle direct pour le nouvel ADR-0003 (même raisonnement : clé secrète → Route Handler obligatoire, malgré la contrainte « pas de back-end dédié »).
- `ai_docs/patterns.md` §5 — snippet générique de Route Handler proxy sécurisé, à suivre pour `/api/contact`.

### Fichiers à créer/modifier

- **Créer** `lib/resend.ts` — client Resend serveur, fonction `sendContactNotification(values: ContactFormValues): Promise<void>`.
- **Créer** `app/api/contact/route.ts` — `POST` handler.
- **Créer** `app/api/contact/route.test.ts` — tests 200/400/502.
- **Créer** `docs/adr/0003-proxy-resend-route-handler.md`.
- **Modifier** `lib/contact.ts` — poster vers `internalApi`/`api/contact`.
- **Modifier** `lib/contact.test.ts` — mocker `internalApi` au lieu de `formspreeApi` ; retirer la dépendance à `NEXT_PUBLIC_FORMSPREE_FORM_ID`.
- **Modifier** `lib/ky.ts` — retirer `formspreeApi`.
- **Modifier** `components/sections/contact.tsx` — texte RGPD.
- **Modifier** `.env.local.example` — retirer `NEXT_PUBLIC_FORMSPREE_FORM_ID`, ajouter `RESEND_API_KEY` (section « Serveur uniquement », avec commentaire de mise en garde comme pour `ORS_API_KEY`).
- **Modifier** `README.md` — remplacer le prérequis « compte Formspree » par « compte Resend » et mettre à jour le tableau des variables d'env.
- **Modifier** `SETUP-ENV.md` — ajouter une section tuto Resend (création clé API, vérification domaine ou usage du domaine sandbox) au même niveau de détail que MapTiler/ORS.
- **Modifier** `package.json` — ajouter la dépendance `resend`.
- **Modifier** `docs/BACKLOG.md` — ajouter le ticket LP-20 (ce ticket) en Phase 8, cocher `[x]` une fois livré.
- **Modifier** `ai_docs/architecture.md`, `ai_docs/index.md`, `ai_docs/patterns.md` — ajouter le proxy `/api/contact` aux côtés du proxy `/api/route` comme second exemple du pattern « Route Handler proxy sécurisé ».
- **Modifier** `CHANGELOG.md` — entrée décrivant la migration.

### Patterns existants à suivre

- **Route Handler proxy sécurisé** (`ai_docs/patterns.md` §5, illustré par `app/api/route/route.ts`) : parse JSON → validation Zod entrée → try/catch service externe → validation/formatage sortie → jamais l'erreur brute au client.
- **Validation Zod aux frontières** (`CLAUDE.md`, `ai_docs/patterns.md` §2) : `contactSchema.safeParse(body)` côté serveur, même schéma que côté client (réutilisation directe de `schemas/contact.ts`, pas de duplication).
- **`ky` uniquement, jamais `fetch`/`axios`** : `lib/resend.ts` peut soit utiliser le SDK officiel `resend` (recommandé — cf. § Implementation Details) soit `ky` si un appel HTTP brut à l'API Resend est préféré ; dans les deux cas, aucun appel réseau via `fetch`/`axios`.
- **Logique métier dans `lib/`, pas dans le JSX** : la construction du corps d'email vit dans `lib/resend.ts`, pas dans `contact.tsx` ni dans le Route Handler.
- **Séparation client/serveur des clés** (`CLAUDE.md` § Règle critique) : `RESEND_API_KEY` jamais préfixée `NEXT_PUBLIC_`, jamais importée dans un fichier `"use client"`.
- **Placeholders depuis `lib/constants.ts`** : l'adresse destinataire de la notification est `BUSINESS.email` (déjà défini dans `lib/constants.ts`), pas une valeur codée en dur dans `lib/resend.ts`.

## Implementation Details

### Contrats d'API / Route Handlers

**`POST /api/contact`**

- **Request body** (JSON) — identique à `ContactFormValues` (`schemas/contact.ts`) :
  ```ts
  {
    nom: string;
    telephone: string;
    email: string;
    date?: string;
    heure?: string;
    depart?: string;
    destination?: string;
    message?: string;
    consentement: boolean; // doit être true (contrainte déjà dans contactSchema)
  }
  ```
- **Réponse succès** — `200`, body minimal `{ ok: true }` (le client n'a besoin que du statut, cf. `submitContactForm` qui retourne `Promise<void>`).
- **Réponse erreur validation** — `400`, `{ error: "Formulaire invalide." }` (JSON invalide ou échec `contactSchema.safeParse`).
- **Réponse erreur envoi** — `502`, `{ error: "Envoi du formulaire indisponible." }` si Resend échoue (jamais l'erreur SDK brute, jamais la clé API en clair dans un message).

Squelette (à adapter, calqué sur `app/api/route/route.ts`) :

```ts
import { NextResponse } from "next/server";
import { sendContactNotification } from "@/lib/resend";
import { contactSchema } from "@/schemas/contact";

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Formulaire invalide." }, { status: 400 });
  }

  const parse = contactSchema.safeParse(body);
  if (!parse.success) {
    return NextResponse.json({ error: "Formulaire invalide." }, { status: 400 });
  }

  try {
    await sendContactNotification(parse.data);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: "Envoi du formulaire indisponible." },
      { status: 502 },
    );
  }
}
```

**`lib/resend.ts`** — squelette (SDK officiel `resend`, cf. doc officielle pour l'API exacte) :

```ts
// SERVEUR uniquement — n'importer que dans un Route Handler (jamais depuis un composant).
import { Resend } from "resend";
import { BUSINESS } from "@/lib/constants";
import type { ContactFormValues } from "@/schemas/contact";

const resend = new Resend(process.env.RESEND_API_KEY!);

function formatBody(values: ContactFormValues): string {
  const lines = [
    `Nom : ${values.nom}`,
    `Téléphone : ${values.telephone}`,
    `Email : ${values.email}`,
    values.date && `Date souhaitée : ${values.date}`,
    values.heure && `Heure souhaitée : ${values.heure}`,
    values.depart && `Départ : ${values.depart}`,
    values.destination && `Destination : ${values.destination}`,
    values.message && `Message : ${values.message}`,
  ].filter(Boolean);
  return lines.join("\n");
}

export async function sendContactNotification(values: ContactFormValues): Promise<void> {
  const { error } = await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL!,
    to: BUSINESS.email,
    replyTo: values.email,
    subject: `Nouvelle demande de devis — ${values.nom}`,
    text: formatBody(values),
  });
  if (error) throw new Error(error.message);
}
```

> ⚠️ **À valider en implémentation** : l'adresse `from` d'un envoi Resend doit appartenir à un domaine vérifié dans le dashboard Resend (ou utiliser le domaine sandbox `onboarding@resend.dev`, limité aux tests). Le PRP introduit donc une nouvelle variable `RESEND_FROM_EMAIL` (serveur, non secrète en soi mais liée à la config Resend) — à documenter dans `.env.local.example` avec un placeholder explicite (`onboarding@resend.dev` en dev, domaine vérifié en prod).

### Schémas & données

- Aucun nouveau schéma Zod : `contactSchema` (`schemas/contact.ts`) est réutilisé tel quel côté serveur — c'est la même frontière de validation qu'attendu par `CLAUDE.md` (« Zod pour toute validation… entrées de formulaire »), simplement appliquée maintenant aussi côté Route Handler (défense en profondeur, le client peut être contourné).
- `BUSINESS.email` (`lib/constants.ts`) reste la source unique de vérité pour l'adresse destinataire — ne pas dupliquer dans `lib/resend.ts`.

### Logique métier

- Pas de logique métier complexe ici (pas de pricing, pas de matching) : la seule règle est la mise en forme du corps d'email (`formatBody`), à tester en TDD dans `lib/resend.test.ts` — cas limites : champs optionnels absents (ne doivent pas apparaître comme `undefined` dans le texte), tous champs renseignés.
- Le `replyTo` sur l'email du visiteur (`values.email`) permet au chauffeur de répondre directement depuis son client mail sans changement d'outil — comportement à confirmer utile mais non bloquant pour la livraison.

### Sécurité & clés API

- `RESEND_API_KEY` : **serveur uniquement**, jamais `NEXT_PUBLIC_`, importée exclusivement dans `lib/resend.ts` — même règle que `ORS_API_KEY` (`CLAUDE.md` § Règle critique, ADR-0001).
- Le Route Handler ne doit **jamais** renvoyer le message d'erreur brut du SDK Resend au client (peut contenir des détails internes) — toujours un message générique 502, à tester explicitement (comme le test existant `app/api/route/route.test.ts` qui vérifie `expect(JSON.stringify(json)).not.toMatch(/quota|abc123/)`).
- RGPD : le formulaire ne persiste toujours aucune donnée (pas de DB) ; les données transitent uniquement par le Route Handler vers Resend pour l'envoi de l'email, puis ne sont conservées que dans la boîte mail du chauffeur (hors périmètre applicatif). La mention de consentement dans `contact.tsx` doit refléter ce nouveau circuit sans nommer un outil tiers spécifique par sa marque, par exemple :
  > « J'accepte que les informations de ce formulaire soient utilisées uniquement pour traiter ma demande de réservation (envoi d'un email à votre chauffeur). Aucune donnée n'est conservée par ce site. »

## Validation Criteria

### Exigences fonctionnelles

- [ ] Soumission valide du formulaire → email reçu par `BUSINESS.email` via Resend, avec tous les champs renseignés lisibles dans le corps.
- [ ] Champs optionnels vides (date/heure/départ/destination/message) → n'apparaissent pas comme `undefined`/`null` dans l'email.
- [ ] Échec Resend (clé invalide, quota, timeout) → l'UI affiche le repli CTA téléphone existant (`isError` dans `contact.tsx`), sans changement de comportement visible par rapport à l'ancien Formspree.
- [ ] Consentement non coché → toujours bloqué côté client par `contactSchema` (comportement inchangé) et re-vérifié côté serveur par le Route Handler.

### Exigences techniques

- [ ] `npm run lint` et `npm run build` (type-check inclus) passent sans erreur.
- [ ] `RESEND_API_KEY` jamais exposée côté client ; aucun import de `lib/resend.ts` depuis un composant `"use client"`.
- [ ] Validation Zod aux frontières : `contactSchema.safeParse` dans le Route Handler, en plus du `zodResolver` client existant.
- [ ] Logique métier (`formatBody`) dans `lib/resend.ts`, testée ; rien de métier dans le JSX ni dans le Route Handler.
- [ ] `ky` utilisé pour l'appel client → serveur (`internalApi.post("api/contact", …)`) ; TanStack Query (`useContactForm`) inchangé.
- [ ] Aucune trace résiduelle de `formspreeApi` / `NEXT_PUBLIC_FORMSPREE_FORM_ID` dans le code, `.env.local.example`, `README.md`, `SETUP-ENV.md`.
- [ ] Accessibilité (cibles ≥ 44px, contrastes AA) inchangée sur `contact.tsx` (seul le texte RGPD change).
- [ ] CTA `tel:`/`wa.me` toujours fonctionnels dans le bloc erreur.
- [ ] Placeholders lus depuis `lib/constants.ts` (`BUSINESS.email`), aucune adresse codée en dur dans `lib/resend.ts`.
- [ ] Aucun secret commité (`RESEND_API_KEY` absent de `.env.local`, présent seulement en placeholder dans `.env.local.example`) ; appel Resend mocké dans tous les tests.
- [ ] `npm run test` vert, y compris les nouveaux tests `app/api/contact/route.test.ts` et `lib/resend.test.ts`, et `lib/contact.test.ts` mis à jour.

### Étapes de test

1. `npm run lint` puis `npm run build` — aucune erreur.
2. `npm run test` — suite complète verte, y compris :
   - `lib/resend.test.ts` (nouveau) : `formatBody` avec champs optionnels absents/présents ; `sendContactNotification` mocke le SDK Resend (succès, erreur → exception propagée).
   - `app/api/contact/route.test.ts` (nouveau) : 200 avec body valide ; 400 JSON invalide ; 400 `contactSchema` invalide (ex. `consentement: false`) ; 502 avec message générique quand `sendContactNotification` rejette, en vérifiant que le message d'erreur original n'est jamais exposé.
   - `lib/contact.test.ts` (mis à jour) : `submitContactForm` appelle `internalApi.post("api/contact", { json: values })`.
3. Test manuel du Route Handler en local avec une vraie clé Resend de test :
   ```bash
   curl -X POST http://localhost:3000/api/contact \
     -H "Content-Type: application/json" \
     -d '{"nom":"Jean Test","telephone":"0612345678","email":"jean@example.com","consentement":true}'
   ```
   Vérifier réception de l'email, puis un cas d'échec (clé invalide) → `502` avec message générique.
4. Parcours navigateur complet : remplir et soumettre le formulaire de contact sur la page → message de succès + reset ; couper temporairement `RESEND_API_KEY` (ou simuler un échec réseau) → vérifier l'affichage du repli CTA téléphone.
5. Vérifier dans les DevTools réseau/sources que `RESEND_API_KEY` n'apparaît nulle part dans le bundle client ni dans les requêtes réseau émises par le navigateur (seule la requête vers `/api/contact` doit être visible, chemin relatif, sans clé).
