import { useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { Search, SlidersHorizontal, Sparkles, ChevronRight, CalendarDays, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

const SearchGames = () => {
  const tips = useSelector((state) => state.tips.list || []);
  const status = useSelector((state) => state.tips.status);
  const [term, setTerm] = useState("");

  const suggestions = useMemo(() => {
    const values = new Set();
    tips.forEach((tip) => {
      [tip.match, tip.league, tip.prediction, tip.homeTeam, tip.awayTeam].forEach((value) => {
        if (value) values.add(value);
      });
    });

    return [...values].filter((value) => value.toLowerCase().includes(term.toLowerCase())).slice(0, 6);
  }, [tips, term]);

  const filtered = useMemo(
    () =>
      tips.filter((tip) => {
        const query = term.toLowerCase();
        if (!query) return true;
        return [tip.match, tip.league, tip.prediction, tip.homeTeam, tip.awayTeam]
          .filter(Boolean)
          .some((value) => value.toLowerCase().includes(query));
      }),
    [term, tips]
  );

  return (
    <div className="space-y-6 py-4">
      <div className="section-shell">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-[10px] uppercase tracking-[0.22em] text-slate-400">Search</p>
            <h1 className="mt-1 text-2xl font-bold text-white">Find the right prediction</h1>
          </div>
          <Button variant="outline" className="w-fit rounded-full border-white/10 bg-white/5 text-slate-200">
            <SlidersHorizontal className="mr-2 h-4 w-4" /> Filters
          </Button>
        </div>

        <div className="relative mt-5">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            placeholder="Search teams, leagues, predictions..."
            className="w-full rounded-2xl border border-white/10 bg-slate-950/80 pl-9 text-sm text-white placeholder:text-slate-400"
          />
        </div>

        {term && (
          <div className="mt-4 flex flex-wrap gap-2">
            {suggestions.length > 0 ? (
              suggestions.map((item) => (
                <button
                  key={item}
                  onClick={() => setTerm(item)}
                  className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-xs text-emerald-200"
                >
                  {item}
                </button>
              ))
            ) : (
              <span className="text-xs text-slate-400">No suggestions found</span>
            )}
          </div>
        )}
      </div>

      <div className="section-shell">
        <div className="mb-4 flex items-center gap-2 text-sm text-slate-300">
          <Filter className="h-4 w-4 text-emerald-300" />
          Filtered results: <span className="font-semibold text-white">{filtered.length}</span>
        </div>

        {status === "pending" ? (
          <div className="grid gap-4 md:grid-cols-2">
            {Array.from({ length: 4 }).map((_, idx) => (
              <div key={idx} className="rounded-[24px] border border-white/10 bg-slate-950/60 p-4">
                <Skeleton className="h-5 w-20 rounded-full" />
                <Skeleton className="mt-4 h-8 w-full rounded-2xl" />
                <Skeleton className="mt-3 h-16 w-full rounded-2xl" />
                <Skeleton className="mt-3 h-10 w-full rounded-2xl" />
              </div>
            ))}
          </div>
        ) : filtered.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2">
            {filtered.slice(0, 12).map((tip) => (
              <article key={tip.id} className="rounded-[22px] border border-white/10 bg-slate-950/60 p-4 transition-all duration-200 hover:border-emerald-400/30 hover:bg-slate-950">
                <div className="flex items-center justify-between gap-2">
                  <Badge variant="secondary">{tip.league}</Badge>
                  <Badge variant="outline">{tip.prediction}</Badge>
                </div>

                <div className="mt-4">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400">Match</p>
                  <h3 className="mt-2 text-lg font-semibold text-white">{tip.match}</h3>
                </div>

                <div className="mt-4 flex items-center justify-between rounded-2xl border border-white/8 bg-slate-900/70 p-3 text-sm text-slate-200">
                  <span>{tip.homeTeam || "Home"}</span>
                  <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-1 text-[10px] font-medium uppercase tracking-[0.2em] text-emerald-300">vs</span>
                  <span>{tip.awayTeam || "Away"}</span>
                </div>

                <div className="mt-4 flex items-center justify-between text-xs text-slate-300">
                  <span className="inline-flex items-center gap-1.5"><CalendarDays className="h-3.5 w-3.5 text-emerald-300" /> {tip.date || "Upcoming"}</span>
                  <span>Odds: {tip.odds || "2.05"}</span>
                </div>

                <div className="mt-4 flex items-center justify-between">
                  <span className="text-xs text-slate-300">Confidence: {tip.confidence || "86%"}</span>
                  <Button variant="ghost" size="sm" className="rounded-full text-xs text-slate-200 hover:text-white">
                    View details <ChevronRight className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="flex min-h-[240px] flex-col items-center justify-center rounded-[22px] border border-dashed border-white/10 bg-slate-950/40 px-6 py-10 text-center">
            <Sparkles className="mx-auto mb-3 h-6 w-6 text-emerald-300" />
            <p className="text-base font-medium text-white">No matches found</p>
            <p className="mt-2 max-w-md text-sm text-slate-400">Try a different team, league, or prediction keyword. Check back later for fresh picks.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchGames;