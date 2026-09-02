import { formspreeApi } from "@/lib/ky";
import type { ContactFormValues } from "@/schemas/contact";

export async function submitContactForm(values: ContactFormValues): Promise<void> {
  await formspreeApi.post(
    `https://formspree.io/f/${process.env.NEXT_PUBLIC_FORMSPREE_FORM_ID}`,
    { json: values, headers: { Accept: "application/json" } },
  );
}
