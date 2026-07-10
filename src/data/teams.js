// Full 32-team list. `founded` = first year of franchise existence (as an NFL/AAFC entity),
// used to determine which decades are spinnable for that team.
// `eraNames` lets us show the historically-accurate team name for older decades
// (e.g. Patriots were the "Boston Patriots" in the 1960s).
export const TEAMS = [
  { id: "cardinals", name: "Arizona Cardinals", abbr: "ARI", primary: "#97233F", secondary: "#000000", founded: 1920,
    eraNames: { 1920: "Chicago Cardinals", 1930: "Chicago Cardinals", 1940: "Chicago Cardinals", 1950: "Chicago Cardinals", 1960: "St. Louis Cardinals", 1970: "St. Louis Cardinals", 1980: "St. Louis Cardinals", 1990: "Phoenix/Arizona Cardinals" } },
  { id: "falcons", name: "Atlanta Falcons", abbr: "ATL", primary: "#A71930", secondary: "#000000", founded: 1966 },
  { id: "ravens", name: "Baltimore Ravens", abbr: "BAL", primary: "#241773", secondary: "#000000", founded: 1996 },
  { id: "bills", name: "Buffalo Bills", abbr: "BUF", primary: "#00338D", secondary: "#C60C30", founded: 1960 },
  { id: "panthers", name: "Carolina Panthers", abbr: "CAR", primary: "#0085CA", secondary: "#101820", founded: 1995 },
  { id: "bears", name: "Chicago Bears", abbr: "CHI", primary: "#0B162A", secondary: "#C83803", founded: 1920 },
  { id: "bengals", name: "Cincinnati Bengals", abbr: "CIN", primary: "#FB4F14", secondary: "#000000", founded: 1968 },
  { id: "browns", name: "Cleveland Browns", abbr: "CLE", primary: "#311D00", secondary: "#FF3C00", founded: 1946 },
  { id: "cowboys", name: "Dallas Cowboys", abbr: "DAL", primary: "#041E42", secondary: "#869397", founded: 1960 },
  { id: "broncos", name: "Denver Broncos", abbr: "DEN", primary: "#FB4F14", secondary: "#002244", founded: 1960 },
  { id: "lions", name: "Detroit Lions", abbr: "DET", primary: "#0076B6", secondary: "#B0B7BC", founded: 1930,
    eraNames: { 1930: "Portsmouth Spartans / Detroit Lions" } },
  { id: "packers", name: "Green Bay Packers", abbr: "GB", primary: "#203731", secondary: "#FFB612", founded: 1921 },
  { id: "texans", name: "Houston Texans", abbr: "HOU", primary: "#03202F", secondary: "#A71930", founded: 2002 },
  { id: "colts", name: "Indianapolis Colts", abbr: "IND", primary: "#002C5F", secondary: "#A2AAAD", founded: 1953,
    eraNames: { 1950: "Baltimore Colts", 1960: "Baltimore Colts", 1970: "Baltimore Colts", 1980: "Baltimore/Indianapolis Colts" } },
  { id: "jaguars", name: "Jacksonville Jaguars", abbr: "JAX", primary: "#101820", secondary: "#D7A22A", founded: 1995 },
  { id: "chiefs", name: "Kansas City Chiefs", abbr: "KC", primary: "#E31837", secondary: "#FFB81C", founded: 1960,
    eraNames: { 1960: "Dallas Texans / Kansas City Chiefs" } },
  { id: "raiders", name: "Las Vegas Raiders", abbr: "LV", primary: "#000000", secondary: "#A5ACAF", founded: 1960,
    eraNames: { 1960: "Oakland Raiders", 1970: "Oakland Raiders", 1980: "L.A./Oakland Raiders", 1990: "Oakland Raiders", 2000: "Oakland Raiders", 2010: "Oakland Raiders" } },
  { id: "chargers", name: "Los Angeles Chargers", abbr: "LAC", primary: "#0080C6", secondary: "#FFC20E", founded: 1960,
    eraNames: { 1960: "L.A./San Diego Chargers", 1970: "San Diego Chargers", 1980: "San Diego Chargers", 1990: "San Diego Chargers", 2000: "San Diego Chargers", 2010: "San Diego/L.A. Chargers" } },
  { id: "rams", name: "Los Angeles Rams", abbr: "LAR", primary: "#003594", secondary: "#FFA300", founded: 1936,
    eraNames: { 1930: "Cleveland Rams", 1940: "Cleveland/Los Angeles Rams", 1950: "Los Angeles Rams", 1960: "Los Angeles Rams", 1970: "Los Angeles Rams", 1980: "Los Angeles Rams", 1990: "St. Louis Rams", 2000: "St. Louis Rams", 2010: "St. Louis/L.A. Rams" } },
  { id: "dolphins", name: "Miami Dolphins", abbr: "MIA", primary: "#008E97", secondary: "#FC4C02", founded: 1966 },
  { id: "vikings", name: "Minnesota Vikings", abbr: "MIN", primary: "#4F2683", secondary: "#FFC62F", founded: 1961 },
  { id: "patriots", name: "New England Patriots", abbr: "NE", primary: "#002244", secondary: "#C60C30", founded: 1960,
    eraNames: { 1960: "Boston Patriots" } },
  { id: "saints", name: "New Orleans Saints", abbr: "NO", primary: "#D3BC8D", secondary: "#101820", founded: 1967 },
  { id: "giants", name: "New York Giants", abbr: "NYG", primary: "#0B2265", secondary: "#A71930", founded: 1925 },
  { id: "jets", name: "New York Jets", abbr: "NYJ", primary: "#125740", secondary: "#000000", founded: 1960,
    eraNames: { 1960: "New York Titans / Jets" } },
  { id: "eagles", name: "Philadelphia Eagles", abbr: "PHI", primary: "#004C54", secondary: "#A5ACAF", founded: 1933 },
  { id: "steelers", name: "Pittsburgh Steelers", abbr: "PIT", primary: "#FFB612", secondary: "#101820", founded: 1933,
    eraNames: { 1930: "Pittsburgh Pirates / Steelers" } },
  { id: "49ers", name: "San Francisco 49ers", abbr: "SF", primary: "#AA0000", secondary: "#B3995D", founded: 1946 },
  { id: "seahawks", name: "Seattle Seahawks", abbr: "SEA", primary: "#002244", secondary: "#69BE28", founded: 1976 },
  { id: "buccaneers", name: "Tampa Bay Buccaneers", abbr: "TB", primary: "#D50A0A", secondary: "#34302B", founded: 1976 },
  { id: "titans", name: "Tennessee Titans", abbr: "TEN", primary: "#4B92DB", secondary: "#0C2340", founded: 1960,
    eraNames: { 1960: "Houston Oilers", 1970: "Houston Oilers", 1980: "Houston Oilers", 1990: "Houston Oilers / Tennessee Titans" } },
  { id: "commanders", name: "Washington Commanders", abbr: "WAS", primary: "#5A1414", secondary: "#FFB612", founded: 1932,
    eraNames: { 1930: "Boston Braves / Redskins", 1940: "Washington Redskins", 1950: "Washington Redskins", 1960: "Washington Redskins", 1970: "Washington Redskins", 1980: "Washington Redskins", 1990: "Washington Redskins", 2000: "Washington Redskins", 2010: "Washington Redskins/Football Team" } },
];

export const ERAS = [1920, 1930, 1940, 1950, 1960, 1970, 1980, 1990, 2000, 2010, 2020];

export function eraLabel(decade) {
  return `${decade}s`;
}

export function teamById(id) {
  return TEAMS.find((t) => t.id === id);
}

export function teamDisplayNameForEra(team, decade) {
  if (team.eraNames && team.eraNames[decade]) return team.eraNames[decade];
  return team.name;
}

// A team/era combo is valid if the franchise existed for at least part of that decade.
export function isValidTeamEra(team, decade) {
  return team.founded <= decade + 9;
}

export function validErasForTeam(team) {
  return ERAS.filter((d) => isValidTeamEra(team, d));
}
