import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST } from "./route";
import { sendContactNotification } from "@/lib/resend";

vi.mock("@/lib/resend", () => ({
  sendContactNotification: vi.fn(),
}));

const mockedSendContactNotification = vi.mocked(sendContactNotification);

const validBody = {
  nom: "Jean Dupont",
  telephone: "0612345678",
  email: "jean.dupont@example.com",
  consentement: true,
};

function makeRequest(body: unknown) {
  return new Request("http://localhost/api/contact", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

describe("POST /api/contact", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renvoie 200 quand l'envoi réussit pour un formulaire valide", async () => {
    mockedSendContactNotification.mockResolvedValue(undefined);

    const res = await POST(makeRequest(validBody));

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true });
    expect(mockedSendContactNotification).toHaveBeenCalledWith(validBody);
  });

  it("renvoie 400 quand le body n'est pas du JSON valide", async () => {
    const badRequest = new Request("http://localhost/api/contact", {
      method: "POST",
      body: "not-json",
    });

    const res = await POST(badRequest);

    expect(res.status).toBe(400);
    expect(mockedSendContactNotification).not.toHaveBeenCalled();
  });

  it("renvoie 400 quand le consentement est manquant", async () => {
    const res = await POST(makeRequest({ ...validBody, consentement: false }));

    expect(res.status).toBe(400);
    expect((await res.json()).error).toBeTruthy();
    expect(mockedSendContactNotification).not.toHaveBeenCalled();
  });

  it("renvoie 400 quand un champ obligatoire est invalide", async () => {
    const res = await POST(makeRequest({ ...validBody, email: "pas-un-email" }));

    expect(res.status).toBe(400);
  });

  it("renvoie 502 avec un message générique quand Resend échoue, sans exposer l'erreur brute", async () => {
    mockedSendContactNotification.mockRejectedValue(
      new Error("Resend 401 - invalid API key sk_live_abc123"),
    );

    const res = await POST(makeRequest(validBody));
    const json = await res.json();

    expect(res.status).toBe(502);
    expect(json).toEqual({ error: "Envoi du formulaire indisponible." });
    expect(JSON.stringify(json)).not.toMatch(/sk_live|abc123|invalid API key/);
  });
});
