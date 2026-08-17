import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
fetchStandings,
fetchLeagues,
setStandingsFilters,
clearStandings,
} from "@/features/slices/footballSlice";

import StandingTable from "@/components/common/unified/StandingTable";
import StandingCard from "@/components/common/unified/StandingCard";
import PageHeader from "@/components/common/unified/PageHeader";
import LoadingSkeleton from "@/components/common/unified/LoadingSkeleton";
import EmptyState from "@/components/common/unified/EmptyState";
import ErrorState from "@/components/common/ErrorState";

const DEFAULT_LEAGUE_ID = "2021"; // Premier League

const StandingsPage = () => {
const dispatch = useDispatch();

const standings = useSelector(
(state) => state.football.standings || []
);

const loading = useSelector(
(state) => state.football.loading.standings
);

const error = useSelector(
(state) => state.football.errors.standings
);

const standingsFilters = useSelector(
(state) => state.football.standingsFilters || {}
);

const leagues = useSelector(
(state) => state.football.leagues || []
);

const { league } = standingsFilters;

/*

* Premier League is selected by default.
  */
  useEffect(() => {
  if (!league) {
  dispatch(
  setStandingsFilters({
  league: DEFAULT_LEAGUE_ID,
  group: "",
  stage: "",
  })
  );
  }
  }, [dispatch, league]);

/*

* Load available leagues.
  */
  useEffect(() => {
  dispatch(fetchLeagues());
  }, [dispatch]);

/*

* Load standings whenever the selected league changes.
  */
  useEffect(() => {
  if (!league) {
  dispatch(clearStandings());
  return;
  }

dispatch(
  fetchStandings({
    league,
    limit: 500,
  })
);

}, [dispatch, league]);

/*

* Current league selection.
  */
  const currentLeague = league || DEFAULT_LEAGUE_ID;

/*

* Reset to Premier League.
  */
  const resetFilters = () => {
  dispatch(
  setStandingsFilters({
  league: DEFAULT_LEAGUE_ID,
  group: "",
  stage: "",
  })
  );
  };

return (
<div className="space-y-6">


  {/* League Filter */}
  <section className="rounded-[28px] border border-white/10 bg-slate-900/80 p-5">
    <div className="max-w-md">
      <label className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">
        League
      </label>

      <select
        value={currentLeague}
        onChange={(event) => {
          dispatch(
            setStandingsFilters({
              league: event.target.value,
              group: "",
              stage: "",
            })
          );
        }}
        className="w-full rounded-2xl border border-white/10 bg-slate-950/80 px-3 py-2 text-sm text-white"
      >
        <option value="">Select league</option>

        {leagues.map((entry) => (
          <option
            key={entry.leagueId}
            value={entry.leagueId}
          >
            {entry.name ||
              entry.leagueName ||
              entry.leagueId}
          </option>
        ))}
      </select>
    </div>
  </section>

  {/* Content */}
  {loading ? (
    <LoadingSkeleton count={4} />
  ) : !!error ? (
    <ErrorState
      title="Couldn't load standings."
      message={error || "Please try again later."}
      onRetry={() =>
        dispatch(
          fetchStandings({
            league: currentLeague,
            limit: 500,
          })
        )
      }
    />
  ) : standings.length > 0 ? (
    <>
      {/* Desktop */}
      <div className="hidden lg:block">
        <StandingTable standings={standings} />
      </div>

      {/* Mobile */}
      <div className="grid gap-4 lg:hidden">
        {standings.map((standing) => {
          const key = `${standing.leagueId || ''}:${standing.teamId || ''}:${standing.season || ''}:${standing.stage || ''}:${standing.group || ''}`;
          return (
            <StandingCard
              key={standing.id || key}
              standing={standing}
            />
          );
        })}
      </div>
    </>
  ) : (
    <EmptyState
      title="No standings available."
      message="There are no standings available for the selected league."
      actionLabel="Reset league"
      onAction={resetFilters}
    />
  )}
</div>

);
};

export default StandingsPage;
