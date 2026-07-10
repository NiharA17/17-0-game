import Field from "./Field.jsx";

const SLOT_LABELS = { QB: "QB", RB: "RB", WR: "WR", FLEX: "FLEX", TE: "TE", DEF: "DEF" };

export default function ResultScreen({ roster, result, onPlayAgain }) {
  const { wins, losses, verdict, teamOverall, breakdown, games } = result;
  const perfect = wins === 17;

  return (
    <div className={`result-screen ${perfect ? "perfect" : ""}`}>
      <h1 className="result-record">
        {wins}-{losses}
      </h1>
      <p className="result-verdict">{verdict}</p>
      <p className="result-rating">Team Overall: {teamOverall} OVR</p>

      <div className="result-body">
        <Field roster={roster} hideStats={false} />

        <div className="result-panel">
          <h3>Roster Breakdown</h3>
          <div className="breakdown-list">
            {Object.keys(SLOT_LABELS).map((slot) => {
              const entry = roster[slot];
              if (!entry) return null;
              return (
                <div className="breakdown-row" key={slot}>
                  <span className="breakdown-slot">{SLOT_LABELS[slot]}</span>
                  <span className="breakdown-name">
                    {entry.player.name}
                    <small>
                      {entry.team.name} &middot; {entry.decade}s
                    </small>
                  </span>
                  <span className="breakdown-score">{Math.round(breakdown[slot])}</span>
                </div>
              );
            })}
          </div>

          <h3>Season Log</h3>
          <div className="game-log">
            {games.map((g) => (
              <span key={g.game} className={`game-chip ${g.win ? "win" : "loss"}`} title={`Game ${g.game}`}>
                {g.win ? "W" : "L"}
              </span>
            ))}
          </div>

          <button className="play-again-btn" onClick={onPlayAgain}>
            Play Again
          </button>
        </div>
      </div>
    </div>
  );
}
