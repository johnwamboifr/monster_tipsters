export const LoadingSkeleton = ({ count = 3, className = "" }) => (
  <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
    {Array.from({ length: count }).map((_, index) => (
      <div key={index} className={`rounded-[26px] border border-white/10 bg-slate-950/60 p-4 ${className}`}>
        <div className="h-4 w-24 rounded-full bg-slate-800 animate-pulse" />
        <div className="mt-4 space-y-3">
          <div className="h-7 w-full rounded-2xl bg-slate-800 animate-pulse" />
          <div className="h-7 w-3/4 rounded-2xl bg-slate-800 animate-pulse" />
          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="h-16 rounded-2xl bg-slate-800 animate-pulse" />
            <div className="h-16 rounded-2xl bg-slate-800 animate-pulse" />
          </div>
          <div className="h-10 w-full rounded-2xl bg-slate-800 animate-pulse" />
        </div>
      </div>
    ))}
  </div>
);

export default LoadingSkeleton;
