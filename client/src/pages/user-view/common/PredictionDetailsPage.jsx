import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { fetchPredictionByFixture } from "@/features/slices/footballSlice";
import MatchHeader from "@/components/common/MatchHeader";
import EmptyState from "@/components/common/EmptyState";
import ErrorState from "@/components/common/ErrorState";
import LoadingSkeleton from "@/components/common/LoadingSkeleton";

const PredictionDetailsPage = () => {
  const dispatch = useDispatch();
  const { fixtureId } = useParams();
  const data = useSelector((state) => state.football.prediction);
  const loading = useSelector((state) => state.football.loading.prediction);
  const error = useSelector((state) => state.football.errors.prediction);

  useEffect(() => {
    if (fixtureId) {
      dispatch(fetchPredictionByFixture(fixtureId));
    }
  }, [dispatch, fixtureId]);

  if (loading) {
    return <div className="py-4"><LoadingSkeleton count={1} /></div>;
  }

  if (!!error) {
    return <div className="py-4"><ErrorState title="Prediction unavailable" message={error} onRetry={() => dispatch(fetchPredictionByFixture(fixtureId))} /></div>;
  }

  if (!data?.fixture || !data?.prediction) {
    return <div className="py-4"><EmptyState title="Prediction not found" message="This fixture does not have a published prediction yet." actionLabel="Refresh" onAction={() => window.location.reload()} /></div>;
  }

  const fixture = data.fixture;
  const prediction = data.prediction;

  return (
    <div className="space-y-6 py-4">
      <MatchHeader
        league={fixture.league}
        kickOffTime={fixture.kickoffTime}
        homeTeam={fixture.homeTeam}
        awayTeam={fixture.awayTeam}
        homeTeamLogo={fixture.homeTeamLogo}
        awayTeamLogo={fixture.awayTeamLogo}
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="section-shell">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">Fixture Information</h2>
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] uppercase tracking-[0.16em] text-slate-200">{fixture.status || "SCHEDULED"}</span>
          </div>

          <div className="grid gap-3 text-sm text-slate-300">
            <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-3"><span className="text-slate-400">League:</span> {fixture.league || "—"}</div>
            <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-3"><span className="text-slate-400">Match time:</span> {fixture.kickoffTime ? new Date(fixture.kickoffTime).toLocaleString() : "—"}</div>
            <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-3"><span className="text-slate-400">Home team:</span> {fixture.homeTeam || "—"}</div>
            <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-3"><span className="text-slate-400">Away team:</span> {fixture.awayTeam || "—"}</div>
          </div>
        </section>

        <section className="section-shell">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">Prediction Information</h2>
            <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-[10px] uppercase tracking-[0.16em] text-emerald-300">{prediction.market || "Match Winner"}</span>
          </div>

          <div className="grid gap-3 text-sm text-slate-300">
            <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-3"><span className="text-slate-400">Prediction:</span> {prediction.prediction || "—"}</div>
            <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-3"><span className="text-slate-400">Market:</span> {prediction.market || "—"}</div>
            <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-3"><span className="text-slate-400">Odds:</span> {prediction.odds ?? "—"}</div>
            <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-3"><span className="text-slate-400">Confidence:</span> {prediction.confidence ?? "—"}%</div>
            <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-3"><span className="text-slate-400">Analysis:</span> {prediction.analysis || "—"}</div>
            <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-3"><span className="text-slate-400">Result:</span> {prediction.result || "pending"}</div>
            <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-3"><span className="text-slate-400">Published date:</span> {prediction.publishedAt ? new Date(prediction.publishedAt).toLocaleString() : "—"}</div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default PredictionDetailsPage;
