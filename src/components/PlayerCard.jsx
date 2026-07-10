export default function PlayerCard({
  player,
  position,
  team,
  hideDetails = false,
  selected = false,
  onClick,
  compact = false,
}) {
  if (!player) return null;

  return (
    <button
      type="button"
      className={`player-card ${compact ? "compact" : ""} ${selected ? "selected" : ""} ${onClick ? "clickable" : ""}`}
      onClick={onClick}
      style={team ? { "--team-primary": team.primary, "--team-secondary": team.secondary } : undefined}
    >
      <div className="player-card-header">
        <span className="player-card-pos">{position}</span>
        {!hideDetails && <span className="player-card-years">{player.years}</span>}
      </div>
      <div className="player-card-name">{player.name}</div>
      {!hideDetails && player.blurb && <div className="player-card-blurb">{player.blurb}</div>}
      {!hideDetails && player.stats && player.stats.length > 0 && (
        <div className="player-card-stats">
          {player.stats.slice(0, 5).map((s, i) => (
            <div className="player-card-stat" key={i}>
              <span className="stat-value">{s.value}</span>
              <span className="stat-label">{s.label}</span>
            </div>
          ))}
        </div>
      )}
      {hideDetails && <div className="player-card-hidden-note">Stats hidden &mdash; challenge mode</div>}
    </button>
  );
}
