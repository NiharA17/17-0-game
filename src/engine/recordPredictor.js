// Heuristic "AI" that rates a 6-player fantasy roster and projects a 17-game
// record as if that roster played in today's NFL. No external LLM call --
// it's a deterministic scoring model based on stat magnitude + accolades.

const POSITION_WEIGHT = { QB: 0.30, RB: 0.15, WR: 0.15, FLEX: 0.13, TE: 0.12, DEF: 0.15 };

const ACCOLADE_BONUSES = [
  { re: /HOF|Hall of Fame/i, bonus: 22 },
  { re: /\bMVP\b/i, bonus: 16 },
  { re: /DPOY|Defensive Player of the Year/i, bonus: 16 },
  { re: /Super Bowl.*(champ|title|win)|(champ|title|win).*Super Bowl/i, bonus: 10 },
  { re: /ROY|Rookie of the Year|DROY/i, bonus: 8 },
  { re: /record/i, bonus: 6 },
  { re: /All-Pro/i, bonus: 6 },
  { re: /Pro Bowl/i, bonus: 4 },
  { re: /elite|dominant|generational|greatest|GOAT/i, bonus: 8 },
];

function accoladeScore(player) {
  const text = `${player.blurb || ""} ${(player.stats || []).map((s) => s.value).join(" ")}`;
  let score = 0;
  for (const { re, bonus } of ACCOLADE_BONUSES) {
    if (re.test(text) || re.test(player.blurb || "")) score += bonus;
  }
  const multiMatch = (player.blurb || "").match(/(\d+)x\s*(Pro Bowl|All-Pro|MVP|champion)/i);
  if (multiMatch) score += Math.min(parseInt(multiMatch[1], 10) * 3, 24);
  return score;
}

function statValue(player, labelPattern) {
  const stat = (player.stats || []).find((s) => labelPattern.test(s.label));
  if (!stat) return null;
  const num = parseFloat(String(stat.value).replace(/[^0-9.]/g, ""));
  return Number.isFinite(num) ? num : null;
}

function statScore(player, position) {
  switch (position) {
    case "QB": {
      const rating = statValue(player, /Rating/i) ?? 75;
      const passYds = statValue(player, /Pass Yds/i) ?? 2000;
      const passTD = statValue(player, /Pass TD/i) ?? 15;
      const int = statValue(player, /^INT$/i) ?? 15;
      let s = ((rating - 50) / 70) * 55;
      s += Math.min(passYds / 4500, 1) * 20;
      s += Math.min(passTD / 35, 1) * 15;
      s -= Math.min(int / 25, 1) * 10;
      return Math.max(0, s);
    }
    case "RB": {
      const rushYds = statValue(player, /Rush Yds/i) ?? 700;
      const rushTD = statValue(player, /Rush TD/i) ?? 5;
      const ypc = statValue(player, /YPC/i) ?? 4.0;
      const recYds = statValue(player, /Rec Yds/i) ?? 200;
      let s = Math.min(rushYds / 1800, 1) * 45;
      s += Math.min(rushTD / 16, 1) * 20;
      s += Math.min(Math.max(ypc - 3.5, 0) / 2.5, 1) * 15;
      s += Math.min(recYds / 700, 1) * 10;
      return Math.max(0, s);
    }
    case "WR": {
      const recYds = statValue(player, /Rec Yds/i) ?? 500;
      const recTD = statValue(player, /Rec TD/i) ?? 4;
      const rec = statValue(player, /Receptions/i) ?? 50;
      let s = Math.min(recYds / 1400, 1) * 50;
      s += Math.min(recTD / 15, 1) * 25;
      s += Math.min(rec / 100, 1) * 15;
      return Math.max(0, s);
    }
    case "TE": {
      const recYds = statValue(player, /Rec Yds/i) ?? 400;
      const recTD = statValue(player, /Rec TD/i) ?? 3;
      let s = Math.min(recYds / 1000, 1) * 55;
      s += Math.min(recTD / 10, 1) * 30;
      return Math.max(0, s);
    }
    case "DEF": {
      const sacks = statValue(player, /Sacks/i);
      const ints = statValue(player, /^INT$/i);
      const tackles = statValue(player, /Tackles/i);
      let s = 30;
      if (sacks != null) s += Math.min(sacks / 14, 1) * 35;
      if (ints != null) s += Math.min(ints / 6, 1) * 30;
      if (tackles != null) s += Math.min(tackles / 150, 1) * 25;
      return Math.min(100, s);
    }
    default:
      return 40;
  }
}

export function ratePlayer(player, position) {
  const base = statScore(player, position);
  const bonus = accoladeScore(player);
  return Math.max(5, Math.min(100, base + bonus));
}

// roster: { QB, RB, WR, FLEX, TE, DEF } each = { player, position }. `position` on
// each entry is the player's ACTUAL position (e.g. a RB slotted into FLEX still
// has position "RB"), while the object key is which roster SLOT they occupy.
export function computeTeamRating(roster) {
  let total = 0;
  const breakdown = {};
  for (const slot of Object.keys(POSITION_WEIGHT)) {
    const entry = roster[slot];
    const score = ratePlayer(entry.player, entry.position);
    breakdown[slot] = score;
    total += score * POSITION_WEIGHT[slot];
  }
  return { rating: total, breakdown };
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

function winProbability(teamRating) {
  const diff = teamRating - 55;
  return 1 / (1 + Math.exp(-diff / 11));
}

export function predictRecord(roster, seed) {
  const { rating, breakdown } = computeTeamRating(roster);
  const p = winProbability(rating);
  const rng = seededRandom(seed || "17-0");

  let wins = 0, losses = 0;
  const games = [];
  for (let i = 1; i <= 17; i++) {
    const roll = rng();
    const win = roll < p;
    if (win) wins++; else losses++;
    games.push({ game: i, win, margin: Math.round((rng() - 0.3) * 20) });
  }

  let verdict;
  if (wins === 17) verdict = "PERFECT SEASON. History repeats itself.";
  else if (wins >= 15) verdict = "One of the greatest teams ever assembled.";
  else if (wins >= 12) verdict = "A true Super Bowl contender.";
  else if (wins >= 9) verdict = "A solid, respectable playoff hopeful.";
  else if (wins >= 6) verdict = "A middling squad that needed more firepower.";
  else verdict = "A rebuilding roster, overmatched by modern competition.";

  return { rating: Math.round(rating * 10) / 10, breakdown, wins, losses, games, verdict, winProbability: p };
}
