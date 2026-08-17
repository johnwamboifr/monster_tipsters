import { useEffect, useMemo, useState } from "react";
import {
  BarChart3,
  CalendarDays,
  Check,
  ChevronRight,
  CircleDollarSign,
  Clock3,
  FileText,
  PencilLine,
  Plus,
  Search,
  ShieldCheck,
  Trash2,
  Trophy,
  X,
  RotateCcw,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

/*
|--------------------------------------------------------------------------
| TIP TYPES
|--------------------------------------------------------------------------
*/

const TIP_TYPE_OPTIONS = [
  {
    value: "free",
    label: "Free",
    description: "Available to everyone",
  },
  {
    value: "bronze",
    label: "Bronze",
    description: "Bronze subscribers",
  },
  {
    value: "silver",
    label: "Silver",
    description: "Silver subscribers",
  },
  {
    value: "gold",
    label: "Gold",
    description: "Gold subscribers",
  },
];

/*
|--------------------------------------------------------------------------
| BETTING MARKETS
|--------------------------------------------------------------------------
|
| Keep the market values stable because they are saved in the database.
|
*/

const MARKET_OPTIONS = [
  {
    value: "match_winner",
    label: "Match Winner",
    predictions: [
      { value: "home", label: "Home Win" },
      { value: "draw", label: "Draw" },
      { value: "away", label: "Away Win" },
    ],
  },

  {
    value: "double_chance",
    label: "Double Chance",
    predictions: [
      { value: "1X", label: "1X — Home or Draw" },
      { value: "X2", label: "X2 — Draw or Away" },
      { value: "12", label: "12 — Home or Away" },
    ],
  },

  {
    value: "draw_no_bet",
    label: "Draw No Bet",
    predictions: [
      { value: "home", label: "Home" },
      { value: "away", label: "Away" },
    ],
  },

  {
    value: "over_under_0_5",
    label: "Over/Under 0.5 Goals",
    predictions: [
      { value: "over_0_5", label: "Over 0.5" },
      { value: "under_0_5", label: "Under 0.5" },
    ],
  },

  {
    value: "over_under_1_5",
    label: "Over/Under 1.5 Goals",
    predictions: [
      { value: "over_1_5", label: "Over 1.5" },
      { value: "under_1_5", label: "Under 1.5" },
    ],
  },

  {
    value: "over_under_2_5",
    label: "Over/Under 2.5 Goals",
    predictions: [
      { value: "over_2_5", label: "Over 2.5" },
      { value: "under_2_5", label: "Under 2.5" },
    ],
  },

  {
    value: "over_under_3_5",
    label: "Over/Under 3.5 Goals",
    predictions: [
      { value: "over_3_5", label: "Over 3.5" },
      { value: "under_3_5", label: "Under 3.5" },
    ],
  },

  {
    value: "btts",
    label: "Both Teams To Score",
    predictions: [
      { value: "yes", label: "Yes" },
      { value: "no", label: "No" },
    ],
  },

  {
    value: "home_over_0_5",
    label: "Home Team Over 0.5 Goals",
    predictions: [
      { value: "yes", label: "Yes" },
      { value: "no", label: "No" },
    ],
  },

  {
    value: "home_over_1_5",
    label: "Home Team Over 1.5 Goals",
    predictions: [
      { value: "yes", label: "Yes" },
      { value: "no", label: "No" },
    ],
  },

  {
    value: "home_over_2_5",
    label: "Home Team Over 2.5 Goals",
    predictions: [
      { value: "yes", label: "Yes" },
      { value: "no", label: "No" },
    ],
  },

  {
    value: "away_over_0_5",
    label: "Away Team Over 0.5 Goals",
    predictions: [
      { value: "yes", label: "Yes" },
      { value: "no", label: "No" },
    ],
  },

  {
    value: "away_over_1_5",
    label: "Away Team Over 1.5 Goals",
    predictions: [
      { value: "yes", label: "Yes" },
      { value: "no", label: "No" },
    ],
  },

  {
    value: "away_over_2_5",
    label: "Away Team Over 2.5 Goals",
    predictions: [
      { value: "yes", label: "Yes" },
      { value: "no", label: "No" },
    ],
  },

  {
    value: "ht_over_under_0_5",
    label: "Half Time Over/Under 0.5",
    predictions: [
      { value: "over_0_5", label: "Over 0.5" },
      { value: "under_0_5", label: "Under 0.5" },
    ],
  },

  {
    value: "ht_over_under_1_5",
    label: "Half Time Over/Under 1.5",
    predictions: [
      { value: "over_1_5", label: "Over 1.5" },
      { value: "under_1_5", label: "Under 1.5" },
    ],
  },

  {
    value: "corners_over_under_7_5",
    label: "Total Corners 7.5",
    predictions: [
      { value: "over_7_5", label: "Over 7.5" },
      { value: "under_7_5", label: "Under 7.5" },
    ],
  },

  {
    value: "corners_over_under_8_5",
    label: "Total Corners 8.5",
    predictions: [
      { value: "over_8_5", label: "Over 8.5" },
      { value: "under_8_5", label: "Under 8.5" },
    ],
  },

  {
    value: "corners_over_under_9_5",
    label: "Total Corners 9.5",
    predictions: [
      { value: "over_9_5", label: "Over 9.5" },
      { value: "under_9_5", label: "Under 9.5" },
    ],
  },

  {
    value: "home_corners_over_under_3_5",
    label: "Home Team Corners 3.5",
    predictions: [
      { value: "over_3_5", label: "Over 3.5" },
      { value: "under_3_5", label: "Under 3.5" },
    ],
  },

  {
    value: "away_corners_over_under_3_5",
    label: "Away Team Corners 3.5",
    predictions: [
      { value: "over_3_5", label: "Over 3.5" },
      { value: "under_3_5", label: "Under 3.5" },
    ],
  },

  {
    value: "bookings_over_under_3_5",
    label: "Total Bookings 3.5",
    predictions: [
      { value: "over_3_5", label: "Over 3.5" },
      { value: "under_3_5", label: "Under 3.5" },
    ],
  },

  {
    value: "bookings_over_under_4_5",
    label: "Total Bookings 4.5",
    predictions: [
      { value: "over_4_5", label: "Over 4.5" },
      { value: "under_4_5", label: "Under 4.5" },
    ],
  },

  {
    value: "home_bookings_over_under_1_5",
    label: "Home Team Bookings 1.5",
    predictions: [
      { value: "over_1_5", label: "Over 1.5" },
      { value: "under_1_5", label: "Under 1.5" },
    ],
  },

  {
    value: "away_bookings_over_under_1_5",
    label: "Away Team Bookings 1.5",
    predictions: [
      { value: "over_1_5", label: "Over 1.5" },
      { value: "under_1_5", label: "Under 1.5" },
    ],
  },

  {
    value: "correct_score",
    label: "Correct Score",
    predictions: [],
    customInput: true,
  },
];

/*
|--------------------------------------------------------------------------
| EMPTY FORM
|--------------------------------------------------------------------------
*/

const emptyForm = () => ({
  id: null,

  league: "",
  match: "",

  date: new Date().toISOString().slice(0, 10),
  time: "18:00",

  market: "",
  prediction: "",

  odds: "",
  confidence: "",

  analysis: "",

  tipsType: "free",

  source: "manual",

  isWon: null,
  isLost: null,
  isRefunded: null,
});

/*
|--------------------------------------------------------------------------
| PLAN / TIP TYPE BADGES
|--------------------------------------------------------------------------
*/

const getTipTypeBadgeClasses = (type) => {
  const map = {
    free:
      "bg-slate-500/15 text-slate-200 border-slate-400/30",

    bronze:
      "bg-orange-500/15 text-orange-200 border-orange-400/30",

    silver:
      "bg-zinc-400/15 text-zinc-100 border-zinc-300/30",

    gold:
      "bg-yellow-500/15 text-yellow-200 border-yellow-400/30",
  };

  return (
    map[type] ||
    "bg-muted text-muted-foreground border-border"
  );
};

/*
|--------------------------------------------------------------------------
| RESULT BADGE
|--------------------------------------------------------------------------
*/

const getResultBadge = (tip) => {
  if (tip.isRefunded === true) {
    return {
      label: "REFUNDED",
      className:
        "bg-blue-500/15 text-blue-300 border-blue-400/30",
      icon: RotateCcw,
    };
  }

  if (tip.isWon === true) {
    return {
      label: "WON",
      className:
        "bg-emerald-500/15 text-emerald-300 border-emerald-400/30",
      icon: Check,
    };
  }

  if (tip.isLost === true) {
    return {
      label: "LOST",
      className:
        "bg-red-500/15 text-red-300 border-red-400/30",
      icon: X,
    };
  }

  return {
    label: "PENDING",
    className:
      "bg-amber-500/15 text-amber-300 border-amber-400/30",
    icon: Clock3,
  };
};

/*
|--------------------------------------------------------------------------
| AUTH HEADERS
|--------------------------------------------------------------------------
*/

const getAuthHeaders = () => {
  const token =
    typeof window !== "undefined"
      ? window.localStorage.getItem("token")
      : null;

  return {
    "Content-Type": "application/json",

    ...(token
      ? {
          "x-auth-token": token,
          Authorization: `Bearer ${token}`,
        }
      : {}),
  };
};

/*
|--------------------------------------------------------------------------
| COMPONENT
|--------------------------------------------------------------------------
*/

const AdminPremiumTips = () => {
  const [formData, setFormData] = useState(emptyForm());

  const [tips, setTips] = useState([]);

  const [searchTerm, setSearchTerm] = useState("");

  const [filterType, setFilterType] = useState("all");

  const [filterMarket, setFilterMarket] = useState("all");

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const [error, setError] = useState("");

  /*
  |--------------------------------------------------------------------------
  | CURRENT MARKET
  |--------------------------------------------------------------------------
  */

  const currentMarket = useMemo(
    () =>
      MARKET_OPTIONS.find(
        (market) =>
          market.value === formData.market
      ),
    [formData.market]
  );

  /*
  |--------------------------------------------------------------------------
  | PREDICTION OPTIONS
  |--------------------------------------------------------------------------
  */

  const predictionOptions =
    currentMarket?.predictions || [];

  /*
  |--------------------------------------------------------------------------
  | LOAD TIPS
  |--------------------------------------------------------------------------
  */

  const loadTips = async () => {
    try {
      setError("");

      const response = await fetch(
        "/api/tips/get",
        {
          headers: getAuthHeaders(),
        }
      );

      const result = await response.json();

      if (
        !response.ok ||
        result?.success === false
      ) {
        throw new Error(
          result?.message ||
            "Unable to load tips."
        );
      }

      setTips(
        Array.isArray(result?.data)
          ? result.data
          : []
      );
    } catch (loadError) {
      setError(
        loadError.message ||
          "Unable to load tips."
      );
    }
  };

  /*
  |--------------------------------------------------------------------------
  | INITIAL LOAD
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    loadTips();
  }, []);

  /*
  |--------------------------------------------------------------------------
  | FILTERED TIPS
  |--------------------------------------------------------------------------
  */

  const filteredTips = useMemo(() => {
    const term =
      searchTerm.trim().toLowerCase();

    return tips.filter((tip) => {
      const matchesSearch =
        !term ||
        [
          tip.league,
          tip.match,
          tip.prediction,
          tip.market,
          tip.tipsType,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(term);

      const matchesType =
        filterType === "all" ||
        tip.tipsType === filterType;

      const matchesMarket =
        filterMarket === "all" ||
        tip.market === filterMarket;

      return (
        matchesSearch &&
        matchesType &&
        matchesMarket
      );
    });
  }, [
    tips,
    searchTerm,
    filterType,
    filterMarket,
  ]);

  /*
  |--------------------------------------------------------------------------
  | FORM CHANGE
  |--------------------------------------------------------------------------
  */

  const handleChange = (event) => {
    const {
      name,
      value,
    } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  /*
  |--------------------------------------------------------------------------
  | MARKET CHANGE
  |--------------------------------------------------------------------------
  */

  const handleMarketChange = (value) => {
    setFormData((previous) => ({
      ...previous,
      market: value,
      prediction: "",
    }));
  };

  /*
  |--------------------------------------------------------------------------
  | RESET
  |--------------------------------------------------------------------------
  */

  const resetForm = () => {
    setFormData(emptyForm());
    setError("");
  };
    /*
  |--------------------------------------------------------------------------
  | EDIT TIP
  |--------------------------------------------------------------------------
  */

  const handleEdit = (tip) => {
    setError("");

    setFormData({
      id: tip.id || null,

      league: tip.league || "",
      match: tip.match || "",

      date: tip.date
        ? String(tip.date).slice(0, 10)
        : new Date()
            .toISOString()
            .slice(0, 10),

      time: tip.time || "18:00",

      market: tip.market || "",

      prediction:
        tip.prediction || "",

      odds:
        tip.odds !== null &&
        tip.odds !== undefined
          ? String(tip.odds)
          : "",

      confidence:
        tip.confidence !== null &&
        tip.confidence !== undefined
          ? String(tip.confidence)
          : "",

      analysis:
        tip.analysis || "",

      tipsType:
        tip.tipsType || "free",

      source:
        tip.source || "manual",

      isWon:
        tip.isWon ?? null,

      isLost:
        tip.isLost ?? null,

      isRefunded:
        tip.isRefunded ?? null,
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  /*
  |--------------------------------------------------------------------------
  | DELETE
  |--------------------------------------------------------------------------
  */

  const handleDelete = async (tipId) => {
    if (!tipId) return;

    const confirmed = window.confirm(
      "Are you sure you want to delete this tip?"
    );

    if (!confirmed) return;

    try {
      setError("");

      const response = await fetch(
        `/api/tips/delete/${tipId}`,
        {
          method: "DELETE",
          headers: getAuthHeaders(),
        }
      );

      const result =
        await response.json();

      if (
        !response.ok ||
        result?.success === false
      ) {
        throw new Error(
          result?.message ||
            "Unable to delete tip."
        );
      }

      if (formData.id === tipId) {
        resetForm();
      }

      await loadTips();
    } catch (deleteError) {
      setError(
        deleteError.message ||
          "Unable to delete tip."
      );
    }
  };

  /*
  |--------------------------------------------------------------------------
  | SUBMIT
  |--------------------------------------------------------------------------
  */

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");

    const {
      league,
      match,
      date,
      time,
      market,
      prediction,
      odds,
      confidence,
      analysis,
      tipsType,
    } = formData;

    /*
    |--------------------------------------------------------------------------
    | BASIC VALIDATION
    |--------------------------------------------------------------------------
    */

    if (!league) {
      setError("Please enter the league.");
      return;
    }

    if (!match) {
      setError(
        "Please enter the match."
      );
      return;
    }

    if (!market) {
      setError(
        "Please select a betting market."
      );
      return;
    }

    if (!prediction) {
      setError(
        "Please select or enter a prediction."
      );
      return;
    }

    if (!tipsType) {
      setError(
        "Please select the tip type."
      );
      return;
    }

    /*
    |--------------------------------------------------------------------------
    | ODDS VALIDATION
    |--------------------------------------------------------------------------
    */

    if (
      odds !== "" &&
      Number(odds) <= 0
    ) {
      setError(
        "Odds must be greater than 0."
      );
      return;
    }

    /*
    |--------------------------------------------------------------------------
    | CONFIDENCE VALIDATION
    |--------------------------------------------------------------------------
    */

    if (
      confidence !== "" &&
      (Number(confidence) < 0 ||
        Number(confidence) > 100)
    ) {
      setError(
        "Confidence must be between 0 and 100."
      );
      return;
    }

    setIsSubmitting(true);

    try {
      /*
      |--------------------------------------------------------------------------
      | PAYLOAD
      |--------------------------------------------------------------------------
      |
      | Important:
      | We intentionally DO NOT send:
      |
      | plan
      | premium
      | published
      |
      */

      const requestBody = {
        league:
          league || null,

        match:
          match || null,

        date:
          date || null,

        time:
          time || null,

        source:
          "manual",

        market:
          market || null,

        prediction:
          prediction || null,

        odds:
          odds === ""
            ? null
            : Number(odds),

        confidence:
          confidence === ""
            ? null
            : Number(confidence),

        analysis:
          analysis || null,

        tipsType:
          tipsType || "free",
      };

      const endpoint = formData.id
        ? `/api/tips/update/${formData.id}`
        : "/api/tips/create";

      const method = formData.id
        ? "PUT"
        : "POST";

      const response = await fetch(
        endpoint,
        {
          method,
          headers: getAuthHeaders(),
          body: JSON.stringify(
            requestBody
          ),
        }
      );

      const result =
        await response.json();

      if (
        !response.ok ||
        result?.success === false
      ) {
        throw new Error(
          result?.message ||
            "Unable to save tip."
        );
      }

      resetForm();

      await loadTips();
    } catch (submitError) {
      setError(
        submitError.message ||
          "Unable to save tip."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | RENDER
  |--------------------------------------------------------------------------
  */

  return (
    <div className="space-y-6 p-4 md:p-6 lg:p-8">

      {/* ================================================================ */}
      {/* PAGE HEADER */}
      {/* ================================================================ */}

      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

        <div>
          <div className="mb-2 flex items-center gap-2">

            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10">
              <Trophy className="h-5 w-5 text-emerald-400" />
            </div>

            <Badge
              variant="outline"
              className="border-emerald-400/30 text-emerald-300"
            >
              TIP MANAGEMENT
            </Badge>

          </div>

          <h1 className="text-2xl font-semibold text-foreground md:text-3xl">
            Create Football Tips
          </h1>

          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            Add manual betting tips independently
            of synchronized football fixtures.
          </p>
        </div>

        <Button
          type="button"
          variant="outline"
          className="rounded-full"
          onClick={resetForm}
        >
          <Plus className="mr-2 h-4 w-4" />
          New Tip
        </Button>

      </div>

      {/* ================================================================ */}
      {/* ERROR */}
      {/* ================================================================ */}

      {error ? (
        <div className="flex items-start gap-3 rounded-2xl border border-red-500/20 bg-red-500/5 p-4 text-sm text-red-300">

          <X className="mt-0.5 h-4 w-4 shrink-0" />

          <span>{error}</span>

        </div>
      ) : null}

      {/* ================================================================ */}
      {/* MAIN GRID */}
      {/* ================================================================ */}

      <div className="grid gap-6 xl:grid-cols-[440px_1fr]">

        {/* ============================================================ */}
        {/* CREATE / EDIT */}
        {/* ============================================================ */}

        <Card className="overflow-hidden border-border/70 bg-card/80 shadow-sm">

          <CardHeader className="border-b border-border/60">

            <div className="flex items-start justify-between gap-4">

              <div>
                <CardTitle className="flex items-center gap-2 text-lg">

                  {formData.id ? (
                    <PencilLine className="h-5 w-5 text-emerald-400" />
                  ) : (
                    <Plus className="h-5 w-5 text-emerald-400" />
                  )}

                  {formData.id
                    ? "Edit Tip"
                    : "Create New Tip"}

                </CardTitle>

                <CardDescription className="mt-1">
                  Add a match and select the
                  betting market and prediction.
                </CardDescription>
              </div>

              <div className="rounded-xl bg-emerald-500/10 p-2">
                <BarChart3 className="h-5 w-5 text-emerald-400" />
              </div>

            </div>

          </CardHeader>

          <CardContent className="pt-6">

            <form
              onSubmit={handleSubmit}
              className="space-y-5"
            >

              {/* ====================================================== */}
              {/* MATCH */}
              {/* ====================================================== */}

              <div className="space-y-4">

                <div className="flex items-center gap-2">

                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-500/10">
                    <Trophy className="h-4 w-4 text-slate-300" />
                  </div>

                  <p className="text-sm font-semibold">
                    Match Information
                  </p>

                </div>

                <div className="space-y-2">

                  <Label htmlFor="league">
                    League
                  </Label>

                  <Input
                    id="league"
                    name="league"
                    value={formData.league}
                    onChange={handleChange}
                    placeholder="Premier League"
                  />

                </div>

                <div className="space-y-2">

                  <Label htmlFor="match">
                    Match
                  </Label>

                  <Input
                    id="match"
                    name="match"
                    value={formData.match}
                    onChange={handleChange}
                    placeholder="Arsenal vs Liverpool"
                  />

                  <p className="text-xs text-muted-foreground">
                    This can be any match, even if
                    it is not available from the
                    football API.
                  </p>

                </div>

                <div className="grid gap-4 sm:grid-cols-2">

                  <div className="space-y-2">

                    <Label htmlFor="date">
                      Date
                    </Label>

                    <Input
                      id="date"
                      name="date"
                      type="date"
                      value={formData.date}
                      onChange={handleChange}
                    />

                  </div>

                  <div className="space-y-2">

                    <Label htmlFor="time">
                      Kickoff
                    </Label>

                    <Input
                      id="time"
                      name="time"
                      type="time"
                      value={formData.time}
                      onChange={handleChange}
                    />

                  </div>

                </div>

              </div>

              {/* ====================================================== */}
              {/* MARKET */}
              {/* ====================================================== */}

              <div className="space-y-4 border-t border-border/60 pt-5">

                <div className="flex items-center gap-2">

                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-purple-500/10">
                    <CircleDollarSign className="h-4 w-4 text-purple-400" />
                  </div>

                  <p className="text-sm font-semibold">
                    Betting Selection
                  </p>

                </div>

                <div className="space-y-2">

                  <Label>
                    Betting Market
                  </Label>

                  <Select
                    value={formData.market}
                    onValueChange={
                      handleMarketChange
                    }
                  >

                    <SelectTrigger>
                      <SelectValue placeholder="Select betting market" />
                    </SelectTrigger>

                    <SelectContent className="max-h-[320px]">

                      {MARKET_OPTIONS.map(
                        (market) => (
                          <SelectItem
                            key={market.value}
                            value={market.value}
                          >
                            {market.label}
                          </SelectItem>
                        )
                      )}

                    </SelectContent>

                  </Select>

                </div>

                {/* ==================================================== */}
                {/* PREDICTION */}
                {/* ==================================================== */}

                <div className="space-y-2">

                  <Label>
                    Prediction
                  </Label>

                  {currentMarket?.customInput ? (

                    <Input
                      name="prediction"
                      value={
                        formData.prediction
                      }
                      onChange={
                        handleChange
                      }
                      placeholder="Example: 2-1"
                    />

                  ) : (

                    <Select
                      value={
                        formData.prediction
                      }
                      onValueChange={(
                        value
                      ) =>
                        setFormData(
                          (previous) => ({
                            ...previous,
                            prediction:
                              value,
                          })
                        )
                      }
                      disabled={
                        !formData.market
                      }
                    >

                      <SelectTrigger>
                        <SelectValue
                          placeholder={
                            formData.market
                              ? "Select prediction"
                              : "Select market first"
                          }
                        />
                      </SelectTrigger>

                      <SelectContent>

                        {predictionOptions.map(
                          (prediction) => (
                            <SelectItem
                              key={
                                prediction.value
                              }
                              value={
                                prediction.value
                              }
                            >
                              {
                                prediction.label
                              }
                            </SelectItem>
                          )
                        )}

                      </SelectContent>

                    </Select>

                  )}

                </div>

                {/* ==================================================== */}
                {/* ODDS */}
                {/* ==================================================== */}

                <div className="space-y-2">

                  <Label htmlFor="odds">
                    Odds
                    <span className="ml-1 text-xs text-muted-foreground">
                      (optional)
                    </span>
                  </Label>

                  <Input
                    id="odds"
                    name="odds"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.odds}
                    onChange={handleChange}
                    placeholder="2.10"
                  />

                </div>

              </div>

              {/* ====================================================== */}
              {/* ANALYSIS */}
              {/* ====================================================== */}

              <div className="space-y-4 border-t border-border/60 pt-5">

                <div className="flex items-center gap-2">

                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-500/10">
                    <FileText className="h-4 w-4 text-blue-400" />
                  </div>

                  <p className="text-sm font-semibold">
                    Analysis
                  </p>

                </div>

                <div className="space-y-2">

                  <Label htmlFor="confidence">
                    Confidence
                  </Label>

                  <Input
                    id="confidence"
                    name="confidence"
                    type="number"
                    min="0"
                    max="100"
                    value={
                      formData.confidence
                    }
                    onChange={handleChange}
                    placeholder="85"
                  />

                </div>

                <div className="space-y-2">

                  <Label htmlFor="analysis">
                    Match Analysis
                  </Label>

                  <textarea
                    id="analysis"
                    name="analysis"
                    value={
                      formData.analysis
                    }
                    onChange={handleChange}
                    placeholder="Add reasoning behind this prediction..."
                    rows={5}
                    className="flex w-full rounded-xl border border-input bg-background px-3 py-2 text-sm outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
                  />

                </div>

              </div>

              {/* ====================================================== */}
              {/* TIP TYPE */}
              {/* ====================================================== */}

              <div className="space-y-3 border-t border-border/60 pt-5">

                <div className="flex items-center gap-2">

                  <ShieldCheck className="h-4 w-4 text-emerald-400" />

                  <p className="text-sm font-semibold">
                    Tip Access
                  </p>

                </div>

                                <Select
                  value={formData.tipsType}
                  onValueChange={(value) =>
                    setFormData((previous) => ({
                      ...previous,
                      tipsType: value,
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select tip type" />
                  </SelectTrigger>

                  <SelectContent>
                    {TIP_TYPE_OPTIONS.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Betting Market */}
              <div className="space-y-2">
                <Label htmlFor="market">Betting Market</Label>

                <Select
                  value={formData.market}
                  onValueChange={(value) =>
                    handleMarketChange(value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select betting market" />
                  </SelectTrigger>

                  <SelectContent>
                    {MARKET_OPTIONS.map((market) => (
                      <SelectItem
                        key={market.value}
                        value={market.value}
                      >
                        {market.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Prediction */}
              <div className="space-y-2">
                <Label htmlFor="prediction">
                  Prediction
                </Label>

                {getPredictionOptions(formData.market).length > 0 ? (
                  <Select
                    value={formData.prediction}
                    onValueChange={(value) =>
                      setFormData((previous) => ({
                        ...previous,
                        prediction: value,
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select prediction" />
                    </SelectTrigger>

                    <SelectContent>
                      {getPredictionOptions(
                        formData.market
                      ).map((prediction) => (
                        <SelectItem
                          key={prediction.value}
                          value={prediction.value}
                        >
                          {prediction.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Input
                    id="prediction"
                    name="prediction"
                    value={formData.prediction}
                    onChange={handleChange}
                    placeholder="Enter prediction"
                  />
                )}
              </div>

              {/* Odds */}
              <div className="space-y-2">
                <Label htmlFor="odds">
                  Odds
                </Label>

                <Input
                  id="odds"
                  name="odds"
                  type="number"
                  min="1"
                  step="0.01"
                  value={formData.odds}
                  onChange={handleChange}
                  placeholder="2.10"
                />
              </div>

              {/* Confidence */}
              <div className="space-y-2">
                <Label htmlFor="confidence">
                  Confidence (%)
                </Label>

                <Input
                  id="confidence"
                  name="confidence"
                  type="number"
                  min="0"
                  max="100"
                  value={formData.confidence}
                  onChange={handleChange}
                  placeholder="85"
                />
              </div>

              {/* Date + Time */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="date">
                    Match Date
                  </Label>

                  <Input
                    id="date"
                    name="date"
                    type="date"
                    value={formData.date}
                    onChange={handleChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="time">
                    Kickoff
                  </Label>

                  <Input
                    id="time"
                    name="time"
                    type="time"
                    value={formData.time}
                    onChange={handleChange}
                  />
                </div>
              </div>

              {/* Analysis */}
              <div className="space-y-2">
                <Label htmlFor="analysis">
                  Analysis
                </Label>

                <textarea
                  id="analysis"
                  name="analysis"
                  value={formData.analysis}
                  onChange={handleChange}
                  placeholder="Add match analysis, reasoning and supporting information..."
                  rows={5}
                  className="w-full resize-none rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition focus:ring-2 focus:ring-primary"
                />
              </div>

              {error ? (
                <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                  {error}
                </div>
              ) : null}

              {/* Form Actions */}
              <div className="flex gap-2 pt-2">
                <Button
                  type="submit"
                  className="flex-1 rounded-full"
                  disabled={isSubmitting}
                >
                  {formData.id ? (
                    <PencilLine className="mr-2 h-4 w-4" />
                  ) : (
                    <Plus className="mr-2 h-4 w-4" />
                  )}

                  {isSubmitting
                    ? "Saving..."
                    : formData.id
                    ? "Update Tip"
                    : "Save Tip"}
                </Button>

                {formData.id ? (
                  <Button
                    type="button"
                    variant="outline"
                    className="rounded-full"
                    onClick={() => resetForm()}
                  >
                    Cancel
                  </Button>
                ) : null}
              </div>
            </form>
          </CardContent>
        </Card>

        
                                {/* ============================================================ */}
        {/* TIPS LIST */}
        {/* ============================================================ */}

        <Card className="overflow-hidden border-border/70 bg-card/80 shadow-sm">

          <CardHeader className="border-b border-border/60">

            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">

              <div>

                <CardTitle className="text-lg">
                  All Tips
                </CardTitle>

                <CardDescription>
                  Manage manually created betting
                  tips and their settlement status.
                </CardDescription>

              </div>

              <div className="flex flex-col gap-2 sm:flex-row">

                {/* SEARCH */}

                <div className="relative w-full sm:w-64">

                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />

                  <Input
                    value={searchTerm}
                    onChange={(event) =>
                      setSearchTerm(
                        event.target.value
                      )
                    }
                    placeholder="Search tips..."
                    className="pl-9"
                  />

                </div>

                {/* TYPE */}

                <Select
                  value={filterType}
                  onValueChange={
                    setFilterType
                  }
                >

                  <SelectTrigger className="w-full sm:w-36">
                    <SelectValue placeholder="Tip type" />
                  </SelectTrigger>

                  <SelectContent>

                    <SelectItem value="all">
                      All Types
                    </SelectItem>

                    {TIP_TYPE_OPTIONS.map(
                      (type) => (
                        <SelectItem
                          key={type.value}
                          value={type.value}
                        >
                          {type.label}
                        </SelectItem>
                      )
                    )}

                  </SelectContent>

                </Select>

              </div>

            </div>

            {/* ======================================================== */}
            {/* MARKET FILTER */}
            {/* ======================================================== */}

            <div className="pt-4">

              <Select
                value={filterMarket}
                onValueChange={
                  setFilterMarket
                }
              >

                <SelectTrigger className="w-full sm:w-72">
                  <SelectValue placeholder="Filter by market" />
                </SelectTrigger>

                <SelectContent className="max-h-[320px]">

                  <SelectItem value="all">
                    All Markets
                  </SelectItem>

                  {MARKET_OPTIONS.map(
                    (market) => (
                      <SelectItem
                        key={market.value}
                        value={market.value}
                      >
                        {market.label}
                      </SelectItem>
                    )
                  )}

                </SelectContent>

              </Select>

            </div>

          </CardHeader>

          {/* ========================================================== */}
          {/* TABLE */}
          {/* ========================================================== */}

          <CardContent className="p-0">

            <div className="overflow-x-auto">

              <Table>

                <TableHeader>

                  <TableRow>

                    <TableHead>
                      Match
                    </TableHead>

                    <TableHead>
                      Market
                    </TableHead>

                    <TableHead>
                      Prediction
                    </TableHead>

                    <TableHead>
                      Odds
                    </TableHead>

                    <TableHead>
                      Type
                    </TableHead>

                    <TableHead>
                      Kickoff
                    </TableHead>

                    <TableHead>
                      Result
                    </TableHead>

                    <TableHead className="text-right">
                      Actions
                    </TableHead>

                  </TableRow>

                </TableHeader>

                <TableBody>

                  {filteredTips.length > 0 ? (

                    filteredTips.map((tip) => {

                      const result =
                        getResultBadge(tip);

                      const ResultIcon =
                        result.icon;

                      const market =
                        MARKET_OPTIONS.find(
                          (item) =>
                            item.value ===
                            tip.market
                        );

                      return (
                        <TableRow
                          key={tip.id}
                          className="group"
                        >

                          {/* ================================================= */}
                          {/* MATCH */}
                          {/* ================================================= */}

                          <TableCell>

                            <div className="min-w-[220px]">

                              <p className="font-medium text-foreground">
                                {tip.match ||
                                  "Unnamed Match"}
                              </p>

                              <p className="mt-1 text-xs text-muted-foreground">
                                {tip.league ||
                                  "No league"}
                              </p>

                            </div>

                          </TableCell>

                          {/* ================================================= */}
                          {/* MARKET */}
                          {/* ================================================= */}

                          <TableCell>

                            <div className="min-w-[150px]">

                              <p className="text-sm font-medium">
                                {market?.label ||
                                  tip.market ||
                                  "—"}
                              </p>

                            </div>

                          </TableCell>

                          {/* ================================================= */}
                          {/* PREDICTION */}
                          {/* ================================================= */}

                          <TableCell>

                            <Badge
                              variant="outline"
                              className="whitespace-nowrap"
                            >
                              {tip.prediction ||
                                "—"}
                            </Badge>

                          </TableCell>

                          {/* ================================================= */}
                          {/* ODDS */}
                          {/* ================================================= */}

                          <TableCell>

                            <span className="font-semibold">
                              {tip.odds ??
                                "—"}
                            </span>

                          </TableCell>

                          {/* ================================================= */}
                          {/* TIP TYPE */}
                          {/* ================================================= */}

                          <TableCell>

                            <Badge
                              variant="outline"
                              className={
                                getTipTypeBadgeClasses(
                                  tip.tipsType
                                )
                              }
                            >
                              {(
                                tip.tipsType ||
                                "free"
                              ).toUpperCase()}
                            </Badge>

                          </TableCell>

                          {/* ================================================= */}
                          {/* DATE */}
                          {/* ================================================= */}

                          <TableCell>

                            <div className="flex min-w-[150px] items-center gap-2 text-sm text-muted-foreground">

                              <CalendarDays className="h-3.5 w-3.5" />

                              <div>

                                <p>
                                  {tip.date
                                    ? new Date(
                                        `${tip.date}T${
                                          tip.time ||
                                          "00:00"
                                        }:00`
                                      ).toLocaleDateString()
                                    : "—"}
                                </p>

                                <p className="text-xs">
                                  {tip.time ||
                                    "—"}
                                </p>

                              </div>

                            </div>

                          </TableCell>

                          {/* ================================================= */}
                          {/* RESULT */}
                          {/* ================================================= */}

                          <TableCell>

                            <Badge
                              variant="outline"
                              className={
                                result.className
                              }
                            >

                              <ResultIcon className="mr-1 h-3 w-3" />

                              {result.label}

                            </Badge>

                          </TableCell>

                          {/* ================================================= */}
                          {/* ACTIONS */}
                          {/* ================================================= */}

                          <TableCell className="text-right">

                            <div className="flex justify-end gap-2">

                              <Button
                                variant="outline"
                                size="sm"
                                className="rounded-full"
                                onClick={() =>
                                  handleEdit(
                                    tip
                                  )
                                }
                              >

                                <PencilLine className="h-4 w-4" />

                              </Button>

                              <Button
                                variant="destructive"
                                size="sm"
                                className="rounded-full"
                                onClick={() =>
                                  handleDelete(
                                    tip.id
                                  )
                                }
                              >

                                <Trash2 className="h-4 w-4" />

                              </Button>

                            </div>

                          </TableCell>

                        </TableRow>
                      );
                    })

                  ) : (

                    <TableRow>

                      <TableCell
                        colSpan={8}
                        className="py-16 text-center"
                      >

                        <div className="mx-auto flex max-w-sm flex-col items-center">

                          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-muted">

                            <BarChart3 className="h-6 w-6 text-muted-foreground" />

                          </div>

                          <h3 className="font-semibold">
                            No tips found
                          </h3>

                          <p className="mt-1 text-sm text-muted-foreground">
                            Create your first manual
                            betting tip or change
                            the current filters.
                          </p>

                          <Button
                            type="button"
                            variant="outline"
                            className="mt-4 rounded-full"
                            onClick={() => {
                              setSearchTerm("");
                              setFilterType(
                                "all"
                              );
                              setFilterMarket(
                                "all"
                              );
                            }}
                          >
                            Clear Filters
                          </Button>

                        </div>

                      </TableCell>

                    </TableRow>

                  )}

                </TableBody>

              </Table>

            </div>

          </CardContent>

        </Card>

      </div>

      {/* ================================================================ */}
      {/* QUICK MARKET SUMMARY */}
      {/* ================================================================ */}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

        <Card className="border-border/70 bg-card/80">

          <CardContent className="flex items-center gap-4 p-5">

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-500/10">

              <Trophy className="h-5 w-5 text-blue-400" />

            </div>

            <div>

              <p className="text-xs uppercase tracking-wider text-muted-foreground">
                Total Tips
              </p>

              <p className="mt-1 text-2xl font-bold">
                {tips.length}
              </p>

            </div>

          </CardContent>

        </Card>

        <Card className="border-border/70 bg-card/80">

          <CardContent className="flex items-center gap-4 p-5">

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/10">

              <Check className="h-5 w-5 text-emerald-400" />

            </div>

            <div>

              <p className="text-xs uppercase tracking-wider text-muted-foreground">
                Won
              </p>

              <p className="mt-1 text-2xl font-bold">
                {
                  tips.filter(
                    (tip) =>
                      tip.isWon === true
                  ).length
                }
              </p>

            </div>

          </CardContent>

        </Card>

        <Card className="border-border/70 bg-card/80">

          <CardContent className="flex items-center gap-4 p-5">

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-500/10">

              <X className="h-5 w-5 text-red-400" />

            </div>

            <div>

              <p className="text-xs uppercase tracking-wider text-muted-foreground">
                Lost
              </p>

              <p className="mt-1 text-2xl font-bold">
                {
                  tips.filter(
                    (tip) =>
                      tip.isLost === true
                  ).length
                }
              </p>

            </div>

          </CardContent>

        </Card>

        <Card className="border-border/70 bg-card/80">

          <CardContent className="flex items-center gap-4 p-5">

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-500/10">

              <Clock3 className="h-5 w-5 text-amber-400" />

            </div>

            <div>

              <p className="text-xs uppercase tracking-wider text-muted-foreground">
                Pending
              </p>

              <p className="mt-1 text-2xl font-bold">
                {
                  tips.filter(
                    (tip) =>
                      tip.isWon !== true &&
                      tip.isLost !== true &&
                      tip.isRefunded !== true
                  ).length
                }
              </p>

            </div>

          </CardContent>

        </Card>

      </div>

    </div>
  );
};

export default AdminPremiumTips;
                        
