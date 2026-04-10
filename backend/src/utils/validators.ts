export const clampLimit = (
  value: number | undefined,
  min: number,
  max: number,
  fallback: number,
): number => {
  if (value === undefined || !Number.isFinite(value)) {
    return fallback;
  }
  return Math.min(max, Math.max(min, Math.floor(value)));
};

export const hasMinimumItems = (
  itemsCount: number,
  minimum: number,
): boolean => {
  return itemsCount >= minimum;
};
