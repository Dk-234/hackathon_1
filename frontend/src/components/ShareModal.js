import React, { useState } from 'react';
import axios from 'axios';
import { FaEnvelope, FaFacebook, FaTwitter, FaLinkedin, FaWhatsapp } from 'react-icons/fa';

const ShareModal = ({ article, onClose }) => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const handleEmailShare = async (e) => {
    e.preventDefault();
    
    if (!email) {
      setError('Please enter recipient email');
      return;
    }
    
    setLoading(true);
    setError('');
    setSuccess('');
    
    const user = JSON.parse(localStorage.getItem('user'));
    
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`
        }
      };
      
      await axios.post('/api/share/email', {
        article,
        recipientEmail: email,
        message
      }, config);
      
      setSuccess('Article shared successfully!');
      setEmail('');
      setMessage('');
      setLoading(false);
    } catch (error) {
      console.error('Email share error:', error);
      setError(error.response?.data?.message || 'Failed to share article');
      setLoading(false);
    }
  };
  
  const handleSocialShare = (platform) => {
    let shareUrl;
    const articleUrl = encodeURIComponent(article.url);
    const articleTitle = encodeURIComponent(article.title);
    
    switch (platform) {
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${articleUrl}`;
        break;
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?url=${articleUrl}&text=${articleTitle}`;
        break;
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${articleUrl}`;
        break;
      case 'whatsapp':
        shareUrl = `https://api.whatsapp.com/send?text=${articleTitle}%20${articleUrl}`;
        break;
      default:
        return;
    }
    
    window.open(shareUrl, '_blank', 'width=600,height=400');
  };
  
  return (
    <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Share Article</h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          <div className="modal-body">
            <h6>{article.title}</h6>
            
            {error && <div className="alert alert-danger">{error}</div>}
            {success && <div className="alert alert-success">{success}</div>}
            
            <div className="social-share-buttons my-3 d-flex justify-content-between">
              <button 
                className="btn btn-outline-primary" 
                onClick={() => handleSocialShare('facebook')}
                title="Share on Facebook"
              >
                <FaFacebook />
              </button>
              <button 
                className="btn btn-outline-info" 
                onClick={() => handleSocialShare('twitter')}
                title="Share on Twitter"
              >
                <FaTwitter />
              </button>
              <button 
                className="btn btn-outline-primary" 
                onClick={() => handleSocialShare('linkedin')}
                title="Share on LinkedIn"
              >
                <FaLinkedin />
              </button>
              <button 
                className="btn btn-outline-success" 
                onClick={() => handleSocialShare('whatsapp')}
                title="Share on WhatsApp"
              >
                <FaWhatsapp />
              </button>
            </div>
            
            <hr />
            
            <form onSubmit={handleEmailShare}>
              <div className="mb-3">
                <label htmlFor="recipientEmail" className="form-label">
                  <FaEnvelope className="me-2" />
                  Share via Email
                </label>
                <input
                  type="email"
                  className="form-control"
                  id="recipientEmail"
                  placeholder="recipient@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              
              <div className="mb-3">
                <label htmlFor="shareMessage" className="form-label">Personal Message (optional)</label>
                <textarea
                  className="form-control"
                  id="shareMessage"
                  rows="3"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Check out this interesting article I found!"
                ></textarea>
              </div>
              
              <button 
                type="submit" 
                className="btn btn-primary w-100"
                disabled={loading}
              >
                {loading ? 'Sending...' : 'Send Email'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShareModal;
