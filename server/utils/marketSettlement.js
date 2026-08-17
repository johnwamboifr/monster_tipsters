const MARKET_ALIASES = {
  MATCH_WINNER: "MATCH_WINNER",
  MATCHWINNER: "MATCH_WINNER",
  "1X2": "MATCH_WINNER",
  HOME_WIN: "MATCH_WINNER",
  AWAY_WIN: "MATCH_WINNER",
  DOUBLE_CHANCE: "DOUBLE_CHANCE",
  DC1X: "DOUBLE_CHANCE",
  DCX2: "DOUBLE_CHANCE",
  DC12: "DOUBLE_CHANCE",
  TOTAL_GOALS: "TOTAL_GOALS",
  GOALS: "TOTAL_GOALS",
  OVER_UNDER: "TOTAL_GOALS",
  BTTS: "BTTS",
  BOTH_TEAMS_TO_SCORE: "BTTS",
  BOTHTEAMSTOSCORE: "BTTS",
  GG: "BTTS",
  NG: "BTTS",
  HOME_TEAM_TOTAL_GOALS: "HOME_TEAM_TOTAL_GOALS",
  AWAY_TEAM_TOTAL_GOALS: "AWAY_TEAM_TOTAL_GOALS",
  DRAW_NO_BET: "DRAW_NO_BET",
  DNB: "DRAW_NO_BET",
  CORRECT_SCORE: "CORRECT_SCORE",
  CORRECTSCORE: "CORRECT_SCORE",
};

const normalizeText = (value) => {
  if (value === null || value === undefined) {
    return "";
  }

  return String(value).trim();
};

export const canonicalizeSeason = (value) => {
  const raw = normalizeText(value);

  if (!raw) {
    return null;
  }

  const compact = raw.replace(/\s+/g, "").replace(/\\/g, "/");
  const plainYearMatch = compact.match(/^(\d{4})$/);

  if (plainYearMatch) {
    const startYear = Number(plainYearMatch[1]);
    const nextYear = startYear + 1;
    return `${startYear}/${String(nextYear).slice(-2)}`;
  }

  const seasonMatch = compact.match(/^(\d{4})[-/](\d{2,4})$/);

  if (seasonMatch) {
    const startYear = Number(seasonMatch[1]);
    const endYearValue = seasonMatch[2];
    const endYear = Number(endYearValue.length === 2 ? `20${endYearValue}` : endYearValue);

    if (Number.isFinite(endYear) && endYear <= startYear) {
      const nextYear = startYear + 1;
      return `${startYear}/${String(nextYear).slice(-2)}`;
    }

    return `${startYear}/${String(endYear).slice(-2)}`;
  }

  return raw;
};

export const normalizeMarketName = (market) => {
  const raw = normalizeText(market).toUpperCase();

  if (!raw) {
    return "";
  }

  const collapsed = raw.replace(/[^A-Z0-9]+/g, "");
  const normalized = raw
    .replace(/\s+/g, "_")
    .replace(/[^A-Z0-9_.]+/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_|_$/g, "");

  if (!normalized) {
    return "";
  }

  if (MARKET_ALIASES[normalized]) {
    return MARKET_ALIASES[normalized];
  }

  const direct = normalized.replace(/\./g, "");
  if (MARKET_ALIASES[direct]) {
    return MARKET_ALIASES[direct];
  }

  if (raw.includes("MATCH") && raw.includes("WINNER")) {
    return "MATCH_WINNER";
  }

  if (raw.includes("DOUBLE") && raw.includes("CHANCE")) {
    return "DOUBLE_CHANCE";
  }

  if ((raw.includes("OVER") || raw.includes("UNDER")) && (raw.includes("GOAL") || /\d/.test(raw))) {
    return "TOTAL_GOALS";
  }

  if ((raw.includes("TOTAL") && raw.includes("GOAL")) || raw.includes("GOALS")) {
    return "TOTAL_GOALS";
  }

  if (raw.includes("TEAM") && raw.includes("GOAL")) {
    if (raw.includes("HOME")) {
      return "HOME_TEAM_TOTAL_GOALS";
    }
    if (raw.includes("AWAY")) {
      return "AWAY_TEAM_TOTAL_GOALS";
    }
  }

  if (collapsed.includes("BTTS") || raw.includes("BOTH") || raw.includes("GG") || raw.includes("NG")) {
    return "BTTS";
  }

  if (raw.includes("DNB")) {
    return "DRAW_NO_BET";
  }

  if (raw.includes("CORRECT") && raw.includes("SCORE")) {
    return "CORRECT_SCORE";
  }

  return normalized;
};

export const normalizeSelection = (selection, market) => {
  const raw = normalizeText(selection);

  if (!raw) {
    return "";
  }

  const marketName = normalizeMarketName(market);
  const upper = raw.toUpperCase();
  const clean = upper.replace(/[_\s-]+/g, "");

  /*
   * =========================================================
   * BTTS
   *
   * Database/UI may store:
   * Yes, YES, GG, BTTS, Both Teams To Score
   * No, NO, NG, NBTTS, No Both Teams To Score
   *
   * Normalize them to:
   * GG = Yes
   * NG = No
   * =========================================================
   */

  if (marketName === "BTTS") {
    if (
      [
        "YES",
        "Y",
        "GG",
        "BTTS",
        "BOTHTEAMSTOSCORE",
        "BOTHTEAMSTOSCOREYES",
      ].includes(clean)
    ) {
      return "GG";
    }

    if (
      [
        "NO",
        "N",
        "NG",
        "NBTTS",
        "NOBOTHTEAMSTOSCORE",
        "NOBOTHTEAMSTOSCORENO",
      ].includes(clean)
    ) {
      return "NG";
    }
  }

  if (["HOME", "H", "1"].includes(clean)) {
    return "HOME";
  }

  if (["DRAW", "D", "X"].includes(clean)) {
    return "DRAW";
  }

  if (["AWAY", "A", "2"].includes(clean)) {
    return "AWAY";
  }

  if (clean.includes("DC1X") || (clean.includes("1X") && clean.includes("D") && !clean.includes("2"))) {
    return "DC1X";
  }

  if (clean.includes("DCX2") || clean.includes("X2")) {
    return "DCX2";
  }

  if (clean.includes("DC12") || clean.includes("12")) {
    return "DC12";
  }

  const thresholdMatch = clean.match(/(OV|UNDER|UN|OVER|HOMEOV|AWAYOV|HOMEUNDER|AWAYUNDER|HOMEUN|AWAYUN|HOMEOVER|AWAYOVER)(\d+(?:[.,]\d+)?)/i);
  const threshold = thresholdMatch ? thresholdMatch[2].replace(",", ".") : null;

  if (clean.startsWith("OV") || clean.startsWith("OVER")) {
    const value = threshold || clean.replace(/^(OV|OVER)/, "");
    return `OV${value.includes(".") ? value : value.replace(/^(\d+)(\d)$/, "$1.$2")}`;
  }

  if (clean.startsWith("UN") || clean.startsWith("UNDER")) {
    const value = threshold || clean.replace(/^(UN|UNDER)/, "");
    return `UN${value.includes(".") ? value : value.replace(/^(\d+)(\d)$/, "$1.$2")}`;
  }

  if (clean.includes("HOME") && threshold && (clean.includes("OV") || clean.includes("OVER") || clean.includes("UN") || clean.includes("UNDER"))) {
    return `HOME_${clean.includes("OV") || clean.includes("OVER") ? `OV${threshold}` : `UN${threshold}`}`;
  }

  if (clean.includes("AWAY") && threshold && (clean.includes("OV") || clean.includes("OVER") || clean.includes("UN") || clean.includes("UNDER"))) {
    return `AWAY_${clean.includes("OV") || clean.includes("OVER") ? `OV${threshold}` : `UN${threshold}`}`;
  }

  if (["GG", "BOTHTEAMSSTOSCORE", "BTTS"].includes(clean)) {
    return "GG";
  }

  if (["NG", "NOBOTHTEAMSTOSCORE", "NBTTS"].includes(clean)) {
    return "NG";
  }

  if (clean.includes("DNB")) {
    return clean.includes("HOME") ? "DNB_HOME" : clean.includes("AWAY") ? "DNB_AWAY" : "DNB_HOME";
  }

  if (marketName === "CORRECT_SCORE") {
    const score = raw.replace(/\s+/g, "").replace(/_/g, "").replace(/-/g, "-");
    return score;
  }

  if (/^\d+[-:]\d+$/.test(raw.replace(/\s+/g, ""))) {
    return raw.replace(/\s+/g, "").replace(":", "-");
  }

  return clean;
};

const isThresholdSelection = (selection, threshold) => {
  const normalized = normalizeSelection(selection, "TOTAL_GOALS");

  if (normalized.startsWith("OV")) {
    const value = Number(normalized.replace("OV", ""));
    return value === threshold;
  }

  if (normalized.startsWith("UN")) {
    const value = Number(normalized.replace("UN", ""));
    return value === threshold;
  }

  return false;
};

const settleTotalGoals = (homeScore, awayScore, selection) => {
  const totalGoals = homeScore + awayScore;
  const normalized = normalizeSelection(selection, "TOTAL_GOALS");

  if (normalized.startsWith("OV")) {
    const threshold = Number(normalized.replace("OV", ""));
    return totalGoals > threshold ? "WON" : "LOST";
  }

  if (normalized.startsWith("UN")) {
    const threshold = Number(normalized.replace("UN", ""));
    return totalGoals < threshold ? "WON" : "LOST";
  }

  return "LOST";
};

const settleTeamGoals = (teamScore, selection) => {
  const normalized = normalizeSelection(selection, "HOME_TEAM_TOTAL_GOALS");
  const clean = normalized.replace(/^HOME_|^AWAY_/, "");

  if (clean.startsWith("OV")) {
    const threshold = Number(clean.replace("OV", ""));
    return teamScore > threshold ? "WON" : "LOST";
  }

  if (clean.startsWith("UN")) {
    const threshold = Number(clean.replace("UN", ""));
    return teamScore < threshold ? "WON" : "LOST";
  }

  return "LOST";
};

export const settlePrediction = ({ homeScore, awayScore, market, selection, status }) => {
  if (status && String(status).toUpperCase() !== "FINISHED" && String(status).toUpperCase() !== "FT" && String(status).toUpperCase() !== "AET" && String(status).toUpperCase() !== "PEN" && String(status).toUpperCase() !== "COMPLETED") {
    return "PENDING";
  }

  const marketName = normalizeMarketName(market);
  const selectionName = normalizeSelection(selection, marketName);

  if (marketName === "MATCH_WINNER") {
    const outcome = homeScore > awayScore ? "HOME" : awayScore > homeScore ? "AWAY" : "DRAW";
    if (selectionName === outcome) {
      return "WON";
    }
    return "LOST";
  }

  if (marketName === "DOUBLE_CHANCE") {
    if (selectionName === "DC1X") {
      return homeScore >= awayScore ? "WON" : "LOST";
    }

    if (selectionName === "DCX2") {
      return awayScore >= homeScore ? "WON" : "LOST";
    }

    if (selectionName === "DC12") {
      return homeScore !== awayScore ? "WON" : "LOST";
    }

    return "LOST";
  }

  if (marketName === "TOTAL_GOALS") {
    return settleTotalGoals(homeScore, awayScore, selectionName);
  }

  if (marketName === "BTTS") {
    const bothScores = homeScore > 0 && awayScore > 0;
    return selectionName === "GG" ? (bothScores ? "WON" : "LOST") : (bothScores ? "LOST" : "WON");
  }

  if (marketName === "HOME_TEAM_TOTAL_GOALS") {
    return settleTeamGoals(homeScore, selectionName);
  }

  if (marketName === "AWAY_TEAM_TOTAL_GOALS") {
    return settleTeamGoals(awayScore, selectionName);
  }

  if (marketName === "DRAW_NO_BET") {
    if (homeScore === awayScore) {
      return "VOID";
    }

    if ((selectionName === "DNB_HOME" && homeScore > awayScore) || (selectionName === "DNB_AWAY" && awayScore > homeScore)) {
      return "WON";
    }

    return "LOST";
  }

  if (marketName === "CORRECT_SCORE") {
    const expected = normalizeSelection(selectionName, marketName);
    const actual = `${homeScore}-${awayScore}`;
    return actual === expected ? "WON" : "LOST";
  }

  if (selectionName === "HOME") {
    return homeScore > awayScore ? "WON" : "LOST";
  }

  if (selectionName === "AWAY") {
    return awayScore > homeScore ? "WON" : "LOST";
  }

  if (selectionName === "DRAW") {
    return homeScore === awayScore ? "WON" : "LOST";
  }

  return "LOST";
};

export default {
  canonicalizeSeason,
  normalizeMarketName,
  normalizeSelection,
  settlePrediction,
};
