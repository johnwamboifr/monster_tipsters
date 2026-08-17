import { memo } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CalendarDays, Clock3, Trophy } from "lucide-react";

const FixtureCard = memo(function FixtureCard({ fixture, onViewMatch }) {
  const kickoff = fixture.kickoffTime ? new Date(fixture.kickoffTime) : null;
  const leagueName = fixture.league || fixture.leagueName || "Football";

  return (
    <article className="rounded-[26px] border border-white/10 bg-slate-950/70 p-5 shadow-[0_18px_50px_rgba(15,23,42,0.25)]">
      <div className="flex items-center justify-between gap-3 text-xs uppercase tracking-[0.18em] text-slate-400">
        <div className="flex items-center gap-2">
          {fixture.leagueLogo ? (
            <img src={fixture.leagueLogo} alt={leagueName} className="h-7 w-7 rounded-full object-cover" />
          ) : (
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-300">
              <Trophy className="h-3.5 w-3.5" />
            </div>
          )}
          <span>{leagueName}</span>
        </div>
        <Badge variant="secondary">{String(fixture.status || "SCHEDULED").toUpperCase()}</Badge>
      </div>

      <div className="mt-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          {fixture.homeTeamLogo ? (
            <img src={fixture.homeTeamLogo} alt={fixture.homeTeam || "Home team"} className="h-10 w-10 rounded-full object-cover" />
          ) : (
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/5 text-[10px] font-semibold text-slate-200">H</div>
          )}
          <span className="text-sm font-semibold text-white">{fixture.homeTeam || "Home"}</span>
        </div>

        <span className="text-xs uppercase tracking-[0.2em] text-slate-400">vs</span>

        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold text-white">{fixture.awayTeam || "Away"}</span>
          {fixture.awayTeamLogo ? (
            <img src={fixture.awayTeamLogo} alt={fixture.awayTeam || "Away team"} className="h-10 w-10 rounded-full object-cover" />
          ) : (
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/5 text-[10px] font-semibold text-slate-200">A</div>
          )}
        </div>
      </div>

      <div className="mt-4 grid gap-3 rounded-2xl border border-white/10 bg-slate-900/70 p-3 text-sm text-slate-300">
        <div className="flex items-center justify-between gap-2">
          <span className="inline-flex items-center gap-1.5"><CalendarDays className="h-3.5 w-3.5 text-emerald-300" /> Date</span>
          <span>{kickoff ? kickoff.toLocaleDateString() : "TBD"}</span>
        </div>
        <div className="flex items-center justify-between gap-2">
          <span className="inline-flex items-center gap-1.5"><Clock3 className="h-3.5 w-3.5 text-blue-300" /> Kickoff</span>
          <span>{kickoff ? kickoff.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "TBD"}</span>
        </div>
        <div className="flex items-center justify-between gap-2">
          <span className="inline-flex items-center gap-1.5"><Trophy className="h-3.5 w-3.5 text-amber-300" /> Match status</span>
          <span>{String(fixture.status || "SCHEDULED").toUpperCase()}</span>
        </div>
      </div>

      <Button onClick={onViewMatch} className="mt-4 w-full rounded-full bg-emerald-500 text-slate-950 hover:bg-emerald-400">
        View Match
      </Button>
    </article>
  );
});

export default FixtureCard;
