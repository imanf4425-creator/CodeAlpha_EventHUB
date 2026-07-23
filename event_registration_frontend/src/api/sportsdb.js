/**
 * TheSportsDB API — Free tier (v1/json/3, no key needed)
 *
 * FREE TIER LIMITATIONS (important):
 * - Standings: NOT available on free tier (returns null/empty)
 * - Live scores: NOT available on free tier (paid only)
 * - Next/Past events: Available but limited (1-15 results)
 * - We handle all failures gracefully with fallback messages
 */

const BASE = 'https://www.thesportsdb.com/api/v1/json/3';

async function sdbFetch(endpoint) {
  const res = await fetch(`${BASE}${endpoint}`);
  if (!res.ok) throw new Error(`SportsDB error: ${res.status}`);
  return res.json();
}

export const LEAGUES = [
  { id: '4328', name: 'English Premier League', sport: 'Soccer',          country: 'England',    badge: '⚽', hasStandings: false },
  { id: '4335', name: 'La Liga',                 sport: 'Soccer',          country: 'Spain',      badge: '⚽', hasStandings: false },
  { id: '4331', name: 'Bundesliga',              sport: 'Soccer',          country: 'Germany',    badge: '⚽', hasStandings: false },
  { id: '4332', name: 'Serie A',                 sport: 'Soccer',          country: 'Italy',      badge: '⚽', hasStandings: false },
  { id: '4480', name: 'FIFA World Cup',          sport: 'Soccer',          country: 'World',      badge: '🏆', hasStandings: false },
  { id: '4346', name: 'Pakistan Super League',   sport: 'Cricket',         country: 'Pakistan',   badge: '🏏', hasStandings: false },
  { id: '4340', name: 'IPL',                     sport: 'Cricket',         country: 'India',      badge: '🏏', hasStandings: false },
  { id: '4387', name: 'NBA',                     sport: 'Basketball',      country: 'USA',        badge: '🏀', hasStandings: false },
  { id: '4424', name: 'NFL',                     sport: 'American Football',country: 'USA',       badge: '🏈', hasStandings: false },
  { id: '4516', name: 'Formula 1',               sport: 'Motorsport',      country: 'World',      badge: '🏎', hasStandings: false },
  { id: '4418', name: 'UFC',                     sport: 'MMA',             country: 'World',      badge: '🥊', hasStandings: false },
  { id: '4422', name: 'Wimbledon',               sport: 'Tennis',          country: 'UK',         badge: '🎾', hasStandings: false },
  { id: '4397', name: 'NHL',                     sport: 'Ice Hockey',      country: 'USA/Canada', badge: '🏒', hasStandings: false },
  { id: '4391', name: 'MLB',                     sport: 'Baseball',        country: 'USA',        badge: '⚾', hasStandings: false },
];

/** Get next upcoming events for a league */
export async function getNextEvents(leagueId) {
  try {
    const data = await sdbFetch(`/eventsnextleague.php?id=${leagueId}`);
    return (data?.events || []).map(normalizeMatch);
  } catch {
    return [];
  }
}

/** Get recent results for a league */
export async function getLastResults(leagueId) {
  try {
    const data = await sdbFetch(`/eventspastleague.php?id=${leagueId}`);
    return (data?.events || []).map(normalizeMatch);
  } catch {
    return [];
  }
}

/**
 * Standings — free tier does NOT support current season tables.
 * We return null so the UI can show a clear "not available" message
 * instead of a confusing error.
 */
export async function getStandings(leagueId) {
  // Try a few recent seasons; free tier almost always returns empty
  const seasons = ['2024-2025', '2025', '2023-2024'];
  for (const s of seasons) {
    try {
      const data = await sdbFetch(`/lookuptable.php?l=${leagueId}&s=${s}`);
      const rows = data?.standing || data?.table || [];
      if (rows.length > 0) return rows;
    } catch { /* continue */ }
  }
  return null; // Signal "not available on free tier"
}

function normalizeMatch(e) {
  return {
    id: e.idEvent,
    name: e.strEvent,
    homeTeam: e.strHomeTeam,
    awayTeam: e.strAwayTeam,
    homeScore: e.intHomeScore,
    awayScore: e.intAwayScore,
    date: e.dateEvent,
    time: e.strTime,
    datetime: e.dateEvent && e.strTime ? `${e.dateEvent}T${e.strTime}` : null,
    venue: e.strVenue,
    city: e.strCity,
    country: e.strCountry,
    league: e.strLeague,
    season: e.strSeason,
    status: e.strStatus,
    homeThumb: e.strHomeTeamBadge,
    awayThumb: e.strAwayTeamBadge,
    thumb: e.strThumb,
    source: 'sportsdb',
    sport: e.strSport,
  };
}
