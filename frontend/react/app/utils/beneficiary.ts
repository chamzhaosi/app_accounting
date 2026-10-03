export const normalizeBeneficiaryName = (value: string) =>
  value
    .normalize("NFKC")
    .trim()
    .replace(/\s+/g, " ")
    .toLocaleLowerCase("en-US");

export const cleanBeneficiaryText = (value: string) =>
  value.normalize("NFKC").trim().replace(/\s+/g, " ");
