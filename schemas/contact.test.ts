import { describe, it, expect } from "vitest";
import { contactSchema } from "./contact";

const validBase = {
  nom: "Jean Dupont",
  telephone: "0612345678",
  email: "jean.dupont@example.com",
  consentement: true,
};

describe("contactSchema", () => {
  it("accepte les champs obligatoires seuls (champs optionnels omis)", () => {
    const result = contactSchema.safeParse(validBase);
    expect(result.success).toBe(true);
  });

  it("accepte tous les champs, y compris optionnels", () => {
    const result = contactSchema.safeParse({
      ...validBase,
      date: "2026-09-15",
      heure: "14:30",
      depart: "L'Haÿ-les-Roses",
      destination: "Aéroport d'Orly",
      message: "Merci de confirmer la disponibilité.",
    });
    expect(result.success).toBe(true);
  });

  it("rejette un nom trop court", () => {
    const result = contactSchema.safeParse({ ...validBase, nom: "J" });
    expect(result.success).toBe(false);
  });

  it("rejette un email malformé", () => {
    const result = contactSchema.safeParse({ ...validBase, email: "pas-un-email" });
    expect(result.success).toBe(false);
  });

  it("rejette un téléphone trop court", () => {
    const result = contactSchema.safeParse({ ...validBase, telephone: "06" });
    expect(result.success).toBe(false);
  });

  it("rejette l'absence de consentement", () => {
    const result = contactSchema.safeParse({ ...validBase, consentement: false });
    expect(result.success).toBe(false);
  });
});
