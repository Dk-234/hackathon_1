const express = require('express');
const router = express.Router();
const {
  addBookmark,
  getBookmarks,
  deleteBookmark
} = require('../controllers/bookmarkController');
const { protect } = require('../middleware/authMiddleware');

// All routes are protected - require login
router.use(protect);

router.route('/')
  .get(getBookmarks)
  .post(addBookmark);

router.route('/:id')
  .delete(deleteBookmark);

module.exports = router;
