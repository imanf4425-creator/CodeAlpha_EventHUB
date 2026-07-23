import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import socket from '../socket';
import styles from '../styles/Home.module.css';
import cardStyles from '../styles/EventCard.module.css';

function formatDate(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleString('en-PK', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function EventCard({ event }) {
  const isFree = event.is_free || !event.ticket_price || Number(event.ticket_price) === 0;
  const price = isFree ? 'Free' : `Rs. ${Number(event.ticket_price).toLocaleString()}`;
  
  return (
    <Link to={`/events/${event.id}`} className={cardStyles.card}>
      <div className={cardStyles.header}>
        <h3 className={cardStyles.title}>{event.title}</h3>
        {event.is_full
          ? <span className={cardStyles.badgeFull}>Full</span>
          : <span className={cardStyles.badgeOpen}>{event.available_spots} spots left</span>
        }
      </div>
      <p className={cardStyles.location}>📍 {event.location}</p>
      <p className={cardStyles.date}>🗓 {formatDate(event.start_datetime)}</p>
      {event.description && (
        <p className={cardStyles.desc}>{event.description.slice(0, 100)}{event.description.length > 100 ? '…' : ''}</p>
      )}
      <div className={cardStyles.footer}>
        <span className={cardStyles.capacity}>👥 {event.capacity} capacity</span>
        <span className={cardStyles.price} style={{ 
          color: isFree ? '#10b981' : '#f59e0b',
          fontWeight: 600 
        }}>
          💳 {price}
        </span>
      </div>
      <div className={cardStyles.meta}>
        <span className={cardStyles.organizer}>by {event.organizer_name}</span>
      </div>
    </Link>
  );
}

export default function Home() {
  const [events, setEvents] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [liveNotice, setLiveNotice] = useState('');

  const fetchEvents = useCallback(async (q) => {
    setLoading(true);
    setError('');
    try {
      const params = {};
      if (q) params.search = q;
      const { data } = await api.get('/events', { params });
      setEvents(data);
    } catch {
      setError('Failed to load events. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => fetchEvents(search), 400);
    return () => clearTimeout(timer);
  }, [search, fetchEvents]);

  // ── Real-time Socket.io listeners ───────────────────────────────────────────
  useEffect(() => {
    // New event posted by any organizer
    function onEventCreated(newEvent) {
      setEvents((prev) => {
        // Avoid duplicates
        if (prev.find((e) => e.id === newEvent.id)) return prev;
        setLiveNotice(`🆕 New event posted: "${newEvent.title}"`);
        setTimeout(() => setLiveNotice(''), 5000);
        // Insert sorted by start_datetime
        const updated = [...prev, newEvent].sort(
          (a, b) => new Date(a.start_datetime) - new Date(b.start_datetime)
        );
        return updated;
      });
    }

    // Event details updated by organizer
    function onEventUpdated(updated) {
      setEvents((prev) =>
        prev.map((e) => e.id === updated.id ? { ...e, ...updated } : e)
      );
      setLiveNotice(`✏️ Event updated: "${updated.title}"`);
      setTimeout(() => setLiveNotice(''), 4000);
    }

    // Event deleted or unpublished
    function onEventDeleted({ id }) {
      setEvents((prev) => prev.filter((e) => e.id !== id));
    }

    // Spots changed when someone registers or cancels
    function onSpotsUpdated({ id, available_spots, is_full }) {
      setEvents((prev) =>
        prev.map((e) =>
          e.id === id ? { ...e, available_spots, is_full } : e
        )
      );
    }

    socket.on('event:created', onEventCreated);
    socket.on('event:updated', onEventUpdated);
    socket.on('event:deleted', onEventDeleted);
    socket.on('event:spots_updated', onSpotsUpdated);

    return () => {
      socket.off('event:created', onEventCreated);
      socket.off('event:updated', onEventUpdated);
      socket.off('event:deleted', onEventDeleted);
      socket.off('event:spots_updated', onSpotsUpdated);
    };
  }, []);

  return (
    <div className={styles.page}>
      <div className={styles.hero}>
        <h1 className={styles.heading}>Discover Events</h1>
        <p className={styles.sub}>Find and register for events happening across Pakistan</p>
        <input
          className={styles.search}
          type="text"
          placeholder="Search by title or city..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Live notification banner */}
      {liveNotice && (
        <div className={styles.liveNotice}>
          <span className={styles.liveDot} /> {liveNotice}
        </div>
      )}

      <div className={styles.container}>
        {/* Live indicator */}
        <div className={styles.liveBar}>
          <span className={styles.liveDot} />
          <span>Live — events update in real-time</span>
          <span className={styles.count}>{events.length} events</span>
        </div>

        {loading && <p className={styles.status}>Loading events...</p>}
        {error && <p className={styles.error}>{error}</p>}
        {!loading && !error && events.length === 0 && (
          <p className={styles.status}>No events found{search ? ` for "${search}"` : ''}.</p>
        )}
        <div className={styles.grid}>
          {events.map((e) => <EventCard key={e.id} event={e} />)}
        </div>
      </div>
    </div>
  );
}
