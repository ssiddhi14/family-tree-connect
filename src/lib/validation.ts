import { z } from "zod";

export const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .min(1, "Email is required")
  .email("Enter a valid email address")
  .max(255);

export const passwordSchema = z
  .string()
  .min(8, "At least 8 characters")
  .max(72, "Too long")
  .regex(/[A-Z]/, "Needs an uppercase letter")
  .regex(/[a-z]/, "Needs a lowercase letter")
  .regex(/[0-9]/, "Needs a number")
  .regex(/[^A-Za-z0-9]/, "Needs a special character");

export const signupSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Password is required"),
});

export const forgotSchema = z.object({ email: emailSchema });

export const resetSchema = z.object({ password: passwordSchema });

export const profileSchema = z.object({
  full_name: z
    .string()
    .trim()
    .min(3, "Name must be at least 3 characters")
    .max(120)
    .refine((v) => !/^\d+$/.test(v), "Name cannot be only numbers"),
  phone: z
    .string()
    .trim()
    .regex(/^[0-9+\-\s]+$/, "Only numbers")
    .min(7, "Phone is too short")
    .max(20, "Phone is too long"),
  address: z.string().trim().min(8, "Address is too short").max(255),
});

export type SignupInput = z.infer<typeof signupSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ProfileInput = z.infer<typeof profileSchema>;

export function passwordChecks(pw: string) {
  return [
    { label: "8+ characters", ok: pw.length >= 8 },
    { label: "Uppercase", ok: /[A-Z]/.test(pw) },
    { label: "Lowercase", ok: /[a-z]/.test(pw) },
    { label: "Number", ok: /[0-9]/.test(pw) },
    { label: "Special character", ok: /[^A-Za-z0-9]/.test(pw) },
  ];
}