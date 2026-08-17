const PLAN_HIERARCHY = {
  FREE: 0,
  SILVER: 1,
  BRONZE: 2,
  GOLD: 3,
};

const PLAN_ENTITLEMENTS = {
  FREE: {
    freeTips: true,
    dailyExpertPredictions: false,
    standardOdds: false,
    twoToThreeOddsSlips: false,
    fiveOddsSlips: false,
    accumulators: false,
    higherValueSelections: false,
    priorityTips: false,
    premiumAnalysis: false,
    accessLevel: "FREE",
    rank: 0,
  },
  SILVER: {
    freeTips: true,
    dailyExpertPredictions: true,
    standardOdds: true,
    twoToThreeOddsSlips: false,
    fiveOddsSlips: false,
    accumulators: false,
    higherValueSelections: false,
    priorityTips: false,
    premiumAnalysis: true,
    accessLevel: "SILVER",
    rank: 1,
  },
  BRONZE: {
    freeTips: true,
    dailyExpertPredictions: true,
    standardOdds: true,
    twoToThreeOddsSlips: true,
    fiveOddsSlips: true,
    accumulators: true,
    higherValueSelections: false,
    priorityTips: false,
    premiumAnalysis: true,
    accessLevel: "BRONZE",
    rank: 2,
  },
  GOLD: {
    freeTips: true,
    dailyExpertPredictions: true,
    standardOdds: true,
    twoToThreeOddsSlips: true,
    fiveOddsSlips: true,
    accumulators: true,
    higherValueSelections: true,
    priorityTips: true,
    premiumAnalysis: true,
    accessLevel: "GOLD",
    rank: 3,
  },
};

export const normalizePlanName = (value) => {
  if (!value) {
    return "FREE";
  }

  const normalized = String(value).trim().toUpperCase();
  if (PLAN_HIERARCHY[normalized]) {
    return normalized;
  }

  const cleaned = normalized.replace(/\s+/g, "").replace(/[-_]+/g, "");
  if (cleaned === "SILVERPLAN") {
    return "SILVER";
  }
  if (cleaned === "BRONZEPLAN") {
    return "BRONZE";
  }
  if (cleaned === "GOLDPLAN") {
    return "GOLD";
  }
  if (cleaned === "FREEPLAN") {
    return "FREE";
  }

  return normalized.includes("SILVER") ? "SILVER" : normalized.includes("BRONZE") ? "BRONZE" : normalized.includes("GOLD") ? "GOLD" : "FREE";
};

export const getPlanRank = (plan) => PLAN_HIERARCHY[normalizePlanName(plan)] ?? 0;

export const canAccessPlan = (userPlan, requiredPlan) => {
  const userRank = getPlanRank(userPlan);
  const requiredRank = getPlanRank(requiredPlan);
  return userRank >= requiredRank;
};

export const getPlanEntitlements = (plan) => PLAN_ENTITLEMENTS[normalizePlanName(plan)] ?? PLAN_ENTITLEMENTS.FREE;

export default {
  PLAN_HIERARCHY,
  PLAN_ENTITLEMENTS,
  normalizePlanName,
  getPlanRank,
  canAccessPlan,
  getPlanEntitlements,
};
