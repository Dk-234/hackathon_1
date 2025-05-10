import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import CategoryNews from './pages/CategoryNews';
import SearchResults from './pages/SearchResults';
import ResetPassword from './pages/ResetPassword';
import './App.css';

function App() {
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    return savedTheme ? savedTheme : 'light';
  });

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
  };

  useEffect(() => {
    document.body.className = theme;

    // Add global image error handler
    const handleImageErrors = () => {
      const images = document.querySelectorAll('img');
      images.forEach((img) => {
        if (!img.complete || img.naturalWidth === 0) {
          img.style.display = 'none';
        }
      });
    };

    window.addEventListener(
      'error',
      function (e) {
        if (e.target.tagName.toLowerCase() === 'img') {
          e.target.style.display = 'none';
        }
      },
      true
    );

    return () => {
      window.removeEventListener('error', handleImageErrors, true);
    };
  }, [theme]);

  return (
    <Router>
      <div className={`App ${theme}-theme`}>
        <Navbar theme={theme} toggleTheme={toggleTheme} />
        <div className="container mt-4">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/category/:category" element={<CategoryNews />} />
            <Route path="/search" element={<SearchResults />} />
            <Route path="/reset-password/:resetToken" element={<ResetPassword />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
