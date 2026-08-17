import { memo } from "react";

const StatsCard = memo(function StatsCard({ label, value, detail, icon: Icon }) {
  return (
    <div className="rounded-[24px] border border-white/10 bg-slate-900/80 p-4 shadow-[0_12px_30px_rgba(15,23,42,0.12)]">
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400">{label}</p>
        {Icon ? <Icon className="h-4 w-4 text-emerald-300" /> : null}
      </div>
      <p className="mt-3 text-2xl font-semibold text-white">{value}</p>
      {detail ? <p className="mt-2 text-sm text-slate-400">{detail}</p> : null}
    </div>
  );
});

export default StatsCard;
