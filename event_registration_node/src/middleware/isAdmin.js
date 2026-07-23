module.exports = function isAdmin(req, res, next) {
  if (!req.user || !req.user.is_staff) {
    return res.status(403).json({ detail: 'Admin access required.' });
  }
  next();
};
