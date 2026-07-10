export default function PlayerCard({
  player,
  position,
  team,
  decade,
  rating,
  hideDetails = false,
  picked = false,
  onClick,
}) {
  if (!player) return null;

  const metaParts = [position];
  if (team) metaParts.push(team.name || team);
  if (decade) metaParts.push(`${decade}s`);

  return (
    <button
      type="button"
      className={`player-card ${picked ? "picked" : ""}`}
      onClick={onClick}
      disabled={picked}
    >
      <div>
        <div className="name">{player.name}</div>
        <div className="meta">{metaParts.join(" \u00b7 ")}</div>
        {!hideDetails && player.blurb && <div className="meta blurb">{player.blurb}</div>}
        {!hideDetails && player.stats && player.stats.length > 0 && (
          <div className="statline">
            {player.stats
              .slice(0, 4)
              .map((s) => `${s.value} ${s.label}`)
              .join(" / ")}
          </div>
        )}
        {hideDetails && <div className="statline dim">Stats hidden &mdash; challenge mode</div>}
      </div>
      {!hideDetails && rating != null && (
        <div className="rating">
          {Math.round(rating)}
          <span>OVR</span>
        </div>
      )}
    </button>
  );
}
