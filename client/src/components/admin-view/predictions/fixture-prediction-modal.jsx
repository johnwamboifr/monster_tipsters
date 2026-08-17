import { useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";

const BETTING_MARKETS = {
  MATCH_WINNER: { label: "Match Winner", key: "MATCH_WINNER", options: ["Home Win", "Draw", "Away Win"] },
  DOUBLE_CHANCE: { label: "Double Chance", key: "DOUBLE_CHANCE", options: ["1X", "X2", "12"] },
  BTTS: { label: "Both Teams To Score", key: "BTTS", options: ["Yes", "No"] },
  DRAW_NO_BET: { label: "Draw No Bet", key: "DRAW_NO_BET", options: ["Home", "Away"] },
  FIRST_HALF_WINNER: { label: "First Half Winner", key: "FIRST_HALF_WINNER", options: ["Home", "Draw", "Away"] },
  TOTAL_GOALS: { label: "Total Goals (Over/Under)", key: "TOTAL_GOALS", options: ["0.5", "1.5", "2.5", "3.5", "4.5"] },
};

const BETTING_MARKETS_LIST = Object.values(BETTING_MARKETS);

const FixturePredictionModal = ({ open, fixture, formData, setFormData, errors, saving, onClose, onSave, onFieldChange }) => {
  useEffect(() => {
    if (!open) {
      return;
    }

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  if (!fixture) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="flex h-[100dvh] w-full max-w-none flex-col overflow-hidden rounded-t-3xl border border-border/70 bg-background/95 p-0 text-foreground md:h-auto md:max-w-3xl md:rounded-2xl md:overflow-visible md:p-6">
        <DialogHeader className="sticky top-0 z-10 border-b border-border/70 bg-background/95 px-4 py-4 md:px-6">
          <DialogTitle className="text-lg">Edit Prediction</DialogTitle>
          <DialogDescription className="text-sm">
            Update the prediction attached to the selected synchronized fixture. The fixture information is read-only.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-4 py-4 md:px-6">
            <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-border/70 bg-muted/30 p-4">
              <div className="space-y-2 text-sm text-muted-foreground">
                <div><span className="font-semibold text-foreground">League:</span> {fixture.league || "—"}</div>
                <div><span className="font-semibold text-foreground">Match:</span> {fixture.homeTeam || "Home"} vs {fixture.awayTeam || "Away"}</div>
                <div><span className="font-semibold text-foreground">Kickoff:</span> {fixture.kickoffTime ? new Date(fixture.kickoffTime).toLocaleString() : "—"}</div>
                <div><span className="font-semibold text-foreground">Home team:</span> {fixture.homeTeam || "—"}</div>
                <div><span className="font-semibold text-foreground">Away team:</span> {fixture.awayTeam || "—"}</div>
              </div>
            </div>

            <div className="grid gap-4">
              <div>
                <Label className="mb-2">Betting Market</Label>
                <Select value={formData.market || ""} onValueChange={(value) => {
                  // When market changes, clear prediction if it no longer matches
                  const prevMarket = formData.market;
                  onFieldChange("market", value);
                  if (prevMarket !== value) {
                    onFieldChange("prediction", "");
                    onFieldChange("overUnderLine", "");
                    onFieldChange("overUnderSide", "");
                  }
                }}>
                  <SelectTrigger className="w-full rounded-xl">
                    <SelectValue placeholder="Select a market" />
                  </SelectTrigger>
                  <SelectContent>
                    {BETTING_MARKETS_LIST.map((m) => (
                      <SelectItem key={m.key} value={m.key}>{m.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.market && <p className="mt-1 text-xs text-red-500">{errors.market}</p>}
              </div>

              <div>
                <Label className="mb-2">Prediction</Label>
                {/* Dynamic options based on market */}
                {(() => {
                  const marketKey = formData.market || "";
                  if (!marketKey) {
                    return <p className="text-sm text-muted-foreground">Choose a market first</p>;
                  }

                  if (marketKey === "TOTAL_GOALS") {
                    return (
                      <div className="grid gap-2">
                        <div className="flex gap-2 flex-wrap">
                          {BETTING_MARKETS.TOTAL_GOALS.options.map((line) => (
                            <button key={line} type="button" className={`rounded-xl border px-3 py-1 text-sm ${formData.overUnderLine === line ? "bg-emerald-600 text-white" : "bg-background"}`} onClick={() => onFieldChange("overUnderLine", line)}>{line}</button>
                          ))}
                        </div>
                        <div className="flex gap-2 mt-2">
                          <button type="button" className={`flex-1 rounded-xl border px-3 py-2 ${formData.overUnderSide === "OVER" ? "bg-emerald-600 text-white" : "bg-background"}`} onClick={() => onFieldChange("overUnderSide", "OVER")}>Over</button>
                          <button type="button" className={`flex-1 rounded-xl border px-3 py-2 ${formData.overUnderSide === "UNDER" ? "bg-rose-600 text-white" : "bg-background"}`} onClick={() => onFieldChange("overUnderSide", "UNDER")}>Under</button>
                        </div>
                        <div className="mt-2 text-sm text-muted-foreground">Selected: {formData.overUnderSide && formData.overUnderLine ? `${formData.overUnderSide} ${formData.overUnderLine}` : "—"}</div>
                        {errors.prediction && <p className="mt-1 text-xs text-red-500">{errors.prediction}</p>}
                      </div>
                    );
                  }

                  const marketDef = BETTING_MARKETS[marketKey];
                  if (marketDef) {
                    return (
                      <div className="flex gap-2 flex-wrap">
                        {marketDef.options.map((opt) => (
                          <button key={opt} type="button" className={`rounded-xl border px-3 py-1 text-sm ${formData.prediction === opt ? "bg-emerald-600 text-white" : "bg-background"}`} onClick={() => onFieldChange("prediction", opt)}>{opt}</button>
                        ))}
                      </div>
                    );
                  }

                  return <Input id="prediction" value={formData.prediction || ""} onChange={(event) => onFieldChange("prediction", event.target.value)} className="w-full" />;
                })()}
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="odds">Odds</Label>
                  <Input id="odds" type="number" min="1" step="0.01" value={formData.odds || ""} onChange={(event) => onFieldChange("odds", event.target.value)} className="w-full min-h-[44px]" />
                  {errors.odds && <p className="mt-1 text-xs text-red-500">{errors.odds}</p>}
                </div>
                <div>
                  <Label htmlFor="confidence">Confidence (%)</Label>
                  <Input id="confidence" type="number" min="0" max="100" step="1" value={formData.confidence || ""} onChange={(event) => onFieldChange("confidence", event.target.value)} className="w-full min-h-[44px]" />
                  {errors.confidence && <p className="mt-1 text-xs text-red-500">{errors.confidence}</p>}
                </div>
              </div>

              <div>
                <Label htmlFor="analysis">Analysis</Label>
                <Textarea id="analysis" value={formData.analysis || ""} onChange={(event) => onFieldChange("analysis", event.target.value)} className="min-h-[120px] w-full" />
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between rounded-2xl border border-border/70 bg-muted/30 px-3 py-3">
                  <Label className="text-sm">Featured</Label>
                  <input type="checkbox" checked={Boolean(formData.isFeatured)} onChange={(e) => onFieldChange("isFeatured", e.target.checked)} />
                </div>

                <div className="rounded-2xl border border-border/70 bg-muted/30 px-3 py-3">
                  <Label className="text-sm">Result</Label>
                  <select value={formData.result || "pending"} onChange={(event) => onFieldChange("result", event.target.value)} className="mt-2 min-h-[44px] w-full rounded-xl border border-border/70 bg-background px-3 py-2 text-sm">
                    <option value="pending">Pending</option>
                    <option value="won">Won</option>
                    <option value="lost">Lost</option>
                    <option value="void">Void</option>
                  </select>
                </div>

                <div className="rounded-2xl border border-border/70 bg-muted/30 px-3 py-3">
                  <Label className="text-sm">Tips Type</Label>
                  <div className="mt-2 flex gap-2 flex-wrap">
                    {[
                      { value: "free", label: "Free" },
                      { value: "bronze", label: "Bronze" },
                      { value: "silver", label: "Silver" },
                      { value: "gold", label: "Gold" },
                    ].map((t) => (
                      <button key={t.value} type="button" onClick={() => onFieldChange("tipsType", t.value)} className={`px-3 py-1 rounded-full border font-medium ${formData.tipsType === t.value ? "bg-emerald-600 text-white" : "bg-background"}`}>
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <Badge variant="outline">Prediction</Badge>
                <Badge variant="outline">Fixture locked</Badge>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="sticky bottom-0 z-10 flex flex-col gap-2 border-t border-border/70 bg-background/95 px-4 py-4 md:flex-row md:px-6">
          <Button variant="outline" className="min-h-[44px] w-full md:w-auto" onClick={onClose} disabled={saving}>Cancel</Button>
          <Button onClick={onSave} disabled={saving} className="min-h-[44px] w-full rounded-full md:w-auto">
            {saving ? "Saving..." : "Save Prediction"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default FixturePredictionModal;
