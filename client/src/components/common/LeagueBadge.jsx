const LeagueBadge = ({ league }) => (
  <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-200">
    {league || "Football"}
  </span>
);

export default LeagueBadge;
