import PlayerCard from "./PlayerCard.jsx";
import { ratingFor } from "../engine/recordPredictor.js";

const TABS = ["ALL", "QB", "RB", "WR", "FLEX", "TE", "DEF"];

export default function Sidebar({
  phase,
  mode,
  team,
  era,
  players,
  positionFilter,
  setPositionFilter,
  search,
  setSearch,
  sortMode,
  setSortMode,
  onPick,
}) {
  const ready = phase === "ready";
  const hideDetails = mode === "challenge";

  return (
    <section className="draft-pool">
      <div className="controls">
        {TABS.map((tab) => (
          <button
            key={tab}
            className={`pos-btn ${positionFilter === tab ? "active" : ""}`}
            onClick={() => setPositionFilter(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="controls">
        <input
          className="search"
          type="text"
          placeholder="Search..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className="sort"
          value={hideDetails ? "AZ" : sortMode}
          onChange={(e) => setSortMode(e.target.value)}
          disabled={hideDetails}
        >
          <option value="OVR">OVR</option>
          <option value="AZ">A-Z</option>
        </select>
      </div>

      <p className="available">
        <span>{ready ? players.length : 0}</span> players available
      </p>

      <div className="player-list">
        {!ready ? (
          <p className="placeholder">Spin the board to start the draft.</p>
        ) : players.length === 0 ? (
          <p className="placeholder">No players match. Try clearing filters/search, or respin.</p>
        ) : (
          players.map(({ player, pos }) => (
            <PlayerCard
              key={`${pos}-${player.name}`}
              player={player}
              position={pos}
              rating={ratingFor(pos, player.name, era, team?.name)}
              hideDetails={hideDetails}
              onClick={() => onPick(player, pos)}
            />
          ))
        )}
      </div>
    </section>
  );
}
