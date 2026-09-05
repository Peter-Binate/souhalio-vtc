import { internalApi } from "@/lib/ky";
import type { ContactFormValues } from "@/schemas/contact";

export async function submitContactForm(values: ContactFormValues): Promise<void> {
  await internalApi.post("api/contact", { json: values });
}
