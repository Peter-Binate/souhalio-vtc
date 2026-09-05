// SERVEUR uniquement — n'importer que dans un Route Handler (jamais depuis un composant).
import { Resend } from "resend";
import { BUSINESS } from "@/lib/constants";
import type { ContactFormValues } from "@/schemas/contact";

// Instanciation différée : le SDK Resend valide la clé dès le constructeur,
// ce qui casserait le build si RESEND_API_KEY est absente à la compilation
// (contrairement à ORS_API_KEY, simplement interpolée dans un header).
function getResendClient(): Resend {
  return new Resend(process.env.RESEND_API_KEY!);
}

export function formatContactEmailBody(values: ContactFormValues): string {
  const lines = [
    `Nom : ${values.nom}`,
    `Téléphone : ${values.telephone}`,
    `Email : ${values.email}`,
    values.date && `Date souhaitée : ${values.date}`,
    values.heure && `Heure souhaitée : ${values.heure}`,
    values.depart && `Départ : ${values.depart}`,
    values.destination && `Destination : ${values.destination}`,
    values.message && `Message : ${values.message}`,
  ].filter((line): line is string => Boolean(line));
  return lines.join("\n");
}

export async function sendContactNotification(values: ContactFormValues): Promise<void> {
  const { error } = await getResendClient().emails.send({
    from: process.env.RESEND_FROM_EMAIL!,
    to: BUSINESS.email,
    replyTo: values.email,
    subject: `Nouvelle demande de devis — ${values.nom}`,
    text: formatContactEmailBody(values),
  });
  if (error) throw new Error(error.message);
}
