import { useMemo, useState } from "react";
import "./App.css";
import ModeSelect from "./components/ModeSelect.jsx";
import Sidebar from "./components/Sidebar.jsx";
import Field from "./components/Field.jsx";
import ResultScreen from "./components/ResultScreen.jsx";
import { TEAMS, validErasForTeam, eraLabel, teamDisplayNameForEra } from "./data/teams.js";
import { getPoolWithMinimum } from "./engine/dataAccess.js";
import { ratingFor, predictRecord } from "./engine/recordPredictor.js";

const SLOTS = ["QB", "RB", "WR", "FLEX", "TE", "DEF"];
const FLEX_ELIGIBLE = ["RB", "WR", "TE"];

// Given a generic position (QB/RB/WR/TE/DEF) and the current roster, figure out
// which specific slot to fill. RB/WR/TE all overflow into the shared FLEX slot
// once their primary slot is taken.
function nextOpenSlot(position, roster) {
  if (position === "QB" || position === "DEF") {
    return roster[position] ? null : position;
  }
  if (FLEX_ELIGIBLE.includes(position)) {
    if (!roster[position]) return position;
    if (!roster.FLEX) return "FLEX";
    return null;
  }
  return null;
}

// Which generic positions still have a home somewhere in the roster (primary
// slot or FLEX).
function computeOpenPositions(roster) {
  const open = [];
  if (!roster.QB) open.push("QB");
  if (!roster.DEF) open.push("DEF");
  for (const pos of FLEX_ELIGIBLE) {
    if (!roster[pos] || !roster.FLEX) open.push(pos);
  }
  return open;
}

function App() {
  const [mode, setMode] = useState(null);
  const [roster, setRoster] = useState({});
  const [teamRespinAvailable, setTeamRespinAvailable] = useState(true);
  const [eraRespinAvailable, setEraRespinAvailable] = useState(true);
  const [result, setResult] = useState(null);
  const [turnKey, setTurnKey] = useState(0);

  const [phase, setPhase] = useState("idle"); // idle -> spinning -> ready
  const [team, setTeam] = useState(null);
  const [era, setEra] = useState(null);
  const [teamDisplay, setTeamDisplay] = useState(null);
  const [eraDisplay, setEraDisplay] = useState(null);
  const [spinningWhat, setSpinningWhat] = useState(null); // "team" | "era" | null

  const [search, setSearch] = useState("");
  const [positionFilter, setPositionFilter] = useState("ALL");
  const [sortMode, setSortMode] = useState("OVR");

  function resetSpinState() {
    setPhase("idle");
    setTeam(null);
    setEra(null);
    setTeamDisplay(null);
    setEraDisplay(null);
    setSpinningWhat(null);
    setSearch("");
    setPositionFilter("ALL");
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
      const valid = validErasForTeam(finalTeam);
      const finalEra = valid[Math.floor(Math.random() * valid.length)];
      setSpinningWhat("era");
      runReel(setEraDisplay, valid, finalEra, () => {
        setEra(finalEra);
        setSpinningWhat(null);
        setPhase("ready");
      });
    });
  }

  function respinTeam() {
    setTeamRespinAvailable(false);
    setSpinningWhat("team");
    const finalTeam = TEAMS[Math.floor(Math.random() * TEAMS.length)];
    runReel(setTeamDisplay, TEAMS, finalTeam, () => {
      setTeam(finalTeam);
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
    setEraRespinAvailable(false);
    setSpinningWhat("era");
    const valid = validErasForTeam(team);
    const finalEra = valid[Math.floor(Math.random() * valid.length)];
    runReel(setEraDisplay, valid, finalEra, () => {
      setEra(finalEra);
      setSpinningWhat(null);
    });
  }

  function handleModeSelect(selected) {
    setMode(selected);
  }

  function handleLockPick(player, position) {
    const slot = nextOpenSlot(position, roster);
    if (!slot) return;
    const newRoster = { ...roster, [slot]: { player, position, team, decade: era } };
    setRoster(newRoster);

    if (Object.keys(newRoster).length >= SLOTS.length) {
      const seed = Object.values(newRoster)
        .map((e) => e.player.name)
        .join("|");
      setResult(predictRecord(newRoster, seed));
    } else {
      setTurnKey((k) => k + 1);
      resetSpinState();
    }
  }

  function handlePlayAgain() {
    setMode(null);
    setRoster({});
    setTeamRespinAvailable(true);
    setEraRespinAvailable(true);
    setResult(null);
    setTurnKey(0);
    resetSpinState();
  }

  const excludeNames = Object.values(roster).map((e) => e.player.name);
  const openPositions = computeOpenPositions(roster);
  const picksRemaining = SLOTS.length - Object.keys(roster).length;

  const availablePlayers = useMemo(() => {
    if (!team || !era || phase !== "ready") return [];
    const list = [];
    for (const pos of openPositions) {
      const pool = getPoolWithMinimum(team.id, era, pos).filter((p) => !excludeNames.includes(p.name));
      for (const p of pool) list.push({ player: p, pos });
    }
    return list;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [team, era, phase, openPositions.join(","), excludeNames.join(",")]);

  const visiblePlayers = useMemo(() => {
    let list = availablePlayers;
    if (positionFilter === "FLEX") {
      list = list.filter((e) => FLEX_ELIGIBLE.includes(e.pos));
    } else if (positionFilter !== "ALL") {
      list = list.filter((e) => e.pos === positionFilter);
    }
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter((e) => e.player.name.toLowerCase().includes(q));
    }
    list = [...list];
    if (mode === "challenge") {
      list.sort((a, b) => a.player.name.localeCompare(b.player.name));
    } else if (sortMode === "OVR") {
      list.sort(
        (a, b) =>
          ratingFor(b.pos, b.player.name, era, team?.name) - ratingFor(a.pos, a.player.name, era, team?.name)
      );
    } else {
      list.sort((a, b) => a.player.name.localeCompare(b.player.name));
    }
    return list;
  }, [availablePlayers, positionFilter, search, mode, sortMode, era, team]);

  if (!mode) {
    return <ModeSelect onSelect={handleModeSelect} />;
  }

  if (result) {
    return <ResultScreen roster={roster} result={result} onPlayAgain={handlePlayAgain} />;
  }

  const pickNumber = Math.min(SLOTS.length - picksRemaining + 1, SLOTS.length);

  let teamChipText = "SPIN";
  let yearChipText = "YEAR";
  let noteChipText = "Spin a team & era, then pick any open position from that board.";
  if (phase === "spinning") {
    teamChipText = teamDisplay ? teamDisplay.abbr : "???";
    yearChipText = eraDisplay ? eraLabel(eraDisplay) : "????s";
    noteChipText = "Finding board\u2026";
  } else if (phase === "ready" && team && era) {
    teamChipText = teamDisplayNameForEra(team, era);
    yearChipText = eraLabel(era);
    noteChipText = "Pick any open spot from this board.";
  }

  return (
    <div className="game-shell">
      <div className="round-row">
        <div className="round">
          Pick {pickNumber} / {SLOTS.length}
          <span className={`mode-pill ${mode}`}>{mode === "classic" ? "Classic" : "Challenge"}</span>
        </div>
        <div className="round-actions">
          {phase === "idle" && (
            <button className="btn" onClick={spinBoth}>
              Spin Board
            </button>
          )}
          {phase === "ready" && teamRespinAvailable && (
            <button className="btn secondary" onClick={respinTeam}>
              Respin Team
            </button>
          )}
          {phase === "ready" && eraRespinAvailable && (
            <button className="btn secondary" onClick={respinEra}>
              Respin Era
            </button>
          )}
        </div>
      </div>

      <div className="chips">
        <span className={`chip team ${phase === "spinning" && spinningWhat === "team" ? "spin-flash" : ""}`}>
          {teamChipText}
        </span>
        <span className={`chip year ${phase === "spinning" && spinningWhat === "era" ? "spin-flash" : ""}`}>
          {yearChipText}
        </span>
        <span className="chip note">{noteChipText}</span>
      </div>

      <div className="main" key={turnKey}>
        <Sidebar
          phase={phase}
          mode={mode}
          team={team}
          era={era}
          players={visiblePlayers}
          positionFilter={positionFilter}
          setPositionFilter={setPositionFilter}
          search={search}
          setSearch={setSearch}
          sortMode={sortMode}
          setSortMode={setSortMode}
          onPick={handleLockPick}
        />

        <section className="field-wrap">
          <Field roster={roster} hideStats={mode === "challenge"} />
        </section>
      </div>
    </div>
  );
}

export default App;
