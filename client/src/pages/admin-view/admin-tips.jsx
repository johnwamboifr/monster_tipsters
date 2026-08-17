import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { FaEdit, FaTrashAlt, FaPlus, FaSearch, FaFilter } from "react-icons/fa";
import moment from "moment";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "react-toastify";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
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
import { Link } from "react-router-dom";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const AdminTips = () => {
  const dispatch = useDispatch();
  const tips = useSelector((state) => state.tips.list);
  const status = useSelector((state) => state.tips.status);
  const error = useSelector((state) => state.tips.error);

  const [selectedTip, setSelectedTip] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");

  const [formData, setFormData] = useState({
    league: "",
    odds: "",
    results: "",
    tipsType: "",
    prediction: "",
    match: "",
    date: "",
    time: "",
  });

  useEffect(() => {
    const loadPredictions = async () => {
      try {
        const response = await fetch("/api/admin/predictions", {
          headers: {
            "Content-Type": "application/json",
            ...(typeof window !== "undefined" && window.localStorage.getItem("token")
              ? { "x-auth-token": window.localStorage.getItem("token"), Authorization: `Bearer ${window.localStorage.getItem("token")}` }
              : {}),
          },
        });
        const result = await response.json();
        if (!response.ok || result?.success === false) {
          throw new Error(result?.message || "Unable to fetch predictions");
        }
        dispatch({ type: "tips/setList", payload: result.data || [] });
      } catch (err) {
        dispatch({ type: "tips/setError", payload: err.message });
      }
    };

    loadPredictions();
  }, [dispatch]);

  useEffect(() => {
    if (selectedTip) {
      setFormData({
        league: selectedTip.league,
        odds: selectedTip.odds,
        results: selectedTip.results,
        tipsType: selectedTip.tipsType,
        prediction: selectedTip.prediction,
        match: selectedTip.match,
        date: moment(selectedTip.date).format("YYYY-MM-DD"),
        time: moment(selectedTip.time, "HH:mm").format("HH:mm"),
      });
    } else {
      setFormData({
        league: "",
        odds: "",
        results: "",
        tipsType: "",
        prediction: "",
        match: "",
        date: "",
        time: "",
      });
    }
  }, [selectedTip]);

  const handleDelete = async () => {
    if (!confirmDelete) return;
    try {
      const response = await fetch(`/api/admin/predictions/${confirmDelete.fixtureId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          ...(typeof window !== "undefined" && window.localStorage.getItem("token")
            ? { "x-auth-token": window.localStorage.getItem("token"), Authorization: `Bearer ${window.localStorage.getItem("token")}` }
            : {}),
        },
      });
      const result = await response.json();
      if (!response.ok || result?.success === false) {
        throw new Error(result?.message || "Unable to delete prediction");
      }
      toast.success("Prediction deleted successfully");
      setConfirmDelete(null);
      dispatch({ type: "tips/setList", payload: (tips || []).filter((tip) => tip.fixtureId !== confirmDelete.fixtureId) });
    } catch (error) {
      toast.error("Error deleting prediction: " + error.message);
    }
  };

  const handleSave = async () => {
    const { league, prediction, odds, tipsType, match } = formData;
    if (!league || !prediction || !odds || !tipsType || !match) {
      toast.error("Please fill all required fields", { position: "top-center" });
      return;
    }

    try {
      if (selectedTip) {
        const response = await fetch(`/api/admin/predictions/${selectedTip.fixtureId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            ...(typeof window !== "undefined" && window.localStorage.getItem("token")
              ? { "x-auth-token": window.localStorage.getItem("token"), Authorization: `Bearer ${window.localStorage.getItem("token")}` }
              : {}),
          },
          body: JSON.stringify({
            fixtureId: selectedTip.fixtureId,
            market: selectedTip.market || "Match Winner",
            prediction,
            odds: Number(odds),
            confidence: selectedTip.confidence || 0,
            analysis: selectedTip.analysis || "",
            isPremium: tipsType !== "free",
            isFeatured: Boolean(selectedTip.isFeatured),
            isPublished: Boolean(selectedTip.isPublished),
            result: selectedTip.result || "pending",
            tipsType: tipsType || "free",
          }),
        });
        const result = await response.json();
        if (!response.ok || result?.success === false) {
          throw new Error(result?.message || "Unable to save prediction");
        }
        toast.success("Prediction updated successfully");
        setSelectedTip(null);
        const refreshed = await fetch("/api/admin/predictions", { headers: { "Content-Type": "application/json", ...(typeof window !== "undefined" && window.localStorage.getItem("token") ? { "x-auth-token": window.localStorage.getItem("token"), Authorization: `Bearer ${window.localStorage.getItem("token")}` } : {}) } });
        const refreshedResult = await refreshed.json();
        dispatch({ type: "tips/setList", payload: refreshedResult.data || [] });
      }
    } catch (error) {
      toast.error("Error updating prediction: " + error.message);
    }
  };

  const filteredTips = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return (tips || []).filter((tip) => {
      const matchesSearch =
        (tip?.homeTeam || "").toLowerCase().includes(term) ||
        (tip?.awayTeam || "").toLowerCase().includes(term) ||
        (tip?.league || "").toLowerCase().includes(term) ||
        (tip?.prediction || "").toLowerCase().includes(term);

      const matchesFilter = filterType === "all" || (tip.tipsType || "free") === filterType;

      return matchesSearch && matchesFilter;
    });
  }, [tips, searchTerm, filterType]);

  const getResultBadge = (result) => {
    const colors = {
      won: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
      lost: "bg-rose-500/15 text-rose-700 dark:text-rose-300",
      pending: "bg-amber-500/15 text-amber-700 dark:text-amber-300",
      void: "bg-slate-500/15 text-slate-700 dark:text-slate-300",
    };
    return <span className={`rounded-full px-2 py-1 text-xs font-medium ${colors[result] || "bg-muted text-muted-foreground"}`}>{result || "N/A"}</span>;
  };

  const getTypeBadge = (tipsType) => {
    const typeMap = {
      free: { className: "bg-slate-500/15 text-slate-700 dark:text-slate-300", label: "Free" },
      bronze: { className: "bg-amber-500/15 text-amber-700 dark:text-amber-300", label: "Bronze" },
      silver: { className: "bg-slate-400/15 text-slate-600 dark:text-slate-400", label: "Silver" },
      gold: { className: "bg-yellow-500/15 text-yellow-700 dark:text-yellow-300", label: "Gold" },
    };
    const config = typeMap[tipsType] || typeMap.free;
    return <Badge className={config.className}>{config.label}</Badge>;
  };

  const summary = {
    total: filteredTips.length,
    free: filteredTips.filter((tip) => (tip.tipsType || "free") === "free").length,
    bronze: filteredTips.filter((tip) => tip.tipsType === "bronze").length,
    silver: filteredTips.filter((tip) => tip.tipsType === "silver").length,
    gold: filteredTips.filter((tip) => tip.tipsType === "gold").length,
  };

  return (
    <div className="space-y-6 px-1 py-2">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-primary">Content hub</p>
          <h1 className="text-2xl font-semibold text-foreground">Tips Management</h1>
          <p className="mt-1 text-sm text-muted-foreground">Manage, filter, and edit betting tips in one view.</p>
        </div>
        <Link to="/admin/post">
          <Button className="flex items-center gap-2 rounded-full px-4">
            <FaPlus className="h-4 w-4" /> Add Tip
          </Button>
        </Link>
      </div>

      <div className="grid gap-3 md:grid-cols-5">
        <div className="rounded-2xl border border-border/70 bg-background/70 p-4">
          <p className="text-sm text-muted-foreground">Total tips</p>
          <p className="mt-2 text-2xl font-semibold text-foreground">{summary.total}</p>
        </div>
        <div className="rounded-2xl border border-border/70 bg-background/70 p-4">
          <p className="text-sm text-muted-foreground">Free tips</p>
          <p className="mt-2 text-2xl font-semibold text-foreground">{summary.free}</p>
        </div>
        <div className="rounded-2xl border border-border/70 bg-background/70 p-4">
          <p className="text-sm text-muted-foreground">Bronze tips</p>
          <p className="mt-2 text-2xl font-semibold text-foreground">{summary.bronze}</p>
        </div>
        <div className="rounded-2xl border border-border/70 bg-background/70 p-4">
          <p className="text-sm text-muted-foreground">Silver tips</p>
          <p className="mt-2 text-2xl font-semibold text-foreground">{summary.silver}</p>
        </div>
        <div className="rounded-2xl border border-border/70 bg-background/70 p-4">
          <p className="text-sm text-muted-foreground">Gold tips</p>
          <p className="mt-2 text-2xl font-semibold text-foreground">{summary.gold}</p>
        </div>
      </div>

      <Card className="border border-border/70 bg-card/80 shadow-sm">
        <CardContent className="flex flex-col gap-4 p-4 md:flex-row">
          <div className="relative flex-1">
            <FaSearch className="pointer-events-none absolute left-3 top-3 text-muted-foreground" />
            <Input
              placeholder="Search by match, league, or prediction..."
              className="pl-9 rounded-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="w-full md:w-48">
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="rounded-full">
                <div className="flex items-center gap-2">
                  <FaFilter className="text-muted-foreground" />
                  <SelectValue placeholder="Filter" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="free">Free</SelectItem>
                <SelectItem value="bronze">Bronze</SelectItem>
                <SelectItem value="silver">Silver</SelectItem>
                <SelectItem value="gold">Gold</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {status === "pending" ? (
        <div className="space-y-4 py-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="rounded-2xl border border-border/70 bg-background/70 p-4">
              <div className="flex items-center justify-between gap-4">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-24" />
              </div>
              <div className="mt-4 grid gap-3 md:grid-cols-3">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
              </div>
            </div>
          ))}
        </div>
      ) : status === "rejected" ? (
        <div className="rounded-2xl border border-red-200 bg-red-500/10 p-4 text-red-600">
          Error: {error}
        </div>
      ) : (
        <Card className="overflow-hidden border border-border/70 bg-card/80 shadow-sm">
          <CardHeader>
            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <div>
                <CardTitle>All Tips</CardTitle>
                <CardDescription>{filteredTips.length} total</CardDescription>
              </div>
              <p className="text-xs text-muted-foreground">Last updated {moment().format("MMM D, h:mm A")}</p>
            </div>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-muted/40">
                <TableRow>
                  <TableHead>League</TableHead>
                  <TableHead>Match</TableHead>
                  <TableHead>Prediction</TableHead>
                  <TableHead>Odds</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Result</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTips.length > 0 ? (
                  filteredTips.map((tip) => (
                    <TableRow key={tip.id} className="transition hover:bg-muted/40">
                      <TableCell>{tip.league || "—"}</TableCell>
                      <TableCell>{[tip.homeTeam, tip.awayTeam].filter(Boolean).join(" vs ") || tip.fixtureId}</TableCell>
                      <TableCell>{tip.prediction}</TableCell>
                      <TableCell>{tip.odds ?? "—"}</TableCell>
                      <TableCell>{getTypeBadge(tip.tipsType || "free")}</TableCell>
                      <TableCell>{getResultBadge(tip.result)}</TableCell>
                      <TableCell>{moment(tip.kickoffTime || tip.updatedAt).format("MMM D")}</TableCell>
                      <TableCell className="flex justify-end gap-2 text-right">
                        <Button variant="outline" size="sm" onClick={() => setSelectedTip(tip)} className="rounded-full">
                          <FaEdit className="h-4 w-4" />
                        </Button>
                        <Button variant="destructive" size="sm" onClick={() => setConfirmDelete(tip)} className="rounded-full">
                          <FaTrashAlt className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan="8" className="py-10 text-center text-muted-foreground">
                      No tips found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      <Dialog open={Boolean(selectedTip)} onOpenChange={() => setSelectedTip(null)}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle>Edit Tip</DialogTitle>
            <DialogDescription>Update the selected tip below.</DialogDescription>
          </DialogHeader>
          <div className="mt-4 space-y-3">
            <div>
              <Label>League</Label>
              <Input value={formData.league} onChange={(e) => setFormData({ ...formData, league: e.target.value })} />
            </div>
            <div>
              <Label>Match</Label>
              <Input value={formData.match} onChange={(e) => setFormData({ ...formData, match: e.target.value })} />
            </div>
            <div>
              <Label>Prediction</Label>
              <Input value={formData.prediction} onChange={(e) => setFormData({ ...formData, prediction: e.target.value })} />
            </div>
            <div>
              <Label>Odds</Label>
              <Input value={formData.odds} onChange={(e) => setFormData({ ...formData, odds: e.target.value })} />
            </div>
            <div>
              <Label>Type</Label>
              <Select value={formData.tipsType} onValueChange={(value) => setFormData({ ...formData, tipsType: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="free">Free</SelectItem>
                  <SelectItem value="bronze">Bronze</SelectItem>
                  <SelectItem value="silver">Silver</SelectItem>
                  <SelectItem value="gold">Gold</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Result</Label>
              <Select value={formData.results} onValueChange={(value) => setFormData({ ...formData, results: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select result" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="win">Win</SelectItem>
                  <SelectItem value="loss">Loss</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <Button variant="outline" onClick={() => setSelectedTip(null)}>Cancel</Button>
              <Button onClick={handleSave}>Save</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(confirmDelete)} onOpenChange={() => setConfirmDelete(null)}>
        <DialogContent className="sm:max-w-[420px]">
          <DialogHeader>
            <DialogTitle>Delete tip</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete <strong>{confirmDelete?.match}</strong>?
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={() => setConfirmDelete(null)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete}>Delete</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminTips;
