import { memo } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CalendarDays, Clock3, Trophy } from "lucide-react";

const FixtureCard = memo(function FixtureCard({ fixture, onViewDetails }) {
  const kickoff = fixture?.kickoffTime ? new Date(fixture.kickoffTime) : null;

  return (
    <article className="rounded-[28px] border border-white/10 bg-slate-900/80 p-5 shadow-[0_18px_45px_rgba(15,23,42,0.14)]">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-slate-400">
          <Trophy className="h-3.5 w-3.5 text-emerald-300" />
          <span>{fixture?.league || "League"}</span>
        </div>
        <Badge variant="secondary">{String(fixture?.status || "SCHEDULED").toUpperCase()}</Badge>
      </div>

      <div className="mt-4 flex items-center justify-between gap-3 rounded-2xl border border-white/8 bg-slate-950/60 p-3 text-sm text-white">
        <div className="min-w-0">
          <p className="text-[10px] uppercase tracking-[0.16em] text-slate-400">Home</p>
          <p className="mt-1 truncate font-semibold">{fixture?.homeTeam || "Home"}</p>
        </div>
        <div className="px-2 text-xs uppercase tracking-[0.2em] text-slate-400">vs</div>
        <div className="min-w-0 text-right">
          <p className="text-[10px] uppercase tracking-[0.16em] text-slate-400">Away</p>
          <p className="mt-1 truncate font-semibold">{fixture?.awayTeam || "Away"}</p>
        </div>
      </div>

      <div className="mt-4 grid gap-2 rounded-2xl border border-white/8 bg-slate-950/50 p-3 text-sm text-slate-300">
        <div className="flex items-center justify-between gap-2">
          <span className="inline-flex items-center gap-2"><CalendarDays className="h-3.5 w-3.5 text-emerald-300" /> Date</span>
          <span>{kickoff ? kickoff.toLocaleDateString() : "TBD"}</span>
        </div>
        <div className="flex items-center justify-between gap-2">
          <span className="inline-flex items-center gap-2"><Clock3 className="h-3.5 w-3.5 text-blue-300" /> Kickoff</span>
          <span>{kickoff ? kickoff.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "TBD"}</span>
        </div>
      </div>

      {fixture?.prediction ? (
        <div className="mt-4 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-3 text-sm text-emerald-200">
          <p className="text-[10px] uppercase tracking-[0.18em]">Prediction</p>
          <p className="mt-1 font-semibold">{fixture.prediction.prediction || "Available"}</p>
        </div>
      ) : null}

      <Button className="mt-4 w-full rounded-full" onClick={() => onViewDetails?.(fixture?.fixtureId || fixture?.matchId)}>
        View match
      </Button>
    </article>
  );
});

export default FixtureCard;
