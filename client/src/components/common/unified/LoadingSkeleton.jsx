const LoadingSkeleton = ({ count = 3, className = "" }) => (
  <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
    {Array.from({ length: count }).map((_, index) => (
      <div key={index} className={`animate-pulse rounded-[24px] border border-white/10 bg-slate-900/70 p-4 ${className}`}>
        <div className="h-3 w-24 rounded-full bg-slate-800" />
        <div className="mt-4 h-6 w-full rounded-2xl bg-slate-800" />
        <div className="mt-3 h-6 w-3/4 rounded-2xl bg-slate-800" />
        <div className="mt-4 h-16 rounded-2xl bg-slate-800" />
        <div className="mt-4 h-10 rounded-2xl bg-slate-800" />
      </div>
    ))}
  </div>
);

export default LoadingSkeleton;
