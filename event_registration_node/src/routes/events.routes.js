const router = require('express').Router();
const ctrl = require('../controllers/events.controller');

// Public — no auth required
router.get('/', ctrl.listPublicEvents);
router.get('/:id', ctrl.getPublicEvent);

module.exports = router;
