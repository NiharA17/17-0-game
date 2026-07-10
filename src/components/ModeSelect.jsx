export default function ModeSelect({ onSelect }) {
  return (
    <div className="mode-select">
      <div className="mode-select-title">
        <h1>17-0</h1>
        <p>Build a roster of legends from any team, any era &mdash; and see if they could go undefeated in today's NFL.</p>
      </div>
      <div className="mode-cards">
        <button className="mode-card classic" onClick={() => onSelect("classic")}>
          <h2>Classic</h2>
          <p>See full stats and blurbs for every player. Draft with all the info in front of you.</p>
        </button>
        <button className="mode-card challenge" onClick={() => onSelect("challenge")}>
          <h2>Challenge</h2>
          <p>Players are listed alphabetically with stats hidden. Trust your NFL knowledge.</p>
        </button>
      </div>
      <div className="mode-rules">
        <h3>How to play</h3>
        <ul>
          <li>Spin a <strong>Team</strong> and an <strong>Era</strong> for each of your 6 roster spots (QB, RB, WR, WR, TE, DEF).</li>
          <li>Pick the best available player for that spot from the spun team &amp; era.</li>
          <li>You get <strong>one Team respin</strong> and <strong>one Era respin</strong> to use anywhere in the game.</li>
          <li>Once all 6 spots are filled, the AI simulates a 17-game season and gives you a record.</li>
        </ul>
      </div>
    </div>
  );
}
