import { z } from "zod";

export type LoginFormType = z.infer<typeof loginSchema>;

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Please enter your email")
    .email("Invalid email"),
  password: z.string().trim().min(6, "Password must be at least 6 characters"),
});

export const loginFormDefaultValues: LoginFormType = {
  email: "",
  password: "",
};
