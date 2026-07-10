import { useMemo, useState } from "react";
import { TEAMS, eraLabel, teamDisplayNameForEra, validErasForTeam } from "../data/teams.js";
import { getPoolWithMinimum } from "../engine/dataAccess.js";
import { ratePlayer } from "../engine/recordPredictor.js";
import PlayerCard from "./PlayerCard.jsx";

const POSITION_LABELS = { QB: "Quarterbacks", RB: "Running Backs", WR: "Wide Receivers", TE: "Tight Ends", DEF: "Defense" };

export default function DraftPanel({
  openPositions, // array of position codes still needed, e.g. ["QB","WR","DEF"]
  picksRemaining,
  totalSlots,
  mode,
  teamRespinAvailable,
  eraRespinAvailable,
  onUseTeamRespin,
  onUseEraRespin,
  onLockPick,
  excludeNames,
}) {
  const [phase, setPhase] = useState("idle"); // idle -> spinning -> pick
  const [team, setTeam] = useState(null);
  const [era, setEra] = useState(null);
  const [teamDisplay, setTeamDisplay] = useState(null);
  const [eraDisplay, setEraDisplay] = useState(null);
  const [spinningWhat, setSpinningWhat] = useState(null); // "team" | "era" | null
  const [search, setSearch] = useState("");

  function pickRandomEraFor(t) {
    const valid = validErasForTeam(t);
    return valid[Math.floor(Math.random() * valid.length)];
  }

  function runReel(setDisplay, options, finalValue, onFinish) {
    let ticks = 0;
    const iv = setInterval(() => {
      setDisplay(options[Math.floor(Math.random() * options.length)]);
      ticks++;
      if (ticks > 14) {
        clearInterval(iv);
        setDisplay(finalValue);
        onFinish();
      }
    }, 70);
  }

  function spinBoth() {
    setPhase("spinning");
    setSpinningWhat("team");
    const finalTeam = TEAMS[Math.floor(Math.random() * TEAMS.length)];
    runReel(setTeamDisplay, TEAMS, finalTeam, () => {
      setTeam(finalTeam);
      const finalEra = pickRandomEraFor(finalTeam);
      setSpinningWhat("era");
      runReel(setEraDisplay, validErasForTeam(finalTeam), finalEra, () => {
        setEra(finalEra);
        setSpinningWhat(null);
        setPhase("pick");
      });
    });
  }

  function respinTeam() {
    onUseTeamRespin();
    setSpinningWhat("team");
    const finalTeam = TEAMS[Math.floor(Math.random() * TEAMS.length)];
    runReel(setTeamDisplay, TEAMS, finalTeam, () => {
      setTeam(finalTeam);
      // Current era might not be valid for the new team -- re-roll era silently if so.
      const valid = validErasForTeam(finalTeam);
      if (!valid.includes(era)) {
        const finalEra = valid[Math.floor(Math.random() * valid.length)];
        setSpinningWhat("era");
        runReel(setEraDisplay, valid, finalEra, () => {
          setEra(finalEra);
          setSpinningWhat(null);
        });
      } else {
        setSpinningWhat(null);
      }
    });
  }

  function respinEra() {
    onUseEraRespin();
    setSpinningWhat("era");
    const valid = validErasForTeam(team);
    const finalEra = valid[Math.floor(Math.random() * valid.length)];
    runReel(setEraDisplay, valid, finalEra, () => {
      setEra(finalEra);
      setSpinningWhat(null);
    });
  }

  const poolsByPosition = useMemo(() => {
    if (!team || !era || phase !== "pick") return {};
    const result = {};
    for (const pos of openPositions) {
      let pool = getPoolWithMinimum(team.id, era, pos).filter((p) => !excludeNames.includes(p.name));
      if (mode === "challenge") {
        pool = [...pool].sort((a, b) => a.name.localeCompare(b.name));
      } else {
        pool = [...pool].sort((a, b) => ratePlayer(b, pos) - ratePlayer(a, pos));
      }
      if (search.trim()) {
        pool = pool.filter((p) => p.name.toLowerCase().includes(search.trim().toLowerCase()));
      }
      result[pos] = pool;
    }
    return result;
  }, [team, era, phase, openPositions, excludeNames, mode, search]);

  const totalVisible = Object.values(poolsByPosition).reduce((sum, arr) => sum + arr.length, 0);

  return (
    <div className="draft-panel">
      <div className="draft-progress">
        {picksRemaining} of {totalSlots} spots left
      </div>

      {phase === "idle" && (
        <div className="spin-cta">
          <p>Spin a Team and Era, then draft any open position from that team's roster.</p>
          <button className="spin-btn big" onClick={spinBoth}>
            Spin Team &amp; Era
          </button>
        </div>
      )}

      {(phase === "spinning" || phase === "pick") && (
        <>
          <div className="draft-reels">
            <div className="reel-block">
              <div className="reel-label">Team</div>
              <div className={`reel-display ${spinningWhat === "team" ? "spinning" : ""}`}>
                {teamDisplay ? <span style={{ color: teamDisplay.primary }}>{teamDisplay.abbr}</span> : <span className="reel-placeholder">???</span>}
              </div>
              {team && phase === "pick" && <div className="reel-result-name">{teamDisplayNameForEra(team, era)}</div>}
              {team && phase === "pick" && teamRespinAvailable && (
                <button className="respin-btn" onClick={respinTeam}>
                  Respin Team (1 left)
                </button>
              )}
            </div>

            <div className="reel-block">
              <div className="reel-label">Era</div>
              <div className={`reel-display ${spinningWhat === "era" ? "spinning" : ""}`}>
                {eraDisplay ? <span>{eraLabel(eraDisplay)}</span> : <span className="reel-placeholder">????s</span>}
              </div>
              {era && phase === "pick" && <div className="reel-result-name">&nbsp;</div>}
              {era && phase === "pick" && eraRespinAvailable && (
                <button className="respin-btn" onClick={respinEra}>
                  Respin Era (1 left)
                </button>
              )}
            </div>
          </div>

          {phase === "pick" && (
            <div className="draft-pick-zone">
              <div className="draft-pick-header">
                <strong>{teamDisplayNameForEra(team, era)}</strong> &middot; {eraLabel(era)} &mdash; choose any open position
                {mode === "challenge" && <span className="challenge-note"> (sorted alphabetically, stats hidden)</span>}
              </div>

              <input
                className="player-search"
                type="text"
                placeholder="Search players by name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />

              {totalVisible === 0 ? (
                <p className="no-players">No documented players found. Try clearing the search, or respin if you have one available.</p>
              ) : (
                openPositions.map((pos) => {
                  const pool = poolsByPosition[pos] || [];
                  if (pool.length === 0) return null;
                  return (
                    <div className="position-group" key={pos}>
                      <h3 className="position-group-title">{POSITION_LABELS[pos]}</h3>
                      <div className="draft-pick-grid">
                        {pool.map((p) => (
                          <PlayerCard
                            key={p.name}
                            player={p}
                            position={pos}
                            team={team}
                            hideDetails={mode === "challenge"}
                            onClick={() => onLockPick({ player: p, position: pos, team, decade: era })}
                          />
                        ))}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
