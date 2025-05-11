const Bookmark = require('../models/Bookmark');

// @desc    Add a bookmark
// @route   POST /api/bookmarks
// @access  Private
const addBookmark = async (req, res) => {
  try {
    const { article } = req.body;
    const userId = req.user.id;

    if (!article || !article.url) {
      return res.status(400).json({ message: 'Invalid article data' });
    }

    // Check if bookmark already exists
    const existingBookmark = await Bookmark.findOne({
      user: userId.toString(),
      'article.url': article.url
    });

    if (existingBookmark) {
      return res.status(400).json({ message: 'Article already bookmarked' });
    }

    // Create bookmark
    const bookmark = await Bookmark.create({
      user: userId.toString(),
      article: {
        title: article.title,
        description: article.description || '',
        url: article.url,
        urlToImage: article.urlToImage || '',
        publishedAt: article.publishedAt || new Date(),
        source: {
          id: article.source?.id || '',
          name: article.source?.name || 'Unknown Source'
        }
      }
    });

    res.status(201).json(bookmark);
  } catch (error) {
    console.error('Add bookmark error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get user bookmarks
// @route   GET /api/bookmarks
// @access  Private
const getBookmarks = async (req, res) => {
  try {
    const bookmarks = await Bookmark.find({ user: req.user.id.toString() })
      .sort({ createdAt: -1 });

    res.status(200).json(bookmarks);
  } catch (error) {
    console.error('Get bookmarks error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete bookmark
// @route   DELETE /api/bookmarks/:id
// @access  Private
const deleteBookmark = async (req, res) => {
  try {
    const bookmark = await Bookmark.findById(req.params.id);

    if (!bookmark) {
      return res.status(404).json({ message: 'Bookmark not found' });
    }

    // Check if user owns the bookmark
    if (bookmark.user !== req.user.id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    await bookmark.deleteOne();

    res.status(200).json({ id: req.params.id });
  } catch (error) {
    console.error('Delete bookmark error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  addBookmark,
  getBookmarks,
  deleteBookmark
};
