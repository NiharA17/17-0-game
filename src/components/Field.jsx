import PlayerCard from "./PlayerCard.jsx";

// Offense lines up below the line of scrimmage (facing up-field), defense above it.
// Rows are spaced far enough apart vertically that cards never overlap even at
// the field's largest size.
const SLOT_LAYOUT = [
  { key: "DEF", label: "DEF", top: "12%", left: "50%", side: "defense" },

  { key: "WR1", label: "WR", top: "48%", left: "15%", side: "offense" },
  { key: "TE", label: "TE", top: "48%", left: "85%", side: "offense" },
  { key: "WR2", label: "WR", top: "66%", left: "50%", side: "offense" },
  { key: "QB", label: "QB", top: "82%", left: "50%", side: "offense" },
  { key: "RB", label: "RB", top: "94%", left: "50%", side: "offense" },
];

export default function Field({ roster, hideStats }) {
  return (
    <div className="field">
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
                position={slot.label}
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
