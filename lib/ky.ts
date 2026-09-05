import ky from "ky";

// API interne (Route Handlers), côté client — chemins relatifs.
export const internalApi = ky.create({ timeout: 12_000, retry: 0 });
