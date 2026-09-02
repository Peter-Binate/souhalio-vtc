"use client";

import { useMutation } from "@tanstack/react-query";
import { submitContactForm } from "@/lib/contact";
import type { ContactFormValues } from "@/schemas/contact";

export function useContactForm() {
  return useMutation<void, Error, ContactFormValues>({
    mutationFn: submitContactForm,
  });
}
