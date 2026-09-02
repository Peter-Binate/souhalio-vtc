import { describe, it, expect, vi, beforeEach } from "vitest";
import ky from "ky";
import { geocode } from "./maptiler";

vi.mock("ky", () => ({
  default: {
    get: vi.fn(),
  },
}));

const mockedGet = vi.mocked(ky.get);

describe("geocode", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.NEXT_PUBLIC_MAPTILER_KEY = "test-key";
  });

  it("ne fait aucun appel réseau en dessous de 3 caractères", async () => {
    const result = await geocode("ab");

    expect(result).toEqual([]);
    expect(mockedGet).not.toHaveBeenCalled();
  });

  it("ignore les espaces superflus pour la validation de longueur minimale", async () => {
    const result = await geocode("  a  ");

    expect(result).toEqual([]);
    expect(mockedGet).not.toHaveBeenCalled();
  });

  it("interroge MapTiler avec le biais Île-de-France et renvoie les suggestions parsées", async () => {
    mockedGet.mockReturnValue({
      json: () =>
        Promise.resolve({
          features: [
            { place_name: "Paris, France", center: [2.3522, 48.8566] },
            { place_name: "Paris-Orly", center: [2.3794, 48.7233] },
          ],
        }),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);

    const result = await geocode("Paris");

    expect(result).toEqual([
      { place_name: "Paris, France", center: [2.3522, 48.8566] },
      { place_name: "Paris-Orly", center: [2.3794, 48.7233] },
    ]);
    expect(mockedGet).toHaveBeenCalledWith(
      expect.stringContaining("api.maptiler.com/geocoding/Paris.json"),
      expect.objectContaining({
        searchParams: expect.objectContaining({
          key: "test-key",
          country: "fr",
          proximity: "2.3522,48.8566",
          autocomplete: "true",
          limit: "5",
        }),
      }),
    );
  });

  it("rejette une réponse MapTiler qui ne respecte pas le contrat attendu", async () => {
    mockedGet.mockReturnValue({
      json: () =>
        Promise.resolve({
          features: [{ place_name: "Paris", center: [2.3522] }],
        }),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);

    await expect(geocode("Paris")).rejects.toThrow();
  });
});
