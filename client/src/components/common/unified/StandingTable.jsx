import { memo } from "react";
import { Badge } from "@/components/ui/badge";

const StandingTable = memo(function StandingTable({ standings = [] }) {
  return (
    <div className="overflow-hidden rounded-[24px] border border-white/10 bg-slate-900/80">
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm text-slate-300">
          <thead className="bg-slate-950/70 text-left text-[11px] uppercase tracking-[0.22em] text-slate-400">
            <tr>
              <th className="px-4 py-3">Pos</th>
              <th className="px-4 py-3">Club</th>
              <th className="px-4 py-3">P</th>
              <th className="px-4 py-3">W</th>
              <th className="px-4 py-3">D</th>
              <th className="px-4 py-3">L</th>
              <th className="px-4 py-3">GF</th>
              <th className="px-4 py-3">GA</th>
              <th className="px-4 py-3">GD</th>
              <th className="px-4 py-3">Pts</th>
            </tr>
          </thead>

          <tbody>
            {standings.map((standing) => {
              const key = `${standing.leagueId || ""}:${standing.teamId || ""}:${standing.season || ""}:${standing.stage || ""}:${standing.group || ""}`;

              return (
                <tr
                  key={standing.id || key}
                  className="border-t border-white/8"
                >
                  <td className="px-4 py-3 font-semibold text-white">
                    {standing.position}
                  </td>

                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {standing.teamLogo ? (
                        <img
                          src={standing.teamLogo}
                          alt={standing.teamName || "Team"}
                          className="h-8 w-8 rounded-full object-cover"
                        />
                      ) : null}

                      <span className="font-medium text-white">
                        {standing.teamName || "Unknown Team"}
                      </span>
                    </div>
                  </td>

                  <td className="px-4 py-3">
                    {standing.playedGames ?? 0}
                  </td>

                  <td className="px-4 py-3">
                    {standing.won ?? 0}
                  </td>

                  <td className="px-4 py-3">
                    {standing.draw ?? 0}
                  </td>

                  <td className="px-4 py-3">
                    {standing.lost ?? 0}
                  </td>

                  <td className="px-4 py-3">
                    {standing.goalsFor ?? 0}
                  </td>

                  <td className="px-4 py-3">
                    {standing.goalsAgainst ?? 0}
                  </td>

                  <td className="px-4 py-3">
                    {standing.goalDifference ?? 0}
                  </td>

                  <td className="px-4 py-3">
                    <Badge variant="secondary">
                      {standing.points ?? 0}
                    </Badge>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
});

export default StandingTable;
