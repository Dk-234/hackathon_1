const mongoose = require('mongoose');

const bookmarkSchema = mongoose.Schema(
  {
    user: {
      type: String,
      required: true,
      // Store MySQL user ID
    },
    article: {
      title: {
        type: String,
        required: true,
      },
      description: {
        type: String,
        default: '',
      },
      url: {
        type: String,
        required: true,
      },
      urlToImage: {
        type: String,
      },
      publishedAt: {
        type: Date,
        required: true,
      },
      source: {
        id: {
          type: String,
        },
        name: {
          type: String,
          required: true,
        },
      },
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to prevent duplicate bookmarks
bookmarkSchema.index({ user: 1, 'article.url': 1 }, { unique: true });

module.exports = mongoose.model('Bookmark', bookmarkSchema);
