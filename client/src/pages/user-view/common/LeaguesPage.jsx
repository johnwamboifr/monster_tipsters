import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchLeagues } from "@/features/slices/footballSlice";
import PageHeader from "@/components/common/unified/PageHeader";
import LoadingSkeleton from "@/components/common/unified/LoadingSkeleton";
import EmptyState from "@/components/common/unified/EmptyState";
import ErrorState from "@/components/common/ErrorState";

const LeaguesPage = () => {
  const dispatch = useDispatch();
  const leagues = useSelector((state) => state.football.leagues || []);
  const loading = useSelector((state) => state.football.loading.leagues);
  const error = useSelector((state) => state.football.errors.leagues);

  useEffect(() => {
    dispatch(fetchLeagues());
  }, [dispatch]);

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Leagues" title="Explore the synced competitions" description="The league catalog is loaded directly from the MySQL database" />
      {loading ? <LoadingSkeleton count={4} /> : !!error ? <ErrorState title="Unable to load leagues" message={error} onRetry={() => dispatch(fetchLeagues())} /> : leagues.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {leagues.map((league) => (
            <article key={league.leagueId || league.id} className="rounded-[24px] border border-white/10 bg-slate-900/80 p-5">
              <div className="flex items-center gap-3">
                {league.logo ? <img src={league.logo} alt={league.name} className="h-10 w-10 rounded-full object-cover" /> : null}
                <div>
                  <h3 className="text-lg font-semibold text-white">{league.name}</h3>
                  <p className="text-sm text-slate-400">{league.country || "Unknown country"}</p>
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : <EmptyState title="No leagues found" message="Leagues will appear here once synchronized into the database." />}
    </div>
  );
};

export default LeaguesPage;
