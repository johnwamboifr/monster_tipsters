import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

import {
  getStatistics,
  selectOverallStatistics,
  selectPackageStatistics,
} from "@/features/slices/statisticsSlice";

import PageHeader from "@/components/common/unified/PageHeader";
import StatsCard from "@/components/common/unified/StatsCard";
import LoadingSkeleton from "@/components/common/unified/LoadingSkeleton";
import ErrorState from "@/components/common/ErrorState";

import {
  Activity,
  Trophy,
  TrendingUp,
  Sparkles,
  XCircle,
  RotateCcw,
} from "lucide-react";

const StatisticsPage = () => {
  const dispatch = useDispatch();

  const overall = useSelector(selectOverallStatistics);
  const packages = useSelector(selectPackageStatistics);

  const status = useSelector(
    (state) => state.statistics.status
  );

  const error = useSelector(
    (state) => state.statistics.error
  );

  useEffect(() => {
    dispatch(getStatistics());
  }, [dispatch]);

  const loading = status === "pending";

  const packageData = [
    {
      key: "free",
      label: "Free Tips",
      data: packages?.free,
    },
    {
      key: "bronze",
      label: "Bronze Tips",
      data: packages?.bronze,
    },
    {
      key: "silver",
      label: "Silver Tips",
      data: packages?.silver,
    },
    {
      key: "gold",
      label: "Gold Tips",
      data: packages?.gold,
    },
  ];

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Statistics"
        title="Performance overview"
        description="Live performance numbers from your published tips, separated by subscription package."
      />

      {loading ? (
        <LoadingSkeleton count={4} />
      ) : !!error ? (
        <ErrorState
          title="Unable to load statistics"
          message={error}
          onRetry={() => dispatch(getStatistics())}
        />
      ) : (
        <>
          {/* =====================================================
              OVERALL STATISTICS
          ===================================================== */}

          <section className="space-y-4">
            <div>
              <h2 className="text-lg font-semibold text-foreground">
                Overall performance
              </h2>

              <p className="text-sm text-muted-foreground">
                Combined results across all tip packages.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
              <StatsCard
                label="Total tips"
                value={overall?.total ?? 0}
                detail="All published tips"
                icon={Sparkles}
              />

              <StatsCard
                label="Tips won"
                value={overall?.won ?? 0}
                detail="Successful tips"
                icon={Trophy}
              />

              <StatsCard
                label="Tips lost"
                value={overall?.lost ?? 0}
                detail="Unsuccessful tips"
                icon={XCircle}
              />

              <StatsCard
                label="Pending"
                value={overall?.pending ?? 0}
                detail="Unresolved tips"
                icon={Activity}
              />

              <StatsCard
                label="Refunded"
                value={overall?.refunded ?? 0}
                detail="Refunded tips"
                icon={RotateCcw}
              />

              <StatsCard
                label="Win rate"
                value={`${overall?.winRate ?? 0}%`}
                detail="Overall winning accuracy"
                icon={TrendingUp}
              />
            </div>
          </section>

          {/* =====================================================
              PACKAGE PERFORMANCE
          ===================================================== */}

          <section className="space-y-4">
            <div>
              <h2 className="text-lg font-semibold text-foreground">
                Performance by package
              </h2>

              <p className="text-sm text-muted-foreground">
                Tips are calculated independently for Free, Bronze,
                Silver and Gold.
              </p>
            </div>

            <div className="grid gap-5 lg:grid-cols-2">
              {packageData.map((pkg) => {
                const data = pkg.data || {};

                return (
                  <div
                    key={pkg.key}
                    className="rounded-2xl border border-border/70 bg-card p-5 shadow-sm"
                  >
                    {/* PACKAGE HEADER */}

                    <div className="mb-5 flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-foreground">
                          {pkg.label}
                        </h3>

                        <p className="text-sm text-muted-foreground">
                          {data.total ?? 0} total tips
                        </p>
                      </div>

                      <div className="rounded-full bg-primary/10 px-4 py-2">
                        <span className="text-sm font-bold text-primary">
                          {data.winRate ?? 0}%
                        </span>
                      </div>
                    </div>

                    {/* PACKAGE STATISTICS */}

                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                      <div className="rounded-xl bg-muted/40 p-4">
                        <p className="text-xs font-medium text-muted-foreground">
                          Won
                        </p>

                        <p className="mt-1 text-xl font-bold text-emerald-600">
                          {data.won ?? 0}
                        </p>
                      </div>

                      <div className="rounded-xl bg-muted/40 p-4">
                        <p className="text-xs font-medium text-muted-foreground">
                          Lost
                        </p>

                        <p className="mt-1 text-xl font-bold text-rose-600">
                          {data.lost ?? 0}
                        </p>
                      </div>

                      <div className="rounded-xl bg-muted/40 p-4">
                        <p className="text-xs font-medium text-muted-foreground">
                          Pending
                        </p>

                        <p className="mt-1 text-xl font-bold text-amber-600">
                          {data.pending ?? 0}
                        </p>
                      </div>

                      <div className="rounded-xl bg-muted/40 p-4">
                        <p className="text-xs font-medium text-muted-foreground">
                          Refunded
                        </p>

                        <p className="mt-1 text-xl font-bold text-slate-600">
                          {data.refunded ?? 0}
                        </p>
                      </div>
                    </div>

                    {/* WIN RATE */}

                    <div className="mt-5">
                      <div className="mb-2 flex items-center justify-between">
                        <span className="text-sm font-medium text-muted-foreground">
                          Win rate
                        </span>

                        <span className="text-sm font-semibold text-foreground">
                          {data.winRate ?? 0}%
                        </span>
                      </div>

                      <div className="h-2 overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full rounded-full bg-primary transition-all"
                          style={{
                            width: `${Math.min(
                              Number(data.winRate ?? 0),
                              100
                            )}%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </>
      )}
    </div>
  );
};

export default StatisticsPage;
