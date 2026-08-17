const MatchHeader = ({ league, kickOffTime, homeTeam, awayTeam, homeTeamLogo, awayTeamLogo }) => (
  <div className="rounded-[26px] border border-white/10 bg-slate-950/70 p-4">
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div>
        <p className="text-[10px] uppercase tracking-[0.18em] text-slate-400">{league || "Football"}</p>
        <h1 className="mt-2 text-2xl font-black text-white sm:text-3xl">{homeTeam || "Home"} vs {awayTeam || "Away"}</h1>
      </div>
      <div className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-300">
        {kickOffTime ? new Date(kickOffTime).toLocaleString() : "Match Time TBD"}
      </div>
    </div>

    <div className="mt-4 flex items-center justify-between gap-3 rounded-2xl border border-white/8 bg-slate-900/70 p-3">
      <div className="flex items-center gap-3">
        {homeTeamLogo ? <img src={homeTeamLogo} alt={homeTeam || "Home team"} className="h-10 w-10 rounded-full object-cover" loading="lazy" /> : null}
        <div>
          <p className="text-[10px] uppercase tracking-[0.16em] text-slate-400">Home</p>
          <p className="text-sm font-semibold text-white">{homeTeam || "Home"}</p>
        </div>
      </div>

      <div className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-emerald-300">vs</div>

      <div className="flex items-center gap-3 text-right">
        <div>
          <p className="text-[10px] uppercase tracking-[0.16em] text-slate-400">Away</p>
          <p className="text-sm font-semibold text-white">{awayTeam || "Away"}</p>
        </div>
        {awayTeamLogo ? <img src={awayTeamLogo} alt={awayTeam || "Away team"} className="h-10 w-10 rounded-full object-cover" loading="lazy" /> : null}
      </div>
    </div>
  </div>
);

export default MatchHeader;
