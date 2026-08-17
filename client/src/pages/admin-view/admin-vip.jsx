/* eslint-disable react/no-unescaped-entities */
/** @format */

import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  FaEdit,
  FaTrashAlt,
  FaSearch,
  FaSync,
  FaPlus,
  FaCheckCircle,
  FaTimesCircle,
  FaUndo,
  FaFutbol,
} from "react-icons/fa";
import moment from "moment";

import { Skeleton } from "@/components/ui/skeleton";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Textarea } from "@/components/ui/textarea";

import { toast } from "react-toastify";

import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";

import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

import {
  fetchTips,
  createTip,
  deleteTip,
  updateTip,
} from "@/features/slices/tipsSlice";

/* =========================================================
   TIP TYPES
========================================================= */

const TIP_TYPES = [
  {
    value: "free",
    label: "Free",
  },
  {
    value: "bronze",
    label: "Bronze",
  },
  {
    value: "silver",
    label: "Silver",
  },
  {
    value: "gold",
    label: "Gold",
  },
];

/* =========================================================
   BETTING MARKETS
========================================================= */

const MARKET_OPTIONS = [
  {
    value: "match_winner",
    label: "Match Winner",
    predictions: [
      "Home Win",
      "Draw",
      "Away Win",
    ],
  },

  {
    value: "dc_1x",
    label: "Double Chance 1X",
    predictions: ["1X"],
  },

  {
    value: "dc_x2",
    label: "Double Chance X2",
    predictions: ["X2"],
  },

  {
    value: "dc_12",
    label: "Double Chance 12",
    predictions: ["12"],
  },

  {
    value: "draw_no_bet",
    label: "Draw No Bet",
    predictions: [
      "Home",
      "Away",
    ],
  },

  {
    value: "over_0_5",
    label: "Over/Under 0.5 Goals",
    predictions: [
      "Over 0.5",
      "Under 0.5",
    ],
  },

  {
    value: "over_1_5",
    label: "Over/Under 1.5 Goals",
    predictions: [
      "Over 1.5",
      "Under 1.5",
    ],
  },

  {
    value: "over_2_5",
    label: "Over/Under 2.5 Goals",
    predictions: [
      "Over 2.5",
      "Under 2.5",
    ],
  },

  {
    value: "over_3_5",
    label: "Over/Under 3.5 Goals",
    predictions: [
      "Over 3.5",
      "Under 3.5",
    ],
  },

  {
    value: "over_4_5",
    label: "Over/Under 4.5 Goals",
    predictions: [
      "Over 4.5",
      "Under 4.5",
    ],
  },

  {
    value: "btts",
    label: "Both Teams To Score",
    predictions: [
      "Yes",
      "No",
    ],
  },

  {
    value: "home_over_0_5",
    label: "Home Team Over/Under 0.5",
    predictions: [
      "Home Over 0.5",
      "Home Under 0.5",
    ],
  },

  {
    value: "home_over_1_5",
    label: "Home Team Over/Under 1.5",
    predictions: [
      "Home Over 1.5",
      "Home Under 1.5",
    ],
  },

  {
    value: "home_over_2_5",
    label: "Home Team Over/Under 2.5",
    predictions: [
      "Home Over 2.5",
      "Home Under 2.5",
    ],
  },

  {
    value: "away_over_0_5",
    label: "Away Team Over/Under 0.5",
    predictions: [
      "Away Over 0.5",
      "Away Under 0.5",
    ],
  },

  {
    value: "away_over_1_5",
    label: "Away Team Over/Under 1.5",
    predictions: [
      "Away Over 1.5",
      "Away Under 1.5",
    ],
  },

  {
    value: "away_over_2_5",
    label: "Away Team Over/Under 2.5",
    predictions: [
      "Away Over 2.5",
      "Away Under 2.5",
    ],
  },

  {
    value: "ht_over_0_5",
    label: "Half Time Over/Under 0.5",
    predictions: [
      "HT Over 0.5",
      "HT Under 0.5",
    ],
  },

  {
    value: "ht_over_1_5",
    label: "Half Time Over/Under 1.5",
    predictions: [
      "HT Over 1.5",
      "HT Under 1.5",
    ],
  },

  {
    value: "ht_result",
    label: "Half Time Result",
    predictions: [
      "HT Home Win",
      "HT Draw",
      "HT Away Win",
    ],
  },

  {
    value: "corners_over_5_5",
    label: "Total Corners Over/Under 5.5",
    predictions: [
      "Over 5.5 Corners",
      "Under 5.5 Corners",
    ],
  },

  {
    value: "corners_over_7_5",
    label: "Total Corners Over/Under 7.5",
    predictions: [
      "Over 7.5 Corners",
      "Under 7.5 Corners",
    ],
  },

  {
    value: "corners_over_8_5",
    label: "Total Corners Over/Under 8.5",
    predictions: [
      "Over 8.5 Corners",
      "Under 8.5 Corners",
    ],
  },

  {
    value: "corners_over_9_5",
    label: "Total Corners Over/Under 9.5",
    predictions: [
      "Over 9.5 Corners",
      "Under 9.5 Corners",
    ],
  },

  {
    value: "corners_over_10_5",
    label: "Total Corners Over/Under 10.5",
    predictions: [
      "Over 10.5 Corners",
      "Under 10.5 Corners",
    ],
  },

  {
    value: "home_corners_over_2_5",
    label: "Home Team Corners Over/Under 2.5",
    predictions: [
      "Home Over 2.5 Corners",
      "Home Under 2.5 Corners",
    ],
  },

  {
    value: "home_corners_over_3_5",
    label: "Home Team Corners Over/Under 3.5",
    predictions: [
      "Home Over 3.5 Corners",
      "Home Under 3.5 Corners",
    ],
  },

  {
    value: "home_corners_over_4_5",
    label: "Home Team Corners Over/Under 4.5",
    predictions: [
      "Home Over 4.5 Corners",
      "Home Under 4.5 Corners",
    ],
  },

  {
    value: "away_corners_over_2_5",
    label: "Away Team Corners Over/Under 2.5",
    predictions: [
      "Away Over 2.5 Corners",
      "Away Under 2.5 Corners",
    ],
  },

  {
    value: "away_corners_over_3_5",
    label: "Away Team Corners Over/Under 3.5",
    predictions: [
      "Away Over 3.5 Corners",
      "Away Under 3.5 Corners",
    ],
  },

  {
    value: "away_corners_over_4_5",
    label: "Away Team Corners Over/Under 4.5",
    predictions: [
      "Away Over 4.5 Corners",
      "Away Under 4.5 Corners",
    ],
  },

  {
    value: "bookings_over_2_5",
    label: "Total Bookings Over/Under 2.5",
    predictions: [
      "Over 2.5 Bookings",
      "Under 2.5 Bookings",
    ],
  },

  {
    value: "bookings_over_3_5",
    label: "Total Bookings Over/Under 3.5",
    predictions: [
      "Over 3.5 Bookings",
      "Under 3.5 Bookings",
    ],
  },

  {
    value: "bookings_over_4_5",
    label: "Total Bookings Over/Under 4.5",
    predictions: [
      "Over 4.5 Bookings",
      "Under 4.5 Bookings",
    ],
  },

  {
    value: "home_bookings_over_1_5",
    label: "Home Team Bookings Over/Under 1.5",
    predictions: [
      "Home Over 1.5 Bookings",
      "Home Under 1.5 Bookings",
    ],
  },

  {
    value: "away_bookings_over_1_5",
    label: "Away Team Bookings Over/Under 1.5",
    predictions: [
      "Away Over 1.5 Bookings",
      "Away Under 1.5 Bookings",
    ],
  },

  {
    value: "correct_score",
    label: "Correct Score",
    predictions: [],
  },
];

/* =========================================================
   DEFAULT FORM
========================================================= */

const emptyForm = () => ({
  id: null,

  league: "",
  date: "",
  time: "",

  match: "",

  source: "manual",

  market: "",
  prediction: "",
  odds: "",

  confidence: "",

  analysis: "",

  tipsType: "free",

  homeScore: "",
  awayScore: "",

  halfTimeHomeScore: "",
  halfTimeAwayScore: "",

  homeCorners: "",
  awayCorners: "",

  homeBookings: "",
  awayBookings: "",

  isWon: null,
  isLost: false,
  isRefunded: false,
});

/* =========================================================
   MARKET LABEL
========================================================= */

const getMarketLabel = (market) => {
  const found = MARKET_OPTIONS.find(
    (item) => item.value === market
  );

  return found?.label || market || "—";
};

/* =========================================================
   TIP TYPE BADGE
========================================================= */

const getTipTypeBadgeClasses = (type) => {
  const normalized = String(type || "free").toLowerCase();

  const map = {
    free:
      "border-slate-400/30 bg-slate-500/10 text-slate-300",

    bronze:
      "border-amber-600/30 bg-amber-700/10 text-amber-300",

    silver:
      "border-slate-300/30 bg-slate-300/10 text-slate-200",

    gold:
      "border-yellow-400/30 bg-yellow-400/10 text-yellow-300",
  };

  return (
    map[normalized] ||
    "border-border bg-muted text-muted-foreground"
  );
};

/* =========================================================
   RESULT STATUS
========================================================= */

const getResultStatus = (tip) => {
  if (tip?.isRefunded) {
    return {
      label: "Refunded",
      variant: "outline",
      icon: FaUndo,
    };
  }

  if (tip?.isWon === true || tip?.isWon === 1) {
    return {
      label: "Won",
      variant: "default",
      icon: FaCheckCircle,
    };
  }

  if (tip?.isLost === true || tip?.isLost === 1) {
    return {
      label: "Lost",
      variant: "destructive",
      icon: FaTimesCircle,
    };
  }

  return {
    label: "Pending",
    variant: "secondary",
    icon: FaFutbol,
  };
};
const AdminVip = () => {
  const dispatch = useDispatch();

  const {
    status,
    error,
    list: tips,
  } = useSelector((state) => state.tips);

  /* =========================================================
     DIALOG STATE
  ========================================================= */

  const [showTipDialog, setShowTipDialog] =
    useState(false);

  const [showDeleteDialog, setShowDeleteDialog] =
    useState(false);

  const [selectedTip, setSelectedTip] =
    useState(null);

  /* =========================================================
     FORM STATE
  ========================================================= */

  const [formData, setFormData] =
    useState(emptyForm());

  /* =========================================================
     FILTER STATE
  ========================================================= */

  const [searchTerm, setSearchTerm] =
    useState("");

  const [filterType, setFilterType] =
    useState("all");

  const [filterMarket, setFilterMarket] =
    useState("all");

  const [filterResult, setFilterResult] =
    useState("all");

  /* =========================================================
     LOAD TIPS
  ========================================================= */

  useEffect(() => {
    dispatch(fetchTips());
  }, [dispatch]);

  /* =========================================================
     REFRESH
  ========================================================= */

  const handleRefresh = () => {
    dispatch(fetchTips());
  };

  /* =========================================================
     OPEN CREATE
  ========================================================= */

  const openCreate = () => {
    setSelectedTip(null);

    setFormData({
      ...emptyForm(),
      date: moment().format("YYYY-MM-DD"),
      time: "18:00",
    });

    setShowTipDialog(true);
  };

  /* =========================================================
     OPEN EDIT
  ========================================================= */

  const openEdit = (tip) => {
    if (!tip) return;

    setSelectedTip(tip);

    setFormData({
      id: tip.id || null,

      league: tip.league || "",

      date: tip.date
        ? moment(tip.date).format("YYYY-MM-DD")
        : "",

      time: tip.time
        ? String(tip.time).slice(0, 5)
        : "",

      match: tip.match || "",

      source: tip.source || "manual",

      market: tip.market || "",

      prediction: tip.prediction || "",

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

      analysis: tip.analysis || "",

      tipsType:
        tip.tipsType || "free",

      homeScore:
        tip.homeScore !== null &&
        tip.homeScore !== undefined
          ? String(tip.homeScore)
          : "",

      awayScore:
        tip.awayScore !== null &&
        tip.awayScore !== undefined
          ? String(tip.awayScore)
          : "",

      halfTimeHomeScore:
        tip.halfTimeHomeScore !== null &&
        tip.halfTimeHomeScore !== undefined
          ? String(tip.halfTimeHomeScore)
          : "",

      halfTimeAwayScore:
        tip.halfTimeAwayScore !== null &&
        tip.halfTimeAwayScore !== undefined
          ? String(tip.halfTimeAwayScore)
          : "",

      homeCorners:
        tip.homeCorners !== null &&
        tip.homeCorners !== undefined
          ? String(tip.homeCorners)
          : "",

      awayCorners:
        tip.awayCorners !== null &&
        tip.awayCorners !== undefined
          ? String(tip.awayCorners)
          : "",

      homeBookings:
        tip.homeBookings !== null &&
        tip.homeBookings !== undefined
          ? String(tip.homeBookings)
          : "",

      awayBookings:
        tip.awayBookings !== null &&
        tip.awayBookings !== undefined
          ? String(tip.awayBookings)
          : "",

      isWon:
        tip.isWon === true ||
        tip.isWon === 1
          ? true
          : null,

      isLost:
        tip.isLost === true ||
        tip.isLost === 1,

      isRefunded:
        tip.isRefunded === true ||
        tip.isRefunded === 1,
    });

    setShowTipDialog(true);
  };

  /* =========================================================
     CLOSE TIP DIALOG
  ========================================================= */

  const closeTipDialog = () => {
    setShowTipDialog(false);
    setSelectedTip(null);
    setFormData(emptyForm());
  };

  /* =========================================================
     FORM INPUT
  ========================================================= */

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

  /* =========================================================
     SELECT INPUT
  ========================================================= */

  const handleSelectChange = (
    name,
    value
  ) => {
    setFormData((previous) => {
      const updated = {
        ...previous,
        [name]: value,
      };

      /*
       * When market changes, reset prediction.
       */
      if (name === "market") {
        updated.prediction = "";
      }

      /*
       * When result state changes, keep the
       * mutually exclusive states clean.
       */
      if (name === "isWon") {
        if (value === "won") {
          updated.isWon = true;
          updated.isLost = false;
          updated.isRefunded = false;
        }

        if (value === "lost") {
          updated.isWon = false;
          updated.isLost = true;
          updated.isRefunded = false;
        }

        if (value === "refunded") {
          updated.isWon = false;
          updated.isLost = false;
          updated.isRefunded = true;
        }

        if (value === "pending") {
          updated.isWon = null;
          updated.isLost = false;
          updated.isRefunded = false;
        }
      }

      return updated;
    });
  };

  /* =========================================================
     SELECTED MARKET
  ========================================================= */

  const selectedMarket = useMemo(() => {
    return MARKET_OPTIONS.find(
      (market) =>
        market.value === formData.market
    );
  }, [formData.market]);

  /* =========================================================
     PREDICTION OPTIONS
  ========================================================= */

  const predictionOptions =
    selectedMarket?.predictions || [];

  /* =========================================================
     FILTER TIPS
  ========================================================= */

  const filteredTips = useMemo(() => {
    if (!Array.isArray(tips)) {
      return [];
    }

    return tips
      .filter((tip) => {
        if (filterType === "all") {
          return true;
        }

        return (
          String(
            tip.tipsType || "free"
          ).toLowerCase() ===
          filterType.toLowerCase()
        );
      })

      .filter((tip) => {
        if (filterMarket === "all") {
          return true;
        }

        return (
          String(
            tip.market || ""
          ).toLowerCase() ===
          filterMarket.toLowerCase()
        );
      })

      .filter((tip) => {
        if (filterResult === "all") {
          return true;
        }

        const result =
          getResultStatus(tip);

        return (
          result.label.toLowerCase() ===
          filterResult.toLowerCase()
        );
      })

      .filter((tip) => {
        if (!searchTerm.trim()) {
          return true;
        }

        const search =
          searchTerm
            .trim()
            .toLowerCase();

        return [
          tip.league,
          tip.match,
          tip.prediction,
          tip.market,
          getMarketLabel(tip.market),
          tip.tipsType,
          tip.source,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(search);
      })

      .sort(
        (a, b) =>
          new Date(
            b.updatedAt ||
              b.createdAt ||
              0
          ) -
          new Date(
            a.updatedAt ||
              a.createdAt ||
              0
          )
      );
  }, [
    tips,
    searchTerm,
    filterType,
    filterMarket,
    filterResult,
  ]);

  /* =========================================================
     SUBMIT VALIDATION
  ========================================================= */

  const validateForm = () => {
    if (
      formData.confidence !== "" &&
      (
        Number(formData.confidence) < 0 ||
        Number(formData.confidence) > 100
      )
    ) {
      toast.error(
        "Confidence must be between 0 and 100.",
        {
          position: "top-center",
        }
      );

      return false;
    }

    if (
      formData.odds !== "" &&
      Number(formData.odds) <= 0
    ) {
      toast.error(
        "Odds must be greater than zero.",
        {
          position: "top-center",
        }
      );

      return false;
    }

    if (
      formData.market &&
      formData.market !==
        "correct_score" &&
      !formData.prediction
    ) {
      toast.error(
        "Please select a prediction.",
        {
          position: "top-center",
        }
      );

      return false;
    }

    return true;
  };

  /* =========================================================
     SAVE TIP
  ========================================================= */

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    const payload = {
      league:
        formData.league || null,

      date:
        formData.date || null,

      time:
        formData.time || null,

      match:
        formData.match || null,

      source:
        formData.source || "manual",

      market:
        formData.market || null,

      prediction:
        formData.prediction || null,

      odds:
        formData.odds === ""
          ? null
          : Number(formData.odds),

      confidence:
        formData.confidence === ""
          ? null
          : Number(formData.confidence),

      analysis:
        formData.analysis || null,

      tipsType:
        formData.tipsType || "free",

      homeScore:
        formData.homeScore === ""
          ? null
          : Number(formData.homeScore),

      awayScore:
        formData.awayScore === ""
          ? null
          : Number(formData.awayScore),

      halfTimeHomeScore:
        formData.halfTimeHomeScore === ""
          ? null
          : Number(formData.halfTimeHomeScore),

      halfTimeAwayScore:
        formData.halfTimeAwayScore === ""
          ? null
          : Number(formData.halfTimeAwayScore),

      homeCorners:
        formData.homeCorners === ""
          ? null
          : Number(formData.homeCorners),

      awayCorners:
        formData.awayCorners === ""
          ? null
          : Number(formData.awayCorners),

      homeBookings:
        formData.homeBookings === ""
          ? null
          : Number(formData.homeBookings),

      awayBookings:
        formData.awayBookings === ""
          ? null
          : Number(formData.awayBookings),

      isWon:
        formData.isWon,

      isLost:
        Boolean(formData.isLost),

      isRefunded:
        Boolean(formData.isRefunded),
    };

    let result;

    if (selectedTip?.id) {
      result = await dispatch(
        updateTip({
          tipId: selectedTip.id,
          formData: payload,
        })
      );
    } else {
      result = await dispatch(
        createTip(payload)
      );
    }

    if (
      createTip.fulfilled.match(result) ||
      updateTip.fulfilled.match(result)
    ) {
      closeTipDialog();

      dispatch(fetchTips());
    }
  };

  /* =========================================================
     DELETE
  ========================================================= */

  const handleDeleteClick = (tip) => {
    setSelectedTip(tip);
    setShowDeleteDialog(true);
  };

  const closeDeleteDialog = () => {
    setSelectedTip(null);
    setShowDeleteDialog(false);
  };

  const handleConfirmDelete = async () => {
    if (!selectedTip?.id) {
      return;
    }

    const result = await dispatch(
      deleteTip(selectedTip.id)
    );

    if (
      deleteTip.fulfilled.match(result)
    ) {
      closeDeleteDialog();
    }
  };  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <div className="w-full max-w-full min-w-0 space-y-6 p-3 sm:p-4 md:p-6 lg:p-8">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

        <div className="min-w-0">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-amber-500 sm:text-xs">
            Premium Management
          </p>

          <h2 className="mt-1 text-xl font-semibold tracking-tight sm:text-2xl">
            Manage Premium Tips
          </h2>

          <p className="mt-1 text-sm text-muted-foreground">
            Create, edit, settle and manage manual betting tips
            without requiring football API fixtures.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">

          <Button
            variant="outline"
            className="w-full rounded-full sm:w-auto"
            onClick={handleRefresh}
            disabled={status === "pending"}
          >
            <FaSync
              className={`mr-2 ${
                status === "pending"
                  ? "animate-spin"
                  : ""
              }`}
            />

            Refresh
          </Button>

          <Button
            className="w-full rounded-full sm:w-auto"
            onClick={openCreate}
          >
            <FaPlus className="mr-2" />

            Create Tip
          </Button>

        </div>
      </div>

      <Separator />

      {/* =====================================================
          FILTERS
      ===================================================== */}

      <Card className="border border-border/60 shadow-sm">

        <CardContent className="p-4">

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">

            {/* SEARCH */}

            <div className="relative">

              <FaSearch className="absolute left-3 top-3.5 text-muted-foreground" />

              <Input
                className="pl-10"
                placeholder="Search league, match, prediction..."
                value={searchTerm}
                onChange={(event) =>
                  setSearchTerm(
                    event.target.value
                  )
                }
              />

            </div>

            {/* TIP TYPE */}

            <Select
              value={filterType}
              onValueChange={setFilterType}
            >

              <SelectTrigger>
                <SelectValue placeholder="Tip type" />
              </SelectTrigger>

              <SelectContent>

                <SelectItem value="all">
                  All tip types
                </SelectItem>

                {TIP_TYPES.map(
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

            {/* MARKET */}

            <Select
              value={filterMarket}
              onValueChange={setFilterMarket}
            >

              <SelectTrigger>
                <SelectValue placeholder="Market" />
              </SelectTrigger>

              <SelectContent>

                <SelectItem value="all">
                  All markets
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

            {/* RESULT */}

            <Select
              value={filterResult}
              onValueChange={setFilterResult}
            >

              <SelectTrigger>
                <SelectValue placeholder="Result" />
              </SelectTrigger>

              <SelectContent>

                <SelectItem value="all">
                  All results
                </SelectItem>

                <SelectItem value="pending">
                  Pending
                </SelectItem>

                <SelectItem value="won">
                  Won
                </SelectItem>

                <SelectItem value="lost">
                  Lost
                </SelectItem>

                <SelectItem value="refunded">
                  Refunded
                </SelectItem>

              </SelectContent>

            </Select>

          </div>

        </CardContent>

      </Card>

      {/* =====================================================
          TABLE CARD
      ===================================================== */}

      <Card className="overflow-hidden rounded-2xl border border-border/50 shadow-sm">

        <CardHeader className="bg-muted/40">

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">

            <div>

              <CardTitle className="text-lg">
                Premium Tips
              </CardTitle>

              <CardDescription>
                {filteredTips.length} tip
                {filteredTips.length === 1
                  ? ""
                  : "s"} found.
              </CardDescription>

            </div>

            <Badge variant="outline">
              Manual Tip Management
            </Badge>

          </div>

        </CardHeader>

        <CardContent className="p-0">

          {/* =================================================
              LOADING
          ================================================= */}

          {status === "pending" ? (

            <div className="space-y-3 p-6">

              {Array.from({
                length: 6,
              }).map((_, index) => (

                <div
                  key={index}
                  className="rounded-xl border border-border/60 p-4"
                >

                  <div className="flex items-center justify-between gap-4">

                    <Skeleton className="h-4 w-32" />

                    <Skeleton className="h-4 w-20" />

                  </div>

                  <div className="mt-4 grid gap-3 md:grid-cols-4">

                    <Skeleton className="h-4 w-full" />

                    <Skeleton className="h-4 w-full" />

                    <Skeleton className="h-4 w-full" />

                    <Skeleton className="h-4 w-full" />

                  </div>

                </div>

              ))}

            </div>

          ) : error ? (

            /* =================================================
                ERROR
            ================================================= */

            <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">

              <p className="text-sm text-red-500">
                {typeof error === "string"
                  ? error
                  : "Unable to load tips."}
              </p>

              <Button
                variant="outline"
                onClick={handleRefresh}
              >
                Try Again
              </Button>

            </div>

          ) : (

            /* =================================================
                MOBILE CARD LIST / DESKTOP TABLE
            ================================================= */

            <>
              <div className="block w-full max-w-full p-3 md:hidden">
                {filteredTips.length === 0 ? (
                  <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border/70 bg-slate-900/40 p-6 text-center">
                    <div className="rounded-full bg-muted p-4">
                      <FaFutbol className="text-muted-foreground" />
                    </div>
                    <div>
                      <p className="font-medium text-white">No tips found</p>
                      <p className="mt-1 text-sm text-muted-foreground">Create your first manual betting tip.</p>
                    </div>
                    <Button size="sm" onClick={openCreate}>
                      <FaPlus className="mr-2" />
                      Create Tip
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredTips.map((tip) => {
                      const result = getResultStatus(tip);
                      const ResultIcon = result.icon;

                      return (
                        <div key={tip.id} className="w-full max-w-full rounded-2xl border border-border/60 bg-slate-900/50 p-3 shadow-sm">
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-sm font-semibold text-white">{tip.match || "Unknown match"}</p>
                              <p className="mt-1 text-xs text-muted-foreground">{tip.league || "—"}</p>
                            </div>
                            <Badge variant={result.variant} className="gap-1 shrink-0">
                              <ResultIcon className="h-3 w-3" />
                              {result.label}
                            </Badge>
                          </div>

                          <div className="mt-3 grid gap-2 text-xs text-slate-300">
                            <div className="flex items-center justify-between gap-3">
                              <span className="text-muted-foreground">Market</span>
                              <span className="truncate text-right font-medium text-white">{getMarketLabel(tip.market)}</span>
                            </div>
                            <div className="flex items-center justify-between gap-3">
                              <span className="text-muted-foreground">Pick</span>
                              <span className="truncate text-right font-medium text-white">{tip.prediction || "—"}</span>
                            </div>
                            <div className="flex items-center justify-between gap-3">
                              <span className="text-muted-foreground">Odds</span>
                              <span className="font-medium text-white">{tip.odds !== null && tip.odds !== undefined ? Number(tip.odds).toFixed(2) : "—"}</span>
                            </div>
                            <div className="flex items-center justify-between gap-3">
                              <span className="text-muted-foreground">Type</span>
                              <Badge variant="outline" className={getTipTypeBadgeClasses(tip.tipsType)}>
                                {String(tip.tipsType || "free").toUpperCase()}
                              </Badge>
                            </div>
                            <div className="flex items-center justify-between gap-3">
                              <span className="text-muted-foreground">Date</span>
                              <span className="text-right text-white">{tip.createdAt ? moment(tip.createdAt).format("MMM DD, YYYY") : "—"}</span>
                            </div>
                          </div>

                          <div className="mt-3 flex justify-end gap-2">
                            <Button size="icon" variant="ghost" onClick={() => openEdit(tip)} title="Edit tip" className="h-8 w-8">
                              <FaEdit />
                            </Button>
                            <Button size="icon" variant="ghost" className="h-8 w-8 text-red-500 hover:text-red-600" onClick={() => handleDeleteClick(tip)} title="Delete tip">
                              <FaTrashAlt />
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="hidden w-full max-w-full overflow-x-auto md:block">
                <Table className="min-w-[760px] md:min-w-0">

                  <TableHeader>

                    <TableRow>

                      <TableHead>
                        Match
                      </TableHead>

                      <TableHead>
                        League
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
                        Result
                      </TableHead>

                      <TableHead>
                        Date
                      </TableHead>

                      <TableHead className="text-right">
                        Actions
                      </TableHead>

                    </TableRow>

                  </TableHeader>

                  <TableBody>

                    {filteredTips.length === 0 ? (

                      <TableRow>

                        <TableCell
                          colSpan={9}
                          className="py-16 text-center"
                        >

                          <div className="flex flex-col items-center gap-3">

                            <div className="rounded-full bg-muted p-4">

                              <FaFutbol className="text-muted-foreground" />

                            </div>

                            <div>

                              <p className="font-medium">
                                No tips found
                              </p>

                              <p className="mt-1 text-sm text-muted-foreground">
                                Create your first manual betting tip.
                              </p>

                            </div>

                            <Button
                              size="sm"
                              onClick={openCreate}
                            >
                              <FaPlus className="mr-2" />
                              Create Tip
                            </Button>

                          </div>

                        </TableCell>

                      </TableRow>

                    ) : (

                      filteredTips.map(
                        (tip) => {

                          const result =
                            getResultStatus(tip);

                          const ResultIcon =
                            result.icon;

                          return (

                            <TableRow
                              key={tip.id}
                              className="hover:bg-muted/30"
                            >

                              <TableCell>
                                <div className="min-w-[180px]">
                                  <p className="font-medium">{tip.match || "Unknown match"}</p>
                                  <p className="mt-1 text-xs text-muted-foreground">
                                    {tip.date ? moment(tip.date).format("MMM DD, YYYY") : "Date not set"}
                                    {tip.time ? ` • ${String(tip.time).slice(0, 5)}` : ""}
                                  </p>
                                </div>
                              </TableCell>

                              <TableCell>{tip.league || "—"}</TableCell>

                              <TableCell>
                                <span className="whitespace-nowrap text-sm">{getMarketLabel(tip.market)}</span>
                              </TableCell>

                              <TableCell>
                                <span className="font-medium">{tip.prediction || "—"}</span>
                              </TableCell>

                              <TableCell>
                                {tip.odds !== null && tip.odds !== undefined ? Number(tip.odds).toFixed(2) : "—"}
                              </TableCell>

                              <TableCell>
                                <Badge variant="outline" className={getTipTypeBadgeClasses(tip.tipsType)}>
                                  {String(tip.tipsType || "free").toUpperCase()}
                                </Badge>
                              </TableCell>

                              <TableCell>
                                <Badge variant={result.variant} className="gap-1">
                                  <ResultIcon className="h-3 w-3" />
                                  {result.label}
                                </Badge>
                              </TableCell>

                              <TableCell>
                                {tip.createdAt ? moment(tip.createdAt).format("MMM DD, YYYY") : "—"}
                              </TableCell>

                              <TableCell className="text-right">
                                <div className="flex justify-end gap-1">
                                  <Button size="icon" variant="ghost" onClick={() => openEdit(tip)} title="Edit tip">
                                    <FaEdit />
                                  </Button>
                                  <Button size="icon" variant="ghost" className="text-red-500 hover:text-red-600" onClick={() => handleDeleteClick(tip)} title="Delete tip">
                                    <FaTrashAlt />
                                  </Button>
                                </div>
                              </TableCell>

                            </TableRow>

                          );
                        }
                      )

                    )}

                  </TableBody>

                </Table>
              </div>
            </>

          )}

        </CardContent>

      </Card>
            {/* =====================================================
          CREATE / EDIT DIALOG
      ===================================================== */}

      <Dialog
        open={showTipDialog}
        onOpenChange={(open) => {
          if (!open) {
            closeTipDialog();
          }
        }}
      >

        <DialogContent className="max-h-[90vh] w-[calc(100%-1rem)] max-w-4xl overflow-y-auto rounded-2xl p-4 sm:p-6">

          <DialogHeader>

            <DialogTitle className="flex items-center gap-2">

              {selectedTip ? (
                <FaEdit />
              ) : (
                <FaPlus />
              )}

              {selectedTip
                ? "Edit Betting Tip"
                : "Create Betting Tip"}

            </DialogTitle>

            <DialogDescription>

              Create a manual betting tip. It does not require
              a football API fixture.

            </DialogDescription>

          </DialogHeader>

          <div className="space-y-6 py-4">

            {/* =================================================
                MATCH INFORMATION
            ================================================= */}

            <div>

              <h3 className="mb-3 text-sm font-semibold">
                Match Information
              </h3>

              <div className="grid gap-4 sm:grid-cols-2">

                {/* LEAGUE */}

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

                {/* MATCH */}

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

                </div>

                {/* DATE */}

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

                {/* TIME */}

                <div className="space-y-2">

                  <Label htmlFor="time">
                    Kickoff Time
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

            <Separator />

            {/* =================================================
                BETTING INFORMATION
            ================================================= */}

            <div>

              <h3 className="mb-3 text-sm font-semibold">
                Betting Information
              </h3>

              <div className="grid gap-4 sm:grid-cols-2">

                {/* TIPS TYPE */}

                <div className="space-y-2">

                  <Label>
                    Tip Type
                  </Label>

                  <Select
                    value={
                      formData.tipsType
                    }
                    onValueChange={(value) =>
                      handleSelectChange(
                        "tipsType",
                        value
                      )
                    }
                  >

                    <SelectTrigger>

                      <SelectValue placeholder="Select tip type" />

                    </SelectTrigger>

                    <SelectContent>

                      {TIP_TYPES.map(
                        (type) => (

                          <SelectItem
                            key={
                              type.value
                            }
                            value={
                              type.value
                            }
                          >
                            {type.label}
                          </SelectItem>

                        )
                      )}

                    </SelectContent>

                  </Select>

                </div>

                {/* MARKET */}

                <div className="space-y-2">

                  <Label>
                    Betting Market
                  </Label>

                  <Select
                    value={
                      formData.market
                    }
                    onValueChange={(value) =>
                      handleSelectChange(
                        "market",
                        value
                      )
                    }
                  >

                    <SelectTrigger>

                      <SelectValue placeholder="Select betting market" />

                    </SelectTrigger>

                    <SelectContent>

                      {MARKET_OPTIONS.map(
                        (market) => (

                          <SelectItem
                            key={
                              market.value
                            }
                            value={
                              market.value
                            }
                          >

                            {market.label}

                          </SelectItem>

                        )
                      )}

                    </SelectContent>

                  </Select>

                </div>

                {/* PREDICTION */}

                <div className="space-y-2">

                  <Label>
                    Prediction
                  </Label>

                  {formData.market ===
                  "correct_score" ? (

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
                        handleSelectChange(
                          "prediction",
                          value
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
                                prediction
                              }
                              value={
                                prediction
                              }
                            >

                              {prediction}

                            </SelectItem>

                          )
                        )}

                      </SelectContent>

                    </Select>

                  )}

                </div>

                {/* ODDS */}

                <div className="space-y-2">

                  <Label htmlFor="odds">
                    Odds
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

                {/* CONFIDENCE */}

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
                    step="1"
                    value={
                      formData.confidence
                    }
                    onChange={handleChange}
                    placeholder="85"
                  />

                </div>

                {/* SOURCE */}

                <div className="space-y-2">

                  <Label>
                    Source
                  </Label>

                  <Select
                    value={
                      formData.source
                    }
                    onValueChange={(value) =>
                      handleSelectChange(
                        "source",
                        value
                      )
                    }
                  >

                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>

                    <SelectContent>

                      <SelectItem value="manual">
                        Manual
                      </SelectItem>

                      <SelectItem value="api">
                        API
                      </SelectItem>

                    </SelectContent>

                  </Select>

                </div>

              </div>

              {/* ANALYSIS */}

              <div className="mt-4 space-y-2">

                <Label htmlFor="analysis">
                  Analysis
                </Label>

                <Textarea
                  id="analysis"
                  name="analysis"
                  value={
                    formData.analysis
                  }
                  onChange={handleChange}
                  placeholder="Enter your match analysis..."
                  rows={5}
                />

              </div>

            </div>

            <Separator />

            {/* =================================================
                RESULT INFORMATION
            ================================================= */}

            <div>

              <h3 className="mb-3 text-sm font-semibold">
                Match Result
              </h3>

              <div className="grid gap-4 sm:grid-cols-2">

                {/* FULL TIME */}

                <div className="rounded-xl border p-4">

                  <p className="mb-3 text-sm font-semibold">
                    Full-Time Score
                  </p>

                  <div className="grid grid-cols-2 gap-3">

                    <div className="space-y-2">

                      <Label>
                        Home
                      </Label>

                      <Input
                        type="number"
                        min="0"
                        name="homeScore"
                        value={
                          formData.homeScore
                        }
                        onChange={
                          handleChange
                        }
                        placeholder="2"
                      />

                    </div>

                    <div className="space-y-2">

                      <Label>
                        Away
                      </Label>

                      <Input
                        type="number"
                        min="0"
                        name="awayScore"
                        value={
                          formData.awayScore
                        }
                        onChange={
                          handleChange
                        }
                        placeholder="1"
                      />

                    </div>

                  </div>

                </div>

                {/* HALF TIME */}

                <div className="rounded-xl border p-4">

                  <p className="mb-3 text-sm font-semibold">
                    Half-Time Score
                  </p>

                  <div className="grid grid-cols-2 gap-3">

                    <div className="space-y-2">

                      <Label>
                        Home
                      </Label>

                      <Input
                        type="number"
                        min="0"
                        name="halfTimeHomeScore"
                        value={
                          formData.halfTimeHomeScore
                        }
                        onChange={
                          handleChange
                        }
                        placeholder="1"
                      />

                    </div>

                    <div className="space-y-2">

                      <Label>
                        Away
                      </Label>

                      <Input
                        type="number"
                        min="0"
                        name="halfTimeAwayScore"
                        value={
                          formData.halfTimeAwayScore
                        }
                        onChange={
                          handleChange
                        }
                        placeholder="0"
                      />

                    </div>

                  </div>

                </div>

                {/* CORNERS */}

                <div className="rounded-xl border p-4">

                  <p className="mb-3 text-sm font-semibold">
                    Corners
                  </p>

                  <div className="grid grid-cols-2 gap-3">

                    <div className="space-y-2">

                      <Label>
                        Home
                      </Label>

                      <Input
                        type="number"
                        min="0"
                        name="homeCorners"
                        value={
                          formData.homeCorners
                        }
                        onChange={
                          handleChange
                        }
                        placeholder="7"
                      />

                    </div>

                    <div className="space-y-2">

                      <Label>
                        Away
                      </Label>

                      <Input
                        type="number"
                        min="0"
                        name="awayCorners"
                        value={
                          formData.awayCorners
                        }
                        onChange={
                          handleChange
                        }
                        placeholder="9"
                      />

                    </div>

                  </div>

                </div>

                {/* BOOKINGS */}

                <div className="rounded-xl border p-4">

                  <p className="mb-3 text-sm font-semibold">
                    Bookings
                  </p>

                  <div className="grid grid-cols-2 gap-3">

                    <div className="space-y-2">

                      <Label>
                        Home
                      </Label>

                      <Input
                        type="number"
                        min="0"
                        name="homeBookings"
                        value={
                          formData.homeBookings
                        }
                        onChange={
                          handleChange
                        }
                        placeholder="2"
                      />

                    </div>

                    <div className="space-y-2">

                      <Label>
                        Away
                      </Label>

                      <Input
                        type="number"
                        min="0"
                        name="awayBookings"
                        value={
                          formData.awayBookings
                        }
                        onChange={
                          handleChange
                        }
                        placeholder="4"
                      />

                    </div>

                  </div>

                </div>

              </div>

            </div>

            <Separator />

            {/* =================================================
                TIP SETTLEMENT
            ================================================= */}

            <div>

              <h3 className="mb-3 text-sm font-semibold">
                Tip Settlement
              </h3>

              <div className="space-y-2">

                <Label>
                  Status
                </Label>

                <Select
                  value={
                    formData.isRefunded
                      ? "refunded"
                      : formData.isLost
                      ? "lost"
                      : formData.isWon === true
                      ? "won"
                      : "pending"
                  }
                  onValueChange={(value) =>
                    handleSelectChange(
                      "isWon",
                      value
                    )
                  }
                >

                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>

                  <SelectContent>

                    <SelectItem value="pending">
                      Pending
                    </SelectItem>

                    <SelectItem value="won">
                      Won
                    </SelectItem>

                    <SelectItem value="lost">
                      Lost
                    </SelectItem>

                    <SelectItem value="refunded">
                      Refunded
                    </SelectItem>

                  </SelectContent>

                </Select>

                {formData.market ===
                  "draw_no_bet" && (
                  <p className="text-xs text-muted-foreground">
                    Use Refunded when the Draw No Bet
                    selection ends in a draw.
                  </p>
                )}

              </div>

            </div>

          </div>

          {/* ===================================================
              DIALOG FOOTER
          =================================================== */}

          <DialogFooter className="flex-col-reverse gap-2 sm:flex-row sm:justify-end">

            <Button
              variant="outline"
              className="w-full sm:w-auto"
              onClick={
                closeTipDialog
              }
              disabled={
                status === "pending"
              }
            >
              Cancel
            </Button>

            <Button
              onClick={handleSave}
              className="w-full sm:w-auto"
              disabled={
                status === "pending"
              }
            >

              {status === "pending"
                ? "Saving..."
                : selectedTip
                ? "Update Tip"
                : "Create Tip" }
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    
      {/* =====================================================
          DELETE CONFIRMATION DIALOG
      ===================================================== */}

      <Dialog
        open={showDeleteDialog}
        onOpenChange={(open) => {
          if (!open) {
            closeDeleteDialog();
          }
        }}
      >

        <DialogContent className="w-[calc(100%-1rem)] max-w-md rounded-2xl p-4 sm:p-6">

          <DialogHeader>

            <DialogTitle>
              Delete Betting Tip
            </DialogTitle>

            <DialogDescription>
              This action cannot be undone.
            </DialogDescription>

          </DialogHeader>

          <div className="rounded-xl border bg-muted/30 p-4">

            <div className="space-y-2 text-sm">

              <div className="flex justify-between gap-4">

                <span className="text-muted-foreground">
                  Match
                </span>

                <span className="font-medium text-right">
                  {selectedTip?.match ||
                    "—"}
                </span>

              </div>

              <div className="flex justify-between gap-4">

                <span className="text-muted-foreground">
                  League
                </span>

                <span className="font-medium text-right">
                  {selectedTip?.league ||
                    "—"}
                </span>

              </div>

              <div className="flex justify-between gap-4">

                <span className="text-muted-foreground">
                  Market
                </span>

                <span className="font-medium text-right">
                  {getMarketLabel(
                    selectedTip?.market
                  )}
                </span>

              </div>

              <div className="flex justify-between gap-4">

                <span className="text-muted-foreground">
                  Prediction
                </span>

                <span className="font-medium text-right">
                  {selectedTip?.prediction ||
                    "—"}
                </span>

              </div>

            </div>

          </div>

          <DialogFooter className="flex-col-reverse gap-2 sm:flex-row sm:justify-end">

            <Button
              variant="outline"
              className="w-full sm:w-auto"
              onClick={
                closeDeleteDialog
              }
              disabled={
                status === "pending"
              }
            >
              Cancel
            </Button>

            <Button
              variant="destructive"
              className="w-full sm:w-auto"
              onClick={
                handleConfirmDelete
              }
              disabled={
                status === "pending"
              }
            >

              <FaTrashAlt className="mr-2" />

              {status === "pending"
                ? "Deleting..."
                : "Delete Tip"}

            </Button>

          </DialogFooter>

        </DialogContent>

      </Dialog>

    </div>
  );
};

export default AdminVip;
