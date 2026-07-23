const router = require('express').Router();
const protect = require('../middleware/auth');
const ctrl = require('../controllers/auth.controller');

router.post('/register', ctrl.register);
router.post('/login', ctrl.login);
router.post('/token/refresh', ctrl.refreshToken);
router.get('/profile', protect, ctrl.getProfile);
router.patch('/profile', protect, ctrl.updateProfile);
router.post('/change-password', protect, ctrl.changePassword);

module.exports = router;
