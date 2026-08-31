# Changelog

## LP-03 — Layout, providers & shell SEO

- Ajout de `lib/query-client.tsx` (`Providers`, `QueryClientProvider` monté dans `app/layout.tsx`).
- Ajout de `components/layout/{header,footer,sticky-call-button}.tsx` : en-tête avec CTA appel (desktop), pied de page avec récap business + CTA appel/WhatsApp, bouton d'appel flottant fixe en bas d'écran sur mobile (`sm:hidden`).
- `app/layout.tsx` : `lang="fr"`, `<title>`/meta description conformes à `content-reference.md`, JSON-LD `LocalBusiness` (nom, téléphone, adresse, zone desservie, horaires 24/7, tarifs aéroport en `makesOffer`).
- Nettoyage du boilerplate `create-next-app` dans `app/page.tsx` (retrait du `<h1>` par défaut — le futur et unique `<h1>` sera celui du hero, LP-07) et suppression des SVG désormais inutilisés (`next.svg`, `vercel.svg`).

## LP-02 — Constantes business & placeholders

- Ajout de `lib/constants.ts` : `BUSINESS`, `AIRPORT_FARES`, `PRICING`, `REVIEWS`, et les helpers CTA `telHref`/`waHref`.
- Ajout de Vitest (config `vitest.config.mts`, script `pnpm test`) pour couvrir la normalisation de `telHref`/`waHref` (`lib/constants.test.ts`).
