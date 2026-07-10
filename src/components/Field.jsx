import { ratingFor } from "../engine/recordPredictor.js";

// Offense lines up below the line of scrimmage (facing up-field), defense above it.
const SLOT_LAYOUT = [
  { key: "DEF", label: "DEF", top: "24%", left: "50%", side: "defense" },

  { key: "TE", label: "TE", top: "50%", left: "15%", side: "offense" },
  { key: "WR", label: "WR", top: "50%", left: "85%", side: "offense" },
  { key: "FLEX", label: "FLEX", top: "64%", left: "80%", side: "offense" },
  { key: "QB", label: "QB", top: "78%", left: "50%", side: "offense" },
  { key: "RB", label: "RB", top: "94%", left: "50%", side: "offense" },
];

function shortTeamName(team) {
  if (!team) return "";
  const parts = team.name ? team.name.split(" ") : String(team).split(" ");
  return parts[parts.length - 1];
}

export default function Field({ roster, hideStats }) {
  return (
    <div className="field">
      <div className="line-of-scrimmage">
        <span>LINE OF SCRIMMAGE</span>
      </div>

      {SLOT_LAYOUT.map((slot) => {
        const entry = roster[slot.key];
        const rating = entry
          ? ratingFor(entry.position, entry.player, entry.decade, entry.team?.name || entry.team)
          : null;
        return (
          <div
            className={`field-slot field-slot-${slot.side} ${entry ? "filled" : "empty"}`}
            style={{ top: slot.top, left: slot.left }}
            key={slot.key}
          >
            {entry ? (
              <div className="pick-info">
                <div className="pick-name">{entry.player.name}</div>
                <div className="pick-meta">
                  {slot.label}
                  {!hideStats && rating != null ? ` \u00b7 ${Math.round(rating)} OVR` : ""}
                </div>
                <div className="pick-sub">
                  {shortTeamName(entry.team)} {entry.decade}s
                </div>
              </div>
            ) : (
              <span>{slot.label}</span>
            )}
          </div>
        );
      })}
    </div>
  );
}
