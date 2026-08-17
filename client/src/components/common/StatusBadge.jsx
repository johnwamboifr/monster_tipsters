const StatusBadge = ({ status }) => {
  const normalized = String(status || "SCHEDULED").toUpperCase();
  const tone = normalized === "LIVE" ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300" : normalized === "FINISHED" ? "border-blue-500/30 bg-blue-500/10 text-blue-300" : "border-white/10 bg-white/5 text-slate-200";

  return (
    <span className={`rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] ${tone}`}>
      {normalized}
    </span>
  );
};

export default StatusBadge;
