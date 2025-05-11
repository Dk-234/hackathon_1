import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaBookmark, FaShareAlt, FaCheck } from 'react-icons/fa';
import ShareModal from './ShareModal';

const NewsCard = ({ article, showBookmarkButton = true }) => {
  const [imageError, setImageError] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [bookmarkLoading, setBookmarkLoading] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  
  const navigate = useNavigate();
  
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

  const defaultImage = 'https://placehold.co/300x200?text=No+Image';

  const handleBookmark = async () => {
    const user = JSON.parse(localStorage.getItem('user'));
    
    if (!user) {
      navigate('/login');
      return;
    }
    
    setBookmarkLoading(true);
    
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`
        }
      };
      
      await axios.post('/api/bookmarks', { article }, config);
      setIsBookmarked(true);
      setBookmarkLoading(false);
    } catch (error) {
      console.error('Bookmark error:', error);
      setBookmarkLoading(false);
      
      if (error.response?.data?.tokenExpired) {
        localStorage.removeItem('user');
        alert('Your session has expired. Please login again.');
        navigate('/login');
        return;
      }
      
      if (error.response?.status === 400 && error.response?.data?.message === 'Article already bookmarked') {
        setIsBookmarked(true);
      }
    }
  };
  
  const handleShare = () => {
    const user = JSON.parse(localStorage.getItem('user'));
    
    if (!user) {
      navigate('/login');
      return;
    }
    
    setShowShareModal(true);
  };

  if (!article) {
    return <div className="card h-100 p-3">No article data available</div>;
  }

  return (
    <>
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
        <div className="card-footer bg-transparent">
          <div className="d-flex justify-content-between align-items-center">
            <a href={article.url} className="btn btn-primary" target="_blank" rel="noopener noreferrer">
              Read Full Article
            </a>
            <div>
              {showBookmarkButton && (
                <button 
                  className={`btn btn-sm ${isBookmarked ? 'btn-success' : 'btn-outline-primary'} me-2`}
                  onClick={handleBookmark}
                  disabled={bookmarkLoading || isBookmarked}
                  title={isBookmarked ? 'Bookmarked' : 'Bookmark for later'}
                >
                  {isBookmarked ? <FaCheck /> : <FaBookmark />}
                </button>
              )}
              <button 
                className="btn btn-sm btn-outline-secondary"
                onClick={handleShare}
                title="Share this article"
              >
                <FaShareAlt />
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {showShareModal && (
        <ShareModal 
          article={article}
          onClose={() => setShowShareModal(false)}
        />
      )}
    </>
  );
};

export default NewsCard;
