const axios = require('axios');
const News = require('../models/News');

// Helper to validate image URL
const isValidImageUrl = (url) => {
  if (!url) return false;
  
  // Check if URL is from common domains that might have CORS issues
  const problematicDomains = [
    'bbci.co.uk',
    'brightspotcdn.com',
    'espncdn.com',
    'via.placeholder.com'
  ];
  
  const lowerUrl = url.toLowerCase();
  return !problematicDomains.some(domain => lowerUrl.includes(domain));
};

// @desc    Fetch top headlines
// @route   GET /api/news
// @access  Public
const getTopHeadlines = async (req, res) => {
  try {
    const response = await axios.get(
      `https://newsapi.org/v2/top-headlines?country=us&apiKey=${process.env.NEWS_API_KEY}`
    );
    
    // Save news to MongoDB and return
    const articles = response.data.articles;
    const savedArticles = [];
    
    for (const article of articles) {
      try {
        // Check if article already exists
        const existingArticle = await News.findOne({ 
          title: article.title,
          source: { name: article.source.name }
        });
        
        if (!existingArticle) {
          // Sanitize the image URL
          const urlToImage = isValidImageUrl(article.urlToImage) ? article.urlToImage : '';
          
          const newArticle = await News.create({
            title: article.title || 'No Title',
            description: article.description || '',
            content: article.content || '',
            url: article.url,
            urlToImage: urlToImage,
            publishedAt: article.publishedAt || new Date(),
            source: {
              id: article.source?.id || '',
              name: article.source?.name || 'Unknown Source'
            },
            category: 'general'
          });
          savedArticles.push(newArticle);
        } else {
          savedArticles.push(existingArticle);
        }
      } catch (articleError) {
        console.error('Error saving individual article:', articleError);
        // Continue with the next article instead of failing the entire request
      }
    }
    
    res.status(200).json(savedArticles);
  } catch (error) {
    console.error('Error fetching top headlines:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Fetch news by category
// @route   GET /api/news/category/:category
// @access  Public
const getNewsByCategory = async (req, res) => {
  const { category } = req.params;

  try {
    // First check if we have recent news in this category
    const recentNews = await News.find({ 
      category,
      publishedAt: { $gte: new Date(Date.now() - 24*60*60*1000) } // Last 24 hours
    }).sort({ publishedAt: -1 });

    if (recentNews.length > 10) {
      return res.status(200).json(recentNews);
    }

    // If not enough recent news, fetch from API
    const response = await axios.get(
      `https://newsapi.org/v2/top-headlines?country=us&category=${category}&apiKey=${process.env.NEWS_API_KEY}`
    );
    
    const articles = response.data.articles;
    const savedArticles = [];
    
    for (const article of articles) {
      try {
        const existingArticle = await News.findOne({ 
          title: article.title,
          source: { name: article.source.name }
        });
        
        if (!existingArticle) {
          // Sanitize the image URL
          const urlToImage = isValidImageUrl(article.urlToImage) ? article.urlToImage : '';
          
          const newArticle = await News.create({
            title: article.title || 'No Title',
            description: article.description || '',
            content: article.content || '',
            url: article.url,
            urlToImage: urlToImage,
            publishedAt: article.publishedAt || new Date(),
            source: {
              id: article.source?.id || '',
              name: article.source?.name || 'Unknown Source'
            },
            category
          });
          savedArticles.push(newArticle);
        } else {
          savedArticles.push(existingArticle);
        }
      } catch (articleError) {
        console.error('Error saving individual article:', articleError);
        // Continue with the next article
      }
    }
    
    res.status(200).json(savedArticles);
  } catch (error) {
    console.error('Error fetching news by category:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Search news
// @route   GET /api/news/search
// @access  Public
const searchNews = async (req, res) => {
  const { q } = req.query;

  if (!q) {
    return res.status(400).json({ message: 'Please provide a search query' });
  }

  try {
    const response = await axios.get(
      `https://newsapi.org/v2/everything?q=${q}&apiKey=${process.env.NEWS_API_KEY}`
    );
    
    // Process the articles to filter out problematic image URLs
    const processedArticles = response.data.articles.map(article => ({
      ...article,
      urlToImage: isValidImageUrl(article.urlToImage) ? article.urlToImage : null
    }));
    
    // Return processed search results
    res.status(200).json(processedArticles);
  } catch (error) {
    console.error('Error searching news:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  getTopHeadlines,
  getNewsByCategory,
  searchNews,
};
