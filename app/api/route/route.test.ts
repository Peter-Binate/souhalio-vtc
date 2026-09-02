import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST } from "./route";
import { getDirections } from "@/lib/ors";

vi.mock("@/lib/ors", () => ({
  getDirections: vi.fn(),
}));

const mockedGetDirections = vi.mocked(getDirections);

function makeRequest(body: unknown) {
  return new Request("http://localhost/api/route", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

describe("POST /api/route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renvoie 200 avec le contrat { geometry, distanceKm, durationMin } pour des coordonnées valides", async () => {
    mockedGetDirections.mockResolvedValue({
      geometry: {
        type: "LineString",
        coordinates: [
          [2.35, 48.85],
          [2.55, 49.01],
        ],
      },
      distanceKm: 42.35,
      durationMin: 41.8,
    });

    const res = await POST(makeRequest({ from: [2.35, 48.85], to: [2.55, 49.01] }));

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({
      geometry: {
        type: "LineString",
        coordinates: [
          [2.35, 48.85],
          [2.55, 49.01],
        ],
      },
      distanceKm: 42.35,
      durationMin: 41.8,
    });
  });

  it("renvoie 400 quand une coordonnée est incomplète", async () => {
    const res = await POST(makeRequest({ from: [2.35], to: [2.55, 49.01] }));

    expect(res.status).toBe(400);
    expect((await res.json()).error).toBeTruthy();
    expect(mockedGetDirections).not.toHaveBeenCalled();
  });

  it("renvoie 400 quand une coordonnée est manquante", async () => {
    const res = await POST(makeRequest({ from: [2.35, 48.85] }));

    expect(res.status).toBe(400);
  });

  it("renvoie 400 quand le body n'est pas du JSON valide", async () => {
    const badRequest = new Request("http://localhost/api/route", {
      method: "POST",
      body: "not-json",
    });

    const res = await POST(badRequest);

    expect(res.status).toBe(400);
  });

  it("renvoie 502 avec un message générique quand ORS échoue, sans exposer l'erreur brute", async () => {
    mockedGetDirections.mockRejectedValue(
      new Error("ORS 503 - quota exceeded, key abc123"),
    );

    const res = await POST(makeRequest({ from: [2.35, 48.85], to: [2.55, 49.01] }));
    const json = await res.json();

    expect(res.status).toBe(502);
    expect(json).toEqual({ error: "Calcul d'itinéraire indisponible." });
    expect(JSON.stringify(json)).not.toMatch(/quota|abc123/);
  });
});
