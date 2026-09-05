import { describe, it, expect, vi, beforeEach } from "vitest";
import type { ContactFormValues } from "@/schemas/contact";

const mockSend = vi.fn();

vi.mock("resend", () => ({
  Resend: class {
    emails = { send: mockSend };
  },
}));

const { formatContactEmailBody, sendContactNotification } = await import("./resend");

const values: ContactFormValues = {
  nom: "Jean Dupont",
  telephone: "0612345678",
  email: "jean.dupont@example.com",
  consentement: true,
};

describe("formatContactEmailBody", () => {
  it("n'affiche que les champs obligatoires quand les champs optionnels sont absents", () => {
    const body = formatContactEmailBody(values);

    expect(body).toBe(
      ["Nom : Jean Dupont", "Téléphone : 0612345678", "Email : jean.dupont@example.com"].join(
        "\n",
      ),
    );
    expect(body).not.toMatch(/undefined/);
  });

  it("inclut tous les champs quand ils sont renseignés", () => {
    const body = formatContactEmailBody({
      ...values,
      date: "2026-09-15",
      heure: "14:30",
      depart: "L'Haÿ-les-Roses",
      destination: "Aéroport d'Orly",
      message: "Merci de confirmer la disponibilité.",
    });

    expect(body).toBe(
      [
        "Nom : Jean Dupont",
        "Téléphone : 0612345678",
        "Email : jean.dupont@example.com",
        "Date souhaitée : 2026-09-15",
        "Heure souhaitée : 14:30",
        "Départ : L'Haÿ-les-Roses",
        "Destination : Aéroport d'Orly",
        "Message : Merci de confirmer la disponibilité.",
      ].join("\n"),
    );
  });
});

describe("sendContactNotification", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("envoie l'email via le SDK Resend sans lever d'erreur en cas de succès", async () => {
    mockSend.mockResolvedValue({ data: { id: "email_123" }, error: null });

    await expect(sendContactNotification(values)).resolves.toBeUndefined();
    expect(mockSend).toHaveBeenCalledWith(
      expect.objectContaining({
        to: expect.any(String),
        replyTo: values.email,
        subject: expect.stringContaining(values.nom),
        text: expect.stringContaining(values.nom),
      }),
    );
  });

  it("lève une erreur si Resend renvoie un champ error", async () => {
    mockSend.mockResolvedValue({ data: null, error: { message: "Domaine non vérifié" } });

    await expect(sendContactNotification(values)).rejects.toThrow("Domaine non vérifié");
  });
});
