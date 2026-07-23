const pool = require('../config/db');
const { getIO } = require('../socket');

// ── getStats ──────────────────────────────────────────────────────────────────
async function getStats(req, res, next) {
  try {
    const [users, events, regs, organizers, categories, pendingEvents] = await Promise.all([
      pool.query('SELECT COUNT(*) FROM tbl_users'),
      pool.query('SELECT COUNT(*) FROM tbl_events WHERE is_published=true'),
      pool.query("SELECT COUNT(*) FROM tbl_registrations WHERE status='active'"),
      pool.query('SELECT COUNT(*) FROM tbl_users WHERE is_organizer=true'),
      pool.query('SELECT COUNT(*) FROM tbl_event_categories'),
      pool.query("SELECT COUNT(*) FROM tbl_events WHERE approval_status='pending'"),
    ]);
    return res.json({
      total_users:          Number(users.rows[0].count),
      published_events:     Number(events.rows[0].count),
      active_registrations: Number(regs.rows[0].count),
      organizers:           Number(organizers.rows[0].count),
      categories:           Number(categories.rows[0].count),
      pending_events:       Number(pendingEvents.rows[0].count),
    });
  } catch (err) { next(err); }
}

// ── listUsers ─────────────────────────────────────────────────────────────────
async function listUsers(req, res, next) {
  try {
    const { search, page = 0, size = 20 } = req.query;
    let where = ''; const vals = [];
    if (search) {
      vals.push(`%${search}%`);
      where = `WHERE email ILIKE $1 OR first_name ILIKE $1 OR last_name ILIKE $1`;
    }
    const offset = Number(page) * Number(size);
    const dataVals = [...vals, Number(size), offset];
    const idx = dataVals.length;

    const result = await pool.query(
      `SELECT user_id AS id, email, first_name, last_name, phone,
              is_organizer, is_staff, is_active, created_at
       FROM tbl_users ${where}
       ORDER BY created_at DESC
       LIMIT $${idx-1} OFFSET $${idx}`,
      dataVals
    );
    const total = await pool.query(
      `SELECT COUNT(*) FROM tbl_users ${where}`,
      search ? [`%${search}%`] : []
    );
    return res.json({ users: result.rows, total: Number(total.rows[0].count) });
  } catch (err) { next(err); }
}

// ── updateUser ────────────────────────────────────────────────────────────────
async function updateUser(req, res, next) {
  try {
    const { id } = req.params;
    const { is_organizer, is_active, is_staff } = req.body;
    const fields = []; const vals = []; let i = 1;
    if (is_organizer !== undefined) { fields.push(`is_organizer=$${i++}`); vals.push(Boolean(is_organizer)); }
    if (is_active    !== undefined) { fields.push(`is_active=$${i++}`);    vals.push(Boolean(is_active)); }
    if (is_staff     !== undefined) { fields.push(`is_staff=$${i++}`);     vals.push(Boolean(is_staff)); }
    if (!fields.length) return res.status(400).json({ errors: ['Nothing to update.'] });
    fields.push(`updated_at=NOW()`);
    vals.push(id);
    const result = await pool.query(
      `UPDATE tbl_users SET ${fields.join(',')} WHERE user_id=$${i}
       RETURNING user_id AS id, email, first_name, last_name, is_organizer, is_staff, is_active`,
      vals
    );
    if (!result.rows.length) return res.status(404).json({ detail: 'User not found.' });
    return res.json(result.rows[0]);
  } catch (err) { next(err); }
}

// ── listAllEvents ─────────────────────────────────────────────────────────────
async function listAllEvents(req, res, next) {
  try {
    const { page = 0, size = 20 } = req.query;
    const offset = Number(page) * Number(size);
    const result = await pool.query(
      `SELECT e.event_id AS id, e.title, e.venue_name AS location,
              e.city, e.country, e.start_datetime, e.capacity, e.is_published,
              e.is_featured, e.ticket_price, e.is_free, e.created_at,
              u.email AS organizer_email,
              u.first_name || ' ' || u.last_name AS organizer_name,
              (e.capacity - COALESCE((SELECT COUNT(*) FROM tbl_registrations r
               WHERE r.event_id=e.event_id AND r.status='active'),0)) AS available_spots,
              c.name AS category_name
       FROM tbl_events e
       JOIN tbl_users u ON u.user_id=e.organizer_id
       LEFT JOIN tbl_event_categories c ON c.category_id=e.category_id
       ORDER BY e.created_at DESC LIMIT $1 OFFSET $2`,
      [Number(size), offset]
    );
    const total = await pool.query('SELECT COUNT(*) FROM tbl_events');
    return res.json({ events: result.rows, total: Number(total.rows[0].count) });
  } catch (err) { next(err); }
}

// ── deleteEvent ───────────────────────────────────────────────────────────────
async function deleteEvent(req, res, next) {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'DELETE FROM tbl_events WHERE event_id=$1 RETURNING event_id', [id]
    );
    if (!result.rows.length) return res.status(404).json({ detail: 'Event not found.' });
    try { getIO().emit('event:deleted', { id: Number(id) }); } catch (_) {}
    return res.json({ message: 'Event deleted.' });
  } catch (err) { next(err); }
}

// ── listRegistrations ─────────────────────────────────────────────────────────
async function listRegistrations(req, res, next) {
  try {
    const { page = 0, size = 20 } = req.query;
    const offset = Number(page) * Number(size);
    const result = await pool.query(
      `SELECT r.registration_id AS id, r.status, r.registered_at, r.notes,
              u.email AS user_email,
              u.first_name || ' ' || u.last_name AS user_name,
              e.title AS event_title, e.city AS event_city, e.start_datetime
       FROM tbl_registrations r
       JOIN tbl_users u ON u.user_id=r.user_id
       JOIN tbl_events e ON e.event_id=r.event_id
       ORDER BY r.registered_at DESC LIMIT $1 OFFSET $2`,
      [Number(size), offset]
    );
    const total = await pool.query('SELECT COUNT(*) FROM tbl_registrations');
    return res.json({ registrations: result.rows, total: Number(total.rows[0].count) });
  } catch (err) { next(err); }
}

// ── listCategories ────────────────────────────────────────────────────────────
async function listCategories(req, res, next) {
  try {
    const result = await pool.query(
      'SELECT category_id AS id, name, slug, icon, color, sort_order, is_active FROM tbl_event_categories ORDER BY sort_order'
    );
    return res.json(result.rows);
  } catch (err) { next(err); }
}

// ── listPendingEvents ─────────────────────────────────────────────────────────
async function listPendingEvents(req, res, next) {
  try {
    const result = await pool.query(
      `SELECT e.event_id AS id, e.title, e.venue_name AS location,
              e.city, e.country, e.start_datetime, e.end_datetime,
              e.capacity, e.ticket_price, e.is_free, e.description,
              e.created_at, e.approval_status,
              u.email AS organizer_email,
              u.first_name || ' ' || u.last_name AS organizer_name,
              c.name AS category_name
       FROM tbl_events e
       JOIN tbl_users u ON u.user_id=e.organizer_id
       LEFT JOIN tbl_event_categories c ON c.category_id=e.category_id
       WHERE e.approval_status = 'pending'
       ORDER BY e.created_at ASC`
    );
    return res.json(result.rows);
  } catch (err) { next(err); }
}

// ── approveEvent ──────────────────────────────────────────────────────────────
async function approveEvent(req, res, next) {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `UPDATE tbl_events
       SET approval_status = 'approved',
           approved_by = $1,
           approved_at = NOW()
       WHERE event_id = $2
       RETURNING event_id AS id, title, approval_status, approved_at`,
      [req.user.id, id]
    );
    if (!result.rows.length) return res.status(404).json({ detail: 'Event not found.' });
    
    // Emit socket event if event is published
    const event = result.rows[0];
    try {
      const published = await pool.query('SELECT is_published FROM tbl_events WHERE event_id = $1', [id]);
      if (published.rows[0]?.is_published) {
        getIO().emit('event:updated', event);
      }
    } catch (_) {}
    
    return res.json(event);
  } catch (err) { next(err); }
}

// ── rejectEvent ───────────────────────────────────────────────────────────────
async function rejectEvent(req, res, next) {
  try {
    const { id } = req.params;
    const { rejection_reason } = req.body;
    const result = await pool.query(
      `UPDATE tbl_events
       SET approval_status = 'rejected',
           approved_by = $1,
           approved_at = NOW(),
           rejection_reason = $2
       WHERE event_id = $3
       RETURNING event_id AS id, title, approval_status, rejection_reason, approved_at`,
      [req.user.id, rejection_reason || 'Event does not meet guidelines', id]
    );
    if (!result.rows.length) return res.status(404).json({ detail: 'Event not found.' });
    return res.json(result.rows[0]);
  } catch (err) { next(err); }
}

module.exports = { getStats, listUsers, updateUser, listAllEvents, deleteEvent, listRegistrations, listCategories, listPendingEvents, approveEvent, rejectEvent };
