import PlayerCard from "./PlayerCard.jsx";

// Offense lines up below the line of scrimmage (facing up-field), defense above it.
const SLOT_LAYOUT = [
  { key: "DEF", label: "DEF", top: "24%", left: "50%", side: "defense" },

  { key: "TE", label: "TE", top: "50%", left: "15%", side: "offense" },
  { key: "WR", label: "WR", top: "50%", left: "85%", side: "offense" },
  { key: "FLEX", label: "FLEX", top: "64%", left: "80%", side: "offense" },
  { key: "QB", label: "QB", top: "78%", left: "50%", side: "offense" },
  { key: "RB", label: "RB", top: "94%", left: "50%", side: "offense" },
];

export default function Field({ roster, hideStats }) {
  const filled = Object.keys(roster).length;

  return (
    <div className="field">
      <div className="field-scoreboard">
        <span className="field-scoreboard-score">17 - 0</span>
        <span className="field-scoreboard-sub">{filled} / 6 drafted</span>
      </div>

      <div className="field-lines">
        {[...Array(9)].map((_, i) => (
          <div className="yard-line" key={i} />
        ))}
      </div>

      <div className="line-of-scrimmage">
        <span>LINE OF SCRIMMAGE</span>
      </div>

      {SLOT_LAYOUT.map((slot) => {
        const entry = roster[slot.key];
        return (
          <div
            className={`field-slot field-slot-${slot.side}`}
            style={{ top: slot.top, left: slot.left }}
            key={slot.key}
          >
            {entry ? (
              <PlayerCard
                player={entry.player}
                position={entry.position}
                team={entry.team}
                hideDetails={hideStats}
                compact
              />
            ) : (
              <div className="field-slot-empty">
                <span>{slot.label}</span>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
