import { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchFixtures, setFixturesFilters } from "@/features/slices/footballSlice";
import FixtureCard from "@/components/common/FixtureCard";
import SearchBar from "@/components/common/SearchBar";
import EmptyState from "@/components/common/EmptyState";
import ErrorState from "@/components/common/ErrorState";
import LoadingSkeleton from "@/components/common/LoadingSkeleton";
import { Input } from "@/components/ui/input";

const FixturesPage = () => {
  const dispatch = useDispatch();
  const fixtures = useSelector((state) => state.football.fixtures || []);
  const loading = useSelector((state) => state.football.loading.fixtures);
  const error = useSelector((state) => state.football.errors.fixtures);
  const fixturesFilters = useSelector((state) => state.football.fixturesFilters || {});
  const { search, league, season, date, status, stage, group, matchday } = fixturesFilters;

  useEffect(() => {
    const params = Object.fromEntries(
      Object.entries({
        team: search,
        league,
        season,
        stage,
        group,
        matchday,
        date,
        status,
      }).filter(([, value]) => value !== undefined && value !== null && value !== "")
    );

    dispatch(fetchFixtures(params));
  }, [dispatch, search, league, season, stage, group, matchday, date, status]);

  const stages = useMemo(() => [...new Set(fixtures.map((fixture) => fixture.stage).filter(Boolean))], [fixtures]);
  const groups = useMemo(() => [...new Set(fixtures.map((fixture) => fixture.group).filter(Boolean))], [fixtures]);
  const matchdays = useMemo(() => [...new Set(fixtures.map((fixture) => fixture.matchday).filter((value) => value != null))].sort((a, b) => a - b), [fixtures]);

  const leagues = useMemo(() => {
    const leagueMap = new Map();
    fixtures.forEach((fixture) => {
      const leagueId = fixture.leagueId || fixture.League?.leagueId || fixture.league;
      const label = fixture.league || fixture.League?.name || fixture.league;
      if (leagueId) {
        leagueMap.set(leagueId, label);
      }
    });
    return Array.from(leagueMap.entries()).map(([leagueId, label]) => ({ leagueId, label }));
  }, [fixtures]);

  const seasons = useMemo(
    () => [...new Set(fixtures.map((fixture) => fixture.season).filter(Boolean))].sort().reverse(),
    [fixtures]
  );

  return (
    <div className="space-y-6 py-4">
      <section className="section-shell">
        <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-[10px] uppercase tracking-[0.22em] text-slate-400">Fixtures</p>
            <h1 className="mt-1 text-2xl font-bold text-white">Synchronized fixtures</h1>
          </div>
          <div className="w-full max-w-md">
            <SearchBar value={search || ""} onChange={(value) => dispatch(setFixturesFilters({ search: value }))} placeholder="Search by team..." />
          </div>
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-3">
          <div>
            <label className="mb-2 block text-xs uppercase tracking-[0.18em] text-slate-400">League</label>
            <select value={league || ""} onChange={(event) => dispatch(setFixturesFilters({ league: event.target.value }))} className="w-full rounded-2xl border border-white/10 bg-slate-950/80 px-3 py-2 text-sm text-white">
              <option value="">All leagues</option>
              {leagues.map((entry) => (
                <option key={entry.leagueId} value={entry.leagueId}>{entry.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-xs uppercase tracking-[0.18em] text-slate-400">Season</label>
            <select value={season || ""} onChange={(event) => dispatch(setFixturesFilters({ season: event.target.value }))} className="w-full rounded-2xl border border-white/10 bg-slate-950/80 px-3 py-2 text-sm text-white">
              <option value="">All seasons</option>
              {seasons.map((entry) => (
                <option key={entry} value={entry}>{entry}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-xs uppercase tracking-[0.18em] text-slate-400">Stage</label>
            <select value={stage || ""} onChange={(event) => dispatch(setFixturesFilters({ stage: event.target.value }))} className="w-full rounded-2xl border border-white/10 bg-slate-950/80 px-3 py-2 text-sm text-white">
              <option value="">All stages</option>
              {stages.map((value) => <option key={value} value={value}>{value}</option>)}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-xs uppercase tracking-[0.18em] text-slate-400">Group</label>
            <select value={group || ""} onChange={(event) => dispatch(setFixturesFilters({ group: event.target.value }))} className="w-full rounded-2xl border border-white/10 bg-slate-950/80 px-3 py-2 text-sm text-white">
              <option value="">All groups</option>
              {groups.map((value) => <option key={value} value={value}>{value}</option>)}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-xs uppercase tracking-[0.18em] text-slate-400">Matchday</label>
            <select value={matchday || ""} onChange={(event) => dispatch(setFixturesFilters({ matchday: event.target.value }))} className="w-full rounded-2xl border border-white/10 bg-slate-950/80 px-3 py-2 text-sm text-white">
              <option value="">All matchdays</option>
              {matchdays.map((value) => <option key={value} value={value}>{value}</option>)}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-xs uppercase tracking-[0.18em] text-slate-400">Date</label>
            <Input type="date" value={date || ""} onChange={(event) => dispatch(setFixturesFilters({ date: event.target.value }))} className="w-full rounded-2xl border border-white/10 bg-slate-950/80 text-sm text-white" />
          </div>

          <div>
            <label className="mb-2 block text-xs uppercase tracking-[0.18em] text-slate-400">Status</label>
            <select value={status || ""} onChange={(event) => dispatch(setFixturesFilters({ status: event.target.value }))} className="w-full rounded-2xl border border-white/10 bg-slate-950/80 px-3 py-2 text-sm text-white">
              <option value="">All statuses</option>
              <option value="SCHEDULED">Scheduled</option>
              <option value="LIVE">Live</option>
              <option value="FINISHED">Finished</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="mt-4"><LoadingSkeleton count={3} /></div>
        ) : !!error ? (
          <div className="mt-4"><ErrorState title="Unable to load fixtures" message={error} onRetry={() => dispatch(fetchFixtures(Object.fromEntries(Object.entries({ team: search, league, season, stage, group, matchday, date, status }).filter(([, value]) => value))))} /></div>
        ) : fixtures.length > 0 ? (
          <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {fixtures.map((fixture) => (
              <FixtureCard key={fixture.fixtureId || fixture.matchId || `${fixture.homeTeam}-${fixture.awayTeam}-${fixture.kickoffTime}`} fixture={fixture} />
            ))}
          </div>
        ) : (
          <div className="mt-4"><EmptyState title="No fixtures found" message="Try a different team, league, or date filter. Check back later." actionLabel="Refresh" onAction={() => dispatch(fetchFixtures(Object.fromEntries(Object.entries({ team: search, league, season, stage, group, matchday, date, status }).filter(([, value]) => value))))} /></div>
        )}
      </section>
    </div>
  );
};

export default FixturesPage;
