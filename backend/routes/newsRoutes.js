const express = require('express');
const router = express.Router();
const {
  getTopHeadlines,
  getNewsByCategory,
  searchNews,
  getNewsVideos
} = require('../controllers/newsController');

router.get('/', getTopHeadlines);
router.get('/videos', getNewsVideos);
router.get('/category/:category', getNewsByCategory);
router.get('/search', searchNews);

module.exports = router;
