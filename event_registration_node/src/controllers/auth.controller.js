const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');
const { getIO } = require('../socket');

function generateTokens(payload) {
  const access = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '1d',
  });
  const refresh = jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  });
  return { access, refresh };
}

function userPayload(user) {
  return {
    id: user.user_id || user.id,
    email: user.email,
    is_organizer: user.is_organizer,
    is_staff: user.is_staff || false,
  };
}

// ── register ──────────────────────────────────────────────────────────────────
async function register(req, res, next) {
  try {
    const { email, first_name, last_name, phone, password, password_confirm } = req.body;
    const errors = [];
    if (!email)            errors.push('email is required.');
    if (!first_name)       errors.push('first_name is required.');
    if (!last_name)        errors.push('last_name is required.');
    if (!password)         errors.push('password is required.');
    if (!password_confirm) errors.push('password_confirm is required.');
    if (errors.length) return res.status(400).json({ errors });

    if (password !== password_confirm)
      return res.status(400).json({ errors: ['Passwords do not match.'] });

    const existing = await pool.query('SELECT user_id FROM tbl_users WHERE email = $1', [email]);
    if (existing.rows.length > 0)
      return res.status(400).json({ errors: ['A user with this email already exists.'] });

    const password_hash = await bcrypt.hash(password, 12);

    const result = await pool.query(
      `INSERT INTO tbl_users (email, first_name, last_name, phone, password_hash)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING user_id AS id, email, first_name, last_name, is_organizer, is_staff, is_active, created_at`,
      [email, first_name, last_name, phone || '', password_hash]
    );

    const user = result.rows[0];
    const tokens = generateTokens(userPayload(user));

    return res.status(201).json({
      message: 'Registration successful.',
      user: { id: user.id, email: user.email, first_name: user.first_name, last_name: user.last_name },
      tokens,
    });
  } catch (err) { next(err); }
}

// ── login ─────────────────────────────────────────────────────────────────────
async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    const errors = [];
    if (!email)    errors.push('email is required.');
    if (!password) errors.push('password is required.');
    if (errors.length) return res.status(400).json({ errors });

    const result = await pool.query(
      'SELECT * FROM tbl_users WHERE email = $1',
      [email]
    );
    const user = result.rows[0];

    if (!user || !user.is_active)
      return res.status(401).json({ detail: 'Invalid credentials.' });

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) return res.status(401).json({ detail: 'Invalid credentials.' });

    // Update last_login
    await pool.query('UPDATE tbl_users SET updated_at = NOW() WHERE user_id = $1', [user.user_id]);

    const tokens = generateTokens(userPayload(user));

    return res.status(200).json({
      message: 'Login successful.',
      user: {
        id: user.user_id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        is_organizer: user.is_organizer,
        is_staff: user.is_staff || false,
      },
      tokens,
    });
  } catch (err) { next(err); }
}

// ── refreshToken ──────────────────────────────────────────────────────────────
async function refreshToken(req, res, next) {
  try {
    const { refresh } = req.body;
    if (!refresh) return res.status(400).json({ errors: ['refresh token is required.'] });

    let decoded;
    try {
      decoded = jwt.verify(refresh, process.env.JWT_REFRESH_SECRET);
    } catch {
      return res.status(401).json({ detail: 'Invalid or expired refresh token.' });
    }

    const result = await pool.query(
      'SELECT user_id AS id, email, is_organizer, is_staff, is_active FROM tbl_users WHERE user_id = $1',
      [decoded.id]
    );
    const user = result.rows[0];
    if (!user || !user.is_active)
      return res.status(401).json({ detail: 'User no longer exists or is inactive.' });

    const access = jwt.sign(userPayload(user), process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || '1d',
    });
    return res.status(200).json({ access });
  } catch (err) { next(err); }
}

// ── getProfile ────────────────────────────────────────────────────────────────
async function getProfile(req, res, next) {
  try {
    const result = await pool.query(
      `SELECT user_id AS id, email, first_name, last_name, phone,
              is_organizer, is_staff, is_active, created_at
       FROM tbl_users WHERE user_id = $1`,
      [req.user.id]
    );
    const user = result.rows[0];
    if (!user) return res.status(404).json({ detail: 'User not found.' });
    return res.status(200).json(user);
  } catch (err) { next(err); }
}

// ── updateProfile ─────────────────────────────────────────────────────────────
async function updateProfile(req, res, next) {
  try {
    const { first_name, last_name, phone } = req.body;
    const fields = [];
    const values = [];
    let idx = 1;

    if (first_name !== undefined) {
      if (!first_name.trim()) return res.status(400).json({ errors: ['first_name must not be empty.'] });
      fields.push(`first_name = $${idx++}`); values.push(first_name.trim());
    }
    if (last_name !== undefined) {
      if (!last_name.trim()) return res.status(400).json({ errors: ['last_name must not be empty.'] });
      fields.push(`last_name = $${idx++}`); values.push(last_name.trim());
    }
    if (phone !== undefined) { fields.push(`phone = $${idx++}`); values.push(phone || ''); }
    if (!fields.length) return res.status(400).json({ errors: ['No updatable fields provided.'] });

    fields.push(`updated_at = NOW()`);
    values.push(req.user.id);

    const result = await pool.query(
      `UPDATE tbl_users SET ${fields.join(', ')} WHERE user_id = $${idx}
       RETURNING user_id AS id, email, first_name, last_name, phone, is_organizer, is_staff, created_at`,
      values
    );
    return res.status(200).json(result.rows[0]);
  } catch (err) { next(err); }
}

// ── changePassword ────────────────────────────────────────────────────────────
async function changePassword(req, res, next) {
  try {
    const { old_password, new_password, new_password_confirm } = req.body;
    const errors = [];
    if (!old_password)         errors.push('old_password is required.');
    if (!new_password)         errors.push('new_password is required.');
    if (!new_password_confirm) errors.push('new_password_confirm is required.');
    if (errors.length) return res.status(400).json({ errors });

    if (new_password !== new_password_confirm)
      return res.status(400).json({ errors: ['New passwords do not match.'] });

    const result = await pool.query('SELECT * FROM tbl_users WHERE user_id = $1', [req.user.id]);
    const user = result.rows[0];
    if (!user) return res.status(404).json({ detail: 'User not found.' });

    const valid = await bcrypt.compare(old_password, user.password_hash);
    if (!valid) return res.status(400).json({ errors: ['Old password is incorrect.'] });

    const new_hash = await bcrypt.hash(new_password, 12);
    await pool.query(
      'UPDATE tbl_users SET password_hash = $1, updated_at = NOW() WHERE user_id = $2',
      [new_hash, req.user.id]
    );
    return res.status(200).json({ message: 'Password changed successfully.' });
  } catch (err) { next(err); }
}

module.exports = { register, login, refreshToken, getProfile, updateProfile, changePassword };
