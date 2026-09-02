// Données business & placeholders — source unique de vérité.
// Toute valeur fictive (téléphone, email, adresse, avis) vit ici ;
// ne jamais la coder en dur dans un composant. Cf. ai_docs/content-reference.md.

export const BUSINESS = {
  name: "Soualiho VTC",
  phone: "0673559197",
  whatsapp: "0673559197",
  email: "[EMAIL_ADDRESS]",
  address: "[ADRESSE POSTALE COMPLÈTE]",
  city: "L'Haÿ-les-Roses",
  postalCode: "94240",
  hours: "24h/24, 7j/7, jours fériés",
  payment: "Espèces",
  language: "Français",
} as const;

// Avis FICTIFS — à remplacer par de vrais avis avant mise en ligne.
export const REVIEWS = [
  {
    author: "Marc D. (avis fictif)",
    text: "Chauffeur ponctuel et très professionnel. Il m'attendait à l'aéroport malgré un vol retardé, tarif exactement celui annoncé. Je réserve désormais pour tous mes déplacements.",
  },
  {
    author: "Sophie L. (avis fictif)",
    text: "Réservation simple par téléphone, véhicule propre et confortable, conduite souple. Parfait pour mes rendez-vous professionnels. Je recommande.",
  },
  {
    author: "Karim B. (avis fictif)",
    text: "Appelé à 23h pour un trajet de dernière minute vers Roissy : réponse immédiate et prise en charge impeccable. Un vrai service 24h/24.",
  },
  {
    author: "Élodie M. (avis fictif)",
    text: "Ponctuel, discret et rassurant. Le prix fixe pour l'aéroport, c'est un vrai confort : aucune mauvaise surprise.",
  },
] as const;

// Grille tarifaire — ⚠️ FICTIVE, fournie pour le développement ; le client fournira les vraies valeurs.
export const PRICING = {
  baseFare: 8.0, // prise en charge (€)
  perKm: 2.2, // €/km
  perMin: 0.45, // €/min
  minFare: 20.0, // minimum de course (€)
  nightSurcharge: 0.15, // +15% nuit (20h–6h), dimanches & jours fériés
} as const;

// Tarifs fixes aéroport — au départ de Paris et proche banlieue.
export const AIRPORT_FARES = {
  ORLY: 50,
  CDG: 65, // Roissy-Charles de Gaulle
  BEAUVAIS: 120,
} as const;

// Correction de la durée de trajet renvoyée par ORS (lib/ors.ts) — ORS n'utilise pas
// de trafic temps réel (vitesses moyennes statiques par type de route) et sous-estime
// donc surtout les trajets urbains courts (feux, congestion), tout en restant proche
// de la réalité sur autoroute/longue distance où les vitesses sont prévisibles.
// Calibré le 2026-09-02 par comparaison réelle ORS vs Google Maps sur 5 trajets
// Île-de-France (voir PRPs/LP-17-verification-duree-trajet.md) : palier par distance
// plutôt qu'une régression continue, car seulement 3 points de mesure fiables
// (6,3 km → ×1,52 ; 10,9 km → ×1,07 ; 133 km → ×1,03). À revalider périodiquement.
export const ROUTE_DURATION_CORRECTION = [
  { maxDistanceKm: 8, factor: 1.5 }, // urbain court
  { maxDistanceKm: 20, factor: 1.1 }, // banlieue / trajet mixte
  { maxDistanceKm: Infinity, factor: 1.0 }, // autoroute / longue distance
] as const;

// Coordonnées réelles des aéroports (pas un placeholder) — utilisées pour détecter un trajet aéroport.
export const AIRPORTS = {
  ORLY: { name: "Paris-Orly", coord: [2.3794, 48.7233] },
  CDG: { name: "Paris-Charles de Gaulle (Roissy)", coord: [2.5479, 49.0097] },
  BEAUVAIS: { name: "Paris-Beauvais", coord: [2.1128, 49.4544] },
} as const;

// Helpers CTA — normalisent un numéro brut en lien tel:/wa.me exploitable.
export const telHref = (raw: string) => `tel:${raw.replace(/[^\d+]/g, "")}`;
export const waHref = (raw: string, text?: string) => {
  const base = `https://wa.me/${raw.replace(/\D/g, "")}`;
  return text ? `${base}?text=${encodeURIComponent(text)}` : base;
};
