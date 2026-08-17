/* eslint-disable react/prop-types */
import { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { motion } from "framer-motion";
import { ArrowRight, ShieldCheck, Sparkles, TrendingUp, Trophy, Zap, Target } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { fetchHomeData, fetchFixtures } from "@/features/slices/footballSlice";
import PredictionCard from "@/components/common/PredictionCard";
import FixtureCard from "@/components/common/FixtureCard";
import EmptyState from "@/components/common/EmptyState";
import ErrorState from "@/components/common/ErrorState";
import LoadingSkeleton from "@/components/common/LoadingSkeleton";
import ImageHero from "@/components/common/ImageHero";
import ImageSection from "@/components/common/ImageSection";
import "@/components/common/image-utilities.css";
import footballHero from "@/assets/pexels-work2survive-32545253.jpg";
import footballAnalysis from "@/assets/pexels-srijonism-12537018.jpg";

const Home = () => {
  const dispatch = useDispatch();
  const homeData = useSelector((state) => state.football.home);
  const homeLoading = useSelector((state) => state.football.loading.homeData);
  const homeError = useSelector((state) => state.football.errors.homeData);
  const fixtures = useSelector((state) => state.football.fixtures || []);
  const fixturesLoading = useSelector((state) => state.football.loading.fixtures);
  const fixturesError = useSelector((state) => state.football.errors.fixtures);

  useEffect(() => {
    dispatch(fetchHomeData());
    dispatch(fetchFixtures({ status: "SCHEDULED", limit: 10 }));

    const interval = window.setInterval(() => {
      dispatch(fetchHomeData());
      dispatch(fetchFixtures({ status: "SCHEDULED", limit: 10 }));
    }, 30000);

    return () => {
      window.clearInterval(interval);
    };
  }, [dispatch]);

  const freeTips = useMemo(() => homeData?.freeTips || [], [homeData]);
  const featuredPredictions = useMemo(() => homeData?.featuredPredictions || [], [homeData]);
  const recentWins = useMemo(() => homeData?.recentWins || [], [homeData]);
  const statistics = useMemo(() => homeData?.statistics || {}, [homeData]);
  const leagueSummary = useMemo(
    () => [...new Set([...(featuredPredictions || []).map((item) => item.league).filter(Boolean), ...(freeTips || []).map((item) => item.league).filter(Boolean)])].slice(0, 6),
    [featuredPredictions, freeTips]
  );

  const statCards = [
    { label: "Total predictions", value: String(statistics?.totalPredictions || freeTips.length || 0), detail: "Synced from the backend" },
    { label: "Win rate", value: statistics?.totalPredictions ? `${Math.min(100, Math.max(0, Math.round((Number(statistics?.won || 0) / Math.max(Number(statistics?.totalPredictions || 1), 1)) * 100)))}%` : "0%", detail: "Based on recorded results" },
    { label: "Popular leagues", value: String(leagueSummary.length), detail: "Across the board" },
  ];

  const featuredTips = freeTips.slice(0, 3);
  const upcomingFixtures = fixtures.slice(0, 10);

  const navigateToDetails = (fixtureId) => {
    if (fixtureId) {
      window.location.href = `/user/prediction/${fixtureId}`;
    }
  };

  return (
    <div className="space-y-6 pb-10">
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="overflow-hidden rounded-[30px] border border-white/10 bg-[radial-gradient(circle_at_top_left,_rgba(16,185,129,0.18),_transparent_28%),linear-gradient(135deg,#111827_0%,#0b1020_45%,#0b0f19_100%)] p-5 shadow-[0_25px_80px_rgba(15,23,42,0.55)] sm:p-7"
      >
        <div className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr] lg:items-center">
          <div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-emerald-300">
              <Sparkles className="h-3.5 w-3.5" />
              Elite predictions
            </div>
            <h1 className="max-w-xl text-3xl font-black tracking-tight text-white sm:text-5xl">
              Smart football picks, built for winners.
            </h1>
            <p className="mt-4 max-w-lg text-sm text-slate-300 sm:text-base">
              Follow the latest free football tips, expert match previews, and sharper market insight for your next winning move.
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Button onClick={() => document.getElementById("today-free-tips")?.scrollIntoView({ behavior: "smooth" })} className="rounded-full px-5 py-2.5 text-sm">View today’s tips</Button>
              <Button variant="outline" className="rounded-full px-5 py-2.5 text-sm" onClick={() => window.location.href = "/user/search"}>
                Explore all matches <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
            <div className="mt-6 flex flex-wrap gap-3 text-xs text-slate-300">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-2.5 py-1">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-300" /> Verified picks
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-2.5 py-1">
                <TrendingUp className="h-3.5 w-3.5 text-blue-300" /> Updated daily
              </span>
            </div>
          </div>

          <div className="rounded-[24px] border border-white/10 bg-slate-900/70 p-4 shadow-[0_20px_40px_rgba(15,23,42,0.5)]">
            <div className="flex items-center justify-between">
              <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400">Today’s spotlight</p>
              <Badge variant="secondary">Live</Badge>
            </div>
            <div className="mt-4 space-y-3">
              {featuredTips.length > 0 ? (
                featuredTips.map((tip) => (
                  <div key={tip.id || `${tip.league}-${tip.homeTeam}-${tip.awayTeam}`} className="rounded-2xl border border-white/8 bg-slate-950/60 p-3">
                    <div className="flex items-center justify-between text-[11px] text-slate-300">
                      <span>{tip.league}</span>
                      <span>{tip.kickoffTime ? new Date(tip.kickoffTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "19:30"}</span>
                    </div>
                    <div className="mt-3 flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-white">{tip.homeTeam || "Home"} vs {tip.awayTeam || "Away"}</p>
                        <p className="text-xs text-slate-400">{tip.prediction}</p>
                      </div>
                      <div className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-1 text-xs font-semibold text-emerald-300">{tip.odds || "2.05"}</div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-2xl border border-dashed border-white/10 px-3 py-4 text-xs text-slate-400">No live spotlight available yet.</div>
              )}
            </div>
          </div>
        </div>
      </motion.section>

      {/* Image Gallery Section */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
        className="space-y-4"
      >
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400">Featured content</p>
            <h2 className="mt-1 text-xl font-bold text-white">Why choose Monster Tipsters?</h2>
          </div>
        </div>

        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          <ImageSection
            image={footballHero}
            title="Expert Analysis"
            description="Get predictions backed by advanced football analytics and expert insights."
            badges={["Pro Tips", "Analysis"]}
            onClick={() => window.location.href = "/user/premium"}
          />
          <ImageSection
            image={footballAnalysis}
            title="Professional Picks"
            description="Follow professional tipsters and track their winning records."
            badges={["Professional", "Verified"]}
            onClick={() => window.location.href = "/user/premium"}
          />
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="group relative overflow-hidden rounded-2xl h-64 cursor-pointer bg-gradient-to-br from-emerald-500/20 to-teal-600/20 border border-emerald-500/30 flex items-center justify-center"
            onClick={() => window.location.href = "/premium-tips"}
          >
            <div className="absolute inset-0 transition-all duration-300 group-hover:opacity-75" style={{
              background: `linear-gradient(180deg, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.6) 100%)`,
            }} />
            <div className="relative z-10 text-center p-6 text-white">
              <Zap className="h-12 w-12 mx-auto mb-3 text-emerald-400" />
              <h3 className="text-lg font-bold">VIP Exclusive</h3>
              <p className="text-xs text-slate-200 mt-2">Premium tips with higher odds and accuracy rates</p>
              <Badge className="mt-3 bg-emerald-500/30 text-emerald-300 border-emerald-500/30">Premium</Badge>
            </div>
          </motion.div>
        </div>
      </motion.section>

      <section id="today-free-tips" className="section-shell">
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400">Free tips</p>
            <h2 className="mt-1 text-xl font-bold text-white">Today’s free tips</h2>
          </div>
        </div>

        {homeLoading ? (
          <LoadingSkeleton count={3} />
        ) : !!homeError ? (
          <ErrorState title="Couldn’t load free tips" message={homeError || "We couldn’t load the latest free tips."} onRetry={() => dispatch(fetchHomeData())} />
        ) : freeTips.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {freeTips.map((tip) => (
              <PredictionCard key={tip.fixtureId || tip.id} prediction={tip} onViewDetails={navigateToDetails} />
            ))}
          </div>
        ) : (
          <EmptyState title="No free tips available today." message="Check back later for the next set of predictions and match analysis." actionLabel="Refresh" onAction={() => window.location.reload()} />
        )}
      </section>

      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <section className="section-shell">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">Featured predictions</h3>
            <Badge variant="outline">Top picks</Badge>
          </div>
          <div className="space-y-3">
            {featuredPredictions.length > 0 ? (
              featuredPredictions.slice(0, 4).map((tip) => (
                <div key={tip.fixtureId || tip.id} className="flex items-center justify-between gap-3 border-b border-white/8 pb-3 last:border-b-0 last:pb-0">
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.16em] text-slate-400">{tip.league}</p>
                    <p className="mt-1 text-sm font-semibold text-white">{tip.homeTeam || "Home"} vs {tip.awayTeam || "Away"}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] uppercase tracking-[0.16em] text-slate-400">Prediction</p>
                    <p className="mt-1 text-sm font-semibold text-emerald-300">{tip.prediction}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-400">No featured predictions available.</p>
            )}
          </div>
        </section>

        <section className="section-shell">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">Popular leagues</h3>
            <Trophy className="h-4 w-4 text-emerald-300" />
          </div>
          <div className="flex flex-wrap gap-2">
            {leagueSummary.length > 0 ? (
              leagueSummary.map((league) => (
                <span key={league} className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-slate-200">
                  {league}
                </span>
              ))
            ) : (
              <p className="text-sm text-slate-400">No leagues loaded yet.</p>
            )}
          </div>
        </section>
      </div>

      <section className="section-shell">
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400">Upcoming fixtures</p>
            <h2 className="mt-1 text-xl font-bold text-white">Next scheduled matches</h2>
          </div>
        </div>

        {fixturesLoading ? (
          <LoadingSkeleton count={3} />
        ) : !!fixturesError ? (
          <ErrorState title="Couldn’t load fixtures" message={fixturesError || "The football schedule is temporarily unavailable. Please try again in a moment."} onRetry={() => dispatch(fetchFixtures({ status: "SCHEDULED", limit: 10 }))} />
        ) : upcomingFixtures.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {upcomingFixtures.map((fixture) => (
              <FixtureCard
                key={fixture.fixtureId || fixture.matchId || `${fixture.homeTeam}-${fixture.awayTeam}-${fixture.kickoffTime}`}
                fixture={fixture}
                onViewMatch={() => navigateToDetails(fixture.fixtureId || fixture.matchId)}
              />
            ))}
          </div>
        ) : (
          <EmptyState title="No upcoming fixtures available." message="There are no scheduled matches available right now. Check back later for the next synced fixtures." actionLabel="View All Fixtures" onAction={() => window.location.href = "/user/search"} />
        )}
      </section>

      <div className="grid gap-4 md:grid-cols-3">
        {statCards.map((item) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-[22px] border border-white/10 bg-slate-900/80 p-4 shadow-[0_12px_30px_rgba(15,23,42,0.25)]"
          >
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs uppercase tracking-[0.18em] text-slate-400">{item.label}</span>
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-300">
                <TrendingUp className="h-4 w-4" />
              </div>
            </div>
            <div className="text-2xl font-bold text-white">{item.value}</div>
            <div className="mt-2 text-xs text-slate-400">{item.detail}</div>
          </motion.div>
        ))}
      </div>

      {/* Call to Action Hero Section with Image */}
      <ImageHero
        backgroundImage={footballAnalysis}
        title="Ready to Level Up Your Game?"
        subtitle="Join thousands of successful tipsters making smarter predictions"
        overlay={0.65}
        height="h-72"
        contentPosition="center"
      >
        <div className="flex flex-col sm:flex-row gap-3 justify-center mt-5">
          <Button 
            className="rounded-full px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600"
            onClick={() => window.location.href = "/user/premium"}
          >
            <Target className="h-4 w-4 mr-2" />
            Upgrade to Premium
          </Button>
          <Button 
            variant="outline" 
            className="rounded-full px-6 py-2.5"
            onClick={() => window.location.href = "/user/contact"}
          >
            Contact Support
          </Button>
        </div>
      </ImageHero>

      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="section-shell">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">Recent winning tips</h3>
            <Badge variant="default">Wins</Badge>
          </div>
          <div className="space-y-3">
            {recentWins.length > 0 ? (
              recentWins.slice(0, 4).map((tip) => (
                <div key={tip.id || `${tip.league}-${tip.fixtureId}`} className="flex items-center justify-between gap-3 rounded-2xl border border-white/8 bg-slate-950/60 p-3">
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.16em] text-slate-400">{tip.league}</p>
                    <p className="mt-1 text-sm font-semibold text-white">{tip.homeTeam || "Home"} vs {tip.awayTeam || "Away"}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] uppercase tracking-[0.16em] text-slate-400">Result</p>
                    <p className="mt-1 text-sm font-semibold text-emerald-300">{tip.prediction}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-400">No recent winning tips yet.</p>
            )}
          </div>
        </section>

        <section className="section-shell">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">VIP membership</h3>
            <Badge variant="secondary">Premium</Badge>
          </div>
          <div className="rounded-[22px] border border-amber-500/20 bg-[radial-gradient(circle_at_top,_rgba(245,158,11,0.18),_transparent_35%),rgba(15,23,42,0.9)] p-5">
            <p className="text-[10px] uppercase tracking-[0.18em] text-amber-300">Members only</p>
            <h4 className="mt-3 text-2xl font-bold text-white">Unlock higher-conviction predictions.</h4>
            <p className="mt-3 text-sm text-slate-300">Get premium picks, deeper analysis, and exclusive access to the strongest betting codes.</p>
            <Button className="mt-5 rounded-full bg-amber-400 text-slate-950 hover:bg-amber-300">Upgrade now</Button>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Home;
