import React, { useState } from 'react';

const NewsCard = ({ article }) => {
  // Use a local state to track image loading errors
  const [imageError, setImageError] = useState(false);
  
  // Format the date
  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown date';
    try {
      const options = { year: 'numeric', month: 'long', day: 'numeric' };
      return new Date(dateString).toLocaleDateString(undefined, options);
    } catch (error) {
      return 'Invalid date';
    }
  };

  // Use a more reliable default image hosted on a CDN
  const defaultImage = 'https://placehold.co/300x200?text=No+Image';

  if (!article) {
    return <div className="card h-100 p-3">No article data available</div>;
  }

  return (
    <div className="card h-100">
      {!imageError ? (
        <img 
          src={article.urlToImage || defaultImage} 
          className="card-img-top" 
          alt={article.title || 'News article'}
          onError={(e) => {
            setImageError(true);
          }}
          style={{ height: '200px', objectFit: 'cover' }}
        />
      ) : (
        <div 
          className="card-img-top d-flex justify-content-center align-items-center bg-light text-secondary"
          style={{ height: '200px' }}
        >
          Image Not Available
        </div>
      )}
      <div className="card-body">
        <h5 className="card-title">{article.title || 'No Title'}</h5>
        <p className="card-text text-secondary">
          {article.source?.name || 'Unknown Source'} • {formatDate(article.publishedAt)}
        </p>
        <p className="card-text">{article.description || 'No description available.'}</p>
      </div>
      <div className="card-footer bg-transparent border-top-0">
        <a 
          href={article.url} 
          className="btn btn-primary w-100" 
          target="_blank" 
          rel="noopener noreferrer"
          onClick={(e) => {
            if (!article.url) {
              e.preventDefault();
              alert('No article URL available');
            }
          }}
        >
          Read Full Article
        </a>
      </div>
    </div>
  );
};

export default NewsCard;
