import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

// Define global callback for reCAPTCHA
window.onCaptchaChange = function(token) {
  // Create a custom event to notify React components
  const event = new CustomEvent('recaptchaVerified', { detail: { token } });
  document.dispatchEvent(event);
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
