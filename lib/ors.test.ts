import { describe, it, expect, vi, beforeEach } from "vitest";
import ky from "ky";
import { getDirections, getMatrix } from "./ors";

vi.mock("ky", () => ({
  default: {
    post: vi.fn(),
  },
}));

const mockedPost = vi.mocked(ky.post);

function mockOrsResponse(json: unknown) {
  mockedPost.mockReturnValue({
    json: () => Promise.resolve(json),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } as any);
}

describe("getDirections", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.ORS_API_KEY = "test-key";
  });

  it("convertit distance (m→km) et durée (s→min), et renvoie la géométrie telle quelle", async () => {
    mockOrsResponse({
      features: [
        {
          geometry: {
            type: "LineString",
            coordinates: [
              [2.3522, 48.8566],
              [2.5479, 49.0097],
            ],
          },
          properties: { summary: { distance: 42350.1, duration: 2510.4 } },
        },
      ],
    });

    const result = await getDirections([2.3522, 48.8566], [2.5479, 49.0097]);

    expect(result.distanceKm).toBeCloseTo(42.3501);
    expect(result.durationMin).toBeCloseTo(41.84, 2);
    expect(result.geometry).toEqual({
      type: "LineString",
      coordinates: [
        [2.3522, 48.8566],
        [2.5479, 49.0097],
      ],
    });
  });

  it("envoie l'Authorization et les coordonnées dans l'ordre [lon, lat]", async () => {
    mockOrsResponse({
      features: [
        {
          geometry: { type: "LineString", coordinates: [[2.35, 48.85]] },
          properties: { summary: { distance: 1000, duration: 60 } },
        },
      ],
    });

    await getDirections([2.35, 48.85], [2.55, 49.01]);

    expect(mockedPost).toHaveBeenCalledWith(
      expect.stringContaining("openrouteservice.org"),
      expect.objectContaining({
        headers: {
          Authorization: "test-key",
          Accept: "application/json, application/geo+json",
        },
        json: { coordinates: [[2.35, 48.85], [2.55, 49.01]] },
      }),
    );
  });

  it("ajoute `radiuses` seulement si fourni (option pour scripts/enrich-communes.ts)", async () => {
    mockOrsResponse({
      features: [
        {
          geometry: { type: "LineString", coordinates: [[2.35, 48.85]] },
          properties: { summary: { distance: 1000, duration: 60 } },
        },
      ],
    });

    await getDirections([2.35, 48.85], [2.55, 49.01], { radiuses: [1000, 1000] });

    expect(mockedPost).toHaveBeenCalledWith(
      expect.stringContaining("openrouteservice.org"),
      expect.objectContaining({
        json: { coordinates: [[2.35, 48.85], [2.55, 49.01]], radiuses: [1000, 1000] },
      }),
    );
  });

  it("rejette une réponse ORS qui ne respecte pas le contrat attendu (features vide)", async () => {
    mockOrsResponse({ features: [] });

    await expect(
      getDirections([2.35, 48.85], [2.55, 49.01]),
    ).rejects.toThrow();
  });

  it("rejette une réponse ORS dont la géométrie n'est pas une LineString", async () => {
    mockOrsResponse({
      features: [
        {
          geometry: { type: "Point", coordinates: [2.35, 48.85] },
          properties: { summary: { distance: 1000, duration: 60 } },
        },
      ],
    });

    await expect(
      getDirections([2.35, 48.85], [2.55, 49.01]),
    ).rejects.toThrow();
  });

  describe("correction de durée par palier de distance", () => {
    it("applique le facteur ×1,5 pour un trajet urbain court (< 8 km)", async () => {
      mockOrsResponse({
        features: [
          {
            geometry: { type: "LineString", coordinates: [[2.35, 48.85]] },
            // 6 km, 20 min bruts
            properties: { summary: { distance: 6000, duration: 1200 } },
          },
        ],
      });

      const result = await getDirections([2.35, 48.85], [2.55, 49.01]);

      expect(result.durationMin).toBeCloseTo(30, 5); // 20 * 1.5
    });

    it("applique le facteur ×1,1 pour un trajet banlieue/mixte (8–20 km)", async () => {
      mockOrsResponse({
        features: [
          {
            geometry: { type: "LineString", coordinates: [[2.35, 48.85]] },
            // 11 km, 20 min bruts
            properties: { summary: { distance: 11000, duration: 1200 } },
          },
        ],
      });

      const result = await getDirections([2.35, 48.85], [2.55, 49.01]);

      expect(result.durationMin).toBeCloseTo(22, 5); // 20 * 1.1
    });

    it("n'applique aucune correction pour un trajet autoroute/longue distance (>= 20 km)", async () => {
      mockOrsResponse({
        features: [
          {
            geometry: { type: "LineString", coordinates: [[2.35, 48.85]] },
            // 133 km, 100 min bruts
            properties: { summary: { distance: 133000, duration: 6000 } },
          },
        ],
      });

      const result = await getDirections([2.35, 48.85], [2.55, 49.01]);

      expect(result.durationMin).toBeCloseTo(100, 5); // 100 * 1.0
    });

    it("applique le palier exact à la frontière (8 km pile → urbain court)", async () => {
      mockOrsResponse({
        features: [
          {
            geometry: { type: "LineString", coordinates: [[2.35, 48.85]] },
            properties: { summary: { distance: 8000, duration: 600 } },
          },
        ],
      });

      const result = await getDirections([2.35, 48.85], [2.55, 49.01]);

      expect(result.durationMin).toBeCloseTo(15, 5); // 10 * 1.5
    });
  });
});

describe("getMatrix", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.ORS_API_KEY = "test-key";
  });

  it("indexe sources et destinations dans la liste concaténée envoyée à ORS", async () => {
    mockOrsResponse({ distances: [[1000, 2000]], durations: [[600, 900]] });

    await getMatrix(
      [[2.35, 48.85]],
      [
        [2.39, 48.73],
        [2.54, 49.0],
      ],
    );

    const body = mockedPost.mock.calls[0][1] as { json: Record<string, unknown> };
    expect(body.json.locations).toEqual([
      [2.35, 48.85],
      [2.39, 48.73],
      [2.54, 49.0],
    ]);
    expect(body.json.sources).toEqual([0]);
    expect(body.json.destinations).toEqual([1, 2]);
    expect(body.json.metrics).toEqual(["distance", "duration"]);
  });

  it("convertit m→km (1 décimale) et s→min arrondies, correction de durée appliquée", async () => {
    // 27,3 km → palier ×1,0 : 2199,8 s = 36,66 min → 37
    // 18,5 km → palier ×1,1 : 2161,0 s = 36,02 min × 1,1 = 39,6 → 40
    // 6,0 km  → palier ×1,5 : 600 s = 10 min × 1,5 = 15
    mockOrsResponse({
      distances: [[27274, 18515.61, 6000]],
      durations: [[2199.8, 2161.03, 600]],
    });

    const [row] = await getMatrix([[2.35, 48.85]], [
      [2.54, 49.0],
      [2.39, 48.73],
      [2.3, 48.8],
    ]);

    expect(row[0]).toEqual({ km: 27.3, min: 37 });
    expect(row[1]).toEqual({ km: 18.5, min: 40 });
    expect(row[2]).toEqual({ km: 6, min: 15 });
  });

  it("renvoie null pour une case sans itinéraire plutôt qu'un 0 silencieux", async () => {
    mockOrsResponse({ distances: [[null, 1000]], durations: [[null, 600]] });

    const [row] = await getMatrix([[2.35, 48.85]], [
      [0, 0],
      [2.39, 48.73],
    ]);

    expect(row[0]).toBeNull();
    expect(row[1]).not.toBeNull();
  });

  it("rejette une réponse ORS qui ne respecte pas le schéma", async () => {
    mockOrsResponse({ durations: [[600]] }); // `distances` manquant
    await expect(getMatrix([[2.35, 48.85]], [[2.39, 48.73]])).rejects.toThrow();
  });
});
