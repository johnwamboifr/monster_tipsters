import { memo } from "react";

const StandingCard = memo(function StandingCard({ standing }) {
  return (
    <article className="rounded-[24px] border border-white/10 bg-slate-900/80 p-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-500/10 text-sm font-semibold text-emerald-300">
            {standing.position}
          </div>
          <div>
            <p className="text-sm font-semibold text-white">{standing.teamName}</p>
            <p className="text-xs text-slate-400">{standing.playedGames ?? 0} played</p>
          </div>
        </div>
        <div className="rounded-full border border-white/10 bg-slate-950/70 px-3 py-1 text-sm font-semibold text-white">
          {standing.points ?? 0} pts
        </div>
      </div>
      <div className="mt-4 grid grid-cols-4 gap-2 text-center text-xs text-slate-400">
        <div className="rounded-2xl bg-slate-950/50 p-2"><p className="text-[10px] uppercase tracking-[0.18em]">W</p><p className="mt-1 font-semibold text-white">{standing.won ?? 0}</p></div>
        <div className="rounded-2xl bg-slate-950/50 p-2"><p className="text-[10px] uppercase tracking-[0.18em]">D</p><p className="mt-1 font-semibold text-white">{standing.draw ?? 0}</p></div>
        <div className="rounded-2xl bg-slate-950/50 p-2"><p className="text-[10px] uppercase tracking-[0.18em]">L</p><p className="mt-1 font-semibold text-white">{standing.lost ?? 0}</p></div>
        <div className="rounded-2xl bg-slate-950/50 p-2"><p className="text-[10px] uppercase tracking-[0.18em]">GD</p><p className="mt-1 font-semibold text-white">{standing.goalDifference ?? 0}</p></div>
      </div>
    </article>
  );
});

export default StandingCard;
