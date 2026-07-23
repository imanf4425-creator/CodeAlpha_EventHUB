import { useState, useEffect } from 'react';
import { LEAGUES, getNextEvents, getLastResults, getStandings } from '../api/sportsdb';
import styles from '../styles/LiveSports.module.css';

const SPORT_FILTERS = [
  { value: '', label: '🏆 All Sports' },
  { value: 'Soccer', label: '⚽ Football/Soccer' },
  { value: 'Cricket', label: '🏏 Cricket' },
  { value: 'Basketball', label: '🏀 Basketball' },
  { value: 'Motorsport', label: '🏎 Formula 1' },
  { value: 'MMA', label: '🥊 UFC/MMA' },
  { value: 'Tennis', label: '🎾 Tennis' },
  { value: 'American Football', label: '🏈 NFL' },
  { value: 'Ice Hockey', label: '🏒 NHL' },
];

function formatMatchDate(date, time) {
  if (!date) return 'TBA';
  const d = new Date(`${date}T${time || '12:00:00'}`);
  return d.toLocaleDateString('en-PK', { weekday: 'short', day: 'numeric', month: 'short' })
    + (time ? ` · ${d.toLocaleTimeString('en-PK', { hour: '2-digit', minute: '2-digit' })}` : '');
}

function isLive(date, time) {
  if (!date) return false;
  const matchTime = new Date(`${date}T${time || '12:00:00'}`);
  const now = new Date();
  const diff = (now - matchTime) / (1000 * 60); // minutes
  return diff >= 0 && diff <= 110; // within ~2 hours
}

function MatchCard({ match }) {
  const live = isLive(match.date, match.time);
  const finished = match.status === 'Match Finished' || (match.homeScore != null && match.awayScore != null);

  return (
    <div className={`${styles.matchCard} ${live ? styles.liveCard : ''}`}>
      {live && <div className={styles.liveBanner}>🔴 LIVE</div>}
      <div className={styles.matchLeague}>{match.league}</div>
      <div className={styles.teams}>
        <div className={styles.team}>
          {match.homeThumb && <img src={match.homeThumb} alt={match.homeTeam} className={styles.teamBadge} />}
          <span className={styles.teamName}>{match.homeTeam}</span>
        </div>
        <div className={styles.score}>
          {finished
            ? <span className={styles.scoreText}>{match.homeScore ?? 0} — {match.awayScore ?? 0}</span>
            : <span className={styles.vsText}>VS</span>
          }
        </div>
        <div className={styles.team}>
          {match.awayThumb && <img src={match.awayThumb} alt={match.awayTeam} className={styles.teamBadge} />}
          <span className={styles.teamName}>{match.awayTeam}</span>
        </div>
      </div>
      <div className={styles.matchMeta}>
        <span>🗓 {formatMatchDate(match.date, match.time)}</span>
        {match.venue && <span>📍 {match.venue}</span>}
      </div>
      {match.status && <div className={styles.matchStatus}>{match.status}</div>}
    </div>
  );
}

function StandingsTable({ standings }) {
  // null = free tier limitation, [] = no data for this league
  if (standings === null) {
    return (
      <div className={styles.freeTierNotice}>
        <p style={{ fontSize: '1.5rem', marginBottom: '0.75rem' }}>📊</p>
        <p style={{ fontWeight: 600, color: '#cbd5e1', marginBottom: '0.5rem' }}>
          Standings require a paid TheSportsDB subscription
        </p>
        <p style={{ fontSize: '13px', color: '#64748b', lineHeight: 1.6 }}>
          The free API tier does not return current season standings.<br />
          Use the <strong>Upcoming</strong> and <strong>Results</strong> tabs for live fixture data.
        </p>
        <a
          href="https://www.thesportsdb.com/patreon"
          target="_blank"
          rel="noopener noreferrer"
          className={styles.upgradeLink}
        >
          Upgrade on TheSportsDB →
        </a>
      </div>
    );
  }
  if (standings.length === 0) {
    return <p className={styles.noData}>No standings data available for this league yet.</p>;
  }
  return (
    <div className={styles.tableWrap}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>#</th><th>Team</th><th>P</th><th>W</th><th>D</th><th>L</th><th>GD</th><th>Pts</th>
          </tr>
        </thead>
        <tbody>
          {standings.slice(0, 20).map((row, i) => (
            <tr key={i}>
              <td>{row.intRank}</td>
              <td className={styles.teamCell}>
                {row.strTeamBadge && <img src={row.strTeamBadge} alt={row.strTeam} className={styles.miniLogo} />}
                {row.strTeam}
              </td>
              <td>{row.intPlayed}</td>
              <td>{row.intWin}</td>
              <td>{row.intDraw}</td>
              <td>{row.intLoss}</td>
              <td>{row.intGoalDifference}</td>
              <td className={styles.pts}>{row.intPoints}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function LiveSports() {
  const [sportFilter, setSportFilter] = useState('');
  const [selectedLeague, setSelectedLeague] = useState(LEAGUES[0]);
  const [tab, setTab] = useState('upcoming'); // 'upcoming' | 'results' | 'standings'
  const [matches, setMatches] = useState([]);
  const [standings, setStandings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const filteredLeagues = sportFilter
    ? LEAGUES.filter((l) => l.sport === sportFilter)
    : LEAGUES;

  useEffect(() => {
    // If current league filtered out, select first available
    if (filteredLeagues.length > 0 && !filteredLeagues.find((l) => l.id === selectedLeague.id)) {
      setSelectedLeague(filteredLeagues[0]);
    }
  }, [sportFilter]);

  useEffect(() => {
    setLoading(true);
    setError('');
    setMatches([]);
    setStandings([]);

    const load = async () => {
      try {
        if (tab === 'upcoming') {
          const data = await getNextEvents(selectedLeague.id);
          setMatches(data);
        } else if (tab === 'results') {
          const data = await getLastResults(selectedLeague.id);
          setMatches(data);
        } else if (tab === 'standings') {
          const data = await getStandings(selectedLeague.id);
          setStandings(data);
        }
      } catch (err) {
        setError('Failed to load data. Please try again.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [selectedLeague, tab]);

  return (
    <div className={styles.page}>
      {/* Hero */}
      <div className={styles.hero}>
        <h1 className={styles.heading}>⚽ Live Sports</h1>
        <p className={styles.sub}>Fixtures · Results · Standings · Live Scores</p>
        <p className={styles.sub} style={{ opacity: 0.7, fontSize: '13px' }}>Powered by TheSportsDB</p>
      </div>

      <div className={styles.layout}>
        {/* Sidebar — League selector */}
        <aside className={styles.sidebar}>
          <div className={styles.sidebarHeader}>
            <select
              className={styles.sportSelect}
              value={sportFilter}
              onChange={(e) => setSportFilter(e.target.value)}
            >
              {SPORT_FILTERS.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>
          <ul className={styles.leagueList}>
            {filteredLeagues.map((league) => (
              <li key={league.id}>
                <button
                  className={`${styles.leagueBtn} ${selectedLeague.id === league.id ? styles.leagueActive : ''}`}
                  onClick={() => { setSelectedLeague(league); setTab('upcoming'); }}
                >
                  <span className={styles.leagueBadge}>{league.badge}</span>
                  <span className={styles.leagueInfo}>
                    <span className={styles.leagueName}>{league.name}</span>
                    <span className={styles.leagueCountry}>{league.country}</span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </aside>

        {/* Main content */}
        <main className={styles.main}>
          {/* League header */}
          <div className={styles.leagueHeader}>
            <h2 className={styles.leagueTitle}>
              {selectedLeague.badge} {selectedLeague.name}
            </h2>
            <span className={styles.leagueSport}>{selectedLeague.sport} · {selectedLeague.country}</span>
          </div>

          {/* Tabs */}
          <div className={styles.tabs}>
            {['upcoming', 'results', 'standings'].map((t) => (
              <button
                key={t}
                className={`${styles.tab} ${tab === t ? styles.tabActive : ''}`}
                onClick={() => setTab(t)}
              >
                {t === 'upcoming' ? '📅 Upcoming' : t === 'results' ? '📊 Results' : '🏆 Standings'}
              </button>
            ))}
          </div>

          {/* Content */}
          {loading && (
            <div className={styles.skeletons}>
              {[...Array(6)].map((_, i) => <div key={i} className={styles.skeleton} />)}
            </div>
          )}
          {error && <p className={styles.error}>{error}</p>}

          {!loading && !error && tab !== 'standings' && matches.length === 0 && (
            <div className={styles.empty}>No {tab} matches found for this league.</div>
          )}

          {!loading && !error && tab !== 'standings' && (
            <div className={styles.matchGrid}>
              {matches.map((m) => <MatchCard key={m.id} match={m} />)}
            </div>
          )}

        {!loading && !error && tab === 'standings' && (
          <StandingsTable standings={standings} />
        )}
        </main>
      </div>
    </div>
  );
}
