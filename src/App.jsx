import { useState } from "react";
import "./App.css";
import ModeSelect from "./components/ModeSelect.jsx";
import DraftPanel from "./components/DraftPanel.jsx";
import Field from "./components/Field.jsx";
import ResultScreen from "./components/ResultScreen.jsx";
import { predictRecord } from "./engine/recordPredictor.js";

const SLOTS = ["QB", "RB", "WR1", "WR2", "TE", "DEF"];

// Given a generic position (QB/RB/WR/TE/DEF) and the current roster, figure out
// which specific slot to fill (WR has two slots, so it fills WR1 then WR2).
function nextOpenSlot(position, roster) {
  if (position === "WR") {
    if (!roster.WR1) return "WR1";
    if (!roster.WR2) return "WR2";
    return null;
  }
  return roster[position] ? null : position;
}

function computeOpenPositions(roster) {
  const open = [];
  if (!roster.QB) open.push("QB");
  if (!roster.RB) open.push("RB");
  if (!roster.WR1 || !roster.WR2) open.push("WR");
  if (!roster.TE) open.push("TE");
  if (!roster.DEF) open.push("DEF");
  return open;
}

function App() {
  const [mode, setMode] = useState(null);
  const [roster, setRoster] = useState({});
  const [teamRespinAvailable, setTeamRespinAvailable] = useState(true);
  const [eraRespinAvailable, setEraRespinAvailable] = useState(true);
  const [result, setResult] = useState(null);
  const [turnKey, setTurnKey] = useState(0);

  function handleModeSelect(selected) {
    setMode(selected);
  }

  function handleLockPick({ player, position, team, decade }) {
    const slot = nextOpenSlot(position, roster);
    if (!slot) return;
    const newRoster = { ...roster, [slot]: { player, position: slot, team, decade } };
    setRoster(newRoster);

    if (Object.keys(newRoster).length >= SLOTS.length) {
      const seed = Object.values(newRoster)
        .map((e) => e.player.name)
        .join("|");
      setResult(predictRecord(newRoster, seed));
    } else {
      setTurnKey((k) => k + 1);
    }
  }

  function handlePlayAgain() {
    setMode(null);
    setRoster({});
    setTeamRespinAvailable(true);
    setEraRespinAvailable(true);
    setResult(null);
    setTurnKey(0);
  }

  if (!mode) {
    return <ModeSelect onSelect={handleModeSelect} />;
  }

  if (result) {
    return <ResultScreen roster={roster} result={result} onPlayAgain={handlePlayAgain} />;
  }

  const excludeNames = Object.values(roster).map((e) => e.player.name);
  const openPositions = computeOpenPositions(roster);
  const picksRemaining = SLOTS.length - Object.keys(roster).length;

  return (
    <div className="game-shell">
      <header className="game-header">
        <h1>17-0</h1>
        <span className={`mode-badge ${mode}`}>{mode === "classic" ? "Classic Mode" : "Challenge Mode"}</span>
      </header>

      <div className="game-body">
        <Field roster={roster} hideStats={mode === "challenge"} />

        <DraftPanel
          key={turnKey}
          openPositions={openPositions}
          picksRemaining={picksRemaining}
          totalSlots={SLOTS.length}
          mode={mode}
          teamRespinAvailable={teamRespinAvailable}
          eraRespinAvailable={eraRespinAvailable}
          onUseTeamRespin={() => setTeamRespinAvailable(false)}
          onUseEraRespin={() => setEraRespinAvailable(false)}
          onLockPick={handleLockPick}
          excludeNames={excludeNames}
        />
      </div>
    </div>
  );
}

export default App;
