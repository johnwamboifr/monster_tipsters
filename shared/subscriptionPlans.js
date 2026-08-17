const EXCHANGE_RATE_USD_TO_KES = 130; // 1 USD = 130 KES

const subscriptionPlans = [
  {
    id: "silver",
    name: "Silver Plan",
    shortName: "Silver",
    featured: false,
    userType: "premium",
    description:
      "Daily expert predictions — 2–3 odds range with premium match analysis.",

    // Subscription price
    amount: 20,
    amountUsd: 20,
    amountKes: 20 * EXCHANGE_RATE_USD_TO_KES,

    duration: "30 Days",
    durationDays: 30,
    access: "2–3 odds",

    features: [
      "Daily expert predictions",
      "2–3 odds range",
      "Premium match analysis",
    ],

    durations: {
      "30_days": {
        id: "30_days",
        label: "30 Days",
        days: 30,
        usd: 20,
        kes: 20 * EXCHANGE_RATE_USD_TO_KES,
      },
    },
  },

  {
    id: "bronze",
    name: "Bronze Plan",
    shortName: "Bronze",
    featured: false,
    userType: "premium",
    description:
      "Everything in Silver plus daily 2–3 & 5 odds slips and accumulator tips.",

    // Subscription price
    amount: 30,
    amountUsd: 30,
    amountKes: 30 * EXCHANGE_RATE_USD_TO_KES,

    duration: "30 Days",
    durationDays: 30,
    access: "2–3 & 5 odds",

    features: [
      "Everything in Silver",
      "Daily 2–3 & 5 odds slips",
      "Accumulator tips",
    ],

    durations: {
      "30_days": {
        id: "30_days",
        label: "30 Days",
        days: 30,
        usd: 30,
        kes: 30 * EXCHANGE_RATE_USD_TO_KES,
      },
    },
  },

  {
    id: "gold",
    name: "Gold Plan",
    shortName: "Gold",
    featured: true,
    userType: "premium",
    description:
      "Everything in Bronze plus higher-value premium selections and priority premium tips.",

    // Subscription price
    amount: 40,
    amountUsd: 40,
    amountKes: 40 * EXCHANGE_RATE_USD_TO_KES,

    duration: "30 Days",
    durationDays: 30,
    access: "2–3, 5 & higher-value selections",

    features: [
      "Everything in Bronze",
      "Higher-value premium selections",
      "Priority premium tips",
    ],

    durations: {
      "30_days": {
        id: "30_days",
        label: "30 Days",
        days: 30,
        usd: 40,
        kes: 40 * EXCHANGE_RATE_USD_TO_KES,
      },
    },
  },
];

export const SUBSCRIPTION_PLANS = Object.freeze(
  Object.fromEntries(subscriptionPlans.map((plan) => [plan.id, plan]))
);

/**
 * Resolve a plan that contains only one duration.
 */
const resolveSingleDurationPlan = (plan) => {
  if (!plan) {
    return null;
  }

  const durations = Object.values(plan.durations || {});

  if (durations.length !== 1) {
    return plan;
  }

  const duration = durations[0];

  return {
    ...plan,

    durationId: duration.id,
    duration: duration.label,
    durationDays: duration.days,

    // Keep amount as the USD amount for compatibility.
    amount: duration.usd,

    amountUsd: duration.usd,

    // PayHero uses the KES amount.
    amountKes:
      duration.kes ??
      duration.usd * EXCHANGE_RATE_USD_TO_KES,
  };
};

/**
 * Get a subscription plan by its ID.
 */
export const getSubscriptionPlanById = (planId) => {
  if (!planId) {
    return null;
  }

  const normalized = String(planId).trim().toLowerCase();

  const plan = SUBSCRIPTION_PLANS[normalized] || null;

  return resolveSingleDurationPlan(plan);
};

/**
 * Get a subscription plan by ID, name, or short name.
 */
export const getSubscriptionPlanByRef = (value) => {
  if (!value) {
    return null;
  }

  const normalized = String(value).trim().toLowerCase();

  const byId = getSubscriptionPlanById(normalized);

  if (byId) {
    return byId;
  }

  const plan = subscriptionPlans.find(
    (candidate) =>
      normalized === candidate.name.toLowerCase() ||
      normalized.includes(candidate.name.toLowerCase()) ||
      normalized === candidate.shortName.toLowerCase()
  );

  return resolveSingleDurationPlan(plan);
};

/**
 * Find a duration configuration inside a subscription plan.
 */
export const getSubscriptionDuration = (planId, duration) => {
  const plan = getSubscriptionPlanById(planId);

  if (!plan || !duration) {
    return null;
  }

  const normalizedDuration = String(duration)
    .trim()
    .toLowerCase()
    .replace(/-/g, "_")
    .replace(/\s+/g, "_");

  return plan.durations?.[normalizedDuration] || null;
};

/**
 * Resolve a complete subscription:
 * plan + duration.
 */
export const resolveSubscriptionPlan = ({
  planRef,
  selectedPlan,
  duration,
  amount,
} = {}) => {
  const plan =
    getSubscriptionPlanById(selectedPlan) ||
    getSubscriptionPlanById(planRef) ||
    getSubscriptionPlanByRef(planRef);

  if (!plan) {
    return null;
  }

  let selectedDuration = null;

  /**
   * Resolve by duration.
   */
  if (duration) {
    selectedDuration = getSubscriptionDuration(
      plan.id,
      duration
    );
  }

  /**
   * Resolve by USD amount.
   */
  if (
    !selectedDuration &&
    amount !== undefined &&
    amount !== null &&
    amount !== ""
  ) {
    const numericAmount = Number(amount);

    selectedDuration = Object.values(
      plan.durations || {}
    ).find(
      (entry) =>
        Number(entry.usd) === numericAmount
    );
  }

  /**
   * If the plan has only one duration,
   * automatically use it.
   */
  if (!selectedDuration) {
    const durations = Object.values(
      plan.durations || {}
    );

    if (durations.length === 1) {
      selectedDuration = durations[0];
    }
  }

  if (!selectedDuration) {
    return null;
  }

  /**
   * Validate supplied USD amount.
   */
  if (
    amount !== undefined &&
    amount !== null &&
    amount !== "" &&
    Number(amount) !== Number(selectedDuration.usd)
  ) {
    return null;
  }

  return {
    ...plan,

    durationId: selectedDuration.id,

    duration: selectedDuration.label,

    durationDays: selectedDuration.days,

    // USD amount
    amount: selectedDuration.usd,

    amountUsd: selectedDuration.usd,

    // KES amount sent to PayHero
    amountKes:
      selectedDuration.kes ??
      selectedDuration.usd *
        EXCHANGE_RATE_USD_TO_KES,
  };
};

/**
 * Legacy helper.
 *
 * Searches all plans and durations by USD amount.
 */
export const getSubscriptionPlanByAmount = (
  amount
) => {
  const numericAmount = Number(amount);

  if (!Number.isFinite(numericAmount)) {
    return null;
  }

  for (const plan of subscriptionPlans) {
    const duration = Object.values(
      plan.durations || {}
    ).find(
      (entry) =>
        Number(entry.usd) === numericAmount
    );

    if (duration) {
      return {
        ...plan,

        durationId: duration.id,

        duration: duration.label,

        durationDays: duration.days,

        amount: duration.usd,

        amountUsd: duration.usd,

        amountKes:
          duration.kes ??
          duration.usd *
            EXCHANGE_RATE_USD_TO_KES,
      };
    }
  }

  return null;
};

export default subscriptionPlans;
