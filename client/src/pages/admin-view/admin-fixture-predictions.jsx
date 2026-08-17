import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { ChevronLeft, ChevronRight, Search, SlidersHorizontal, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "react-toastify";
import FixturePredictionModal from "@/components/admin-view/predictions/fixture-prediction-modal";
import FixtureCard from "@/components/admin-view/predictions/FixtureCard";
import { fetchAdminFixtures, saveAdminPredictionThunk } from "@/features/slices/footballSlice";
import { getPredictionStatusLabel, getPredictionStatusVariant, getResultVariant } from "@/utils/predictionStatus";

const PAGE_SIZE = 8;
const defaultFormData = {
  prediction: "",
  market: "MATCH_WINNER",
  odds: "",
  confidence: "",
  analysis: "",
  isFeatured: false,
  result: "pending",
  tipsType: "free",
};

const AdminFixturePredictions = () => {
  const dispatch = useDispatch();

  const adminFixtures = useSelector((state) => state.football.adminFixtures);
  const loading = useSelector((state) => state.football.loading.adminFixtures);
  const error = useSelector((state) => state.football.errors.adminFixtures);

  const fixtures = adminFixtures;

  const [searchTerm, setSearchTerm] = useState("");
  const [leagueFilter, setLeagueFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("");
  const [matchStatusFilter, setMatchStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [selectedFixture, setSelectedFixture] = useState(null);
  const [formData, setFormData] = useState(defaultFormData);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    dispatch(fetchAdminFixtures());
  }, [dispatch]);

  const leagueOptions = useMemo(
    () => [...new Set(fixtures.map((fixture) => fixture.league).filter(Boolean))],
    [fixtures]
  );

  const filteredFixtures = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    return fixtures.filter((fixture) => {
      const searchableText = [
        fixture.homeTeam,
        fixture.awayTeam,
        fixture.league,
        fixture.prediction?.prediction,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchesSearch = !query || searchableText.includes(query);
      const matchesLeague = leagueFilter === "all" || fixture.league === leagueFilter;
      const matchesDate = !dateFilter || new Date(fixture.kickoffTime).toISOString().slice(0, 10) === dateFilter;
      const matchesStatus = matchStatusFilter === "all" || String(fixture.status || "SCHEDULED").toLowerCase() === matchStatusFilter.toLowerCase();

      return matchesSearch && matchesLeague && matchesDate && matchesStatus;
    });
  }, [fixtures, searchTerm, leagueFilter, dateFilter, matchStatusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredFixtures.length / PAGE_SIZE));
  const paginatedFixtures = filteredFixtures.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  useEffect(() => {
    setPage(1);
  }, [searchTerm, leagueFilter, dateFilter, matchStatusFilter]);

  const openEditor = (fixture) => {
    const prediction = fixture?.prediction || {};
    setSelectedFixture(fixture);
    setFormData({
      ...defaultFormData,
      prediction: prediction.prediction || "",
      market: prediction.market || "MATCH_WINNER",
      odds: prediction.odds ?? "",
      confidence: prediction.confidence ?? "",
      analysis: prediction.analysis || "",
      isFeatured: Boolean(prediction.isFeatured),
      result: prediction.result || "pending",
      tipsType: prediction.tipsType || "free",
    });
    setErrors({});
  };

  const closeEditor = () => {
    setSelectedFixture(null);
    setFormData(defaultFormData);
    setErrors({});
  };

  const handleFieldChange = (field, value) => {
    setFormData((previous) => ({ ...previous, [field]: value }));
    setErrors((previous) => ({ ...previous, [field]: "" }));
  };

  const validateForm = () => {
    const nextErrors = {};

    if (!String(formData.prediction || "").trim()) {
        // For markets like TOTAL_GOALS prediction may be constructed from line+side
        if (String(formData.market) === "TOTAL_GOALS") {
          if (!formData.overUnderLine || !formData.overUnderSide) {
            nextErrors.prediction = "Select a line and side for over/under prediction.";
          }
        } else {
          nextErrors.prediction = "Prediction is required.";
        }
    }

    if (!String(formData.market || "").trim()) {
      nextErrors.market = "Betting market is required.";
    }

    const odds = Number(formData.odds);
    if (formData.odds !== "" && (!Number.isFinite(odds) || odds <= 0)) {
      nextErrors.odds = "Odds must be a positive number.";
    }

    const confidence = Number(formData.confidence);
    if (formData.confidence !== "" && (!Number.isFinite(confidence) || confidence < 0 || confidence > 100)) {
      nextErrors.confidence = "Confidence must be between 0 and 100.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSave = async () => {
    if (!selectedFixture) return;

    if (!validateForm()) {
      return;
    }

    const shouldContinue = window.confirm("Save this prediction for the selected synchronized fixture?");
    if (!shouldContinue) {
      return;
    }

    setSaving(true);

    try {
      const fixtureId = selectedFixture.fixtureId || selectedFixture.matchId;
      const existingPrediction = Boolean(selectedFixture.prediction?.prediction || selectedFixture.prediction?.market);
      const method = existingPrediction ? "PUT" : "POST";

      const payloadData = {
        ...formData,
        odds: formData.odds === "" ? "" : Number(formData.odds),
        confidence: formData.confidence === "" ? "" : Number(formData.confidence),
        result: String(formData.result || "pending").toLowerCase(),
      };

      // Construct prediction string for TOTAL_GOALS market
      if (String(formData.market) === "TOTAL_GOALS") {
        payloadData.prediction = formData.overUnderSide && formData.overUnderLine ? `${formData.overUnderSide} ${formData.overUnderLine}` : "";
        delete payloadData.overUnderLine;
        delete payloadData.overUnderSide;
      }

      await dispatch(
        saveAdminPredictionThunk({
          fixtureId,
          method,
          payload: payloadData,
        })
      ).unwrap();

      toast.success(existingPrediction ? "Prediction updated successfully." : "Prediction created successfully.");
      closeEditor();
    } catch (saveError) {
      toast.error(saveError.message || "Unable to save prediction.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 p-4 md:p-6 lg:p-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-emerald-600 dark:text-emerald-300">Admin Workspace</p>
          <h1 className="mt-1 text-2xl font-semibold text-foreground">Fixture Prediction Management</h1>
          <p className="mt-1 text-sm text-muted-foreground">Manage synchronized fixtures and attach or edit prediction data without creating new fixtures.</p>
        </div>
      </div>

      <Card className="border border-border/70 bg-card/80 shadow-sm">
        <CardHeader className="border-b border-border/70">
          <CardTitle className="text-lg">Filter synchronized fixtures</CardTitle>
          <CardDescription>Use the controls below to search and narrow the fixture list before editing predictions.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} placeholder="Search team or league" className="w-full rounded-full pl-9" />
          </div>

          <div>
            <Label className="mb-2 block text-xs uppercase tracking-[0.18em] text-muted-foreground">League</Label>
            <Select value={leagueFilter} onValueChange={setLeagueFilter}>
              <SelectTrigger className="w-full rounded-full">
                <SelectValue placeholder="All leagues" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All leagues</SelectItem>
                {leagueOptions.map((league) => (
                  <SelectItem key={league} value={league}>{league}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="mb-2 block text-xs uppercase tracking-[0.18em] text-muted-foreground">Date</Label>
            <Input type="date" value={dateFilter} onChange={(event) => setDateFilter(event.target.value)} className="w-full rounded-full" />
          </div>

          <div>
            <Label className="mb-2 block text-xs uppercase tracking-[0.18em] text-muted-foreground">Match status</Label>
            <Select value={matchStatusFilter} onValueChange={setMatchStatusFilter}>
              <SelectTrigger className="w-full rounded-full">
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="scheduled">Scheduled</SelectItem>
                <SelectItem value="live">Live</SelectItem>
                <SelectItem value="finished">Finished</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="rounded-2xl border border-border/70 bg-background/70 p-4 md:hidden">
              <div className="flex items-center justify-between gap-3">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-5 w-20" />
              </div>
              <div className="mt-4 space-y-3">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-4/5" />
                <Skeleton className="h-10 w-full rounded-full" />
              </div>
            </div>
          ))}
          <div className="hidden md:block space-y-3">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="rounded-2xl border border-border/70 bg-background/70 p-4">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-5 w-40" />
                  <Skeleton className="h-5 w-24" />
                </div>
                <div className="mt-4 grid gap-3 md:grid-cols-5">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : !!error ? (
        <div className="rounded-2xl border border-red-200 bg-red-500/10 p-4 text-sm text-red-600">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>{error}</div>
            <Button variant="outline" className="rounded-full" onClick={() => dispatch(fetchAdminFixtures())}>
              Retry
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <Card className="overflow-hidden border border-border/70 bg-card/80 shadow-sm">
            <CardHeader className="border-b border-border/70">
              <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                <div>
                  <CardTitle className="text-lg">Synchronized fixtures</CardTitle>
                  <CardDescription>{filteredFixtures.length} fixtures available</CardDescription>
                </div>
                <div className="flex items-center gap-2 rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground">
                  <SlidersHorizontal className="h-3.5 w-3.5" />
                  {searchTerm || leagueFilter !== "all" || dateFilter || matchStatusFilter !== "all" ? "Filtered" : "Showing all"}
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="hidden md:block overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>League</TableHead>
                      <TableHead>Match</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Prediction</TableHead>
                      <TableHead>Tips Type</TableHead>
                      <TableHead>Result</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedFixtures.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="py-12 text-center">
                          <div className="mx-auto flex max-w-sm flex-col items-center justify-center gap-3 text-sm text-muted-foreground">
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted text-foreground">
                              <Sparkles className="h-6 w-6" />
                            </div>
                            <div className="space-y-1 text-center">
                              <p className="font-semibold text-foreground">No synchronized fixtures found.</p>
                              <p>Try changing your filters.</p>
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      paginatedFixtures.map((fixture) => {
                        const prediction = fixture.prediction || {};
                        const hasPrediction = Boolean(prediction.prediction || prediction.market);
                        const predictionLabel = getPredictionStatusLabel(fixture);
                        const resultLabel = String(prediction.result || "pending").toLowerCase();

                        return (
                          <TableRow key={fixture.fixtureId || fixture.matchId}>
                            <TableCell>
                              <div className="flex items-center gap-3">
                                {fixture.leagueLogo ? (
                                  <img src={fixture.leagueLogo} alt={fixture.league || "League"} className="h-8 w-8 rounded-full object-cover" />
                                ) : (
                                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-xs font-semibold text-foreground">L</div>
                                )}
                                <div>
                                  <p className="text-sm font-semibold text-foreground">{fixture.league || "—"}</p>
                                </div>
                              </div>
                            </TableCell>

                            <TableCell>
                              <div className="flex items-center gap-3">
                                {fixture.homeTeamLogo ? (
                                  <img src={fixture.homeTeamLogo} alt={fixture.homeTeam || "Home team"} className="h-8 w-8 rounded-full object-cover" />
                                ) : (
                                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-xs font-semibold text-foreground">H</div>
                                )}
                                <div className="text-sm text-foreground">
                                  <p className="font-medium">{fixture.homeTeam || "Home"}</p>
                                  <p className="text-xs text-muted-foreground">vs {fixture.awayTeam || "Away"}</p>
                                </div>
                                {fixture.awayTeamLogo ? (
                                  <img src={fixture.awayTeamLogo} alt={fixture.awayTeam || "Away team"} className="h-8 w-8 rounded-full object-cover" />
                                ) : (
                                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-xs font-semibold text-foreground">A</div>
                                )}
                              </div>
                            </TableCell>

                            <TableCell>
                              <div className="text-sm text-foreground">
                                <p>{fixture.kickoffTime ? new Date(fixture.kickoffTime).toLocaleDateString() : "—"}</p>
                                <p className="text-xs text-muted-foreground">{fixture.kickoffTime ? new Date(fixture.kickoffTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "—"}</p>
                              </div>
                            </TableCell>

                            <TableCell>
                              <Badge variant="outline">{String(fixture.status || "SCHEDULED").toUpperCase()}</Badge>
                            </TableCell>

                            <TableCell>
                              <Badge variant={getPredictionStatusVariant(fixture)} className="rounded-full">{predictionLabel}</Badge>
                            </TableCell>

                            <TableCell>
                              <span className="rounded-full px-2.5 py-1 text-xs font-medium bg-background text-muted-foreground">
                                {prediction.tipsType ? String(prediction.tipsType).toUpperCase() : "FREE"}
                              </span>
                            </TableCell>

                            <TableCell>
                              <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${getResultVariant(resultLabel)}`}>
                                {resultLabel.toUpperCase()}
                              </span>
                            </TableCell>

                            <TableCell className="text-right">
                              <Button variant="outline" size="sm" className="rounded-full" onClick={() => openEditor(fixture)}>
                                {hasPrediction ? "Edit Prediction" : "Create Prediction"}
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </div>

              <div className="grid gap-4 p-4 md:hidden">
                {paginatedFixtures.length === 0 ? (
                  <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border/70 bg-background/50 p-8 text-center text-sm text-muted-foreground">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted text-foreground">
                      <Sparkles className="h-6 w-6" />
                    </div>
                    <div className="space-y-1">
                      <p className="font-semibold text-foreground">No synchronized fixtures found.</p>
                      <p>Try changing your filters.</p>
                    </div>
                  </div>
                ) : (
                  paginatedFixtures.map((fixture) => (
                    <FixtureCard key={fixture.fixtureId || fixture.matchId} fixture={fixture} onEdit={openEditor} />
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {filteredFixtures.length > 0 && (
        <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-border/70 bg-background/70 p-3 md:flex-row md:justify-between">
          <div className="text-sm text-muted-foreground">Page {page} of {totalPages}</div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" className="h-11 w-11 rounded-full" disabled={page === 1} onClick={() => setPage((current) => Math.max(1, current - 1))}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" className="h-11 w-11 rounded-full" disabled={page === totalPages} onClick={() => setPage((current) => Math.min(totalPages, current + 1))}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      <FixturePredictionModal
        open={Boolean(selectedFixture)}
        fixture={selectedFixture}
        formData={formData}
        setFormData={setFormData}
        errors={errors}
        saving={saving}
        onClose={closeEditor}
        onSave={handleSave}
        onFieldChange={handleFieldChange}
      />
    </div>
  );
};

export default AdminFixturePredictions;
