import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import NewsCard from '../components/NewsCard';

const CategoryNews = () => {
  const { category } = useParams();
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Format category name for display
  const formatCategoryName = (name) => {
    return name.charAt(0).toUpperCase() + name.slice(1);
  };

  useEffect(() => {
    const fetchCategoryNews = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/api/news/category/${category}`);
        setNews(response.data);
        setLoading(false);
      } catch (error) {
        setError('Failed to fetch news');
        setLoading(false);
        console.error('Error fetching category news:', error);
      }
    };

    fetchCategoryNews();
  }, [category]);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger" role="alert">
        {error}
      </div>
    );
  }

  return (
    <div className="category-page">
      <h1 className="mb-4">{formatCategoryName(category)} News</h1>
      
      {news.length === 0 ? (
        <p>No articles found for this category.</p>
      ) : (
        <div className="row">
          {news.map((article, index) => (
            <div className="col-md-4 mb-4" key={index}>
              <NewsCard article={article} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CategoryNews;
