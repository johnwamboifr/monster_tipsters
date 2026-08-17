import { memo } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CalendarDays, Clock3, Trophy } from "lucide-react";
import { getPredictionStatusLabel, getPredictionStatusVariant, getResultVariant } from "@/utils/predictionStatus";

const FixtureCard = memo(function FixtureCard({ fixture, onEdit }) {
  const kickoff = fixture.kickoffTime ? new Date(fixture.kickoffTime) : null;
  const leagueName = fixture.league || fixture.leagueName || "Football";
  const prediction = fixture.prediction || {};
  const hasPrediction = Boolean(prediction.prediction || prediction.market);
  const predictionLabel = getPredictionStatusLabel(fixture);
  const resultLabel = String(prediction.result || "pending").toLowerCase();

  const renderAvatar = (logo, alt, fallback, sizeClass = "h-10 w-10") => {
    if (logo) {
      return <img src={logo} alt={alt} className={`${sizeClass} rounded-full object-cover shrink-0`} />;
    }

    return (
      <div className={`flex ${sizeClass} shrink-0 items-center justify-center rounded-full bg-muted text-[11px] font-semibold text-foreground`}>
        {fallback}
      </div>
    );
  };

  return (
    <article className="w-full max-w-full space-y-4 overflow-hidden rounded-2xl border border-border/70 bg-card/90 p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          {renderAvatar(fixture.leagueLogo, leagueName, "L", "h-8 w-8")}
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">{leagueName}</p>
            <p className="mt-1 text-sm font-semibold leading-5 text-foreground break-words">
              {fixture.homeTeam || "Home"} <span className="text-muted-foreground">vs</span> {fixture.awayTeam || "Away"}
            </p>
          </div>
        </div>
        <Badge variant="outline" className="shrink-0 rounded-full">
          {String(fixture.status || "SCHEDULED").toUpperCase()}
        </Badge>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          {renderAvatar(fixture.homeTeamLogo, fixture.homeTeam || "Home team", "H", "h-10 w-10")}
          <p className="flex-1 text-sm font-medium leading-5 text-foreground break-words">{fixture.homeTeam || "Home"}</p>
        </div>

        <div className="shrink-0 px-2 text-center text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">VS</div>

        <div className="flex min-w-0 flex-1 items-center justify-end gap-3">
          <p className="flex-1 text-right text-sm font-medium leading-5 text-foreground break-words">{fixture.awayTeam || "Away"}</p>
          {renderAvatar(fixture.awayTeamLogo, fixture.awayTeam || "Away team", "A", "h-10 w-10")}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Badge variant={getPredictionStatusVariant(fixture)} className="rounded-full">
          {predictionLabel}
        </Badge>
        <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${getResultVariant(resultLabel)}`}>
          {resultLabel.toUpperCase()}
        </span>
        <span className="rounded-full px-2.5 py-1 text-xs font-medium bg-background text-muted-foreground">
          {prediction.tipsType ? String(prediction.tipsType).toUpperCase() : "FREE"}
        </span>
      </div>

      <div className="grid grid-cols-[90px_minmax(0,1fr)] gap-2 rounded-xl border border-border/60 bg-muted/40 p-3 text-sm text-muted-foreground">
        <span className="inline-flex items-center gap-1.5 font-medium text-muted-foreground">
          <CalendarDays className="h-3.5 w-3.5 text-emerald-500" />
          Date
        </span>
        <span className="break-words text-foreground">{kickoff ? kickoff.toLocaleDateString() : "TBD"}</span>

        <span className="inline-flex items-center gap-1.5 font-medium text-muted-foreground">
          <Clock3 className="h-3.5 w-3.5 text-blue-500" />
          Kickoff
        </span>
        <span className="break-words text-foreground">
          {kickoff ? kickoff.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "TBD"}
        </span>

        <span className="inline-flex items-center gap-1.5 font-medium text-muted-foreground">
          <Trophy className="h-3.5 w-3.5 text-amber-500" />
          Status
        </span>
        <span className="break-words text-foreground">{String(fixture.status || "SCHEDULED").toUpperCase()}</span>
      </div>

      <Button variant="outline" className="w-full min-h-[44px] rounded-full" onClick={() => onEdit(fixture)}>
        {hasPrediction ? "Edit Prediction" : "Create Prediction"}
      </Button>
    </article>
  );
});

export default FixtureCard;
