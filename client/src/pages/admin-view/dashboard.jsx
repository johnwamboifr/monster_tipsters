/* eslint-disable react/no-unescaped-entities */
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from "recharts";
//import { TrendingUp, Users, Trophy, BadgePercent, ArrowUpRight, Activity, Zap } from "lucide-react";
import {
  TrendingUp,
  Users,
  Trophy,
  BadgePercent,
  ArrowUpRight,
  Activity,
  Zap,
  RefreshCw,
  Database,
  ShieldCheck,
  CalendarDays,
  ListOrdered,
  Target,
  Goal,
} from "lucide-react";
import { fetchUsers } from "@/features/slices/usersSlice";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import dashboardHero from "@/assets/pexels-work2survive-32545253.jpg";
import ImageHero from "@/components/common/ImageHero";
import "@/components/common/image-utilities.css";

const AdminDashboard = () => {
  const dispatch = useDispatch();
  const users = useSelector((state) => state.users.list);
  const [stats, setStats] = useState({ totalPredictions: 0, publishedPredictions: 0, premiumPredictions: 0, freePredictions: 0, pendingResults: 0, wonPredictions: 0, lostPredictions: 0, todayFixtures: 0, upcomingFixtures: 0 });
  const [predictions, setPredictions] = useState([]);
  const [syncing, setSyncing] = useState(null);
const [syncMessage, setSyncMessage] = useState(null);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const [statsResponse, predictionsResponse] = await Promise.all([
          fetch("/api/admin/predictions/stats", {
            headers: {
              "Content-Type": "application/json",
              ...(typeof window !== "undefined" && window.localStorage.getItem("token")
                ? { "x-auth-token": window.localStorage.getItem("token"), Authorization: `Bearer ${window.localStorage.getItem("token")}` }
                : {}),
            },
          }),
          fetch("/api/admin/predictions", {
            headers: {
              "Content-Type": "application/json",
              ...(typeof window !== "undefined" && window.localStorage.getItem("token")
                ? { "x-auth-token": window.localStorage.getItem("token"), Authorization: `Bearer ${window.localStorage.getItem("token")}` }
                : {}),
            },
          }),
        ]);
        const statsResult = await statsResponse.json();
        const predictionsResult = await predictionsResponse.json();
        if (statsResponse.ok && statsResult?.success !== false) {
          setStats(statsResult.data || stats);
        }
        if (predictionsResponse.ok && predictionsResult?.success !== false) {
          setPredictions(predictionsResult.data || []);
        }
      } catch (error) {
        console.error("Unable to load dashboard prediction stats", error);
      }
    };

    loadStats();
    dispatch(fetchUsers());
  }, [dispatch]);

  const today = new Date().toISOString().split("T")[0];
  const usersJoinedToday = users.filter(
    (user) => new Date(user.createdAt).toISOString().split("T")[0] === today
  );

  const resultCounts = predictions.reduce(
    (acc, prediction) => {
      const result = prediction.result?.toLowerCase();
      if (result === "won") acc.win += 1;
      else if (result === "lost") acc.loss += 1;
      return acc;
    },
    { win: 0, loss: 0 }
  );

  const totalTipsWithResults = resultCounts.win + resultCounts.loss;
  const winRate = totalTipsWithResults > 0 ? Math.round((resultCounts.win / totalTipsWithResults) * 100) : 0;

  const chartData = [{ category: "Prediction Results", Win: resultCounts.win, Loss: resultCounts.loss }];

  const statCards = [
    { title: "Total Users", value: users.length, icon: Users, accent: "text-blue-300" },
    { title: "Total Predictions", value: stats.totalPredictions, icon: Trophy, accent: "text-emerald-300" },
    { title: "New Today", value: usersJoinedToday.length, icon: Activity, accent: "text-violet-300" },
    { title: "Win Rate", value: `${winRate}%`, icon: BadgePercent, accent: "text-amber-300" },
  ];

  const syncFootballData = async (type) => {
  if (syncing) return;

  setSyncing(type);
  setSyncMessage(null);

  try {
    const token =
      typeof window !== "undefined"
        ? window.localStorage.getItem("token")
        : null;

    const endpoint =
      type === "all"
        ? "/api/admin/football/sync"
        : `/api/admin/football/sync/${type}`;

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token
          ? {
              "x-auth-token": token,
              Authorization: `Bearer ${token}`,
            }
          : {}),
      },
    });

    const result = await response.json();

    if (!response.ok || result?.success === false) {
      throw new Error(
        result?.message ||
        result?.error ||
        "Football synchronization failed"
      );
    }

    setSyncMessage({
      type: "success",
      message:
        result?.message ||
        "Football data synchronized successfully.",
      data: result?.data,
    });
  } catch (error) {
    console.error(
      "[Admin Dashboard] Football sync failed:",
      error
    );

    setSyncMessage({
      type: "error",
      message:
        error?.message ||
        "Football synchronization failed.",
    });
  } finally {
    setSyncing(null);
  }
};

  return (
    <div className="space-y-6">
      {/* Hero Section with Image */}
      
        <ImageHero
  backgroundImage={dashboardHero}
  title="Welcome to Your Control Center"
  subtitle="Manage predictions, users, and track performance metrics all in one place"
  overlay={0.7}
  height="h-64 sm:h-72 md:h-80"
  contentPosition="top-center"
  imagePosition="center"
>
        <div className="mt-4 flex justify-center gap-3">
          <Button 
            size="sm"
            className="rounded-full bg-emerald-500 hover:bg-emerald-600 text-white"
            onClick={() => window.location.href = "/admin/tips"}
          >
            <Zap className="h-4 w-4 mr-2" />
            Manage Tips
          </Button>
          <Button 
            size="sm"
            variant="outline" 
            className="rounded-full"
            onClick={() => window.location.href = "/admin/users"}
          >
            View Users
          </Button>
        </div>
      </ImageHero>

      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400">Overview</p>
          <h1 className="text-2xl font-bold text-white md:text-3xl">Admin Dashboard</h1>
        </div>
        <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-xs text-emerald-300">
          <TrendingUp className="h-3.5 w-3.5" />
          {new Date().toLocaleDateString("en-US", { weekday: "short", year: "numeric", month: "short", day: "numeric" })}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {statCards.map(({ title, value, icon: Icon, accent }) => (
          <div key={title} className="rounded-[22px] border border-white/10 bg-slate-900/85 p-4 shadow-[0_14px_35px_rgba(15,23,42,0.28)]">
            <div className="mb-4 flex items-center justify-between">
              <span className="text-[10px] uppercase tracking-[0.2em] text-slate-400">{title}</span>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 text-slate-200">
                <Icon className={`h-4 w-4 ${accent}`} />
              </div>
            </div>
            <div className="flex items-end justify-between">
              <div className="text-3xl font-black text-white">{value}</div>
              <ArrowUpRight className="h-4 w-4 text-emerald-300" />
            </div>
          </div>
        ))}
      </div>
      {/* Football Data Synchronization */}
<div className="rounded-[24px] border border-white/10 bg-slate-900/85 p-5 shadow-[0_18px_45px_rgba(15,23,42,0.32)]">
  <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
    <div>
      <div className="flex items-center gap-2">
        <Database className="h-5 w-5 text-emerald-300" />
        <h2 className="text-lg font-semibold text-white">
          Football Data Synchronization
        </h2>
      </div>

      <p className="mt-1 text-xs text-slate-400">
        Manually synchronize football-data.org information with
        the database.
      </p>
    </div>

    <Button
      size="sm"
      onClick={() => syncFootballData("all")}
      disabled={Boolean(syncing)}
      className="rounded-full bg-emerald-500 text-white hover:bg-emerald-600"
    >
      <RefreshCw
        className={`mr-2 h-4 w-4 ${
          syncing === "all" ? "animate-spin" : ""
        }`}
      />

      {syncing === "all"
        ? "Syncing..."
        : "Sync All"}
    </Button>
  </div>

  {/* Sync status */}
  {syncMessage && (
    <div
      className={`mb-5 rounded-xl border px-4 py-3 text-sm ${
        syncMessage.type === "success"
          ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-300"
          : "border-red-500/20 bg-red-500/10 text-red-300"
      }`}
    >
      <div className="flex items-center gap-2">
        {syncMessage.type === "success" ? (
          <ShieldCheck className="h-4 w-4" />
        ) : (
          <Activity className="h-4 w-4" />
        )}

        <span>{syncMessage.message}</span>
      </div>
    </div>
  )}

  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
    {/* Leagues */}
    <Button
      variant="outline"
      disabled={Boolean(syncing)}
      onClick={() => syncFootballData("leagues")}
      className="h-auto justify-start rounded-2xl border-white/10 bg-slate-950/60 p-4 text-left text-white hover:bg-slate-800"
    >
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10">
          <Trophy className="h-4 w-4 text-blue-300" />
        </div>

        <div>
          <p className="text-sm font-semibold">
            {syncing === "leagues"
              ? "Syncing..."
              : "Sync Leagues"}
          </p>
          <p className="text-[11px] text-slate-400">
            Competitions
          </p>
        </div>
      </div>
    </Button>

    {/* Teams */}
    <Button
      variant="outline"
      disabled={Boolean(syncing)}
      onClick={() => syncFootballData("teams")}
      className="h-auto justify-start rounded-2xl border-white/10 bg-slate-950/60 p-4 text-left text-white hover:bg-slate-800"
    >
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/10">
          <Users className="h-4 w-4 text-cyan-300" />
        </div>

        <div>
          <p className="text-sm font-semibold">
            {syncing === "teams"
              ? "Syncing..."
              : "Sync Teams"}
          </p>
          <p className="text-[11px] text-slate-400">
            Clubs and teams
          </p>
        </div>
      </div>
    </Button>

    {/* Fixtures */}
    <Button
      variant="outline"
      disabled={Boolean(syncing)}
      onClick={() => syncFootballData("fixtures")}
      className="h-auto justify-start rounded-2xl border-white/10 bg-slate-950/60 p-4 text-left text-white hover:bg-slate-800"
    >
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/10">
          <CalendarDays className="h-4 w-4 text-violet-300" />
        </div>

        <div>
          <p className="text-sm font-semibold">
            {syncing === "fixtures"
              ? "Syncing..."
              : "Sync Fixtures"}
          </p>
          <p className="text-[11px] text-slate-400">
            Upcoming matches
          </p>
        </div>
      </div>
    </Button>

    {/* Standings */}
    <Button
      variant="outline"
      disabled={Boolean(syncing)}
      onClick={() => syncFootballData("standings")}
      className="h-auto justify-start rounded-2xl border-white/10 bg-slate-950/60 p-4 text-left text-white hover:bg-slate-800"
    >
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10">
          <ListOrdered className="h-4 w-4 text-amber-300" />
        </div>

        <div>
          <p className="text-sm font-semibold">
            {syncing === "standings"
              ? "Syncing..."
              : "Sync Standings"}
          </p>
          <p className="text-[11px] text-slate-400">
            League tables
          </p>
        </div>
      </div>
    </Button>

    {/* Scorers */}
    <Button
      variant="outline"
      disabled={Boolean(syncing)}
      onClick={() => syncFootballData("scorers")}
      className="h-auto justify-start rounded-2xl border-white/10 bg-slate-950/60 p-4 text-left text-white hover:bg-slate-800"
    >
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-500/10">
          <Goal className="h-4 w-4 text-rose-300" />
        </div>

        <div>
          <p className="text-sm font-semibold">
            {syncing === "scorers"
              ? "Syncing..."
              : "Sync Scorers"}
          </p>
          <p className="text-[11px] text-slate-400">
            Top goal scorers
          </p>
        </div>
      </div>
    </Button>

    {/* Results */}
    <Button
      variant="outline"
      disabled={Boolean(syncing)}
      onClick={() => syncFootballData("results")}
      className="h-auto justify-start rounded-2xl border-white/10 bg-slate-950/60 p-4 text-left text-white hover:bg-slate-800"
    >
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10">
          <Target className="h-4 w-4 text-emerald-300" />
        </div>

        <div>
          <p className="text-sm font-semibold">
            {syncing === "results"
              ? "Syncing..."
              : "Sync Results"}
          </p>
          <p className="text-[11px] text-slate-400">
            Finished matches
          </p>
        </div>
      </div>
    </Button>
  </div>
</div>

      <div className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
        <div className="rounded-[24px] border border-white/10 bg-slate-900/85 p-4 shadow-[0_18px_45px_rgba(15,23,42,0.32)]">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">Prediction performance</h2>
            <span className="text-xs text-slate-400">Last 30 days</span>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                <XAxis dataKey="category" tick={{ fill: "#cbd5e1", fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#cbd5e1", fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip
                  cursor={{ fill: "rgba(148,163,184,0.08)" }}
                  contentStyle={{
                    borderRadius: "14px",
                    border: "1px solid rgba(148,163,184,0.2)",
                    backgroundColor: "#0f172a",
                    color: "#f8fafc",
                    fontSize: "12px",
                  }}
                />
                <Bar dataKey="Win" fill="#34d399" radius={[8, 8, 0, 0]} />
                <Bar dataKey="Loss" fill="#f87171" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-[24px] border border-white/10 bg-slate-900/85 p-4 shadow-[0_18px_45px_rgba(15,23,42,0.32)]">
          <h2 className="mb-4 text-lg font-semibold text-white">Recent signups</h2>
          <div className="space-y-3">
            {usersJoinedToday.length > 0 ? (
              usersJoinedToday.slice(0, 5).map((user) => (
                <div key={user.id} className="flex items-center gap-3 rounded-2xl border border-white/8 bg-slate-950/70 p-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-cyan-500 font-semibold text-slate-950">
                    {user.name?.[0]?.toUpperCase() || "?"}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-white">{user.email}</p>
                    <p className="text-[11px] text-slate-400">
                      {new Date(user.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="py-8 text-center text-sm text-slate-400">No new users today</p>
            )}
          </div>
        </div>
      </div>

      <div className="rounded-[24px] border border-white/10 bg-slate-900/85 p-4 shadow-[0_18px_45px_rgba(15,23,42,0.32)]">
        <h2 className="mb-4 text-lg font-semibold text-white">Detailed statistics</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {[
            { title: "Wins", value: resultCounts.win, tone: "text-emerald-300", percent: totalTipsWithResults > 0 ? `${Math.round((resultCounts.win / totalTipsWithResults) * 100)}%` : "No data" },
            { title: "Losses", value: resultCounts.loss, tone: "text-red-300", percent: totalTipsWithResults > 0 ? `${Math.round((resultCounts.loss / totalTipsWithResults) * 100)}%` : "No data" },
            { title: "Analyzed", value: totalTipsWithResults, tone: "text-blue-300", percent: stats.totalPredictions > 0 ? `${Math.round((totalTipsWithResults / stats.totalPredictions) * 100)}%` : "No data" },
          ].map((item) => (
            <div key={item.title} className="rounded-2xl border border-white/8 bg-slate-950/70 p-4">
              <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400">{item.title}</p>
              <div className={`mt-3 text-3xl font-black ${item.tone}`}>{item.value}</div>
              <p className="mt-2 text-xs text-slate-400">{item.percent}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
