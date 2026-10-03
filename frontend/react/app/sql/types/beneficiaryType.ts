export type BeneficiaryType = "INDIVIDUAL" | "GROUP";

export type BeneficiaryRspType = {
  id: string;
  type: BeneficiaryType;
  icon: string;
  name: string;
  normalized_name: string;
  relationship: string | null;
  descriptions: string | null;
  is_active: boolean;
  is_self: boolean;
  member_ids: string[];
};

export type BeneficiarySaveReqType = {
  type: BeneficiaryType;
  icon: string;
  name: string;
  normalizedName: string;
  relationship?: string;
  descriptions?: string;
  isActive: boolean;
  memberIds: string[];
};

export type BeneficiaryUpdateReqType = BeneficiarySaveReqType & {
  id: string;
};

export type BeneficiaryFilterOptionType = Pick<
  BeneficiaryRspType,
  "id" | "type" | "icon" | "name" | "is_active" | "is_self"
> &
  Partial<Pick<BeneficiaryRspType, "relationship" | "descriptions">>;
