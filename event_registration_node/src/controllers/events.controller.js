const pool = require('../config/db');
const { getIO } = require('../socket');

// Available spots subquery
const spotsExpr = (alias = 'e') =>
  `(${alias}.capacity - COALESCE((
     SELECT COUNT(*) FROM tbl_registrations r
     WHERE r.event_id = ${alias}.event_id AND r.status = 'active'
   ), 0))`;

// ── listPublicEvents ──────────────────────────────────────────────────────────
async function listPublicEvents(req, res, next) {
  try {
    const { search, ordering } = req.query;
    let orderClause = 'e.start_datetime ASC';
    if (ordering) {
      if (ordering.startsWith('-')) {
        const col = ordering.slice(1);
        if (['start_datetime', 'title'].includes(col)) orderClause = `e.${col} DESC`;
      } else {
        if (['start_datetime', 'title'].includes(ordering)) orderClause = `e.${ordering} ASC`;
      }
    }

    const values = [];
    let whereClause = 'WHERE e.is_published = true AND e.approval_status = \'approved\'';
    if (search) {
      values.push(`%${search}%`);
      whereClause += ` AND (e.title ILIKE $${values.length} OR e.city ILIKE $${values.length} OR e.venue_name ILIKE $${values.length})`;
    }

    const sql = `
      SELECT
        e.event_id AS id, e.title, e.description, e.venue_name AS location, e.city, e.country,
        e.start_datetime, e.end_datetime, e.capacity, e.ticket_price, e.currency, e.is_free,
        e.is_featured, e.tags, e.category_id,
        ${spotsExpr()} AS available_spots,
        CASE WHEN ${spotsExpr()} <= 0 THEN true ELSE false END AS is_full,
        (u.first_name || ' ' || u.last_name) AS organizer_name,
        c.name AS category_name, c.icon AS category_icon
      FROM tbl_events e
      JOIN tbl_users u ON u.user_id = e.organizer_id
      LEFT JOIN tbl_event_categories c ON c.category_id = e.category_id
      ${whereClause}
      ORDER BY ${orderClause}`;

    const result = await pool.query(sql, values);
    return res.status(200).json(result.rows);
  } catch (err) { next(err); }
}

// ── getPublicEvent ────────────────────────────────────────────────────────────
async function getPublicEvent(req, res, next) {
  try {
    const { id } = req.params;
    if (isNaN(Number(id))) return res.status(404).json({ detail: 'Event not found.' });

    const result = await pool.query(
      `SELECT
         e.event_id AS id, e.title, e.description, e.venue_name AS location,
         e.address, e.city, e.country, e.start_datetime, e.end_datetime,
         e.capacity, e.ticket_price, e.currency, e.is_free, e.is_published,
         e.is_featured, e.tags, e.created_at, e.payment_method, e.payment_details,
         ${spotsExpr()} AS available_spots,
         CASE WHEN ${spotsExpr()} <= 0 THEN true ELSE false END AS is_full,
         json_build_object('id', u.user_id, 'name', u.first_name || ' ' || u.last_name, 'email', u.email) AS organizer,
         c.name AS category_name, c.icon AS category_icon
       FROM tbl_events e
       JOIN tbl_users u ON u.user_id = e.organizer_id
       LEFT JOIN tbl_event_categories c ON c.category_id = e.category_id
       WHERE e.event_id = $1 AND e.is_published = true AND e.approval_status = 'approved'`,
      [id]
    );
    if (result.rows.length === 0) return res.status(404).json({ detail: 'Event not found.' });
    return res.status(200).json(result.rows[0]);
  } catch (err) { next(err); }
}

// ── listOrganizerEvents ───────────────────────────────────────────────────────
async function listOrganizerEvents(req, res, next) {
  try {
    const result = await pool.query(
      `SELECT
         e.event_id AS id, e.title, e.description, e.venue_name AS location,
         e.city, e.country, e.start_datetime, e.end_datetime, e.capacity,
         e.ticket_price, e.currency, e.is_free, e.is_published, e.is_featured,
         e.created_at, e.updated_at, e.approval_status, e.rejection_reason,
         ${spotsExpr()} AS available_spots,
         CASE WHEN ${spotsExpr()} <= 0 THEN true ELSE false END AS is_full,
         c.name AS category_name
       FROM tbl_events e
       LEFT JOIN tbl_event_categories c ON c.category_id = e.category_id
       WHERE e.organizer_id = $1
       ORDER BY e.start_datetime ASC`,
      [req.user.id]
    );
    return res.status(200).json(result.rows);
  } catch (err) { next(err); }
}

// ── createEvent ───────────────────────────────────────────────────────────────
async function createEvent(req, res, next) {
  try {
    const { title, description, location, city, country, start_datetime, end_datetime,
            capacity, ticket_price, is_published, is_featured, category_id, 
            payment_method, payment_details } = req.body;

    const errors = [];
    if (!title?.trim())      errors.push('title is required.');
    if (!location?.trim())   errors.push('location is required.');
    if (!start_datetime)     errors.push('start_datetime is required.');
    if (!end_datetime)       errors.push('end_datetime is required.');
    if (capacity == null)    errors.push('capacity is required.');
    if (errors.length) return res.status(400).json({ errors });

    const cap = Number(capacity);
    if (!Number.isInteger(cap) || cap < 1)
      return res.status(400).json({ errors: ['capacity must be an integer >= 1.'] });

    const start = new Date(start_datetime);
    const end   = new Date(end_datetime);
    if (isNaN(start.getTime())) return res.status(400).json({ errors: ['start_datetime is invalid.'] });
    if (isNaN(end.getTime()))   return res.status(400).json({ errors: ['end_datetime is invalid.'] });
    if (end <= start) return res.status(400).json({ errors: ['end_datetime must be after start_datetime.'] });

    const price    = Number(ticket_price) || 0;
    const isFree   = price === 0;
    const published = is_published === true || is_published === 'true';
    const featured  = is_featured  === true || is_featured  === 'true';
    
    // Handle payment details
    const paymentMethod = payment_method || 'bank_transfer';
    const paymentDetailsJson = payment_details ? JSON.stringify(payment_details) : '{}';

    const result = await pool.query(
      `INSERT INTO tbl_events
         (title, description, organizer_id, category_id, venue_name, city, country,
          start_datetime, end_datetime, capacity, ticket_price, is_free, is_published, is_featured,
          payment_method, payment_details)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16)
       RETURNING event_id AS id, title, venue_name AS location, city, country,
                 start_datetime, end_datetime, capacity, ticket_price, is_free,
                 is_published, is_featured, payment_method, payment_details, created_at`,
      [title.trim(), description || '', req.user.id, category_id || null,
       location.trim(), city || '', country || 'Pakistan',
       start, end, cap, price, isFree, published, featured, paymentMethod, paymentDetailsJson]
    );

    const newEvent = result.rows[0];

    if (published) {
      try {
        const full = await pool.query(
          `SELECT e.event_id AS id, e.title, e.venue_name AS location, e.city,
                  e.start_datetime, e.end_datetime, e.capacity, e.is_featured,
                  ${spotsExpr()} AS available_spots,
                  CASE WHEN ${spotsExpr()} <= 0 THEN true ELSE false END AS is_full,
                  (u.first_name || ' ' || u.last_name) AS organizer_name
           FROM tbl_events e JOIN tbl_users u ON u.user_id = e.organizer_id
           WHERE e.event_id = $1`, [newEvent.id]
        );
        getIO().emit('event:created', full.rows[0]);
      } catch (_) {}
    }

    return res.status(201).json(newEvent);
  } catch (err) { next(err); }
}

// ── getOrganizerEvent ─────────────────────────────────────────────────────────
async function getOrganizerEvent(req, res, next) {
  try {
    const { id } = req.params;
    if (isNaN(Number(id))) return res.status(404).json({ detail: 'Event not found.' });

    const result = await pool.query(
      `SELECT e.event_id AS id, e.title, e.description, e.venue_name AS location,
              e.address, e.city, e.country, e.start_datetime, e.end_datetime,
              e.capacity, e.ticket_price, e.currency, e.is_free,
              e.is_published, e.is_featured, e.tags, e.category_id,
              e.approval_status, e.rejection_reason,
              ${spotsExpr()} AS available_spots,
              CASE WHEN ${spotsExpr()} <= 0 THEN true ELSE false END AS is_full
       FROM tbl_events e
       WHERE e.event_id = $1 AND e.organizer_id = $2`,
      [id, req.user.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ detail: 'Event not found.' });
    return res.status(200).json(result.rows[0]);
  } catch (err) { next(err); }
}

// ── updateEvent ───────────────────────────────────────────────────────────────
async function updateEvent(req, res, next) {
  try {
    const { id } = req.params;
    if (isNaN(Number(id))) return res.status(404).json({ detail: 'Event not found.' });

    const existing = await pool.query(
      'SELECT * FROM tbl_events WHERE event_id = $1 AND organizer_id = $2',
      [id, req.user.id]
    );
    if (existing.rows.length === 0) return res.status(404).json({ detail: 'Event not found.' });
    const cur = existing.rows[0];

    const { title, description, location, city, country, start_datetime, end_datetime,
            capacity, ticket_price, is_published, is_featured, category_id,
            payment_method, payment_details } = req.body;

    const newTitle    = title            !== undefined ? title       : cur.title;
    const newDesc     = description      !== undefined ? description : cur.description;
    const newLocation = location         !== undefined ? location    : cur.venue_name;
    const newCity     = city             !== undefined ? city        : cur.city;
    const newCountry  = country          !== undefined ? country     : cur.country;
    const newStart    = start_datetime   !== undefined ? new Date(start_datetime) : cur.start_datetime;
    const newEnd      = end_datetime     !== undefined ? new Date(end_datetime)   : cur.end_datetime;
    const newCap      = capacity         !== undefined ? Number(capacity)         : cur.capacity;
    const newPrice    = ticket_price     !== undefined ? Number(ticket_price)     : Number(cur.ticket_price);
    const newPub      = is_published     !== undefined ? (is_published === true || is_published === 'true') : cur.is_published;
    const newFeat     = is_featured      !== undefined ? (is_featured  === true || is_featured  === 'true') : cur.is_featured;
    const newCat      = category_id      !== undefined ? category_id  : cur.category_id;
    const newPayMethod = payment_method  !== undefined ? payment_method : cur.payment_method;
    const newPayDetails = payment_details !== undefined ? JSON.stringify(payment_details) : cur.payment_details;

    const errors = [];
    if (!newTitle?.toString().trim()) errors.push('title must not be empty.');
    if (!Number.isInteger(newCap) || newCap < 1) errors.push('capacity must be >= 1.');
    if (new Date(newEnd) <= new Date(newStart)) errors.push('end_datetime must be after start_datetime.');
    if (errors.length) return res.status(400).json({ errors });

    const result = await pool.query(
      `UPDATE tbl_events
       SET title=$1, description=$2, venue_name=$3, city=$4, country=$5,
           start_datetime=$6, end_datetime=$7, capacity=$8,
           ticket_price=$9, is_free=$10, is_published=$11, is_featured=$12,
           category_id=$13, payment_method=$14, payment_details=$15, updated_at=NOW()
       WHERE event_id=$16 AND organizer_id=$17
       RETURNING event_id AS id, title, venue_name AS location, city, country,
                 start_datetime, end_datetime, capacity, ticket_price, is_free,
                 is_published, is_featured, payment_method, payment_details, updated_at`,
      [newTitle, newDesc, newLocation, newCity, newCountry,
       newStart, newEnd, newCap, newPrice, newPrice === 0,
       newPub, newFeat, newCat, newPayMethod, newPayDetails, id, req.user.id]
    );

    const updated = result.rows[0];

    try {
      const full = await pool.query(
        `SELECT e.event_id AS id, e.title, e.venue_name AS location, e.city,
                e.start_datetime, e.end_datetime, e.capacity, e.is_featured,
                ${spotsExpr()} AS available_spots,
                CASE WHEN ${spotsExpr()} <= 0 THEN true ELSE false END AS is_full,
                (u.first_name || ' ' || u.last_name) AS organizer_name
         FROM tbl_events e JOIN tbl_users u ON u.user_id = e.organizer_id
         WHERE e.event_id = $1`, [updated.id]
      );
      if (updated.is_published) {
        getIO().emit('event:updated', full.rows[0]);
      } else {
        getIO().emit('event:deleted', { id: Number(id) });
      }
    } catch (_) {}

    return res.status(200).json(updated);
  } catch (err) { next(err); }
}

// ── deleteEvent ───────────────────────────────────────────────────────────────
async function deleteEvent(req, res, next) {
  try {
    const { id } = req.params;
    if (isNaN(Number(id))) return res.status(404).json({ detail: 'Event not found.' });

    const result = await pool.query(
      'DELETE FROM tbl_events WHERE event_id = $1 AND organizer_id = $2 RETURNING event_id',
      [id, req.user.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ detail: 'Event not found.' });

    try { getIO().emit('event:deleted', { id: Number(id) }); } catch (_) {}
    return res.status(200).json({ message: 'Event deleted successfully.' });
  } catch (err) { next(err); }
}

module.exports = {
  listPublicEvents, getPublicEvent, listOrganizerEvents,
  createEvent, getOrganizerEvent, updateEvent, deleteEvent,
};
