import { memo } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CalendarDays, Clock3, Sparkles } from "lucide-react";

const PredictionCard = memo(function PredictionCard({ prediction, onViewDetails, compact = false }) {
  const displayPrediction = prediction || {};
  const matchTitle = `${displayPrediction.homeTeam || "Home"} vs ${displayPrediction.awayTeam || "Away"}`;

  if (compact) {
    return (
      <article className="rounded-[24px] border border-white/10 bg-slate-900/70 p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[10px] uppercase tracking-[0.18em] text-slate-400">{displayPrediction.league || "Fixture"}</p>
            <h3 className="mt-1 text-sm font-semibold text-white">{matchTitle}</h3>
          </div>
          <Badge variant="secondary">{displayPrediction.isPremium ? "Premium" : "Free"}</Badge>
        </div>
        <p className="mt-3 text-sm text-slate-300">{displayPrediction.prediction || "Prediction available soon."}</p>
        <div className="mt-4 flex items-center justify-between text-xs text-slate-400">
          <span>{displayPrediction.kickoffTime ? new Date(displayPrediction.kickoffTime).toLocaleDateString() : "Today"}</span>
          <Button variant="ghost" size="sm" className="rounded-full px-2.5 text-xs" onClick={() => onViewDetails?.(displayPrediction.fixtureId)}>
            View
          </Button>
        </div>
      </article>
    );
  }

  return (
    <article className="rounded-[28px] border border-white/10 bg-slate-900/80 p-5 shadow-[0_18px_45px_rgba(15,23,42,0.16)]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400">{displayPrediction.league || "Football"}</p>
          <h3 className="mt-2 text-lg font-semibold text-white">{matchTitle}</h3>
        </div>
        <Badge variant="secondary">{displayPrediction.result || "Preview"}</Badge>
      </div>

      <div className="mt-4 flex items-center gap-2 rounded-2xl border border-white/8 bg-slate-950/60 px-3 py-2 text-sm text-slate-300">
        <Sparkles className="h-4 w-4 text-emerald-300" />
        <span>{displayPrediction.prediction || "Prediction pending"}</span>
      </div>

      <div className="mt-4 grid gap-3 text-sm text-slate-400 sm:grid-cols-2">
        <div className="rounded-2xl border border-white/8 bg-slate-950/50 p-3">
          <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.2em]">
            <CalendarDays className="h-3.5 w-3.5 text-emerald-300" /> Date
          </div>
          <p className="mt-2 text-sm font-medium text-white">{displayPrediction.kickoffTime ? new Date(displayPrediction.kickoffTime).toLocaleDateString() : "Today"}</p>
        </div>
        <div className="rounded-2xl border border-white/8 bg-slate-950/50 p-3">
          <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.2em]">
            <Clock3 className="h-3.5 w-3.5 text-blue-300" /> Kickoff
          </div>
          <p className="mt-2 text-sm font-medium text-white">{displayPrediction.kickoffTime ? new Date(displayPrediction.kickoffTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "TBD"}</p>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <span className="text-xs text-slate-400">{displayPrediction.market || "Match Winner"}</span>
        <Button variant="ghost" size="sm" className="rounded-full px-2.5 text-xs" onClick={() => onViewDetails?.(displayPrediction.fixtureId)}>
          View details
        </Button>
      </div>
    </article>
  );
});

export default PredictionCard;
