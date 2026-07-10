// Roster rating + 17-game record projection, based on the "17-0 game engine"
// reference implementation (position base + decade adjustment + a stable
// per-name hash roll, then a 17-game sim against weekly opponent overalls via
// a logistic win-probability curve).
//
// For the game's marquee/HOF-tier players, we look up their real researched
// peak-career Madden overall (see src/data/peakRatings.js) instead of
// guessing -- the engine's hash alone can't tell a legend apart from a
// random backup at the same position/decade (Joe Montana and an anonymous
// backup could land in the same range), and a blurb-keyword heuristic still
// can't capture traits-driven greatness (e.g. Michael Vick's real peak was
// 95 despite never winning a ring or MVP). Everyone NOT in that curated
// table -- i.e. the deep bench/role players -- falls back to an accolade-
// aware estimate parsed from their blurb, on the same Madden-style 55-99
// scale. The season simulation itself is untouched.

import { PEAK_OVERALL, PEAK_OVERALL_BY_POSITION } from "../data/peakRatings.js";

const POSITION_BASE = { QB: 77, RB: 76, WR: 76, TE: 74, DEF: 75 };

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

// Give credit for "Nx Pro Bowl" / "3 Super Bowls" style call-outs, falling
// back to a flat bonus for a plain unqualified mention, capped per-category
// so one blurb can't runaway on a single accolade type.
function tieredBonus(text, multiRe, singleRe, singleBonus, perUnit, cap) {
  const multi = text.match(multiRe);
  if (multi) return Math.min(parseInt(multi[1], 10) * perUnit, cap);
  if (singleRe.test(text)) return singleBonus;
  return 0;
}

// Parses a player's blurb for real-world accolades and turns them into a
// bonus (0-34) on top of the base position/decade rating, so a HOF/MVP-laden
// legend actually separates from an anonymous, accolade-less backup.
function accoladeScore(player) {
  const text = (typeof player === "object" && player?.blurb) || "";
  if (!text) return 0;

  let score = 0;
  if (/hall of fame|\bhof\b/i.test(text)) score += 18;
  if (/dpoy|defensive player of the year/i.test(text)) score += 14;
  score += tieredBonus(text, /(\d+)x?\s*mvp/i, /\bmvp\b/i, 10, 6, 24);
  score += tieredBonus(text, /(\d+)\s*(?:x\s*)?super bowls?/i, /super bowl/i, 5, 5, 20);
  score += tieredBonus(text, /(\d+)x\s*all-pro/i, /all-pro/i, 4, 4, 16);
  score += tieredBonus(text, /(\d+)x\s*pro bowl/i, /pro bowl/i, 3, 2, 14);
  if (/\broy\b|rookie of the year|droy/i.test(text)) score += 5;
  if (/goat|greatest|generational|\bdominant\b/i.test(text)) score += 6;
  if (/\brecord\b/i.test(text)) score += 3;

  return Math.min(score, 34);
}

// position: actual position (QB/RB/WR/TE/DEF). player: player object (or a
// bare name string for back-compat -- accolade bonus only applies to the
// object form, since that's what carries the blurb). decade: numeric decade
// (e.g. 1990). team: team name string.
export function ratingFor(position, player, decade, team) {
  const name = typeof player === "string" ? player : player?.name;
  // Position-qualified lookup first -- disambiguates same-name players across
  // positions (e.g. QB Josh Allen vs. Jaguars edge rusher Josh Allen).
  if (name && position && PEAK_OVERALL_BY_POSITION[`${name}|${position}`] != null) {
    return PEAK_OVERALL_BY_POSITION[`${name}|${position}`];
  }
  if (name && PEAK_OVERALL[name] != null) return PEAK_OVERALL[name];

  const key = [team || "", position, name || "", decade || ""].join("|");
  const seed = hashStr(key.toLowerCase());
  const roll = pseudoRandom(seed);
  const base = (POSITION_BASE[position] ?? 75) + (DECADE_ADJUST[decade] ?? 0) * 0.4;
  const jitter = roll * 4 - 2; // small deterministic variance, -2..+2
  const bonus = accoladeScore(player);
  return clamp(Math.round(base + jitter + bonus), 55, 99);
}

// Back-compat alias.
export function ratePlayer(player, position, decade, team) {
  return ratingFor(position, player, decade, team?.name || team);
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
    const rating = ratingFor(entry.position, entry.player, entry.decade, entry.team?.name || entry.team);
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
