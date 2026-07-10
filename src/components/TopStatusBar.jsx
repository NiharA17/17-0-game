import { eraLabel, teamDisplayNameForEra } from "../data/teams.js";

export default function TopStatusBar({
  phase,
  team,
  era,
  teamDisplay,
  eraDisplay,
  spinningWhat,
  teamRespinAvailable,
  eraRespinAvailable,
  onSpin,
  onRespinTeam,
  onRespinEra,
  picksRemaining,
  totalSlots,
}) {
  return (
    <div className="top-status-bar">
      <div className="status-progress">
        Pick {totalSlots - picksRemaining + 1} of {totalSlots}
      </div>

      {phase === "idle" && (
        <div className="status-main">
          <span className="status-text">Spin the board to draft your next player.</span>
          <button className="spin-btn" onClick={onSpin}>
            Spin Team &amp; Era
          </button>
        </div>
      )}

      {phase === "spinning" && (
        <div className="status-main">
          <div className="mini-reel">
            <span className="mini-reel-label">Team</span>
            <span className={`mini-reel-value ${spinningWhat === "team" ? "spinning" : ""}`}>
              {teamDisplay ? teamDisplay.abbr : "???"}
            </span>
          </div>
          <div className="mini-reel">
            <span className="mini-reel-label">Era</span>
            <span className={`mini-reel-value ${spinningWhat === "era" ? "spinning" : ""}`}>
              {eraDisplay ? eraLabel(eraDisplay) : "????s"}
            </span>
          </div>
        </div>
      )}

      {phase === "ready" && team && era && (
        <div className="status-main">
          <span className="status-text">
            <strong>{teamDisplayNameForEra(team, era)}</strong> &middot; {eraLabel(era)} &mdash; click a player card
            to add them to your roster
          </span>
          <div className="status-respins">
            {teamRespinAvailable && (
              <button className="respin-btn" onClick={onRespinTeam}>
                Respin Team
              </button>
            )}
            {eraRespinAvailable && (
              <button className="respin-btn" onClick={onRespinEra}>
                Respin Era
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
