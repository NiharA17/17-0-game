import PlayerCard from "./PlayerCard.jsx";

const TABS = ["ALL", "QB", "RB", "WR", "FLEX", "TE", "DEF"];

export default function Sidebar({
  phase,
  mode,
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

  return (
    <aside className="sidebar">
      <div className="sidebar-tabs">
        {TABS.map((tab) => (
          <button
            key={tab}
            className={`sidebar-tab ${positionFilter === tab ? "active" : ""}`}
            onClick={() => setPositionFilter(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="sidebar-controls">
        <input
          className="sidebar-search"
          type="text"
          placeholder="Search..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className="sidebar-sort"
          value={mode === "challenge" ? "AZ" : sortMode}
          onChange={(e) => setSortMode(e.target.value)}
          disabled={mode === "challenge"}
        >
          <option value="OVR">OVR</option>
          <option value="AZ">A-Z</option>
        </select>
      </div>

      <div className="sidebar-count">{ready ? players.length : 0} players available</div>

      <div className="sidebar-list">
        {!ready ? (
          <p className="sidebar-placeholder">Spin the board to start the draft.</p>
        ) : players.length === 0 ? (
          <p className="sidebar-placeholder">No players match. Try clearing filters/search, or respin.</p>
        ) : (
          players.map(({ player, pos }) => (
            <PlayerCard
              key={`${pos}-${player.name}`}
              player={player}
              position={pos}
              hideDetails={mode === "challenge"}
              onClick={() => onPick(player, pos)}
            />
          ))
        )}
      </div>
    </aside>
  );
}
