import { describe, it, expect } from "vitest";
import { estimatePrice, getAirportFareOverride, getFareEstimate } from "./pricing";
import { AIRPORTS, AIRPORT_FARES } from "./constants";

describe("estimatePrice", () => {
  it("applique le minimum de course sur un trajet très court", () => {
    // 8 + 1×2,2 + 2×0,45 = 11,10 → plancher 20
    expect(estimatePrice(1, 2)).toBe(20);
  });

  it("applique le minimum de course sur un trajet nul (0 km, 0 min)", () => {
    expect(estimatePrice(0, 0)).toBe(20);
  });

  it("calcule un trajet standard (arrondi à l'euro)", () => {
    // 8 + 10×2,2 + 15×0,45 = 36,75 → 37
    expect(estimatePrice(10, 15)).toBe(37);
  });

  it("arrondit .5 vers le haut", () => {
    // 8 + 10×2,2 + 10×0,45 = 34,5 → 35
    expect(estimatePrice(10, 10)).toBe(35);
  });

  it("applique la majoration nuit/férié (+15%) sur un trajet standard", () => {
    // 36,75 × 1,15 = 42,2625 → 42
    expect(estimatePrice(10, 15, { isNightOrHoliday: true })).toBe(42);
  });

  it("applique la majoration nuit/férié après le plancher, pas avant", () => {
    // raw = 11,10 < plancher 20 → plancher d'abord, puis 20 × 1,15 = 23
    expect(estimatePrice(1, 2, { isNightOrHoliday: true })).toBe(23);
  });
});

describe("getAirportFareOverride", () => {
  it("renvoie le tarif fixe Orly quand le départ est à Orly", () => {
    expect(getAirportFareOverride(AIRPORTS.ORLY.coord, [2.35, 48.85])).toBe(
      AIRPORT_FARES.ORLY,
    );
  });

  it("renvoie le tarif fixe CDG quand l'arrivée est à Roissy-CDG", () => {
    expect(getAirportFareOverride([2.35, 48.85], AIRPORTS.CDG.coord)).toBe(
      AIRPORT_FARES.CDG,
    );
  });

  it("renvoie le tarif fixe Beauvais pour un point proche (dans le rayon de détection)", () => {
    const nearBeauvais: [number, number] = [
      AIRPORTS.BEAUVAIS.coord[0] + 0.01,
      AIRPORTS.BEAUVAIS.coord[1] + 0.01,
    ];
    expect(getAirportFareOverride(nearBeauvais, [2.35, 48.85])).toBe(
      AIRPORT_FARES.BEAUVAIS,
    );
  });

  it("renvoie null quand ni le départ ni l'arrivée ne sont un aéroport", () => {
    expect(getAirportFareOverride([2.35, 48.85], [2.3522, 48.8566])).toBeNull();
  });

  it("est prioritaire : le résultat ignore totalement distance/durée réelles", () => {
    // Un aéroport détecté renvoie directement le tarif fixe, sans jamais consulter estimatePrice.
    const override = getAirportFareOverride(AIRPORTS.ORLY.coord, [5, 50]);
    expect(override).toBe(AIRPORT_FARES.ORLY);
  });
});

describe("getFareEstimate", () => {
  it("renvoie le tarif fixe aéroport quand applicable, en ignorant la grille", () => {
    const result = getFareEstimate(AIRPORTS.ORLY.coord, [2.35, 48.85], 200, 180);
    expect(result).toEqual({ amount: AIRPORT_FARES.ORLY, isFixedAirportFare: true });
  });

  it("retombe sur estimatePrice quand aucun point n'est un aéroport", () => {
    const result = getFareEstimate([2.35, 48.85], [2.3522, 48.8566], 10, 15);
    expect(result).toEqual({ amount: 37, isFixedAirportFare: false });
  });
});
