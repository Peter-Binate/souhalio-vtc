import { describe, it, expect, vi, beforeEach } from "vitest";
import { formspreeApi } from "@/lib/ky";
import { submitContactForm } from "./contact";
import type { ContactFormValues } from "@/schemas/contact";

vi.mock("@/lib/ky", () => ({
  formspreeApi: { post: vi.fn() },
}));

const mockedPost = vi.mocked(formspreeApi.post);

const values: ContactFormValues = {
  nom: "Jean Dupont",
  telephone: "0612345678",
  email: "jean.dupont@example.com",
  consentement: true,
};

describe("submitContactForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.NEXT_PUBLIC_FORMSPREE_FORM_ID = "test-form-id";
    mockedPost.mockReturnValue({
      json: () => Promise.resolve({ ok: true }),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);
  });

  it("poste vers l'endpoint Formspree construit depuis NEXT_PUBLIC_FORMSPREE_FORM_ID", async () => {
    await submitContactForm(values);

    expect(mockedPost).toHaveBeenCalledWith(
      "https://formspree.io/f/test-form-id",
      expect.objectContaining({
        json: values,
        headers: { Accept: "application/json" },
      }),
    );
  });

  it("propage une erreur réseau (le hook appelant gère le repli CTA téléphone)", async () => {
    mockedPost.mockImplementation(() => {
      throw new Error("Formspree indisponible");
    });

    await expect(submitContactForm(values)).rejects.toThrow();
  });
});
