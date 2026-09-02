import { describe, it, expect } from "vitest";
import { telHref, waHref } from "./constants";

describe("telHref", () => {
  it("normalise un numéro français au format international avec espaces", () => {
    expect(telHref("+33 6 12 34 56 78")).toBe("tel:+33612345678");
  });

  it("supprime points et tirets", () => {
    expect(telHref("+33.6.12.34.56.78")).toBe("tel:+33612345678");
    expect(telHref("+33-6-12-34-56-78")).toBe("tel:+33612345678");
  });

  it("conserve un numéro local français (0X) tel quel une fois nettoyé", () => {
    expect(telHref("06 12 34 56 78")).toBe("tel:0612345678");
  });

  it("ignore les espaces et parenthèses (conserve les chiffres qu'elles contiennent)", () => {
    expect(telHref("+33 (6) 12 34 56 78")).toBe("tel:+33612345678");
  });
});

describe("waHref", () => {
  it("normalise un numéro international en supprimant le +", () => {
    expect(waHref("+33 6 12 34 56 78")).toBe("https://wa.me/33612345678");
  });

  it("convertit un numéro déjà au format wa.me (sans +, sans espaces)", () => {
    expect(waHref("33612345678")).toBe("https://wa.me/33612345678");
  });

  it("supprime tout séparateur (espaces, points, tirets, parenthèses)", () => {
    expect(waHref("+33 (6).12-34.56 78")).toBe("https://wa.me/33612345678");
  });

  it("ajoute le texte optionnel encodé en query parameter", () => {
    expect(waHref("06 12 34 56 78", "Bonjour, trajet de Paris à Orly")).toBe(
      "https://wa.me/0612345678?text=Bonjour%2C%20trajet%20de%20Paris%20%C3%A0%20Orly"
    );
  });
});
