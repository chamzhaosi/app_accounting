import { z } from "zod";

// Step: 1 - Email form
export type ForgetPasswordEmailFormType = z.infer<
  typeof forgetPasswordEmailFormSchema
>;

export const forgetPasswordEmailFormSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Please enter your email")
    .email("Please enter a valid email address"),
});

export const forgetPasswordEmailFormDefaultValues: ForgetPasswordEmailFormType =
  {
    email: "",
  };

// Step: 2 - OTP form
export type ForgetPasswordOTPFormType = z.infer<
  typeof forgetPasswordOTPFormSchema
>;

export const forgetPasswordOTPFormSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Please enter your email")
    .email("Please enter a valid email address"),
  otp: z.string().trim().length(6, "OTP must be 6 digits"),
});

export const forgetPasswordOTPFormDefaultValues: ForgetPasswordOTPFormType = {
  email: "",
  otp: "",
};

// Step: 3 - Reset password form
export type ForgetPasswordResetFormType = z.infer<
  typeof forgetPasswordResetFormSchema
>;

export const forgetPasswordResetFormSchema = z
  .object({
    email: z
      .string()
      .trim()
      .min(1, "Please enter your email")
      .email("Please enter a valid email address"),
    resetToken: z.string().trim().min(1, "Reset token is required"),
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

export const forgetPasswordResetFormDefaultValues: ForgetPasswordResetFormType =
  {
    email: "",
    resetToken: "",
    password: "",
    cfmPassword: "",
  };
