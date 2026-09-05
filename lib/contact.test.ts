import { describe, it, expect, vi, beforeEach } from "vitest";
import { internalApi } from "@/lib/ky";
import { submitContactForm } from "./contact";
import type { ContactFormValues } from "@/schemas/contact";

vi.mock("@/lib/ky", () => ({
  internalApi: { post: vi.fn() },
}));

const mockedPost = vi.mocked(internalApi.post);

const values: ContactFormValues = {
  nom: "Jean Dupont",
  telephone: "0612345678",
  email: "jean.dupont@example.com",
  consentement: true,
};

describe("submitContactForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockedPost.mockReturnValue({
      json: () => Promise.resolve({ ok: true }),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);
  });

  it("poste vers le Route Handler interne /api/contact", async () => {
    await submitContactForm(values);

    expect(mockedPost).toHaveBeenCalledWith("api/contact", {
      json: values,
    });
  });

  it("propage une erreur réseau (le hook appelant gère le repli CTA téléphone)", async () => {
    mockedPost.mockImplementation(() => {
      throw new Error("/api/contact indisponible");
    });

    await expect(submitContactForm(values)).rejects.toThrow();
  });
});
