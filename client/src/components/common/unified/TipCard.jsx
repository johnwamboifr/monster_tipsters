import {
  CalendarDays,
  Clock,
  Trophy,
  Target,
  BarChart3,
  ShieldCheck,
  ArrowRight,
  CheckCircle2,
  XCircle,
  RotateCcw,
} from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const formatMarket = (market) => {
  if (!market) return "Prediction";

  const markets = {
    match_winner: "Match Winner",
    over_0_5: "Over 0.5",
    over_1_5: "Over 1.5",
    over_2_5: "Over 2.5",
    over_3_5: "Over 3.5",
    over_4_5: "Over 4.5",
    under_0_5: "Under 0.5",
    under_1_5: "Under 1.5",
    under_2_5: "Under 2.5",
    under_3_5: "Under 3.5",
    under_4_5: "Under 4.5",

    corners_over_8_5: "Corners Over 8.5",
    corners_over_9_5: "Corners Over 9.5",
    corners_over_10_5: "Corners Over 10.5",

    corners_under_8_5: "Corners Under 8.5",
    corners_under_9_5: "Corners Under 9.5",
    corners_under_10_5: "Corners Under 10.5",

    both_teams_to_score: "Both Teams To Score",
    btts: "Both Teams To Score",

    double_chance: "Double Chance",

    draw_no_bet: "Draw No Bet",

    home_win: "Home Win",
    away_win: "Away Win",

    first_half_winner: "First Half Winner",

    both_teams_to_score_yes: "BTTS - Yes",
    both_teams_to_score_no: "BTTS - No",
  };

  if (markets[market]) {
    return markets[market];
  }

  return String(market)
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
};

const formatDate = (date) => {
  if (!date) return "Date TBD";

  try {
    return new Date(date).toLocaleDateString(undefined, {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return date;
  }
};

const formatTime = (time) => {
  if (!time) return "TBD";

  try {
    const [hours, minutes] = String(time).split(":");

    const date = new Date();
    date.setHours(Number(hours), Number(minutes), 0, 0);

    return date.toLocaleTimeString(undefined, {
      hour: "numeric",
      minute: "2-digit",
    });
  } catch {
    return time;
  }
};

const getTipsTypeLabel = (tipsType) => {
  switch (String(tipsType || "free").toLowerCase()) {
    case "silver":
      return "Silver";

    case "bronze":
      return "Bronze";

    case "gold":
      return "Gold";

    default:
      return "Free";
  }
};

const getTipsTypeClass = (tipsType) => {
  switch (String(tipsType || "free").toLowerCase()) {
    case "gold":
      return "border-yellow-500/30 bg-yellow-500/10 text-yellow-300";

    case "bronze":
      return "border-orange-500/30 bg-orange-500/10 text-orange-300";

    case "silver":
      return "border-slate-400/30 bg-slate-400/10 text-slate-200";

    default:
      return "border-emerald-500/30 bg-emerald-500/10 text-emerald-300";
  }
};

const getResultStatus = (tip) => {
  if (tip?.isWon === true) {
    return {
      label: "Won",
      icon: CheckCircle2,
      className:
        "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
    };
  }

  if (tip?.isLost === true) {
    return {
      label: "Lost",
      icon: XCircle,
      className: "border-red-500/30 bg-red-500/10 text-red-300",
    };
  }

  if (tip?.isRefunded === true) {
    return {
      label: "Refunded",
      icon: RotateCcw,
      className:
        "border-yellow-500/30 bg-yellow-500/10 text-yellow-300",
    };
  }

  return null;
};

const TipCard = ({ tip, onViewDetails }) => {
  if (!tip) {
    return null;
  }

  const resultStatus = getResultStatus(tip);
  const ResultIcon = resultStatus?.icon;

  return (
    <Card className="group overflow-hidden border border-white/10 bg-slate-900/80 transition-all duration-300 hover:-translate-y-1 hover:border-emerald-400/30 hover:shadow-xl hover:shadow-emerald-500/5">
      {/* =====================================================
          HEADER
      ===================================================== */}

      <CardHeader className="space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <Trophy className="h-4 w-4 shrink-0 text-emerald-400" />

              <span className="truncate text-xs font-semibold uppercase tracking-wider text-emerald-400">
                {tip.league || "Football"}
              </span>
            </div>

            <h3 className="mt-2 line-clamp-2 text-base font-bold text-white sm:text-lg">
              {tip.match || "Match information unavailable"}
            </h3>
          </div>

          <Badge
            className={`shrink-0 border text-xs ${getTipsTypeClass(
              tip.tipsType
            )}`}
          >
            {getTipsTypeLabel(tip.tipsType)}
          </Badge>
        </div>

        {/* ===================================================
            DATE / TIME
        =================================================== */}

        <div className="flex flex-wrap gap-2 text-xs text-slate-400">
          <div className="flex items-center gap-1.5 rounded-md border border-white/5 bg-white/[0.03] px-2 py-1.5">
            <CalendarDays className="h-3.5 w-3.5 text-slate-500" />

            <span>{formatDate(tip.date)}</span>
          </div>

          <div className="flex items-center gap-1.5 rounded-md border border-white/5 bg-white/[0.03] px-2 py-1.5">
            <Clock className="h-3.5 w-3.5 text-slate-500" />

            <span>{formatTime(tip.time)}</span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* ===================================================
            MARKET
        =================================================== */}

        <div className="rounded-xl border border-white/10 bg-slate-950/60 p-4">
          <div className="flex items-center gap-2">
            <Target className="h-4 w-4 text-emerald-400" />

            <span className="text-xs font-medium uppercase tracking-wider text-slate-500">
              Market
            </span>
          </div>

          <p className="mt-2 text-sm font-semibold text-slate-200">
            {formatMarket(tip.market)}
          </p>

          <div className="mt-3 flex items-center justify-between gap-3">
            <div>
              <p className="text-xs text-slate-500">Prediction</p>

              <p className="mt-1 text-lg font-bold text-white">
                {tip.prediction || "N/A"}
              </p>
            </div>

            {tip.odds !== null &&
              tip.odds !== undefined &&
              tip.odds !== "" && (
                <div className="text-right">
                  <p className="text-xs text-slate-500">Odds</p>

                  <p className="mt-1 text-lg font-bold text-emerald-400">
                    {Number(tip.odds).toFixed(2)}
                  </p>
                </div>
              )}
          </div>
        </div>

        {/* ===================================================
            CONFIDENCE
        =================================================== */}

        {tip.confidence !== null &&
          tip.confidence !== undefined &&
          tip.confidence !== "" && (
            <div>
              <div className="mb-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-slate-500" />

                  <span className="text-xs text-slate-400">
                    Confidence
                  </span>
                </div>

                <span className="text-xs font-semibold text-white">
                  {tip.confidence}%
                </span>
              </div>

              <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-emerald-500 transition-all"
                  style={{
                    width: `${Math.min(
                      Math.max(Number(tip.confidence), 0),
                      100
                    )}%`,
                  }}
                />
              </div>
            </div>
          )}

        {/* ===================================================
            ANALYSIS
        =================================================== */}

        {tip.analysis && (
          <div className="rounded-lg border border-white/5 bg-white/[0.02] p-3">
            <div className="mb-1.5 flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-emerald-400" />

              <span className="text-xs font-semibold text-slate-300">
                Analysis
              </span>
            </div>

            <p className="line-clamp-3 text-xs leading-relaxed text-slate-400">
              {tip.analysis}
            </p>
          </div>
        )}

        {/* ===================================================
            RESULT
        =================================================== */}

        {resultStatus && (
          <div
            className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-semibold ${resultStatus.className}`}
          >
            {ResultIcon && <ResultIcon className="h-4 w-4" />}

            <span>Tip Result: {resultStatus.label}</span>
          </div>
        )}

        {/* ===================================================
            ACTION
        =================================================== */}

        {onViewDetails && (
          <Button
            type="button"
            onClick={() => onViewDetails(tip)}
            className="w-full rounded-full bg-emerald-600 text-white hover:bg-emerald-500"
          >
            View Details

            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default TipCard;
