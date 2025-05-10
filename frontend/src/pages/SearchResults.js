import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import NewsCard from '../components/NewsCard';

const SearchResults = () => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const query = searchParams.get('q');
  
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchSearchResults = async () => {
      if (!query) return;

      try {
        setLoading(true);
        const response = await axios.get(`/api/news/search?q=${query}`);
        setResults(response.data);
        setLoading(false);
      } catch (error) {
        setError('Failed to fetch search results');
        setLoading(false);
        console.error('Error searching news:', error);
      }
    };

    fetchSearchResults();
  }, [query]);

  if (!query) {
    return (
      <div className="alert alert-info" role="alert">
        Please enter a search query.
      </div>
    );
  }

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
    <div className="search-results-page">
      <h1 className="mb-4">Search Results for "{query}"</h1>
      
      {results.length === 0 ? (
        <p>No results found for your search.</p>
      ) : (
        <>
          <p>{results.length} results found</p>
          <div className="row">
            {results.map((article, index) => (
              <div className="col-md-4 mb-4" key={index}>
                <NewsCard article={article} />
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default SearchResults;
