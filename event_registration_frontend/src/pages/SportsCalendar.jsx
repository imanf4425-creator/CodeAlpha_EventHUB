import { useState, useEffect } from 'react';
import { LEAGUES, getNextEvents } from '../api/sportsdb';
import styles from '../styles/SportsCalendar.module.css';

// Group events by date
function groupByDate(events) {
  const map = {};
  events.forEach((e) => {
    const key = e.date || 'Unknown';
    if (!map[key]) map[key] = [];
    map[key].push(e);
  });
  // Sort dates
  return Object.entries(map).sort(([a], [b]) => new Date(a) - new Date(b));
}

function formatDayLabel(dateStr) {
  if (!dateStr || dateStr === 'Unknown') return 'Date TBA';
  const d = new Date(dateStr + 'T12:00:00');
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today); tomorrow.setDate(today.getDate() + 1);

  if (d.toDateString() === today.toDateString()) return '🔴 Today';
  if (d.toDateString() === tomorrow.toDateString()) return '🟡 Tomorrow';
  return d.toLocaleDateString('en-PK', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
}

export default function SportsCalendar() {
  const [allEvents, setAllEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [sportFilter, setSportFilter] = useState('');
  const [leagueFilter, setLeagueFilter] = useState('');

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setAllEvents([]);
    setProgress(0);

    // Load all leagues in parallel
    const promises = LEAGUES.filter((l) => l.id).map(async (league, idx) => {
      try {
        const events = await getNextEvents(league.id);
        const tagged = events.map((e) => ({ ...e, leagueName: league.name, sport: league.sport, leagueBadge: league.badge }));
        if (mounted) {
          setAllEvents((prev) => {
            const combined = [...prev, ...tagged];
            return combined;
          });
          setProgress((p) => p + 1);
        }
        return tagged;
      } catch {
        return [];
      }
    });

    Promise.all(promises).then(() => {
      if (mounted) setLoading(false);
    });

    return () => { mounted = false; };
  }, []);

  // Unique sports and leagues from loaded events
  const uniqueSports = [...new Set(LEAGUES.map((l) => l.sport))];
  const filteredLeagues = sportFilter ? LEAGUES.filter((l) => l.sport === sportFilter) : LEAGUES;

  const filtered = allEvents.filter((e) => {
    if (sportFilter && e.sport !== sportFilter) return false;
    if (leagueFilter && e.league !== leagueFilter) return false;
    return true;
  });

  const grouped = groupByDate(filtered);
  const totalLoaded = Math.round((progress / LEAGUES.length) * 100);

  return (
    <div className={styles.page}>
      <div className={styles.hero}>
        <h1 className={styles.heading}>📅 Sports Calendar</h1>
        <p className={styles.sub}>All upcoming matches from 14+ leagues in one place</p>
        {loading && (
          <div className={styles.progressWrap}>
            <div className={styles.progressBar} style={{ width: `${totalLoaded}%` }} />
            <span className={styles.progressText}>Loading leagues... {totalLoaded}%</span>
          </div>
        )}
      </div>

      <div className={styles.container}>
        {/* Filters */}
        <div className={styles.filterRow}>
          <select
            className={styles.select}
            value={sportFilter}
            onChange={(e) => { setSportFilter(e.target.value); setLeagueFilter(''); }}
          >
            <option value="">🏆 All Sports</option>
            {uniqueSports.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <select
            className={styles.select}
            value={leagueFilter}
            onChange={(e) => setLeagueFilter(e.target.value)}
          >
            <option value="">All Leagues</option>
            {filteredLeagues.map((l) => (
              <option key={l.id} value={l.name}>{l.badge} {l.name}</option>
            ))}
          </select>
          <span className={styles.countBadge}>
            {filtered.length} matches
          </span>
        </div>

        {/* Calendar */}
        {grouped.length === 0 && !loading && (
          <div className={styles.empty}>No upcoming matches found.</div>
        )}

        {grouped.map(([date, events]) => (
          <div key={date} className={styles.dayGroup}>
            <div className={styles.dayLabel}>{formatDayLabel(date)}</div>
            <div className={styles.dayMatches}>
              {events.map((match) => (
                <div key={match.id} className={styles.matchRow}>
                  <div className={styles.matchSport}>
                    <span>{match.leagueBadge || '🏆'}</span>
                    <span className={styles.matchLeague}>{match.leagueName || match.league}</span>
                  </div>
                  <div className={styles.matchTeams}>
                    <span className={styles.team1}>{match.homeTeam}</span>
                    <span className={styles.matchVs}>
                      {match.homeScore != null
                        ? <strong>{match.homeScore} — {match.awayScore}</strong>
                        : match.time ? match.time.slice(0, 5) : 'VS'
                      }
                    </span>
                    <span className={styles.team2}>{match.awayTeam}</span>
                  </div>
                  <div className={styles.matchVenue}>
                    {match.venue && <span>📍 {match.venue}</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        {loading && allEvents.length > 0 && (
          <p className={styles.loadingMore}>Loading more leagues...</p>
        )}
      </div>
    </div>
  );
}
