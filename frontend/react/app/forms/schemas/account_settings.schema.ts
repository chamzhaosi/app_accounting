import { z } from "zod";

export const NICKNAME_MAX_LEN = 50;
export const EMAIL_MAX_LEN = 254;

export const accountSettingsFormSchema = z.object({
  nickname: z
    .string()
    .trim()
    .max(NICKNAME_MAX_LEN, "Nickname must not exceed 50 characters"),
  email: z
    .string()
    .trim()
    .max(EMAIL_MAX_LEN, "Email must not exceed 254 characters")
    .refine(
      (value) =>
        value.length === 0 || z.string().email().safeParse(value).success,
      "Invalid email",
    ),
  language: z.enum(["en", "zh-Hans", "ms"]),
});

export type AccountSettingsFormType = z.infer<typeof accountSettingsFormSchema>;

export const accountSettingsFormDefaultValues: AccountSettingsFormType = {
  nickname: "",
  email: "",
  language: "en",
};
