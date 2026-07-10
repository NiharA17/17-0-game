import { PLAYERS } from "../data/players.js";
import { ERAS } from "../data/teams.js";

export const POSITIONS = ["QB", "RB", "WR", "TE", "DEF"];

// Returns the player pool for a team/decade/position. If the exact decade has
// no entries (common for early-era teams at positions that barely existed yet,
// e.g. WR/TE in the 1920s-30s), fall back to the nearest decade (same team)
// that does have entries for that position, so the game never dead-ends.
export function getPlayerPool(teamId, decade, position) {
  const teamData = PLAYERS[teamId];
  if (!teamData) return [];

  const exact = teamData[decade]?.[position];
  if (exact && exact.length > 0) return exact;

  const availableDecades = Object.keys(teamData).map(Number).sort((a, b) => a - b);
  let best = null;
  let bestDist = Infinity;
  for (const d of availableDecades) {
    const pool = teamData[d]?.[position];
    if (pool && pool.length > 0) {
      const dist = Math.abs(d - decade);
      if (dist < bestDist) {
        bestDist = dist;
        best = pool;
      }
    }
  }
  return best || [];
}

// Returns players for STRICTLY the requested decade (same franchise, same position).
// We never pull in players from other decades here -- a player who starred in the
// 2010s should never show up when the 1990s is spun. If the exact decade truly has
// zero documented entries at that position (rare early-era gaps), we fall back to
// the single nearest decade just so the slot isn't a dead end, matching getPlayerPool.
export function getPoolWithMinimum(teamId, decade, position) {
  const teamData = PLAYERS[teamId];
  if (!teamData) return [];

  const exact = teamData[decade]?.[position];
  if (exact && exact.length > 0) return exact.map((p) => ({ ...p, sourceDecade: decade }));

  return getPlayerPool(teamId, decade, position).map((p) => ({ ...p, sourceDecade: decade }));
}

export function getAllPositionPools(teamId, decade) {
  const pools = {};
  for (const pos of POSITIONS) {
    pools[pos] = getPlayerPool(teamId, decade, pos);
  }
  return pools;
}

export function getAllPositionPoolsExpanded(teamId, decade) {
  const pools = {};
  for (const pos of POSITIONS) {
    pools[pos] = getPoolWithMinimum(teamId, decade, pos);
  }
  return pools;
}

export function randomEra() {
  return ERAS[Math.floor(Math.random() * ERAS.length)];
}
