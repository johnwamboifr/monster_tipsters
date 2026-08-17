export const validateMatchId = (matchId) => {
  if (!matchId || String(matchId).trim() === "") {
    throw new Error("matchId is required.");
  }

  return String(matchId).trim();
};

export const validateLeagueId = (leagueId) => {
  if (!leagueId || String(leagueId).trim() === "") {
    throw new Error("leagueId is required.");
  }

  return String(leagueId).trim();
};

export const validateRequiredValue = (value, fieldName) => {
  if (value === undefined || value === null || String(value).trim() === "") {
    throw new Error(`${fieldName} is required.`);
  }

  return value;
};
