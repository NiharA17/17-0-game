# 17-0

Build an all-time NFL roster and see if they could go undefeated in today's league.

**Play it live: https://nihara17.github.io/17-0-game/**

Inspired by "82-0," reimagined for football: spin a Team and an Era, draft real players from that team's history into your 6-man roster (QB, RB, WR, FLEX, TE, DEF), and let the AI simulate a 17-game season.

## How to play

1. Pick **Classic** (stats visible) or **Challenge** (players listed alphabetically, stats hidden) mode.
2. Spin a **Team** and an **Era** (1920s-2020s). You get one respin for Team and one respin for Era, usable anywhere in the game.
3. Once both land, every open position's real players from that team/era show up in the sidebar — draft any one of them into your roster. The 2nd skill-position slot is a **FLEX** (RB, WR, or TE eligible).
4. Repeat until all 6 spots are filled.
5. The AI rates your roster and simulates a 17-game season, giving you a final record and verdict.

## Tech stack

- React 19 + Vite
- A curated, hand-researched dataset of real NFL players by team/decade (`src/data/players.js`)
- A Madden-style rating engine (`src/engine/recordPredictor.js`): marquee/Hall of Fame players are scored from a hand-researched table of real peak Madden overalls (`src/data/peakRatings.js`), while everyone else falls back to a deterministic position/decade/accolade heuristic. Team overall rolls up from a weighted average of the roster, then a 17-game season is simulated against randomized weekly opponents with a logistic win-probability curve.

## Running locally

```bash
npm install
npm run dev
```

Then open the printed `http://localhost:5173/17-0-game/` URL.

## Project structure

```
src/
  data/
    teams.js       # 32 franchises, colors, founding years, historical era names
    players.js      # player database: PLAYERS[teamId][decade][position]
    peakRatings.js  # researched peak Madden overalls for HOF/marquee players
  engine/
    dataAccess.js       # pool lookup + decade-fallback logic
    recordPredictor.js  # player/team rating + season simulation
  components/
    ModeSelect.jsx   # Classic / Challenge mode picker
    Sidebar.jsx      # position tabs, search/sort, and the player draft list
    Field.jsx        # roster display on a mini football field
    PlayerCard.jsx   # individual player card
    ResultScreen.jsx # final record + breakdown
```

## Data notes

Player stats are per-season averages for that player's time with that team during that decade, sourced from public NFL historical records. Depth (number of players per team/decade/position) is more complete for recent decades and thinner for the 1920s-1950s, where historical stat-keeping was sparse. Contributions/corrections to `src/data/players.js` are welcome.
