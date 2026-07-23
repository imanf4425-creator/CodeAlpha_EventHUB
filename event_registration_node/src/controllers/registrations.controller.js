const pool = require('../config/db');
const { getIO } = require('../socket');

async function emitSpotsUpdate(eventId) {
  try {
    const r = await pool.query(
      `SELECT e.event_id AS id,
              (e.capacity - COALESCE((SELECT COUNT(*) FROM tbl_registrations r2
               WHERE r2.event_id = e.event_id AND r2.status = 'active'), 0)) AS available_spots,
              CASE WHEN (e.capacity - COALESCE((SELECT COUNT(*) FROM tbl_registrations r3
               WHERE r3.event_id = e.event_id AND r3.status = 'active'), 0)) <= 0
               THEN true ELSE false END AS is_full
       FROM tbl_events e WHERE e.event_id = $1`, [eventId]
    );
    if (r.rows.length > 0) getIO().emit('event:spots_updated', r.rows[0]);
  } catch (_) {}
}

// ── listMyRegistrations ───────────────────────────────────────────────────────
async function listMyRegistrations(req, res, next) {
  try {
    const result = await pool.query(
      `SELECT
         reg.registration_id AS id,
         reg.registered_at,
         reg.status,
         reg.notes,
         json_build_object(
           'id',             e.event_id,
           'title',          e.title,
           'location',       e.venue_name,
           'city',           e.city,
           'start_datetime', e.start_datetime,
           'end_datetime',   e.end_datetime,
           'is_free',        e.is_free,
           'ticket_price',   e.ticket_price,
           'currency',       e.currency
         ) AS event
       FROM tbl_registrations reg
       JOIN tbl_events e ON e.event_id = reg.event_id
       WHERE reg.user_id = $1
       ORDER BY reg.registered_at DESC`,
      [req.user.id]
    );
    return res.status(200).json(result.rows);
  } catch (err) { next(err); }
}

// ── registerForEvent ──────────────────────────────────────────────────────────
async function registerForEvent(req, res, next) {
  try {
    const { event_id } = req.body;
    if (!event_id) return res.status(400).json({ errors: ['event_id is required.'] });
    if (isNaN(Number(event_id))) return res.status(400).json({ errors: ['event_id must be a valid integer.'] });

    const eventResult = await pool.query(
      `SELECT e.*,
         (e.capacity - COALESCE((SELECT COUNT(*) FROM tbl_registrations r
          WHERE r.event_id = e.event_id AND r.status = 'active'), 0)) AS available_spots
       FROM tbl_events e WHERE e.event_id = $1`, [event_id]
    );
    if (eventResult.rows.length === 0) return res.status(404).json({ detail: 'Event not found.' });
    const event = eventResult.rows[0];
    if (!event.is_published) return res.status(400).json({ detail: 'This event is not published.' });
    if (Number(event.available_spots) <= 0) return res.status(400).json({ detail: 'This event is full.' });

    // Check if paid event requires payment proof
    const isPaid = event.ticket_price && Number(event.ticket_price) > 0;
    const paymentProofUrl = req.file ? `/uploads/payment-proofs/${req.file.filename}` : null;
    
    if (isPaid && !paymentProofUrl) {
      return res.status(400).json({ detail: 'Payment proof is required for paid events.' });
    }

    let reg;
    try {
      const regResult = await pool.query(
        `INSERT INTO tbl_registrations (user_id, event_id, status, payment_proof_url, is_verified)
         VALUES ($1, $2, 'active', $3, $4) RETURNING *`,
        [req.user.id, event_id, paymentProofUrl, !isPaid] // Free events auto-verified
      );
      reg = regResult.rows[0];
    } catch (dbErr) {
      if (dbErr.code === '23505') return res.status(400).json({ detail: 'You are already registered for this event.' });
      throw dbErr;
    }

    await emitSpotsUpdate(event_id);

    // Create notification for organizer (paid events only)
    if (isPaid) {
      try {
        await pool.query(
          `INSERT INTO tbl_notifications (user_id, type, title, message, related_entity_type, related_entity_id)
           VALUES ($1, 'new_registration', $2, $3, 'registration', $4)`,
          [
            event.organizer_id,
            'New Registration Pending',
            `${req.user.first_name} ${req.user.last_name} registered for "${event.title}". Please verify payment proof.`,
            reg.registration_id
          ]
        );
      } catch (_) {
        // Notification failure shouldn't block registration
      }
    }

    return res.status(201).json({
      id: reg.registration_id,
      registered_at: reg.registered_at,
      status: reg.status,
      is_verified: reg.is_verified,
      message: isPaid 
        ? 'Registration submitted! Waiting for organizer to verify your payment.' 
        : 'Successfully registered for the event!',
      event: {
        id: event.event_id,
        title: event.title,
        location: event.venue_name,
        city: event.city,
        start_datetime: event.start_datetime,
        end_datetime: event.end_datetime,
      },
    });
  } catch (err) { next(err); }
}

// ── cancelRegistration ────────────────────────────────────────────────────────
async function cancelRegistration(req, res, next) {
  try {
    const { id } = req.params;
    if (isNaN(Number(id))) return res.status(404).json({ detail: 'Registration not found.' });

    const result = await pool.query(
      'SELECT * FROM tbl_registrations WHERE registration_id = $1 AND user_id = $2',
      [id, req.user.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ detail: 'Registration not found.' });
    const reg = result.rows[0];
    if (reg.status === 'cancelled') return res.status(400).json({ detail: 'This registration is already cancelled.' });

    const updated = await pool.query(
      `UPDATE tbl_registrations
       SET status = 'cancelled', cancelled_at = NOW(), updated_at = NOW()
       WHERE registration_id = $1
       RETURNING registration_id AS id, status, registered_at, cancelled_at`,
      [id]
    );

    await emitSpotsUpdate(reg.event_id);
    return res.status(200).json(updated.rows[0]);
  } catch (err) { next(err); }
}

// ── getEventRegistrations (Organizer Analytics) ───────────────────────────────
async function getEventRegistrations(req, res, next) {
  try {
    const { id } = req.params;
    if (isNaN(Number(id))) return res.status(404).json({ detail: 'Event not found.' });

    // Verify event belongs to organizer
    const eventCheck = await pool.query(
      'SELECT event_id FROM tbl_events WHERE event_id = $1 AND organizer_id = $2',
      [id, req.user.id]
    );
    if (eventCheck.rows.length === 0) {
      return res.status(404).json({ detail: 'Event not found.' });
    }

    // Get all registrations for this event
    const result = await pool.query(
      `SELECT
         reg.registration_id AS id,
         reg.registered_at,
         reg.status,
         CASE WHEN reg.status = 'cancelled' THEN true ELSE false END AS is_cancelled,
         ('TKT-' || reg.event_id || '-' || reg.user_id) AS ticket_code,
         json_build_object(
           'id',         u.user_id,
           'first_name', u.first_name,
           'last_name',  u.last_name,
           'email',      u.email,
           'phone',      u.phone
         ) AS user
       FROM tbl_registrations reg
       JOIN tbl_users u ON u.user_id = reg.user_id
       WHERE reg.event_id = $1
       ORDER BY reg.registered_at DESC`,
      [id]
    );

    return res.status(200).json(result.rows);
  } catch (err) { next(err); }
}

// ── getPendingVerifications (Organizer) ───────────────────────────────────────
async function getPendingVerifications(req, res, next) {
  try {
    // Get all unverified registrations for organizer's events
    const result = await pool.query(
      `SELECT
         reg.registration_id AS id,
         reg.registered_at,
         reg.payment_proof_url,
         e.event_id,
         e.title AS event_title,
         (u.first_name || ' ' || u.last_name) AS user_name,
         u.email AS user_email,
         u.phone AS user_phone
       FROM tbl_registrations reg
       JOIN tbl_events e ON e.event_id = reg.event_id
       JOIN tbl_users u ON u.user_id = reg.user_id
       WHERE e.organizer_id = $1 
         AND reg.status = 'active'
         AND reg.is_verified = false
       ORDER BY reg.registered_at ASC`,
      [req.user.id]
    );

    return res.status(200).json(result.rows);
  } catch (err) { next(err); }
}

// ── verifyRegistration (Organizer) ────────────────────────────────────────────
async function verifyRegistration(req, res, next) {
  try {
    const { id } = req.params;
    const { approve, rejection_reason } = req.body;

    if (isNaN(Number(id))) return res.status(404).json({ detail: 'Registration not found.' });

    // Verify this registration belongs to organizer's event
    const regCheck = await pool.query(
      `SELECT reg.*, e.title AS event_title, u.email AS user_email, 
              (u.first_name || ' ' || u.last_name) AS user_name
       FROM tbl_registrations reg
       JOIN tbl_events e ON e.event_id = reg.event_id
       JOIN tbl_users u ON u.user_id = reg.user_id
       WHERE reg.registration_id = $1 AND e.organizer_id = $2`,
      [id, req.user.id]
    );

    if (regCheck.rows.length === 0) {
      return res.status(404).json({ detail: 'Registration not found.' });
    }

    const registration = regCheck.rows[0];

    if (approve) {
      // Approve registration
      await pool.query(
        `UPDATE tbl_registrations
         SET is_verified = true, verified_at = NOW(), verified_by = $1
         WHERE registration_id = $2`,
        [req.user.id, id]
      );

      // TODO: Send confirmation email to user here
      // For now, just return success

      return res.status(200).json({
        message: 'Registration approved successfully',
        user_email: registration.user_email,
        event_title: registration.event_title,
      });
    } else {
      // Reject registration - mark as cancelled
      await pool.query(
        `UPDATE tbl_registrations
         SET status = 'cancelled', 
             rejection_reason = $1,
             cancelled_at = NOW(),
             updated_at = NOW()
         WHERE registration_id = $2`,
        [rejection_reason || 'Payment proof not valid', id]
      );

      // TODO: Send rejection email to user here

      return res.status(200).json({
        message: 'Registration rejected',
      });
    }
  } catch (err) { next(err); }
}

module.exports = { 
  listMyRegistrations, 
  registerForEvent, 
  cancelRegistration, 
  getEventRegistrations,
  getPendingVerifications,
  verifyRegistration 
};
