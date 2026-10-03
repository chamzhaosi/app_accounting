import { z } from "zod";

export const BENEFICIARY_NAME_MAX_LEN = 50;
export const BENEFICIARY_RELATIONSHIP_MAX_LEN = 50;
export const BENEFICIARY_DESCRIPTION_MAX_LEN = 100;

export const BENEFICIARY_RELATIONSHIP_SUGGESTIONS = [
  "Self",
  "Partner",
  "Husband",
  "Wife",
  "Son",
  "Daughter",
  "Father",
  "Mother",
  "Sibling",
  "Friend",
  "Colleague",
  "Other",
] as const;

export const beneficiaryFormSchema = z.object({
  icon: z.string().trim().min(1, "Please select an icon"),
  name: z
    .string()
    .trim()
    .min(1, "Please enter a beneficiary name")
    .max(
      BENEFICIARY_NAME_MAX_LEN,
      `Name must not exceed ${BENEFICIARY_NAME_MAX_LEN} characters`,
    ),
  relationship: z
    .string()
    .trim()
    .max(
      BENEFICIARY_RELATIONSHIP_MAX_LEN,
      `Relationship must not exceed ${BENEFICIARY_RELATIONSHIP_MAX_LEN} characters`,
    ),
  descriptions: z
    .string()
    .trim()
    .max(
      BENEFICIARY_DESCRIPTION_MAX_LEN,
      `Description must not exceed ${BENEFICIARY_DESCRIPTION_MAX_LEN} characters`,
    ),
  isActive: z.boolean(),
  memberIds: z.array(z.string()),
});

export type BeneficiaryFormType = z.infer<typeof beneficiaryFormSchema>;

export const beneficiaryFormDefaultValues: BeneficiaryFormType = {
  icon: "",
  name: "",
  relationship: "",
  descriptions: "",
  isActive: true,
  memberIds: [],
};
