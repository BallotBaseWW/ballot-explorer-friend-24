import { z } from "zod";

export const formSchema = z.object({
  full_name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  organization: z.string().min(2, "Organization must be at least 2 characters"),
  address: z.string().min(5, "Please enter a valid address"),
  city: z.string().min(2, "Please enter a valid city"),
  state: z.string().min(2, "Please enter a valid state"),
  zip: z.string().min(5, "Please enter a valid ZIP code"),
});

export type FormData = z.infer<typeof formSchema>;