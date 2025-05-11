const axios = require('axios');
const News = require('../models/News');

// Simple in-memory cache
const cache = {
  data: {},
  timestamps: {},
  // Cache duration in milliseconds (1 hour)
  duration: 60 * 60 * 1000
};

// Helper to get data with caching
const fetchWithCache = async (url, cacheKey) => {
  // Check if we have cached data and it's still valid
  if (cache.data[cacheKey] && cache.timestamps[cacheKey]) {
    const now = Date.now();
    const cacheTime = cache.timestamps[cacheKey];
    
    if (now - cacheTime < cache.duration) {
      console.log(`Using cached data for ${cacheKey}`);
      return cache.data[cacheKey];
    }
  }
  
  try {
    console.log(`Fetching fresh data for ${cacheKey}`);
    const response = await axios.get(url);
    
    // Save to cache
    cache.data[cacheKey] = response.data;
    cache.timestamps[cacheKey] = Date.now();
    
    return response.data;
  } catch (error) {
    console.error(`Error fetching data for ${cacheKey}:`, error.message);
    
    // If we have stale cache, return it as fallback
    if (cache.data[cacheKey]) {
      console.log(`Using stale cache for ${cacheKey} due to error`);
      return cache.data[cacheKey];
    }
    
    throw error;
  }
};

// Gnews.io API as an alternative to News API
const getGnewsHeadlines = async () => {
  const apiKey = 'c73c5134a7b20fa87fd7d32a74a07b34'; // Demo key for Gnews.io
  const url = `https://gnews.io/api/v4/top-headlines?country=us&token=${apiKey}`;
  
  const response = await axios.get(url);
  return response.data;
};

// @desc    Fetch top headlines
// @route   GET /api/news
// @access  Public
const getTopHeadlines = async (req, res) => {
  try {
    let articles = [];
    
    try {
      // Try News API first
      const apiUrl = `https://newsapi.org/v2/top-headlines?country=us&apiKey=${process.env.NEWS_API_KEY}`;
      const responseData = await fetchWithCache(apiUrl, 'top-headlines');
      articles = responseData.articles;
    } catch (newsApiError) {
      console.log('News API error, trying Gnews API instead');
      // If News API fails, try Gnews API
      const gnewsData = await getGnewsHeadlines();
      articles = gnewsData.articles.map(article => ({
        ...article,
        urlToImage: article.image,
        publishedAt: article.publishedAt,
        source: { name: article.source.name }
      }));
    }
    
    // Get existing articles from the database
    const existingArticles = await News.find({ category: 'general' })
      .sort({ publishedAt: -1 })
      .limit(articles.length);
    
    // If we have API data, save and return it
    if (articles && articles.length > 0) {
      const savedArticles = [];
      
      for (const article of articles) {
        try {
          // Check if article already exists
          const existingArticle = await News.findOne({ 
            title: article.title,
            'source.name': article.source.name
          });
          
          if (!existingArticle) {
            const newArticle = await News.create({
              title: article.title || 'No Title',
              description: article.description || '',
              content: article.content || '',
              url: article.url,
              urlToImage: article.urlToImage || '',
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
        }
      }
      
      return res.status(200).json(savedArticles);
    }
    
    // If we have existing articles in the database, return those
    if (existingArticles.length > 0) {
      return res.status(200).json(existingArticles);
    }
    
    // If all else fails
    return res.status(500).json({ message: 'Failed to fetch news from any source' });
    
  } catch (error) {
    console.error('Error fetching top headlines:', error);
    
    // Try to get news from database as fallback
    try {
      const cachedNews = await News.find({ category: 'general' })
                            .sort({ publishedAt: -1 })
                            .limit(10);
                            
      if (cachedNews.length > 0) {
        return res.status(200).json(cachedNews);
      }
    } catch (dbError) {
      console.error('Database fallback error:', dbError);
    }
    
    res.status(500).json({ 
      message: 'Failed to fetch news. API rate limit may have been reached.',
      error: error.message 
    });
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

    if (recentNews.length > 5) {
      return res.status(200).json(recentNews);
    }

    let articles = [];
    
    try {
      // Try News API first
      const apiUrl = `https://newsapi.org/v2/top-headlines?country=us&category=${category}&apiKey=${process.env.NEWS_API_KEY}`;
      const responseData = await fetchWithCache(apiUrl, `category-${category}`);
      articles = responseData.articles;
    } catch (newsApiError) {
      console.log(`News API error for ${category}, trying Gnews API instead`);
      // If News API fails, try Gnews API (with topic as category)
      const gnewsApiKey = 'c73c5134a7b20fa87fd7d32a74a07b34'; // Demo key
      let topic = category;
      // Map to supported topics in Gnews
      if (category === 'entertainment') topic = 'entertainment';
      if (category === 'business') topic = 'business';
      if (category === 'sports') topic = 'sports';
      if (category === 'technology') topic = 'technology';
      if (category === 'health') topic = 'health';
      if (category === 'science') topic = 'science';
      
      const gnewsUrl = `https://gnews.io/api/v4/top-headlines?topic=${topic}&token=${gnewsApiKey}`;
      const gnewsData = await axios.get(gnewsUrl);
      
      articles = gnewsData.data.articles.map(article => ({
        ...article,
        urlToImage: article.image,
        publishedAt: article.publishedAt,
        source: { name: article.source.name }
      }));
    }
    
    if (articles && articles.length > 0) {
      const savedArticles = [];
      
      for (const article of articles) {
        try {
          // Check if article already exists
          const existingArticle = await News.findOne({ 
            title: article.title,
            'source.name': article.source.name
          });
          
          if (!existingArticle) {
            const newArticle = await News.create({
              title: article.title || 'No Title',
              description: article.description || '',
              content: article.content || '',
              url: article.url,
              urlToImage: article.urlToImage || '',
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
        }
      }
      
      return res.status(200).json(savedArticles);
    }
    
    // If we have any news in this category, return it (even if older than 24 hours)
    const anyNews = await News.find({ category })
      .sort({ publishedAt: -1 })
      .limit(10);
      
    if (anyNews.length > 0) {
      return res.status(200).json(anyNews);
    }
    
    return res.status(500).json({ message: `Failed to fetch ${category} news from any source` });
    
  } catch (error) {
    console.error('Error fetching news by category:', error);
    
    // Try to get news from database as fallback
    try {
      const cachedNews = await News.find({ category })
                            .sort({ publishedAt: -1 })
                            .limit(10);
                            
      if (cachedNews.length > 0) {
        return res.status(200).json(cachedNews);
      }
    } catch (dbError) {
      console.error('Database fallback error:', dbError);
    }
    
    res.status(500).json({ 
      message: 'Failed to fetch news. API rate limit may have been reached.',
      error: error.message 
    });
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
    let articles = [];
    
    try {
      // Try News API first
      const apiUrl = `https://newsapi.org/v2/everything?q=${q}&apiKey=${process.env.NEWS_API_KEY}`;
      const responseData = await fetchWithCache(apiUrl, `search-${q}`);
      articles = responseData.articles;
    } catch (newsApiError) {
      console.log(`News API search error for "${q}", trying Gnews API`);
      // If News API fails, try Gnews API
      const gnewsApiKey = 'c73c5134a7b20fa87fd7d32a74a07b34'; // Demo key
      const gnewsUrl = `https://gnews.io/api/v4/search?q=${q}&token=${gnewsApiKey}`;
      const gnewsData = await axios.get(gnewsUrl);
      
      articles = gnewsData.data.articles.map(article => ({
        ...article,
        urlToImage: article.image,
        publishedAt: article.publishedAt,
        source: { name: article.source.name }
      }));
    }
    
    res.status(200).json(articles);
  } catch (error) {
    console.error('Error searching news:', error);
    res.status(500).json({ 
      message: 'Search failed. API issues encountered.',
      error: error.message 
    });
  }
};

// @desc    Fetch video news
// @route   GET /api/news/videos
// @access  Public
const getNewsVideos = async (req, res) => {
  try {
    let articles = [];
    
    try {
      // Try News API first
      const apiUrl = `https://newsapi.org/v2/everything?q=video&sortBy=publishedAt&pageSize=10&apiKey=${process.env.NEWS_API_KEY}`;
      const responseData = await fetchWithCache(apiUrl, 'video-news');
      articles = responseData.articles;
    } catch (newsApiError) {
      console.log('News API video search error, trying Gnews API');
      // If News API fails, try Gnews API
      const gnewsApiKey = 'c73c5134a7b20fa87fd7d32a74a07b34'; // Demo key
      const gnewsUrl = `https://gnews.io/api/v4/search?q=video&token=${gnewsApiKey}&max=10`;
      const gnewsData = await axios.get(gnewsUrl);
      
      articles = gnewsData.data.articles.map(article => ({
        ...article,
        urlToImage: article.image,
        publishedAt: article.publishedAt,
        source: { name: article.source.name }
      }));
    }
    
    // Filter results to articles that likely have videos
    const videoArticles = articles.filter(article => {
      const title = article.title?.toLowerCase() || '';
      const description = article.description?.toLowerCase() || '';
      const content = article.content?.toLowerCase() || '';
      
      // Look for video-related keywords
      return (
        title.includes('video') || 
        title.includes('watch') || 
        description.includes('video') || 
        content.includes('video')
      );
    });
    
    // If no video-specific articles found, return the general ones
    const resultsToReturn = videoArticles.length > 0 ? videoArticles.slice(0, 5) : articles.slice(0, 5);
    res.status(200).json(resultsToReturn);
  } catch (error) {
    console.error('Error fetching video news:', error);
    res.status(500).json({ 
      message: 'Failed to fetch video news.',
      error: error.message 
    });
  }
};

module.exports = {
  getTopHeadlines,
  getNewsByCategory,
  searchNews,
  getNewsVideos
};
