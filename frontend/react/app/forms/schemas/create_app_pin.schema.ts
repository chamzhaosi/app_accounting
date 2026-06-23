import z from "zod";

const baseAppPinFormSchema = z.object({
  pin: z.string().trim().min(6, "PIN must be at least 6 characters"),
  cfmPin: z
    .string()
    .trim()
    .min(6, "Confirmation PIN must be at least 6 characters"),
});

export const createAppPinFormSchema = ({
  isUpdate,
  isReqUnenabled,
}: {
  isUpdate: boolean;
  isReqUnenabled: boolean;
}) => {
  const schema = isReqUnenabled
    ? z.object({
        currentPin: z
          .string()
          .trim()
          .min(6, "Current PIN must be at least 6 characters"),
        pin: z.string().optional(),
        cfmPin: z.string().optional(),
      })
    : baseAppPinFormSchema.extend({
        currentPin: isUpdate
          ? z
              .string()
              .trim()
              .min(6, "Current PIN must be at least 6 characters")
          : z.string().trim().min(0).optional(),
      });

  return schema.superRefine((data, ctx) => {
    if (!isReqUnenabled && data.pin !== data.cfmPin) {
      ctx.addIssue({
        code: "custom",
        path: ["cfmPin"],
        message: "PINs do not match",
      });
    }
  });
};

export type CreateAppPinFormType = z.infer<
  ReturnType<typeof createAppPinFormSchema>
>;

export const createAppPinFormDefaultValues: CreateAppPinFormType = {
  currentPin: "",
  pin: "",
  cfmPin: "",
};
