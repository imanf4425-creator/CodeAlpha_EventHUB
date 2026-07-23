const router = require('express').Router();
const protect = require('../middleware/auth');
const ctrl = require('../controllers/admin.controller');

// All admin routes require authentication + superuser flag
// We reuse the protect middleware and check is_staff in each handler
// (simpler than a separate isAdmin middleware for this scale)

function adminOnly(req, res, next) {
  if (!req.user?.is_staff) return res.status(403).json({ detail: 'Admin access required.' });
  next();
}

router.use(protect, adminOnly);

router.get('/stats',             ctrl.getStats);
router.get('/users',             ctrl.listUsers);
router.patch('/users/:id',       ctrl.updateUser);
router.get('/events',            ctrl.listAllEvents);
router.delete('/events/:id',     ctrl.deleteEvent);
router.get('/registrations',     ctrl.listRegistrations);
router.get('/categories',        ctrl.listCategories);
router.get('/pending-events',    ctrl.listPendingEvents);
router.patch('/events/:id/approve', ctrl.approveEvent);
router.patch('/events/:id/reject',  ctrl.rejectEvent);

module.exports = router;
