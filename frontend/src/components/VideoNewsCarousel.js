import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaPlay } from 'react-icons/fa';

const VideoNewsCarousel = () => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState(null);

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const { data } = await axios.get('/api/news/videos');
        setVideos(data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching videos:', error);
        setError('Failed to load video news');
        setLoading(false);
      }
    };

    fetchVideos();
  }, []);

  const handleVideoClick = (video) => {
    setSelectedVideo(video);
    setShowVideoModal(true);
  };

  const closeVideoModal = () => {
    setShowVideoModal(false);
    setSelectedVideo(null);
  };

  // Custom carousel controls
  const goToNextSlide = () => {
    setActiveIndex((prevIndex) => 
      prevIndex === videos.length - 1 ? 0 : prevIndex + 1
    );
  };

  const goToPrevSlide = () => {
    setActiveIndex((prevIndex) => 
      prevIndex === 0 ? videos.length - 1 : prevIndex - 1
    );
  };

  // Auto-advance carousel
  useEffect(() => {
    if (!videos.length) return;
    
    const interval = setInterval(() => {
      goToNextSlide();
    }, 5000);
    
    return () => clearInterval(interval);
  }, [activeIndex, videos.length]);

  // Extract YouTube video ID from URL
  const getYoutubeId = (url) => {
    if (!url) return null;
    
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    
    return (match && match[2].length === 11) ? match[2] : null;
  };

  // Generate thumbnail URL
  const getVideoThumbnail = (video) => {
    // Try to extract YouTube ID first
    const youtubeId = getYoutubeId(video.url);
    if (youtubeId) {
      return `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`;
    }
    
    // Fall back to article image or default
    return video.urlToImage || 'https://placehold.co/800x450?text=Video+News';
  };

  if (loading) {
    return (
      <div className="video-carousel-container my-4">
        <h2 className="mb-3">Latest Video News</h2>
        <div className="d-flex justify-content-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="video-carousel-container my-4">
        <h2 className="mb-3">Latest Video News</h2>
        <div className="alert alert-danger">{error}</div>
      </div>
    );
  }

  if (videos.length === 0) {
    return (
      <div className="video-carousel-container my-4">
        <h2 className="mb-3">Latest Video News</h2>
        <div className="alert alert-info">No video news available right now.</div>
      </div>
    );
  }

  return (
    <div className="video-carousel-container my-4">
      <h2 className="mb-3">Latest Video News</h2>
      
      <div className="custom-carousel">
        <div className="carousel-inner">
          {videos.map((video, index) => (
            <div 
              key={index} 
              className={`carousel-item ${index === activeIndex ? 'active' : ''}`}
            >
              <div 
                className="video-item position-relative" 
                onClick={() => handleVideoClick(video)}
                style={{ cursor: 'pointer' }}
              >
                <img
                  className="d-block w-100"
                  src={getVideoThumbnail(video)}
                  alt={video.title}
                  style={{ height: '400px', objectFit: 'cover', borderRadius: '8px' }}
                />
                <div className="play-button-overlay position-absolute top-50 start-50 translate-middle">
                  <FaPlay size={50} color="white" />
                </div>
                <div className="carousel-caption position-absolute bottom-0 start-0 w-100 p-3 text-start">
                  <h3>{video.title}</h3>
                  <p>{video.source?.name || 'Unknown'} • {new Date(video.publishedAt).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <button 
          className="carousel-control-prev" 
          type="button" 
          onClick={goToPrevSlide}
        >
          <span className="carousel-control-prev-icon" aria-hidden="true"></span>
          <span className="visually-hidden">Previous</span>
        </button>
        
        <button 
          className="carousel-control-next" 
          type="button" 
          onClick={goToNextSlide}
        >
          <span className="carousel-control-next-icon" aria-hidden="true"></span>
          <span className="visually-hidden">Next</span>
        </button>
        
        <div className="carousel-indicators">
          {videos.map((_, index) => (
            <button
              key={index}
              type="button"
              className={index === activeIndex ? 'active' : ''}
              onClick={() => setActiveIndex(index)}
              aria-label={`Slide ${index + 1}`}
            ></button>
          ))}
        </div>
      </div>

      {/* Video Modal */}
      {showVideoModal && selectedVideo && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.8)' }} tabIndex="-1">
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content bg-dark text-light">
              <div className="modal-header border-secondary">
                <h5 className="modal-title">{selectedVideo.title}</h5>
                <button type="button" className="btn-close btn-close-white" onClick={closeVideoModal}></button>
              </div>
              <div className="modal-body p-0">
                {getYoutubeId(selectedVideo.url) ? (
                  <div className="ratio ratio-16x9">
                    <iframe
                      src={`https://www.youtube.com/embed/${getYoutubeId(selectedVideo.url)}?autoplay=1&mute=1`}
                      title={selectedVideo.title}
                      allowFullScreen
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    ></iframe>
                  </div>
                ) : (
                  <div className="text-center p-5">
                    <p>Video content is available at the original source.</p>
                    <a 
                      href={selectedVideo.url} 
                      className="btn btn-primary" 
                      target="_blank" 
                      rel="noopener noreferrer"
                    >
                      Watch on Original Site
                    </a>
                  </div>
                )}
                {getYoutubeId(selectedVideo.url) && (
                  <div className="text-center p-2 bg-dark">
                    <small className="text-muted">
                      Video autoplays muted. Click on the video player's volume control to unmute.
                    </small>
                  </div>
                )}
              </div>
              <div className="modal-footer border-secondary">
                <p className="small text-muted me-auto">
                  Source: {selectedVideo.source?.name || 'Unknown'} • {new Date(selectedVideo.publishedAt).toLocaleDateString()}
                </p>
                <button type="button" className="btn btn-secondary" onClick={closeVideoModal}>
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoNewsCarousel;
