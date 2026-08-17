import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchLeagues } from "@/features/slices/footballSlice";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const LeagueFilter = ({ value, onChange, className = "" }) => {
  const dispatch = useDispatch();
  const leagues = useSelector((state) => state.football.leagues || []);
  const loading = useSelector((state) => state.football.loading.leagues);
  const error = useSelector((state) => state.football.errors.leagues);
  const { userType } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(fetchLeagues());
  }, [dispatch, userType]);

  const options = useMemo(() => leagues.filter(Boolean), [leagues]);

  return (
    <div className={className}>
      <label className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">
        League
      </label>
      <Select value={value || "all"} onValueChange={(next) => onChange?.(next === "all" ? "" : next)}>
        <SelectTrigger className="w-full rounded-2xl border border-white/10 bg-slate-950/80 text-sm text-white">
          <SelectValue placeholder={loading ? "Loading leagues..." : "All leagues"} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All leagues</SelectItem>
          {options.map((league) => {
            const leagueValue = league.leagueId || league.id || league.name;
            return (
              <SelectItem key={leagueValue} value={String(leagueValue)}>
                {league.name}
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>
      {error ? <p className="mt-2 text-xs text-amber-400">{error}</p> : null}
    </div>
  );
};

export default LeagueFilter;
