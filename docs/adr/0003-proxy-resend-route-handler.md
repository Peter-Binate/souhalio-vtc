# ADR-0003 — Migration Formspree → Resend : proxy via Route Handler Next.js

- **Statut :** Accepté
- **Date :** 2026-09-03
- **Décideurs :** Équipe projet

## Contexte

Le formulaire de contact (LP-14) postait initialement les données directement du navigateur vers **Formspree**, via un identifiant de formulaire public (`NEXT_PUBLIC_FORMSPREE_FORM_ID`). Ce n'était pas un secret : Formspree authentifie la requête par l'origine du site, pas par une clé API confidentielle — c'est précisément ce qui permettait à LP-14 de se passer d'un Route Handler à l'époque (cf. `PRPs/LP-08-LP-14-sections-contenu.md`).

LP-20 remplace Formspree par **Resend** pour l'envoi de l'email de notification au chauffeur. Resend authentifie ses appels par une **clé API secrète** (`RESEND_API_KEY`) : une clé de ce type exposée dans le bundle JS serait immédiatement réutilisable par un tiers pour envoyer des emails arbitraires au nom du compte Resend du projet (abus de réputation d'expédition, dépassement de quota). La même contrainte que celle qui a motivé l'ADR-0001 pour OpenRouteService s'applique donc ici.

## Décision

- **Aucun serveur applicatif ni base de données** (contrainte du projet inchangée).
- Les appels Resend passent par un **Route Handler Next.js** (`app/api/contact/route.ts`) faisant office de **proxy** : il s'exécute côté serveur (fonction serverless sur Vercel), lit `RESEND_API_KEY`/`RESEND_FROM_EMAIL` depuis l'environnement, valide l'entrée avec `contactSchema` (déjà existant, réutilisé tel quel), et n'expose au client qu'un contrat minimal (`{ ok: true }` ou `{ error }`).
- `lib/resend.ts` centralise l'appel au SDK Resend et la mise en forme du corps d'email (texte brut), sur le modèle exact de `lib/ors.ts`.
- Le client (`lib/contact.ts`) poste désormais vers `internalApi`/`/api/contact` (chemin relatif) au lieu de l'URL Formspree absolue ; `formspreeApi` (`lib/ky.ts`) est supprimée.
- Périmètre volontairement réduit : notification email au chauffeur uniquement (pas de confirmation automatique au visiteur), corps en texte brut (pas de template `@react-email/components`) — décisions produit confirmées pour ce ticket, non structurantes.

## Alternatives envisagées

- **Conserver Formspree** — écartée : le client souhaite consolider ses outils sur Resend, déjà utilisé par ailleurs.
- **Appel Resend direct depuis le navigateur** avec une clé `NEXT_PUBLIC_` — écartée : expose la clé, risque d'abus d'envoi d'emails au nom du site.
- **Back-end/API séparé** — écarté pour la même raison que l'ADR-0001 : sur-dimensionné pour une landing page.

## Conséquences

**Positives**

- Clé Resend jamais exposée ; déploiement inchangé (Vercel, zéro infra à administrer).
- Défense en profondeur : `contactSchema` est désormais validé côté serveur en plus du client (le formulaire HTML peut être contourné).
- Cohérence avec le pattern déjà établi pour ORS — un seul « type » de Route Handler à maintenir dans le projet.

**Négatives / coûts assumés**

- Un Route Handler de plus à tester (cas 400/502, SDK Resend mocké).
- L'adresse d'expédition (`RESEND_FROM_EMAIL`) dépend d'un domaine vérifié dans Resend pour un envoi fiable en production ; le domaine sandbox (`onboarding@resend.dev`) suffit en dev mais est limité (destinataire restreint).

**Suites**

- Règle inscrite dans `ai_docs/architecture.md`, `ai_docs/index.md`, `ai_docs/patterns.md`, `README.md`, `.env.local.example`, `SETUP-ENV.md`.
- Ticket impacté : `LP-20`.
