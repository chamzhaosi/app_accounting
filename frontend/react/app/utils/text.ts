export const toTitleCase = (value: string): string => {
  return value
    .trim()
    .split(/\s+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
};

export const capitalizeFirst = (value: string): string =>
  `${value.charAt(0).toUpperCase()}${value.slice(1)}`;
