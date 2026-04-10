export const nowIso = (): string => new Date().toISOString();

export const ageSecondsFrom = (value: Date): number => {
  return Math.max(0, Math.floor((Date.now() - value.getTime()) / 1000));
};
