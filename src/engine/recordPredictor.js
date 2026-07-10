// Roster rating + 17-game record projection, ported directly from the
// "17-0 game engine" reference implementation. Player overalls are NOT
// derived from box-score stats anymore -- they're the engine's deterministic
// hash-based rating (position base + decade adjustment + a stable per-name
// roll), and the season is simulated by pitting a weighted team overall
// against a spread of weekly opponent overalls via the engine's logistic
// win-probability curve.

const POSITION_BASE = { QB: 80, RB: 79, WR: 79, TE: 77, DEF: 78 };

const DECADE_ADJUST = {
  1920: -7,
  1930: -6,
  1940: -5,
  1950: -3,
  1960: -2,
  1970: -1,
  1980: 0,
  1990: 1,
  2000: 2,
  2010: 2,
  2020: 2,
};

// Slot weights used when averaging a roster into a single team overall.
// FLEX borrows whichever weight matches the actual position slotted there.
const SLOT_WEIGHT = { QB: 1.35, RB: 0.9, WR: 1.0, TE: 0.72, DEF: 1.18 };

function hashStr(s) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  return h;
}

function pseudoRandom(seed) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

function clamp(v, lo, hi) {
  return Math.max(lo, Math.min(hi, v));
}

// position: actual position (QB/RB/WR/TE/DEF). decade: numeric decade (e.g. 1990). team: team name string.
export function ratingFor(position, name, decade, team) {
  const key = [team || "", position, name || "", decade || ""].join("|");
  const seed = hashStr(key.toLowerCase());
  const roll = pseudoRandom(seed);
  const base = (POSITION_BASE[position] ?? 78) + (DECADE_ADJUST[decade] ?? 0);
  return clamp(Math.round(base + 4 + roll * 15 - 5), 58, 96);
}

// Back-compat wrapper: rates a player entry using the engine's name/position/
// decade/team hash instead of parsing box-score stats.
export function ratePlayer(player, position, decade, team) {
  return ratingFor(position, player?.name, decade, team?.name || team);
}

// roster: { QB, RB, WR, FLEX, TE, DEF } each = { player, position, team, decade }.
// `position` on each entry is the player's ACTUAL position (e.g. a RB slotted
// into FLEX still has position "RB"), while the object key is which roster
// SLOT they occupy.
export function computeTeamRating(roster) {
  let weight = 0;
  let weighted = 0;
  const breakdown = {};
  for (const slotKey of Object.keys(roster)) {
    const entry = roster[slotKey];
    const w = SLOT_WEIGHT[entry.position] ?? SLOT_WEIGHT[slotKey] ?? 1;
    const rating = ratingFor(entry.position, entry.player.name, entry.decade, entry.team?.name || entry.team);
    breakdown[slotKey] = rating;
    weight += w;
    weighted += w * rating;
  }
  return { rating: weight ? weighted / weight : 0, breakdown };
}

export function computeTeamOverall(roster) {
  return Math.round(computeTeamRating(roster).rating);
}

export function winProb(team, opp) {
  return clamp(1 / (1 + Math.pow(10, -(team - opp) / 9)), 0.03, 0.97);
}

export function generateOpponents(count, rng) {
  const rand = rng || Math.random;
  const opps = [];
  for (let i = 0; i < (count || 17); i++) {
    const u = (rand() + rand() + rand()) / 3;
    const allTimeSpike = rand() < 0.24 ? 4 : 0;
    opps.push(Math.round(clamp(82 + u * 15 + allTimeSpike, 80, 99)));
  }
  return opps;
}

export function projectSeason(teamOverall, opponents) {
  const probs = opponents.map((o) => winProb(teamOverall, o));
  const expectedWins = probs.reduce((a, b) => a + b, 0);
  const oddsPerfect = probs.reduce((a, b) => a * b, 1);
  const avgOpp = Math.round(opponents.reduce((a, b) => a + b, 0) / opponents.length);
  return { probs, expectedWins, oddsPerfect, avgOpp };
}

function seededRandom(seed) {
  let h = 1779033703 ^ seed.length;
  for (let i = 0; i < seed.length; i++) {
    h = Math.imul(h ^ seed.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  return function () {
    h = Math.imul(h ^ (h >>> 16), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    h ^= h >>> 16;
    return (h >>> 0) / 4294967296;
  };
}

export function predictRecord(roster, seed) {
  const { rating, breakdown } = computeTeamRating(roster);
  const teamOverall = Math.round(rating);
  const rng = seededRandom(seed || "17-0");
  const opponents = generateOpponents(17, rng);

  let wins = 0, losses = 0;
  const games = [];
  let probSum = 0;
  for (let i = 1; i <= 17; i++) {
    const opp = opponents[i - 1];
    const gameProb = winProb(teamOverall, opp);
    probSum += gameProb;
    const roll = rng();
    const win = roll < gameProb;
    if (win) wins++; else losses++;
    games.push({ game: i, win, opponentOverall: opp, winProbability: gameProb, margin: Math.round((rng() - 0.3) * 20) });
  }
  const avgWinProb = probSum / games.length;

  let verdict;
  if (wins === 17) verdict = "PERFECT SEASON. History repeats itself.";
  else if (wins >= 15) verdict = "One of the greatest teams ever assembled.";
  else if (wins >= 12) verdict = "A true Super Bowl contender.";
  else if (wins >= 9) verdict = "A solid, respectable playoff hopeful.";
  else if (wins >= 6) verdict = "A middling squad that needed more firepower.";
  else verdict = "A rebuilding roster, overmatched by modern competition.";

  return {
    rating: Math.round(rating * 10) / 10,
    teamOverall,
    breakdown,
    wins,
    losses,
    games,
    verdict,
    winProbability: avgWinProb,
  };
}
