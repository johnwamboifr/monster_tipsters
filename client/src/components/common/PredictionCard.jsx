import { memo } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, Clock3, ChevronRight, Star, Zap } from "lucide-react";

const PredictionCard = memo(function PredictionCard({ prediction, onViewDetails }) {
  const leagueName = prediction?.league || "Football";
  const matchLabel = prediction?.match || `${prediction?.homeTeam || "Home"} vs ${prediction?.awayTeam || "Away"}`;
  const confidence = prediction?.confidence ?? 86;
  const odds = prediction?.odds ?? "2.05";
  const market = prediction?.market || "1X2";

  return (
    <article className="group rounded-[26px] border border-white/10 bg-slate-950/60 p-4 transition-all duration-200 hover:border-emerald-400/30 hover:bg-slate-950">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/10 text-[10px] font-bold uppercase tracking-[0.12em] text-emerald-300">
            {String(leagueName).slice(0, 2)}
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-[0.16em] text-slate-400">{leagueName}</p>
            <p className="mt-1 text-sm font-semibold text-white">{matchLabel}</p>
          </div>
        </div>
        <Badge variant="secondary">{prediction?.result || "Preview"}</Badge>
      </div>

      <div className="mt-4 flex items-center justify-between gap-2 rounded-2xl border border-white/8 bg-slate-900/70 p-3">
        <div>
          <p className="text-[10px] uppercase tracking-[0.14em] text-slate-400">Home</p>
          <p className="mt-1 text-sm font-semibold text-white">{prediction?.homeTeam || "Home team"}</p>
        </div>
        <div className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-emerald-300">vs</div>
        <div className="text-right">
          <p className="text-[10px] uppercase tracking-[0.14em] text-slate-400">Away</p>
          <p className="mt-1 text-sm font-semibold text-white">{prediction?.awayTeam || "Away team"}</p>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between text-xs text-slate-300">
        <span className="inline-flex items-center gap-1.5"><CalendarDays className="h-3.5 w-3.5 text-emerald-300" /> {prediction?.kickoffTime ? new Date(prediction.kickoffTime).toLocaleDateString() : "Today"}</span>
        <span className="inline-flex items-center gap-1.5"><Clock3 className="h-3.5 w-3.5 text-blue-300" /> {prediction?.kickoffTime ? new Date(prediction.kickoffTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "19:30"}</span>
      </div>

      <div className="mt-4 flex items-center justify-between gap-3 rounded-2xl border border-white/8 bg-slate-900/60 p-3">
        <div>
          <p className="text-[10px] uppercase tracking-[0.12em] text-slate-400">Pick</p>
          <p className="mt-1 text-sm font-semibold text-emerald-300">{prediction?.prediction}</p>
        </div>
        <div className="text-right">
          <p className="text-[10px] uppercase tracking-[0.12em] text-slate-400">Odds</p>
          <p className="mt-1 text-sm font-semibold text-white">{odds}</p>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 rounded-full border border-amber-500/25 bg-amber-500/10 px-2.5 py-1 text-[10px] font-medium text-amber-200">
          <Star className="h-3.5 w-3.5" />
          {confidence}%
        </div>
        <div className="flex items-center gap-2 rounded-full border border-blue-500/25 bg-blue-500/10 px-2.5 py-1 text-[10px] font-medium text-blue-200">
          <Zap className="h-3.5 w-3.5" />
          {market}
        </div>
      </div>

      <p className="mt-4 text-sm leading-6 text-slate-300">{prediction?.analysis || "A strong value play with a stable matchup and good form trends in the latest fixtures."}</p>

      <div className="mt-4 flex items-center justify-between">
        <span className="text-xs text-slate-400">{prediction?.isPublished ? "Published" : "Draft"}</span>
        <Button variant="ghost" size="sm" className="rounded-full px-2.5 text-xs text-slate-200 hover:text-white" onClick={() => onViewDetails?.(prediction?.fixtureId)}>
          View details <ChevronRight className="h-3.5 w-3.5" />
        </Button>
      </div>
    </article>
  );
});

export default PredictionCard;
