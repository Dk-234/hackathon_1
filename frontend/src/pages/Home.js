import React, { useState, useEffect } from 'react';
import axios from 'axios';
import NewsWidget from '../components/NewsWidget';
import VideoNewsCarousel from '../components/VideoNewsCarousel';
import WeatherForecast from '../components/WeatherForecast';

const Home = () => {
  const [topNews, setTopNews] = useState([]);
  const [businessNews, setBusinessNews] = useState([]);
  const [techNews, setTechNews] = useState([]);
  const [sportsNews, setSportsNews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        // Fetch top headlines
        const topResponse = await axios.get('/api/news');
        setTopNews(topResponse.data);

        // Fetch business news
        const businessResponse = await axios.get('/api/news/category/business');
        setBusinessNews(businessResponse.data);

        // Fetch technology news
        const techResponse = await axios.get('/api/news/category/technology');
        setTechNews(techResponse.data);

        // Fetch sports news
        const sportsResponse = await axios.get('/api/news/category/sports');
        setSportsNews(sportsResponse.data);

        setLoading(false);
      } catch (error) {
        console.error('Error fetching news:', error);
        setLoading(false);
      }
    };

    fetchNews();
  }, []);

  return (
    <div className="home-page">
      <h1 className="mb-4">Latest News</h1>
      
      <WeatherForecast />
      <VideoNewsCarousel />
      
      <NewsWidget 
        title="Top Headlines" 
        articles={topNews} 
        loading={loading} 
      />
      
      <NewsWidget 
        title="Business" 
        articles={businessNews} 
        category="business" 
        loading={loading} 
      />
      
      <NewsWidget 
        title="Technology" 
        articles={techNews} 
        category="technology" 
        loading={loading} 
      />
      
      <NewsWidget 
        title="Sports" 
        articles={sportsNews} 
        category="sports" 
        loading={loading} 
      />
    </div>
  );
};

export default Home;
