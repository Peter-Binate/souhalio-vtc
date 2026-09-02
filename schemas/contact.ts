import { z } from "zod";

export const contactSchema = z.object({
  nom: z.string().trim().min(2, "Votre nom est requis."),
  telephone: z.string().trim().min(6, "Un numéro de téléphone est requis."),
  email: z.string().trim().email("Adresse email invalide."),
  date: z.string().trim().optional(),
  heure: z.string().trim().optional(),
  depart: z.string().trim().optional(),
  destination: z.string().trim().optional(),
  message: z.string().trim().optional(),
  consentement: z
    .boolean()
    .refine((value) => value === true, "Le consentement est requis pour envoyer votre demande."),
});

export type ContactFormValues = z.infer<typeof contactSchema>;
