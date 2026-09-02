import { describe, it, expect, vi, beforeEach } from "vitest";
import ky from "ky";
import { getDirections } from "./ors";

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
        headers: { Authorization: "test-key" },
        json: { coordinates: [[2.35, 48.85], [2.55, 49.01]] },
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
});
