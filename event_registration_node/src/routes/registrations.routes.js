const router = require('express').Router();
const protect = require('../middleware/auth');
const isOrganizer = require('../middleware/isOrganizer');
const upload = require('../middleware/upload');
const eventsCtrl = require('../controllers/events.controller');
const registrationsCtrl = require('../controllers/registrations.controller');

// ── Organizer event management ───────────────────────────────────────────────
router.get('/organizer/events', protect, isOrganizer, eventsCtrl.listOrganizerEvents);
router.post('/organizer/events', protect, isOrganizer, eventsCtrl.createEvent);
router.get('/organizer/events/:id', protect, isOrganizer, eventsCtrl.getOrganizerEvent);
router.get('/organizer/events/:id/registrations', protect, isOrganizer, registrationsCtrl.getEventRegistrations);
router.put('/organizer/events/:id', protect, isOrganizer, eventsCtrl.updateEvent);
router.patch('/organizer/events/:id', protect, isOrganizer, eventsCtrl.updateEvent);
router.delete('/organizer/events/:id', protect, isOrganizer, eventsCtrl.deleteEvent);

// ── Organizer verification ────────────────────────────────────────────────────
router.get('/organizer/pending-verifications', protect, isOrganizer, registrationsCtrl.getPendingVerifications);
router.patch('/organizer/registrations/:id/verify', protect, isOrganizer, registrationsCtrl.verifyRegistration);

// ── User registrations ────────────────────────────────────────────────────────
router.get('/registrations', protect, registrationsCtrl.listMyRegistrations);
router.post('/registrations', protect, upload.single('payment_proof'), registrationsCtrl.registerForEvent);
router.patch('/registrations/:id/cancel', protect, registrationsCtrl.cancelRegistration);

module.exports = router;
