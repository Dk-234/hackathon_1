import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import NewsCard from '../components/NewsCard';
import useAuthCheck from '../components/AuthCheck';

const Bookmarks = () => {
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const navigate = useNavigate();
  const { checkAuth, getAuthHeaders } = useAuthCheck();
  
  useEffect(() => {
    const fetchBookmarks = async () => {
      if (!checkAuth()) {
        navigate('/login');
        return;
      }
      
      try {
        const config = {
          headers: getAuthHeaders()
        };
        
        const { data } = await axios.get('/api/bookmarks', config);
        setBookmarks(data);
        setLoading(false);
      } catch (error) {
        console.error('Bookmark fetch error:', error);
        setError('Failed to fetch bookmarks');
        setLoading(false);
      }
    };
    
    fetchBookmarks();
  }, [navigate, checkAuth, getAuthHeaders]);
  
  const removeBookmark = async (id) => {
    if (!window.confirm('Are you sure you want to remove this bookmark?')) {
      return;
    }
    
    const user = JSON.parse(localStorage.getItem('user'));
    
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`
        }
      };
      
      await axios.delete(`/api/bookmarks/${id}`, config);
      setBookmarks(bookmarks.filter(bookmark => bookmark._id !== id));
    } catch (error) {
      setError('Failed to remove bookmark');
      console.error(error);
    }
  };
  
  if (loading) {
    return (
      <div className="d-flex justify-content-center mt-5">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }
  
  return (
    <div className="bookmarks-page">
      <h1 className="mb-4">My Bookmarks</h1>
      
      {error && <div className="alert alert-danger">{error}</div>}
      
      {bookmarks.length === 0 ? (
        <div className="text-center my-5">
          <p>You haven't bookmarked any articles yet.</p>
          <Link to="/" className="btn btn-primary">
            Browse News
          </Link>
        </div>
      ) : (
        <div className="row">
          {bookmarks.map(bookmark => (
            <div className="col-md-4 mb-4" key={bookmark._id}>
              <div className="position-relative">
                <NewsCard 
                  article={bookmark.article} 
                  showBookmarkButton={false}
                />
                <button 
                  className="btn btn-sm btn-danger position-absolute top-0 end-0 m-2"
                  onClick={() => removeBookmark(bookmark._id)}
                  title="Remove Bookmark"
                >
                  <i className="fas fa-trash"></i> Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Bookmarks;
