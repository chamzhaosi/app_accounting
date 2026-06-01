import z from "zod";

export type OtpFormType = z.infer<typeof otpSchema>;

export const otpSchema = z.object({
  otp: z.string().trim().length(6, "OTP must be 6 digits"),
});

export const otpFormDefaultValues: OtpFormType = {
  otp: "",
};
