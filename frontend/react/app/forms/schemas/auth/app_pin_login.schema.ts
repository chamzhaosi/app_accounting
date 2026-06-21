import { z } from "zod";

export const appPinLoginSchema = z.object({
  pin: z.string().trim().min(6, "PIN must be at least 6 characters"),
});

export type AppPinLoginFormType = z.infer<typeof appPinLoginSchema>;

export const appPinLoginFormDefaultValues: AppPinLoginFormType = {
  pin: "",
};
