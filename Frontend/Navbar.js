 import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaSun, FaMoon, FaSearch, FaSignInAlt, FaSignOutAlt, FaUser, FaBookmark } from 'react-icons/fa';

const Navbar = ({ theme, toggleTheme }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  
  // Get user from localStorage
  const user = JSON.parse(localStorage.getItem('user'));

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${searchQuery}`);
      setSearchQuery('');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/');
  };

  const newsCategories = [
    { name: 'General', path: '/' },
    { name: 'Business', path: '/category/business' },
    { name: 'Technology', path: '/category/technology' },
    { name: 'Sports', path: '/category/sports' },
    { name: 'Entertainment', path: '/category/entertainment' },
    { name: 'Health', path: '/category/health' },
    { name: 'Science', path: '/category/science' }
  ];

  return (
    <nav className="navbar navbar-expand-lg">
      <div className="container">
        <Link className="navbar-brand" to="/">
          NewsHub
        </Link>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarSupportedContent"
          aria-controls="navbarSupportedContent"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarSupportedContent">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            {newsCategories.map((category, index) => (
              <li className="nav-item" key={index}>
                <Link className="nav-link" to={category.path}>
                  {category.name}
                </Link>
              </li>
            ))}
          </ul>
          
          <form className="d-flex mx-3" onSubmit={handleSearchSubmit}>
            <div className="input-group">
              <input
                type="search"
                className="form-control"
                placeholder="Search news..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button className="btn btn-outline-primary" type="submit">
                <FaSearch />
              </button>
            </div>
          </form>
          
          <button
            className="btn-theme-toggle mx-2"
            onClick={toggleTheme}
            title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
          >
            {theme === 'light' ? <FaMoon /> : <FaSun />}
          </button>
          
          <ul className="navbar-nav">
            {user ? (
              <>
                <li className="nav-item">
                  <Link className="nav-link" to="/bookmarks">
                    <FaBookmark /> Bookmarks
                  </Link>
                </li>
                <li className="nav-item">
                  <span className="nav-link">Welcome, {user.username}</span>
                </li>
                <li className="nav-item">
                  <button className="btn btn-link nav-link" onClick={handleLogout}>
                    <FaSignOutAlt /> Logout
                  </button>
                </li>
              </>
            ) : (
              <>
                <li className="nav-item">
                  <Link className="nav-link" to="/login">
                    <FaSignInAlt /> Login
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/register">
                    <FaUser /> Register
                  </Link>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
