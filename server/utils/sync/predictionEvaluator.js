import db from "../../models/index.js";
import { buildLog } from "../footballSyncHelpers.js";
import { settlePrediction } from "../marketSettlement.js";

const { Match, Prediction } = db;

const TERMINAL_MATCH_STATUSES = new Set([
  "FINISHED",
  "FT",
  "AET",
  "PEN",
  "COMPLETED",
  "ENDED",
  "DONE",
  "RESULT",
  "AWARDED",
  "CANCELLED",
  "CANCELED",
  "POSTPONED",
  "SUSPENDED",
]);

const isFinishedStatus = (
  status
) => {
  const normalized = String(
    status || ""
  )
    .trim()
    .toUpperCase();

  return TERMINAL_MATCH_STATUSES.has(
    normalized
  );
};

const resultForMarket = (
  market,
  prediction,
  homeScore,
  awayScore,
  status
) => {
  if (!isFinishedStatus(status)) {
    return "pending";
  }

  const outcome = settlePrediction({
    homeScore,
    awayScore,
    market,
    selection: prediction,
    status,
  });

  return outcome === "WON" ? "won" : outcome === "LOST" ? "lost" : outcome === "VOID" ? "void" : "pending";
};

export const evaluatePredictionResults =
  async (matchId) => {
    const match =
      await Match.findOne({
        where: {
          matchId,
        },
      });

    if (!match) {
      buildLog(
        "evaluatePredictionResults",
        `Match ${matchId} not found`
      );

      return {
        updated: 0,
        skipped: true,
      };
    }

    const predictions =
      await Prediction.findAll({
        where: {
          matchId,
        },
      });

    if (!predictions.length) {
      buildLog(
        "evaluatePredictionResults",
        `No predictions found for match ${matchId}`
      );

      return {
        updated: 0,
        skipped: true,
      };
    }

    const status = String(
  match.status || ""
).toUpperCase();

if (!isFinishedStatus(status)) {
  return {
    updated: 0,
    skipped: true,
  };
}

const rawHomeScore = match.homeScore;
const rawAwayScore = match.awayScore;

const hasHomeScore =
  rawHomeScore !== null &&
  rawHomeScore !== undefined &&
  rawHomeScore !== "";

const hasAwayScore =
  rawAwayScore !== null &&
  rawAwayScore !== undefined &&
  rawAwayScore !== "";

if (!hasHomeScore || !hasAwayScore) {
  buildLog(
    "evaluatePredictionResults",
    `Match ${matchId} is finished but score is unavailable`,
    {
      homeScore: rawHomeScore,
      awayScore: rawAwayScore,
      status,
    }
  );

  return {
    updated: 0,
    skipped: true,
    reason: "SCORE_UNAVAILABLE",
  };
}

const homeScore = Number(rawHomeScore);
const awayScore = Number(rawAwayScore);

if (
  !Number.isFinite(homeScore) ||
  !Number.isFinite(awayScore) ||
  homeScore < 0 ||
  awayScore < 0
) {
  buildLog(
    "evaluatePredictionResults",
    `Match ${matchId} has invalid scores`,
    {
      homeScore: rawHomeScore,
      awayScore: rawAwayScore,
      status,
    }
  );

  return {
    updated: 0,
    skipped: true,
    reason: "INVALID_SCORE",
  };
}


    let updated = 0;

    for (const prediction of predictions) {
      const derivedResult =
        resultForMarket(
          prediction.market,
          prediction.prediction,
          homeScore,
          awayScore,
          status
        );

      /*
       * Avoid unnecessary database writes
       * if the result hasn't changed.
       */
      if (
        prediction.result ===
        derivedResult
      ) {
        continue;
      }

      await prediction.update({
        result: derivedResult,
      });

      updated += 1;
    }

    buildLog(
      "evaluatePredictionResults",
      `Completed prediction evaluation for match ${matchId}`,
      {
        predictions: predictions.length,
        updated,
        homeScore,
        awayScore,
        status,
      }
    );

    return {
      updated,
      skipped: false,
    };
  };

export default evaluatePredictionResults;
