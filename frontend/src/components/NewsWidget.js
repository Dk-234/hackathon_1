import React from 'react';
import { Link } from 'react-router-dom';
import NewsCard from './NewsCard';

const NewsWidget = ({ title, articles, category, loading }) => {
  if (loading) {
    return (
      <div className="news-widget">
        <h2>{title}</h2>
        <div className="d-flex justify-content-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!articles || articles.length === 0) {
    return (
      <div className="news-widget">
        <h2>{title}</h2>
        <p>No articles found.</p>
      </div>
    );
  }

  return (
    <div className="news-widget">
      <div className="d-flex justify-content-between align-items-center">
        <h2>{title}</h2>
        {category && (
          <Link to={`/category/${category}`} className="btn btn-outline-primary">
            View All
          </Link>
        )}
      </div>
      <div className="row">
        {articles.slice(0, 4).map((article, index) => (
          <div className="col-md-3 mb-4" key={index}>
            <NewsCard article={article} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default NewsWidget;
