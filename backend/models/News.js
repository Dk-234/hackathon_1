const mongoose = require('mongoose');

const newsSchema = mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: false, // Changed from required: true to required: false
      default: '',
    },
    content: {
      type: String,
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
    category: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('News', newsSchema);
