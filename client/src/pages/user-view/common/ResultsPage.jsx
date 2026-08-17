import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
fetchResults,
setResultsFilters,
} from "@/features/slices/footballSlice";

import LeagueFilter from "@/components/common/unified/LeagueFilter";
import SearchBar from "@/components/common/SearchBar";
import PageHeader from "@/components/common/unified/PageHeader";
import LoadingSkeleton from "@/components/common/unified/LoadingSkeleton";
import EmptyState from "@/components/common/unified/EmptyState";
import ErrorState from "@/components/common/ErrorState";
import { Badge } from "@/components/ui/badge";

const getPredictionVariant = (result) => {
const value = String(
result?.predictionResult ||
result?.result ||
""
).toLowerCase();

if (value === "won") {
return "default";
}

if (value === "lost") {
return "destructive";
}

return "secondary";
};

const formatResult = (result) => {
const value =
result?.predictionResult ||
result?.result ||
"Pending";

return String(value)
.charAt(0)
.toUpperCase() +
String(value).slice(1).toLowerCase();
};

const formatDate = (date) => {
if (!date) return "Date unavailable";

const parsed = new Date(date);

if (Number.isNaN(parsed.getTime())) {
return "Date unavailable";
}

return parsed.toLocaleDateString(undefined, {
day: "numeric",
month: "short",
year: "numeric",
});
};

const formatTime = (date) => {
if (!date) return "";

const parsed = new Date(date);

if (Number.isNaN(parsed.getTime())) {
return "";
}

return parsed.toLocaleTimeString(undefined, {
hour: "2-digit",
minute: "2-digit",
});
};

const ResultsPage = () => {
const dispatch = useDispatch();

const results = useSelector(
(state) => state.football.results || []
);

const loading = useSelector(
(state) => state.football.loading.results
);

const error = useSelector(
(state) => state.football.errors.results
);

const resultsFilters = useSelector(
(state) => state.football.resultsFilters || {}
);

const {
league,
search,
} = resultsFilters;

/*

* Load results whenever the league or
* search filter changes.
  */
  useEffect(() => {
  dispatch(
  fetchResults({
  league: league || undefined,
  search: search || undefined,
  })
  );
  }, [
  dispatch,
  league,
  search,
  ]);

const retryResults = () => {
dispatch(
fetchResults({
league: league || undefined,
search: search || undefined,
})
);
};

return (
<div className="space-y-8">


  {/* Filters */}
  <section className="rounded-[28px] border border-white/10 bg-slate-900/80 p-5 shadow-xl shadow-black/10">
    <div className="grid gap-4 md:grid-cols-2">
      {/* League */}
      <div>
        <label className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">
          League
        </label>

        <LeagueFilter
          value={league || ""}
          onChange={(value) =>
            dispatch(
              setResultsFilters({
                league: value,
              })
            )
          }
        />
      </div>

      {/* Search */}
      <div>
        <label className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">
          Search
        </label>

        <SearchBar
          value={search || ""}
          onChange={(value) =>
            dispatch(
              setResultsFilters({
                search: value,
              })
            )
          }
          placeholder="Search teams or leagues..."
        />
      </div>
    </div>
  </section>

  {/* Results */}
  {loading ? (
    <LoadingSkeleton count={4} />
  ) : !!error ? (
    <ErrorState
      title="Unable to load results"
      message={
        error ||
        "Something went wrong while loading match results."
      }
      onRetry={retryResults}
    />
  ) : results.length > 0 ? (
    <div className="space-y-4">
      {results.map((result) => {
        const predictionResult =
          result?.predictionResult ||
          result?.result ||
          "pending";

        return (
          <article
            key={
              result.fixtureId ||
              result.matchId ||
              result.id
            }
            className="group overflow-hidden rounded-[28px] border border-white/10 bg-slate-900/80 shadow-lg shadow-black/10 transition hover:border-white/20"
          >
            {/* Top bar */}
            <div className="flex flex-col gap-3 border-b border-white/10 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                    {result.league || "Football"}
                  </p>

                  {result.matchday && (
                    <>
                      <span className="text-slate-700">
                        •
                      </span>

                      <span className="text-xs text-slate-500">
                        Matchday {result.matchday}
                      </span>
                    </>
                  )}
                </div>

                <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                  <span>
                    {formatDate(
                      result.kickoffTime
                    )}
                  </span>

                  {formatTime(
                    result.kickoffTime
                  ) && (
                    <>
                      <span>•</span>
                      <span>
                        {formatTime(
                          result.kickoffTime
                        )}
                      </span>
                    </>
                  )}
                </div>
              </div>

              <Badge
                variant={getPredictionVariant(
                  result
                )}
                className="w-fit capitalize"
              >
                Prediction{" "}
                {formatResult(result)}
              </Badge>
            </div>

            {/* Match */}
            <div className="px-5 py-6">
              <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4">
                {/* Home */}
                <div className="min-w-0">
                  <div className="flex items-center gap-3">
                    {result.homeTeamLogo ? (
                      <img
                        src={
                          result.homeTeamLogo
                        }
                        alt=""
                        className="h-10 w-10 shrink-0 object-contain"
                        loading="lazy"
                      />
                    ) : (
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/10 bg-slate-950 text-xs font-bold text-slate-500">
                        H
                      </div>
                    )}

                    <p className="truncate text-sm font-semibold text-white sm:text-base">
                      {result.homeTeam ||
                        "Home Team"}
                    </p>
                  </div>
                </div>

                {/* Score */}
                <div className="text-center">
                  <div className="rounded-2xl border border-white/10 bg-slate-950/80 px-5 py-3">
                    <p className="text-2xl font-bold tracking-tight text-white">
                      {result.homeScore ??
                        "-"}{" "}
                      <span className="mx-1 text-slate-600">
                        -
                      </span>{" "}
                      {result.awayScore ??
                        "-"}
                    </p>
                  </div>

                  <p className="mt-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-500">
                    Final
                  </p>
                </div>

                {/* Away */}
                <div className="min-w-0">
                  <div className="flex items-center justify-end gap-3">
                    <p className="truncate text-right text-sm font-semibold text-white sm:text-base">
                      {result.awayTeam ||
                        "Away Team"}
                    </p>

                    {result.awayTeamLogo ? (
                      <img
                        src={
                          result.awayTeamLogo
                        }
                        alt=""
                        className="h-10 w-10 shrink-0 object-contain"
                        loading="lazy"
                      />
                    ) : (
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/10 bg-slate-950 text-xs font-bold text-slate-500">
                        A
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Prediction */}
            {(result.prediction ||
              result.predictionMarket ||
              result.predictionOdds != null ||
              result.predictionConfidence != null) && (
              <div className="border-t border-white/10 bg-slate-950/40 px-5 py-4">
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                      Prediction
                    </p>

                    <p className="mt-1 text-sm font-semibold text-white">
                      {result.prediction ||
                        "—"}
                    </p>
                  </div>

                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                      Market
                    </p>

                    <p className="mt-1 text-sm text-slate-300">
                      {result.predictionMarket ||
                        "—"}
                    </p>
                  </div>

                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                      Odds
                    </p>

                    <p className="mt-1 text-sm font-semibold text-white">
                      {result.predictionOdds ??
                        "—"}
                    </p>
                  </div>

                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                      Confidence
                    </p>

                    <p className="mt-1 text-sm font-semibold text-white">
                      {result.predictionConfidence !=
                      null
                        ? `${result.predictionConfidence}%`
                        : "—"}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Additional match details */}
            {(result.halfTimeHome != null ||
              result.halfTimeAway != null ||
              result.extraTimeHome != null ||
              result.extraTimeAway != null ||
              result.penaltiesHome != null ||
              result.penaltiesAway != null) && (
              <div className="border-t border-white/10 px-5 py-3">
                <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-slate-500">
                  {(result.halfTimeHome != null ||
                    result.halfTimeAway != null) && (
                    <span>
                      HT{" "}
                      <strong className="text-slate-300">
                        {result.halfTimeHome ??
                          "-"}{" "}
                        -{" "}
                        {result.halfTimeAway ??
                          "-"}
                      </strong>
                    </span>
                  )}

                  {(result.extraTimeHome != null ||
                    result.extraTimeAway != null) && (
                    <span>
                      ET{" "}
                      <strong className="text-slate-300">
                        {result.extraTimeHome ??
                          "-"}{" "}
                        -{" "}
                        {result.extraTimeAway ??
                          "-"}
                      </strong>
                    </span>
                  )}

                  {(result.penaltiesHome != null ||
                    result.penaltiesAway != null) && (
                    <span>
                      PEN{" "}
                      <strong className="text-slate-300">
                        {result.penaltiesHome ??
                          "-"}{" "}
                        -{" "}
                        {result.penaltiesAway ??
                          "-"}
                      </strong>
                    </span>
                  )}
                </div>
              </div>
            )}
          </article>
        );
      })}
    </div>
  ) : (
    <EmptyState
      title="No completed matches found"
      message="Completed matches and their prediction outcomes will appear here."
    />
  )}
</div>

);
};

export default ResultsPage;
