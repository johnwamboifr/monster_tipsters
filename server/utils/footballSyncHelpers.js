import dotenv from "dotenv";

dotenv.config();

export const normalizeString = (value) => (value ? String(value).trim() : null);

export const normalizeDate = (value) => {
  if (!value) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

export const canonicalizeSeason = (value) => {
  const raw = normalizeString(value);

  if (!raw) {
    return null;
  }

  const compact = raw.replace(/\s+/g, "").replace(/\\/g, "/");

  const plainYearMatch = compact.match(/^(20\d{2})$/);
  if (plainYearMatch) {
    const startYear = Number(plainYearMatch[1]);
    const nextYear = startYear + 1;
    return `${startYear}/${String(nextYear).slice(-2)}`;
  }

  const seasonMatch = compact.match(/^(20\d{2})[\/\-](\d{2,4})$/);
  if (seasonMatch) {
    const startYear = Number(seasonMatch[1]);
    const endYearPart = seasonMatch[2];
    const endYear = Number(endYearPart.length === 2 ? `20${endYearPart}` : endYearPart);

    if (Number.isFinite(endYear) && endYear <= startYear) {
      const nextYear = startYear + 1;
      return `${startYear}/${String(nextYear).slice(-2)}`;
    }

    return `${startYear}/${String(endYear).slice(-2)}`;
  }

  return compact;
};

export const getApplicationSeason = (seasonData) => {
  if (!seasonData) {
    return null;
  }

  const startDate = normalizeDate(seasonData.startDate);
  const endDate = normalizeDate(seasonData.endDate);

  if (startDate && endDate) {
    const startYear = startDate.getUTCFullYear();
    const endYear = endDate.getUTCFullYear();

    if (endYear >= startYear) {
      const formattedEndYear = String(endYear).slice(-2).padStart(2, "0");
      return canonicalizeSeason(`${startYear}/${formattedEndYear}`);
    }
  }

  const rawSeason = normalizeString(
    seasonData.season ?? seasonData.year ?? seasonData
  );

  if (rawSeason) {
    return canonicalizeSeason(rawSeason);
  }

  return null;
};

export const buildLog = (step, message, details = {}) => {
  console.log(`[football-sync] ${step}: ${message}`, details);
};

export const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
