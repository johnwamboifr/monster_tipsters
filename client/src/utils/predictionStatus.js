export const getPredictionStatusLabel = (fixture) => {
  const hasPrediction = Boolean(fixture?.prediction?.prediction || fixture?.prediction?.market);
  if (!hasPrediction) return "No Prediction";
  return fixture?.prediction?.publishedAt ? "Published" : "Draft";
};

export const getPredictionStatusVariant = (fixture) => {
  const hasPrediction = Boolean(fixture?.prediction?.prediction || fixture?.prediction?.market);
  if (!hasPrediction) {
    return "outline";
  }

  return fixture?.prediction?.publishedAt ? "default" : "secondary";
};

export const getPremiumVariant = (isPremium) =>
  isPremium ? "bg-amber-500/15 text-amber-700 dark:text-amber-300" : "bg-slate-500/15 text-slate-700 dark:text-slate-300";

export const getResultVariant = (result) => {
  switch (String(result || "pending").toLowerCase()) {
    case "won":
      return "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300";
    case "lost":
      return "bg-rose-500/15 text-rose-700 dark:text-rose-300";
    case "void":
      return "bg-slate-500/15 text-slate-700 dark:text-slate-300";
    default:
      return "bg-amber-500/15 text-amber-700 dark:text-amber-300";
  }
};
