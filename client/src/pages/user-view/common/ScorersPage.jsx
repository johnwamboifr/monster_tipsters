import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchScorers } from "@/features/slices/footballSlice";

import PageHeader from "@/components/common/unified/PageHeader";
import SearchBar from "@/components/common/SearchBar";
import LoadingSkeleton from "@/components/common/unified/LoadingSkeleton";
import EmptyState from "@/components/common/unified/EmptyState";
import ErrorState from "@/components/common/ErrorState";

const DEFAULT_LEAGUE_ID = "39"; // Premier League

const ScorersPage = () => {
    const dispatch = useDispatch();

    const scorers = useSelector(
        (state) => state.football.scorers || []
    );

    const loading = useSelector(
        (state) => state.football.loading.scorers
    );

    const error = useSelector(
        (state) => state.football.errors.scorers
    );

    const [search, setSearch] = useState("");
    const [league, setLeague] = useState(DEFAULT_LEAGUE_ID);

    /*
     * Build league options from the currently synchronized scorers.
     */
    const leagues = useMemo(() => {
        const options = new Map();

        scorers.forEach((item) => {
            if (!item.leagueId) return;

            options.set(
                item.leagueId,
                item.league ||
                    item.leagueName ||
                    item.competitionName ||
                    item.leagueId
            );
        });

        /*
         * Make sure Premier League remains available even when
         * the current scorer response does not contain it.
         */
        if (!options.has(DEFAULT_LEAGUE_ID)) {
            options.set(DEFAULT_LEAGUE_ID, "Premier League");
        }

        return Array.from(options.entries())
            .map(([value, label]) => ({
                value,
                label,
            }))
            .sort((a, b) =>
                a.label.localeCompare(b.label)
            );
    }, [scorers]);

    /*
     * Fetch scorers whenever league or search changes.
     *
     * Season is intentionally NOT sent to the API.
     */
    useEffect(() => {
        dispatch(
            fetchScorers({
                league: league || DEFAULT_LEAGUE_ID,
                search: search || undefined,
                limit: 100,
            })
        );
    }, [dispatch, league, search]);

    /*
     * Retry the current scorer request.
     */
    const refreshScorers = () => {
        dispatch(
            fetchScorers({
                league: league || DEFAULT_LEAGUE_ID,
                search: search || undefined,
                limit: 100,
            })
        );
    };

    return (
        <div className="space-y-6">

            {/* Page Header */}
            <PageHeader
                eyebrow="Scorers"
                title="Top goal scorers"
                description="Browse players leading the charts from synchronized competition data."
            />

            {/* Filters */}
            <section className="rounded-[28px] border border-white/10 bg-slate-900/80 p-5">
                <div className="grid gap-3 md:grid-cols-2">

                    {/* Search */}
                    <div>
                        <label className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">
                            Search
                        </label>

                        <SearchBar
                            value={search}
                            onChange={setSearch}
                            placeholder="Search player"
                        />
                    </div>

                    {/* League */}
                    <div>
                        <label className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">
                            League
                        </label>

                        <select
                            value={league}
                            onChange={(event) =>
                                setLeague(event.target.value)
                            }
                            className="w-full rounded-2xl border border-white/10 bg-slate-950/80 px-3 py-2 text-sm text-white"
                        >
                            <option value="">
                                Select league
                            </option>

                            {leagues.map((entry) => (
                                <option
                                    key={entry.value}
                                    value={entry.value}
                                >
                                    {entry.label}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </section>

            {/* Loading */}
            {loading ? (
                <LoadingSkeleton count={5} />
            ) : error ? (
                /* Error */
                <ErrorState
                    title="Unable to load scorers"
                    message={
                        error ||
                        "Please try again later."
                    }
                    onRetry={refreshScorers}
                />
            ) : scorers.length > 0 ? (
                /* Scorer Cards */
                <div className="grid gap-4 xl:grid-cols-2">
                    {scorers.map((scorer) => (
                        <article
                            key={`${scorer.playerId || scorer.playerName || scorer.id}-${scorer.teamId || scorer.teamName || "team"}`}
                            className="rounded-[24px] border border-white/10 bg-slate-900/80 p-5"
                        >
                            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                                {/* Player */}
                                <div>
                                    <p className="text-xs uppercase tracking-[0.22em] text-slate-400">
                                        {scorer.league ||
                                            scorer.leagueName ||
                                            scorer.competitionName ||
                                            "League"}
                                    </p>

                                    <h2 className="text-lg font-semibold text-white">
                                        {scorer.playerName ||
                                            scorer.name ||
                                            "Unknown player"}
                                    </h2>

                                    <p className="text-sm text-slate-400">
                                        {scorer.teamName ||
                                            scorer.Team?.name ||
                                            scorer.team ||
                                            "Unknown team"}
                                    </p>
                                </div>

                                {/* Goals */}
                                <div className="grid gap-2 text-right text-sm text-slate-300">
                                    <span>
                                        {scorer.goals ?? 0} goals
                                    </span>
                                </div>
                            </div>

                            {/* Statistics */}
                            <div className="mt-4 grid gap-2 sm:grid-cols-2 text-sm text-slate-300">

                                {/* Assists */}
                                <div className="rounded-2xl border border-white/10 bg-slate-950/80 p-3">
                                    <p className="text-slate-400">
                                        Assists
                                    </p>

                                    <p className="text-white">
                                        {scorer.assists ?? 0}
                                    </p>
                                </div>

                                {/* Matches */}
                                <div className="rounded-2xl border border-white/10 bg-slate-950/80 p-3">
                                    <p className="text-slate-400">
                                        Matches
                                    </p>

                                    <p className="text-white">
                                        {scorer.matchesPlayed ??
                                            scorer.appearances ??
                                            0}
                                    </p>
                                </div>
                            </div>
                        </article>
                    ))}
                </div>
            ) : (
                /* Empty State */
                <EmptyState
                    title="No scorers found"
                    message="There are no synchronized scorers available for the selected league."
                    actionLabel="Refresh"
                    onAction={refreshScorers}
                />
            )}
        </div>
    );
};

export default ScorersPage;
