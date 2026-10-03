import { getMonthKey } from "../../utils/date";
import {
  BENEFICIARY_DESCRIPTION_MAX_LEN,
  BENEFICIARY_NAME_MAX_LEN,
  BENEFICIARY_RELATIONSHIP_MAX_LEN,
} from "../../forms/schemas/beneficiary.schema";
import {
  cleanBeneficiaryText,
  normalizeBeneficiaryName,
} from "../../utils/beneficiary";
import {
  createBeneficiaryToDB,
  getBeneficiaryByIdFromDB,
  getBeneficiaryByNormalizedNameFromDB,
  getBeneficiaryListFromDB,
  getRelevantBeneficiariesFromDB,
  getSelfBeneficiaryFromDB,
  updateBeneficiaryToDB,
} from "../repo/beneficiaryRepo";
import type {
  BeneficiaryRspType,
  BeneficiarySaveReqType,
  BeneficiaryType,
  BeneficiaryUpdateReqType,
} from "../types/beneficiaryType";

export const getBeneficiaryList = (
  type?: BeneficiaryType,
  includeInactive = true,
) => getBeneficiaryListFromDB(type, includeInactive);

export const getSelectableBeneficiaries = () =>
  getBeneficiaryListFromDB(undefined, false);

export const getRelevantBeneficiaries = (startDate: string, endDate: string) =>
  getRelevantBeneficiariesFromDB(startDate, endDate);

export const getBeneficiaryById = (id: string) => getBeneficiaryByIdFromDB(id);

export const getSelfBeneficiary = () => getSelfBeneficiaryFromDB();

const prepareBeneficiary = <T extends BeneficiarySaveReqType>(data: T): T => ({
  ...data,
  name: cleanBeneficiaryText(data.name),
  normalizedName: normalizeBeneficiaryName(data.name),
  relationship: data.relationship
    ? cleanBeneficiaryText(data.relationship)
    : undefined,
  descriptions: data.descriptions?.trim() || undefined,
  memberIds: [...new Set(data.memberIds)],
});

const validateBeneficiary = async (
  data: BeneficiarySaveReqType,
  current?: BeneficiaryRspType | null,
) => {
  if (!data.icon) return "Please select an icon.";
  if (!data.normalizedName) return "Please enter a beneficiary name.";
  if (data.name.length > BENEFICIARY_NAME_MAX_LEN)
    return `Name must not exceed ${BENEFICIARY_NAME_MAX_LEN} characters`;
  if ((data.relationship?.length ?? 0) > BENEFICIARY_RELATIONSHIP_MAX_LEN)
    return `Relationship must not exceed ${BENEFICIARY_RELATIONSHIP_MAX_LEN} characters`;
  if ((data.descriptions?.length ?? 0) > BENEFICIARY_DESCRIPTION_MAX_LEN)
    return `Description must not exceed ${BENEFICIARY_DESCRIPTION_MAX_LEN} characters`;
  const duplicate = await getBeneficiaryByNormalizedNameFromDB(
    data.normalizedName,
  );
  if (duplicate && duplicate.id !== current?.id)
    return "A beneficiary with the same name already exists.";
  if (current?.is_self && !data.isActive)
    return "The self beneficiary must remain active.";
  if (current && current.type !== data.type)
    return "Beneficiary type cannot be changed.";
  if (data.type === "INDIVIDUAL" && data.memberIds.length)
    return "Individuals cannot contain group members.";
  if (data.type === "GROUP") {
    const members = await Promise.all(
      data.memberIds.map((id) => getBeneficiaryByIdFromDB(id)),
    );
    if (members.some((member) => !member || member.type !== "INDIVIDUAL"))
      return "Groups may contain Individuals only.";
  }
};

export const createBeneficiary = async (data: BeneficiarySaveReqType) => {
  const prepared = prepareBeneficiary(data);
  const validationError = await validateBeneficiary(prepared);
  if (validationError) return validationError;
  await createBeneficiaryToDB(prepared);
};

export const updateBeneficiary = async (data: BeneficiaryUpdateReqType) => {
  const current = await getBeneficiaryByIdFromDB(data.id);
  if (!current) return "Beneficiary not found.";
  const prepared = prepareBeneficiary(data);
  const validationError = await validateBeneficiary(prepared, current);
  if (validationError) return validationError;
  await updateBeneficiaryToDB(prepared, getMonthKey());
};
