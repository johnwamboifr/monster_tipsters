import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";

import {
  fetchSingleTip,
  clearSingleTip,
} from "@/features/slices/tipsSlice";

import PageHeader from "@/components/common/unified/PageHeader";
import LoadingSkeleton from "@/components/common/unified/LoadingSkeleton";
import ErrorState from "@/components/common/ErrorState";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

import {
  ArrowLeft,
  CalendarDays,
  Clock,
  Trophy,
  Target,
  BarChart3,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  RotateCcw,
} from "lucide-react";

const TipDetailsPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { tipId } = useParams();

  const tip = useSelector(
    (state) => state.tips?.singleTip
  );

  const loading = useSelector(
    (state) => state.tips?.status === "pending"
  );

  const error = useSelector(
    (state) => state.tips?.error
  );

  // ============================================================
  // FETCH TIP
  // ============================================================

  useEffect(() => {
    if (!tipId) {
      return;
    }

    dispatch(fetchSingleTip(tipId));

    return () => {
      dispatch(clearSingleTip());
    };
  }, [dispatch, tipId]);

  // ============================================================
  // FORMAT DATE
  // ============================================================

  const formatDate = (date) => {
    if (!date) {
      return "TBD";
    }

    try {
      return new Date(date).toLocaleDateString(
        "en-GB",
        {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }
      );
    } catch {
      return date;
    }
  };

  // ============================================================
  // FORMAT TIP TYPE
  // ============================================================

  const formatTipType = (type) => {
    if (!type) {
      return "FREE";
    }

    return String(type)
      .replace(/[_-]/g, " ")
      .replace(/\b\w/g, (char) =>
        char.toUpperCase()
      );
  };

  // ============================================================
  // TIP RESULT
  // ============================================================

  const getResult = () => {
    if (tip?.isWon === true) {
      return {
        label: "WON",
        className:
          "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
        icon: CheckCircle2,
      };
    }

    if (tip?.isLost === true) {
      return {
        label: "LOST",
        className:
          "bg-red-500/20 text-red-300 border-red-500/30",
        icon: XCircle,
      };
    }

    if (tip?.isRefunded === true) {
      return {
        label: "REFUNDED",
        className:
          "bg-amber-500/20 text-amber-300 border-amber-500/30",
        icon: RotateCcw,
      };
    }

    return {
      label: "PENDING",
      className:
        "bg-blue-500/20 text-blue-300 border-blue-500/30",
      icon: Clock,
    };
  };

  // ============================================================
  // LOADING
  // ============================================================

  if (loading) {
    return (
      <div className="space-y-6">

        <PageHeader
          eyebrow="Tip Details"
          title="Loading tip..."
          description="Please wait while we load the selected tip."
        />

        <LoadingSkeleton count={3} />

      </div>
    );
  }

  // ============================================================
  // ERROR
  // ============================================================

  if (error) {
    return (
      <div className="space-y-6">

        <Button
          variant="ghost"
          className="text-slate-300 hover:text-white"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        <ErrorState
          title="Unable to load tip"
          message={error}
          onRetry={() =>
            dispatch(fetchSingleTip(tipId))
          }
        />

      </div>
    );
  }

  // ============================================================
  // TIP NOT FOUND
  // ============================================================

  if (!tip) {
    return (
      <div className="space-y-6">

        <Button
          variant="ghost"
          className="text-slate-300 hover:text-white"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        <Card className="border-white/10 bg-slate-900/80">
          <CardContent className="py-12 text-center">

            <Target className="mx-auto h-12 w-12 text-slate-500" />

            <h2 className="mt-4 text-xl font-semibold text-white">
              Tip not found
            </h2>

            <p className="mt-2 text-sm text-slate-400">
              The tip you are looking for does not exist
              or is no longer available.
            </p>

            <Button
              className="mt-6"
              onClick={() => navigate(-1)}
            >
              Go Back
            </Button>

          </CardContent>
        </Card>

      </div>
    );
  }

  const result = getResult();
  const ResultIcon = result.icon;

  // ============================================================
  // PAGE
  // ============================================================

  return (
    <div className="space-y-6">

      {/* ========================================================
          BACK BUTTON
      ======================================================== */}

      <Button
        variant="ghost"
        className="text-slate-300 hover:text-white"
        onClick={() => navigate(-1)}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Tips
      </Button>

      {/* ========================================================
          HEADER
      ======================================================== */}

      <PageHeader
        eyebrow="Tip Details"
        title={tip.match || "Football Tip"}
        description={
          tip.analysis ||
          "Detailed match prediction and betting information."
        }
      />

      {/* ========================================================
          MATCH HEADER
      ======================================================== */}

      <Card className="overflow-hidden border-white/10 bg-slate-900/80">

        <CardHeader className="border-b border-white/10">

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

            <div>

              <div className="flex flex-wrap items-center gap-2">

                {tip.league && (
                  <Badge
                    variant="outline"
                    className="
                      border-blue-500/30
                      bg-blue-500/10
                      text-blue-300
                    "
                  >
                    <Trophy className="mr-1.5 h-3.5 w-3.5" />
                    {tip.league}
                  </Badge>
                )}

                <Badge
                  variant="outline"
                  className="
                    border-purple-500/30
                    bg-purple-500/10
                    text-purple-300
                  "
                >
                  {formatTipType(tip.tipsType)}
                </Badge>

              </div>

              <CardTitle className="mt-3 text-xl sm:text-2xl text-white">
                {tip.match || "Home vs Away"}
              </CardTitle>

            </div>

            <Badge
              variant="outline"
              className={`
                w-fit
                ${result.className}
              `}
            >
              <ResultIcon className="mr-1.5 h-4 w-4" />
              {result.label}
            </Badge>

          </div>

        </CardHeader>

        <CardContent className="p-4 sm:p-6">

          <div className="grid gap-3 sm:grid-cols-3">

            {/* DATE */}

            <div
              className="
                rounded-xl
                border
                border-white/10
                bg-slate-950/40
                p-4
              "
            >

              <div className="flex items-center gap-2 text-slate-400">

                <CalendarDays className="h-4 w-4" />

                <span className="text-xs uppercase tracking-wide">
                  Date
                </span>

              </div>

              <p className="mt-2 font-semibold text-white">
                {formatDate(tip.date)}
              </p>

            </div>

            {/* TIME */}

            <div
              className="
                rounded-xl
                border
                border-white/10
                bg-slate-950/40
                p-4
              "
            >

              <div className="flex items-center gap-2 text-slate-400">

                <Clock className="h-4 w-4" />

                <span className="text-xs uppercase tracking-wide">
                  Kickoff
                </span>

              </div>

              <p className="mt-2 font-semibold text-white">
                {tip.time || "TBD"}
              </p>

            </div>

            {/* SOURCE */}

            <div
              className="
                rounded-xl
                border
                border-white/10
                bg-slate-950/40
                p-4
              "
            >

              <div className="flex items-center gap-2 text-slate-400">

                <ShieldCheck className="h-4 w-4" />

                <span className="text-xs uppercase tracking-wide">
                  Source
                </span>

              </div>

              <p className="mt-2 font-semibold capitalize text-white">
                {tip.source || "Manual"}
              </p>

            </div>

          </div>

        </CardContent>

      </Card>

      {/* ========================================================
          MAIN CONTENT
      ======================================================== */}

      <div className="grid gap-6 lg:grid-cols-3">

        {/* ======================================================
            PREDICTION
        ====================================================== */}

        <Card className="lg:col-span-2 border-white/10 bg-slate-900/80">

          <CardHeader>

            <CardTitle className="flex items-center gap-2 text-white">

              <Target className="h-5 w-5 text-emerald-400" />

              Betting Tip

            </CardTitle>

          </CardHeader>

          <CardContent className="space-y-5">

            {/* MARKET */}

            <div>

              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Market
              </p>

              <p className="mt-1 text-sm text-slate-300">
                {tip.market || "Match Prediction"}
              </p>

            </div>

            <Separator className="bg-white/10" />

            {/* PREDICTION */}

            <div
              className="
                rounded-2xl
                border
                border-emerald-500/30
                bg-emerald-500/10
                p-5
              "
            >

              <p className="text-xs font-medium uppercase tracking-wide text-emerald-400">
                Prediction
              </p>

              <p className="mt-2 text-2xl font-bold text-white">
                {tip.prediction || "No prediction"}
              </p>

            </div>

            {/* ANALYSIS */}

            {tip.analysis && (
              <div>

                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  Analysis
                </p>

                <p className="mt-2 whitespace-pre-line text-sm leading-7 text-slate-300">
                  {tip.analysis}
                </p>

              </div>
            )}

          </CardContent>

        </Card>

        {/* ======================================================
            ODDS / CONFIDENCE
        ====================================================== */}

        <Card className="border-white/10 bg-slate-900/80">

          <CardHeader>

            <CardTitle className="flex items-center gap-2 text-white">

              <BarChart3 className="h-5 w-5 text-emerald-400" />

              Tip Statistics

            </CardTitle>

          </CardHeader>

          <CardContent className="space-y-4">

            {/* ODDS */}

            <div
              className="
                rounded-xl
                border
                border-white/10
                bg-slate-950/40
                p-4
              "
            >

              <p className="text-xs uppercase tracking-wide text-slate-500">
                Odds
              </p>

              <p className="mt-1 text-2xl font-bold text-white">
                {tip.odds
                  ? Number(tip.odds).toFixed(2)
                  : "N/A"}
              </p>

            </div>

            {/* CONFIDENCE */}

            <div
              className="
                rounded-xl
                border
                border-white/10
                bg-slate-950/40
                p-4
              "
            >

              <p className="text-xs uppercase tracking-wide text-slate-500">
                Confidence
              </p>

              <p className="mt-1 text-2xl font-bold text-white">
                {tip.confidence !== null &&
                tip.confidence !== undefined
                  ? `${tip.confidence}%`
                  : "N/A"}
              </p>

              {tip.confidence !== null &&
                tip.confidence !== undefined && (
                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-800">

                    <div
                      className="h-full rounded-full bg-emerald-500"
                      style={{
                        width: `${Math.min(
                          Math.max(
                            Number(tip.confidence),
                            0
                          ),
                          100
                        )}%`,
                      }}
                    />

                  </div>
                )}

            </div>

          </CardContent>

        </Card>

      </div>

      {/* ========================================================
          MATCH RESULT
      ======================================================== */}

      {(tip.homeScore !== null ||
        tip.awayScore !== null ||
        tip.halfTimeHomeScore !== null ||
        tip.halfTimeAwayScore !== null ||
        tip.homeCorners !== null ||
        tip.awayCorners !== null ||
        tip.homeBookings !== null ||
        tip.awayBookings !== null) && (

        <Card className="border-white/10 bg-slate-900/80">

          <CardHeader>

            <CardTitle className="text-white">
              Match Statistics
            </CardTitle>

          </CardHeader>

          <CardContent>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">

              {/* FULL TIME */}

              {(tip.homeScore !== null ||
                tip.awayScore !== null) && (

                <div
                  className="
                    rounded-xl
                    border
                    border-white/10
                    bg-slate-950/40
                    p-4
                  "
                >

                  <p className="text-xs uppercase tracking-wide text-slate-500">
                    Full Time
                  </p>

                  <p className="mt-2 text-xl font-bold text-white">
                    {tip.homeScore ?? "-"}{" "}
                    -{" "}
                    {tip.awayScore ?? "-"}
                  </p>

                </div>

              )}

              {/* HALF TIME */}

              {(tip.halfTimeHomeScore !== null ||
                tip.halfTimeAwayScore !== null) && (

                <div
                  className="
                    rounded-xl
                    border
                    border-white/10
                    bg-slate-950/40
                    p-4
                  "
                >

                  <p className="text-xs uppercase tracking-wide text-slate-500">
                    Half Time
                  </p>

                  <p className="mt-2 text-xl font-bold text-white">
                    {tip.halfTimeHomeScore ?? "-"}{" "}
                    -{" "}
                    {tip.halfTimeAwayScore ?? "-"}
                  </p>

                </div>

              )}

              {/* CORNERS */}

              {(tip.homeCorners !== null ||
                tip.awayCorners !== null) && (

                <div
                  className="
                    rounded-xl
                    border
                    border-white/10
                    bg-slate-950/40
                    p-4
                  "
                >

                  <p className="text-xs uppercase tracking-wide text-slate-500">
                    Corners
                  </p>

                  <p className="mt-2 text-xl font-bold text-white">
                    {tip.homeCorners ?? "-"}{" "}
                    -{" "}
                    {tip.awayCorners ?? "-"}
                  </p>

                </div>

              )}

              {/* BOOKINGS */}

              {(tip.homeBookings !== null ||
                tip.awayBookings !== null) && (

                <div
                  className="
                    rounded-xl
                    border
                    border-white/10
                    bg-slate-950/40
                    p-4
                  "
                >

                  <p className="text-xs uppercase tracking-wide text-slate-500">
                    Bookings
                  </p>

                  <p className="mt-2 text-xl font-bold text-white">
                    {tip.homeBookings ?? "-"}{" "}
                    -{" "}
                    {tip.awayBookings ?? "-"}
                  </p>

                </div>

              )}

            </div>

          </CardContent>

        </Card>

      )}

    </div>
  );
};

export default TipDetailsPage;
