import { useState, useEffect, useCallback, useRef } from 'react';
import { searchEvents } from '../api/ticketmaster';
import styles from '../styles/GlobalEvents.module.css';

const CATEGORIES = [
  { value: '', label: '🌍 All Categories' },
  { value: 'music', label: '🎵 Music & Concerts' },
  { value: 'sports', label: '⚽ Sports' },
  { value: 'arts', label: '🎭 Arts & Theatre' },
  { value: 'family', label: '👨‍👩‍👧 Family' },
  { value: 'film', label: '🎬 Film' },
  { value: 'miscellaneous', label: '🎪 Miscellaneous' },
];

const COUNTRIES = [
  { code: '', label: '🌍 Worldwide (All Countries)' },
  { code: 'US', label: '🇺🇸 United States' },
  { code: 'GB', label: '🇬🇧 United Kingdom' },
  { code: 'AU', label: '🇦🇺 Australia' },
  { code: 'CA', label: '🇨🇦 Canada' },
  { code: 'DE', label: '🇩🇪 Germany' },
  { code: 'FR', label: '🇫🇷 France' },
  { code: 'JP', label: '🇯🇵 Japan' },
  { code: 'KR', label: '🇰🇷 South Korea' },
  { code: 'AE', label: '🇦🇪 UAE' },
  { code: 'IN', label: '🇮🇳 India' },
  { code: 'PK', label: '🇵🇰 Pakistan' },
  { code: 'MX', label: '🇲🇽 Mexico' },
  { code: 'BR', label: '🇧🇷 Brazil' },
  { code: 'ZA', label: '🇿🇦 South Africa' },
];

// Today's date in ISO format for filtering past events
const TODAY_ISO = new Date().toISOString().slice(0, 19) + 'Z';

function formatDate(date, time) {
  if (!date) return 'TBA';
  try {
    const d = new Date(`${date}T${time || '12:00:00'}`);
    return d.toLocaleDateString('en-US', {
      weekday: 'short', day: 'numeric', month: 'short', year: 'numeric',
    }) + (time ? ` · ${d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}` : '');
  } catch { return date; }
}

function statusLabel(status) {
  if (status === 'onsale') return { text: '● On Sale', color: '#16a34a' };
  if (status === 'offsale') return { text: '● Off Sale', color: '#dc2626' };
  if (status === 'cancelled') return { text: '✕ Cancelled', color: '#6b7280' };
  if (status === 'rescheduled') return { text: '↻ Rescheduled', color: '#ca8a04' };
  return { text: '● Available', color: '#4f46e5' };
}

function EventCard({ event }) {
  const s = statusLabel(event.status);
  return (
    <a href={event.url} target="_blank" rel="noopener noreferrer" className={styles.card}>
      <div className={styles.imgWrap}>
        {event.image
          ? <img src={event.image} alt={event.name} className={styles.img} loading="lazy" />
          : <div className={styles.imgPlaceholder}>🎟</div>
        }
        {event.classification?.segment && (
          <span className={styles.segBadge}>{event.classification.segment}</span>
        )}
        {event.classification?.genre && event.classification.genre !== 'Undefined' && (
          <span className={styles.genreBadge}>{event.classification.genre}</span>
        )}
      </div>
      <div className={styles.body}>
        <h3 className={styles.name}>{event.name}</h3>
        {event.attraction && <p className={styles.attraction}>🎤 {event.attraction}</p>}
        <p className={styles.date}>🗓 {formatDate(event.date, event.time)}</p>
        {event.venue && (
          <p className={styles.venue}>
            📍 {[event.venue.name, event.venue.city, event.venue.country].filter(Boolean).join(', ')}
          </p>
        )}
        <div className={styles.footer}>
          <span className={styles.price}>
            {event.priceMin != null
              ? `From ${event.currency || 'USD'} ${Number(event.priceMin).toFixed(0)}`
              : 'See prices'}
          </span>
          <span style={{ color: s.color, fontSize: '12px', fontWeight: 600 }}>{s.text}</span>
        </div>
      </div>
    </a>
  );
}

export default function GlobalEvents() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [keyword, setKeyword] = useState('');
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('');          // default: Worldwide
  const [category, setCategory] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [total, setTotal] = useState(0);
  const [hasSearched, setHasSearched] = useState(false);
  const debounceRef = useRef(null);

  const fetchEvents = useCallback(async (kw, ct, co, cat, pg) => {
    setLoading(true);
    setError('');
    setHasSearched(true);
    try {
      const result = await searchEvents({
        keyword: kw || undefined,
        city: ct || undefined,
        // Only apply countryCode if no keyword OR if country explicitly chosen
        countryCode: co || undefined,
        classificationName: cat || undefined,
        size: 20,
        page: pg,
        sort: kw ? 'relevance,desc' : 'date,asc',   // relevance sort for keyword search
        startDateTime: TODAY_ISO,                     // only future events
      });
      setEvents(result.events);
      setTotal(result.total);
      setTotalPages(Math.min(result.pages, 50));       // TM caps at page 50
    } catch (err) {
      console.error(err);
      setError('Failed to load events. Check your connection and try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Auto-fetch on filter change with debounce
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchEvents(keyword, city, country, category, page);
    }, 450);
    return () => clearTimeout(debounceRef.current);
  }, [keyword, city, country, category, page, fetchEvents]);

  // Reset page when filters change
  function resetAndFetch(setter, value) {
    setter(value);
    setPage(0);
  }

  return (
    <div className={styles.page}>
      {/* Hero */}
      <div className={styles.hero}>
        <h1 className={styles.heading}>🌍 Global Events</h1>
        <p className={styles.sub}>Search concerts, tours, sports, theatre & more worldwide</p>
        <p className={styles.powered}>Powered by Ticketmaster · {total > 0 ? `${total.toLocaleString()} results` : 'Live data'}</p>
      </div>

      {/* Search & Filters */}
      <div className={styles.filterBar}>
        <div className={styles.filterInner}>
          {/* Keyword — most important, full width */}
          <div className={styles.searchWrap}>
            <span className={styles.searchIcon}>🔍</span>
            <input
              className={styles.searchInput}
              type="text"
              placeholder='Search: "BTS", "FIFA", "Taylor Swift", "Ed Sheeran"...'
              value={keyword}
              onChange={(e) => resetAndFetch(setKeyword, e.target.value)}
              autoFocus
            />
            {keyword && (
              <button className={styles.clearBtn} onClick={() => resetAndFetch(setKeyword, '')}>✕</button>
            )}
          </div>

          <div className={styles.filterRow}>
            <input
              className={styles.filterInput}
              type="text"
              placeholder="City (optional)"
              value={city}
              onChange={(e) => resetAndFetch(setCity, e.target.value)}
            />
            <select
              className={styles.filterSelect}
              value={country}
              onChange={(e) => resetAndFetch(setCountry, e.target.value)}
            >
              {COUNTRIES.map((c) => <option key={c.code} value={c.code}>{c.label}</option>)}
            </select>
            <select
              className={styles.filterSelect}
              value={category}
              onChange={(e) => resetAndFetch(setCategory, e.target.value)}
            >
              {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
            {(keyword || city || country || category) && (
              <button
                className={styles.clearAllBtn}
                onClick={() => { setKeyword(''); setCity(''); setCountry(''); setCategory(''); setPage(0); }}
              >
                Clear All
              </button>
            )}
          </div>
        </div>
      </div>

      <div className={styles.container}>
        {/* Quick search chips */}
        {!keyword && (
          <div className={styles.chips}>
            <span className={styles.chipsLabel}>Trending:</span>
            {['BTS', 'Taylor Swift', 'FIFA', 'Coldplay', 'Ed Sheeran', 'Drake', 'F1', 'NBA', 'Beyoncé'].map((q) => (
              <button key={q} className={styles.chip} onClick={() => resetAndFetch(setKeyword, q)}>
                {q}
              </button>
            ))}
          </div>
        )}

        {/* Results info */}
        {hasSearched && !loading && !error && (
          <div className={styles.statsBar}>
            <span>
              {total === 0
                ? 'No events found'
                : `${total.toLocaleString()} upcoming event${total !== 1 ? 's' : ''}`
              }
              {keyword ? ` for "${keyword}"` : ''}
              {country ? ` in ${COUNTRIES.find(c => c.code === country)?.label.split(' ').slice(1).join(' ')}` : ' worldwide'}
            </span>
            {totalPages > 1 && <span className={styles.pageIndicator}>Page {page + 1} of {totalPages}</span>}
          </div>
        )}

        {/* Loading skeletons */}
        {loading && (
          <div className={styles.grid}>
            {[...Array(8)].map((_, i) => <div key={i} className={styles.skeleton} />)}
          </div>
        )}

        {/* Error */}
        {error && (
          <div className={styles.errorBox}>
            <p>⚠ {error}</p>
            <button onClick={() => fetchEvents(keyword, city, country, category, page)} className={styles.retryBtn}>
              Retry
            </button>
          </div>
        )}

        {/* No results */}
        {!loading && !error && hasSearched && events.length === 0 && (
          <div className={styles.empty}>
            <p style={{ fontSize: '2rem' }}>🔍</p>
            <p>No upcoming events found{keyword ? ` for "${keyword}"` : ''}.</p>
            <p style={{ fontSize: '13px', color: '#9ca3af', marginTop: '0.5rem' }}>
              Try removing the country filter, or check the spelling.
            </p>
            <button
              className={styles.retryBtn}
              style={{ marginTop: '1rem' }}
              onClick={() => { setCountry(''); setPage(0); }}
            >
              Search Worldwide
            </button>
          </div>
        )}

        {/* Welcome state */}
        {!hasSearched && !loading && (
          <div className={styles.welcome}>
            <p>Search for any artist, event, or team above to find tickets worldwide 🎟</p>
          </div>
        )}

        {/* Event cards */}
        {!loading && !error && events.length > 0 && (
          <div className={styles.grid}>
            {events.map((e) => <EventCard key={e.id} event={e} />)}
          </div>
        )}

        {/* Pagination */}
        {!loading && totalPages > 1 && events.length > 0 && (
          <div className={styles.pagination}>
            <button
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              className={styles.pageBtn}
            >← Previous</button>
            <div className={styles.pageNumbers}>
              {[...Array(Math.min(5, totalPages))].map((_, i) => {
                const p = Math.max(0, Math.min(page - 2, totalPages - 5)) + i;
                return (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`${styles.pageNum} ${p === page ? styles.pageNumActive : ''}`}
                  >{p + 1}</button>
                );
              })}
            </div>
            <button
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
              className={styles.pageBtn}
            >Next →</button>
          </div>
        )}
      </div>
    </div>
  );
}
