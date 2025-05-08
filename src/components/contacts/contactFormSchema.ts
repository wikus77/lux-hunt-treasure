
import * as z from "zod";

// Define form validation schema using Zod
export const contactFormSchema = z.object({
  name: z.string().min(2, { message: "Il nome deve essere di almeno 2 caratteri." }),
  email: z.string().email({ message: "Inserisci un indirizzo email valido." }),
  subject: z.string().optional(),
  message: z.string().min(10, { message: "Il messaggio deve essere di almeno 10 caratteri." }),
});

export type ContactFormData = z.infer<typeof contactFormSchema>;
