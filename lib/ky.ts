import ky from "ky";

// API interne (Route Handlers), côté client — chemins relatifs.
export const internalApi = ky.create({ timeout: 12_000, retry: 0 });

// Service tiers (Formspree) — endpoint absolu, hors API interne.
export const formspreeApi = ky.create({ timeout: 10_000, retry: 1 });
