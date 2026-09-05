import { NextResponse } from "next/server";
import { sendContactNotification } from "@/lib/resend";
import { contactSchema } from "@/schemas/contact";

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Formulaire invalide." }, { status: 400 });
  }

  const parse = contactSchema.safeParse(body);
  if (!parse.success) {
    return NextResponse.json({ error: "Formulaire invalide." }, { status: 400 });
  }

  try {
    await sendContactNotification(parse.data);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: "Envoi du formulaire indisponible." },
      { status: 502 },
    );
  }
}
