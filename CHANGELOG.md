# Changelog

## LP-02 — Constantes business & placeholders

- Ajout de `lib/constants.ts` : `BUSINESS`, `AIRPORT_FARES`, `PRICING`, `REVIEWS`, et les helpers CTA `telHref`/`waHref`.
- Ajout de Vitest (config `vitest.config.mts`, script `pnpm test`) pour couvrir la normalisation de `telHref`/`waHref` (`lib/constants.test.ts`).
