import React, { useState, useEffect, useRef } from 'react';
import { FaSync } from 'react-icons/fa';

const SimpleCaptcha = ({ onChange }) => {
  const [captchaText, setCaptchaText] = useState('');
  const [userInput, setUserInput] = useState('');
  const [valid, setValid] = useState(false);
  const canvasRef = useRef(null);

  // Generate random captcha text
  const generateCaptcha = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
    let captcha = '';
    for (let i = 0; i < 6; i++) {
      captcha += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return captcha;
  };

  // Draw captcha on canvas
  const drawCaptcha = (text) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#f0f0f0';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Add noise (dots)
    for (let i = 0; i < 100; i++) {
      ctx.fillStyle = `rgba(${Math.random() * 255},${Math.random() * 255},${Math.random() * 255},0.2)`;
      ctx.fillRect(
        Math.random() * canvas.width,
        Math.random() * canvas.height,
        2,
        2
      );
    }
    
    // Add lines for more noise
    for (let i = 0; i < 4; i++) {
      ctx.strokeStyle = `rgba(${Math.random() * 255},${Math.random() * 255},${Math.random() * 255},0.5)`;
      ctx.beginPath();
      ctx.moveTo(Math.random() * canvas.width, Math.random() * canvas.height);
      ctx.lineTo(Math.random() * canvas.width, Math.random() * canvas.height);
      ctx.stroke();
    }
    
    // Draw captcha text
    ctx.fillStyle = '#333';
    ctx.font = 'bold 24px Arial';
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'center';
    
    // Draw each character with random rotation
    for (let i = 0; i < text.length; i++) {
      ctx.save();
      ctx.translate(20 + i * 25, canvas.height / 2);
      ctx.rotate((Math.random() - 0.5) * 0.4);
      ctx.fillText(text.charAt(i), 0, 0);
      ctx.restore();
    }
  };

  // Initialize and refresh captcha
  const refreshCaptcha = () => {
    const newCaptcha = generateCaptcha();
    setCaptchaText(newCaptcha);
    setUserInput('');
    setValid(false);
    
    // Notify parent component
    if (onChange) {
      onChange(false);
    }
  };

  // Check if user input matches captcha
  const verifyCaptcha = (value) => {
    setUserInput(value);
    const isValid = value === captchaText;
    setValid(isValid);
    
    // Notify parent component
    if (onChange) {
      onChange(isValid);
    }
  };

  // Initialize captcha on component mount
  useEffect(() => {
    refreshCaptcha();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Draw captcha whenever captchaText changes
  useEffect(() => {
    if (captchaText) {
      drawCaptcha(captchaText);
    }
  }, [captchaText]);

  return (
    <div className="captcha-container">
      <label className="form-label">Verify you're human</label>
      <div className="d-flex align-items-center mb-2">
        <canvas 
          ref={canvasRef} 
          width="180" 
          height="50" 
          className="captcha-canvas"
        ></canvas>
        <span 
          className="captcha-refresh" 
          onClick={refreshCaptcha}
          title="Refresh CAPTCHA"
        >
          <FaSync />
        </span>
      </div>
      <input
        type="text"
        className={`form-control ${userInput && (valid ? 'is-valid' : 'is-invalid')}`}
        placeholder="Enter the text above"
        value={userInput}
        onChange={(e) => verifyCaptcha(e.target.value)}
        autoComplete="off"
      />
      {userInput && !valid && (
        <div className="invalid-feedback">
          Incorrect CAPTCHA text. Please try again.
        </div>
      )}
    </div>
  );
};

export default SimpleCaptcha;
