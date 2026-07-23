module.exports = function isOrganizer(req, res, next) {
  if (!req.user || !req.user.is_organizer) {
    return res.status(403).json({ detail: 'You must be an organizer to perform this action.' });
  }
  next();
};
