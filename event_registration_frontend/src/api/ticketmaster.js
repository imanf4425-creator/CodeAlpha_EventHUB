/**
 * Ticketmaster Discovery API
 * Free tier: 5000 calls/day
 * Docs: https://developer.ticketmaster.com/products-and-docs/apis/discovery-api/v2/
 */

const TM_KEY = 'hYtYZkdYE6ADQY5XHPzV9VqFyVZ3v7F2';
const TM_BASE = 'https://app.ticketmaster.com/discovery/v2';

async function tmFetch(endpoint, params = {}) {
  const url = new URL(`${TM_BASE}${endpoint}`);
  url.searchParams.set('apikey', TM_KEY);
  url.searchParams.set('locale', '*');
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') url.searchParams.set(k, v);
  });
  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`Ticketmaster error: ${res.status}`);
  return res.json();
}

/**
 * Search events with filters
 * @param {object} opts
 * opts.keyword  - search term
 * opts.city     - city name
 * opts.countryCode - ISO country code e.g. "PK", "US"
 * opts.classificationName - "music", "sports", "arts", "family"
 * opts.size     - results per page (default 20)
 * opts.page     - page number
 * opts.sort     - "date,asc" | "date,desc" | "relevance,desc"
 * opts.startDateTime - "2025-01-01T00:00:00Z"
 */
export async function searchEvents(opts = {}) {
  const data = await tmFetch('/events.json', {
    keyword: opts.keyword,
    city: opts.city,
    countryCode: opts.countryCode,
    classificationName: opts.classificationName,
    size: opts.size || 20,
    page: opts.page || 0,
    sort: opts.sort || 'date,asc',
    startDateTime: opts.startDateTime,
  });
  const items = data?._embedded?.events || [];
  return {
    events: items.map(normalizeEvent),
    total: data?.page?.totalElements || 0,
    pages: data?.page?.totalPages || 0,
  };
}

/**
 * Get single event detail by Ticketmaster event ID
 */
export async function getEventById(id) {
  const data = await tmFetch(`/events/${id}.json`);
  return normalizeEvent(data);
}

/**
 * Get available classifications (music, sports, arts, etc.)
 */
export async function getClassifications() {
  const data = await tmFetch('/classifications.json', { size: 20 });
  return data?._embedded?.classifications || [];
}

// Normalize TM event to our standard shape
function normalizeEvent(e) {
  const venue = e._embedded?.venues?.[0];
  const img = e.images?.find((i) => i.ratio === '16_9' && i.width > 500)
    || e.images?.[0];
  return {
    id: e.id,
    source: 'ticketmaster',
    name: e.name,
    url: e.url,
    image: img?.url || null,
    date: e.dates?.start?.localDate,
    time: e.dates?.start?.localTime,
    datetime: e.dates?.start?.dateTime,
    status: e.dates?.status?.code, // 'onsale', 'offsale', 'cancelled', 'rescheduled'
    venue: venue ? {
      name: venue.name,
      city: venue.city?.name,
      country: venue.country?.name,
      countryCode: venue.country?.countryCode,
      address: venue.address?.line1,
      lat: venue.location?.latitude,
      lng: venue.location?.longitude,
    } : null,
    classification: {
      segment: e.classifications?.[0]?.segment?.name,
      genre: e.classifications?.[0]?.genre?.name,
      subGenre: e.classifications?.[0]?.subGenre?.name,
    },
    priceMin: e.priceRanges?.[0]?.min,
    priceMax: e.priceRanges?.[0]?.max,
    currency: e.priceRanges?.[0]?.currency,
    attraction: e._embedded?.attractions?.[0]?.name || null,
  };
}
