export const parseStars = (raw: string): number => {
  const cleaned = raw.trim().replaceAll(",", "").toLowerCase();

  if (!cleaned) {
    return 0;
  }

  if (cleaned.endsWith("k")) {
    const num = Number(cleaned.slice(0, -1));
    return Number.isFinite(num) ? Math.round(num * 1000) : 0;
  }

  if (cleaned.endsWith("m")) {
    const num = Number(cleaned.slice(0, -1));
    return Number.isFinite(num) ? Math.round(num * 1000000) : 0;
  }

  const parsed = Number(cleaned);
  return Number.isFinite(parsed) ? Math.round(parsed) : 0;
};
