const express = require('express');
const router = express.Router();
const { shareViaEmail } = require('../controllers/shareController');
const { protect } = require('../middleware/authMiddleware');

// All routes are protected - require login
router.use(protect);

router.post('/email', shareViaEmail);

module.exports = router;
