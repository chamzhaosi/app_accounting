import { z } from "zod";

export type ResetPasswordFormType = z.infer<typeof resetPasswordFormSchema>;

export const resetPasswordFormSchema = z
  .object({
    password: z
      .string()
      .trim()
      .min(1, "Please enter your password")
      .refine(
        (value) =>
          /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/.test(
            value,
          ),
        {
          message:
            "Password must be at least 6 characters and contain uppercase, lowercase, number and special character",
        },
      ),
    cfmPassword: z.string().trim().min(1, "Please confirm your password"),
  })
  .superRefine((data, ctx) => {
    if (data.password !== data.cfmPassword) {
      ctx.addIssue({
        code: "custom",
        path: ["cfmPassword"],
        message: "Passwords do not match",
      });
    }
  });

export const resetPasswordFormDefaultValues: ResetPasswordFormType = {
  password: "",
  cfmPassword: "",
};
