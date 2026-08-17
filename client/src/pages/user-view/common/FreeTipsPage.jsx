import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import { fetchFreePredictions } from "@/features/slices/footballSlice";

import PredictionCard from "@/components/common/PredictionCard";
import SearchBar from "@/components/common/SearchBar";
import EmptyState from "@/components/common/EmptyState";
import ErrorState from "@/components/common/ErrorState";
import LoadingSkeleton from "@/components/common/LoadingSkeleton";
import Pagination from "@/components/common/Pagination";

const itemsPerPage = 6;

const FreeTipsPage = () => {
  const dispatch = useDispatch();

  const {
    freePredictions: predictions = [],
    loadingStatus,
    error,
  } = useSelector((state) => state.football);

  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    dispatch(fetchFreePredictions());
  }, [dispatch]);

  const filteredPredictions = useMemo(() => {
    const query = searchTerm.toLowerCase();

    if (!query) return predictions;

    return predictions.filter((prediction) =>
      [
        prediction.league,
        prediction.homeTeam,
        prediction.awayTeam,
        prediction.prediction,
        prediction.market,
      ]
        .filter(Boolean)
        .some((value) =>
          String(value).toLowerCase().includes(query)
        )
    );
  }, [predictions, searchTerm]);

  useEffect(() => {
    setPage(1);
  }, [searchTerm]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredPredictions.length / itemsPerPage)
  );

  const paginatedPredictions = filteredPredictions.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

  return (
    <div className="space-y-6 py-4">
      <section className="section-shell">
        <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-[10px] uppercase tracking-[0.22em] text-slate-400">
              Free tips
            </p>
            <h1 className="mt-1 text-2xl font-bold text-white">
              Published free predictions
            </h1>
          </div>

          <div className="w-full max-w-md">
            <SearchBar
              value={searchTerm}
              onChange={setSearchTerm}
              placeholder="Search leagues, teams or picks..."
            />
          </div>
        </div>

        {loadingStatus ? (
          <LoadingSkeleton count={6} />
        ) : error ? (
          <ErrorState
            title="Unable to load free tips"
            message={error}
            onRetry={() => dispatch(fetchFreePredictions())}
          />
        ) : paginatedPredictions.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {paginatedPredictions.map((prediction) => (
              <PredictionCard
                key={prediction.fixtureId || prediction.id}
                prediction={prediction}
                onViewDetails={() =>
                  (window.location.href = `/user/prediction/${prediction.fixtureId}`)
                }
              />
            ))}
          </div>
        ) : (
          <EmptyState
            title="No free tips available today"
            message="Our analysts haven't published today's free tips yet. Please check back later."
            actionLabel="Refresh"
            onAction={() => dispatch(fetchFreePredictions())}
          />
        )}

        <Pagination
          page={page}
          totalPages={totalPages}
          onPageChange={setPage}
        />
      </section>
    </div>
  );
};

export default FreeTipsPage;
