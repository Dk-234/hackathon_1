import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import SimpleCaptcha from '../components/SimpleCaptcha';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [captchaVerified, setCaptchaVerified] = useState(false);

  const navigate = useNavigate();

  // Check if user is already logged in
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user) {
      navigate('/');
    }
  }, [navigate]);

  const { email, password } = formData;

  const onChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const onCaptchaChange = (isValid) => {
    setCaptchaVerified(isValid);
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!captchaVerified) {
      setError('Please complete the CAPTCHA verification');
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post('/api/users/login', {
        email,
        password
      });

      // Save user to localStorage
      localStorage.setItem('user', JSON.stringify(response.data));
      
      setLoading(false);
      navigate('/');
    } catch (error) {
      setLoading(false);
      setError(
        error.response?.data?.message || 'An error occurred during login'
      );
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    
    if (!forgotEmail) {
      setError('Please provide your email address');
      return;
    }

    if (!captchaVerified) {
      setError('Please complete the CAPTCHA verification');
      return;
    }
    
    setLoading(true);
    
    try {
      const response = await axios.post('/api/users/forgot-password', {
        email: forgotEmail
      });
      
      setMessage(response.data.message || 'Reset instructions sent to your email.');
      setLoading(false);
    } catch (error) {
      setLoading(false);
      setError(
        error.response?.data?.message || 'Failed to process request'
      );
    }
  };

  return (
    <div className="row justify-content-center">
      <div className="col-md-6">
        <div className="card p-4">
          <div className="card-body">
            {!showForgotPassword ? (
              <>
                <h1 className="text-center mb-4">Login</h1>
                
                {error && <div className="alert alert-danger">{error}</div>}
                
                <form onSubmit={onSubmit}>
                  <div className="mb-3">
                    <label htmlFor="email" className="form-label">Email</label>
                    <input
                      type="email"
                      className="form-control"
                      id="email"
                      name="email"
                      value={email}
                      onChange={onChange}
                      required
                    />
                  </div>
                  
                  <div className="mb-3">
                    <label htmlFor="password" className="form-label">Password</label>
                    <input
                      type="password"
                      className="form-control"
                      id="password"
                      name="password"
                      value={password}
                      onChange={onChange}
                      required
                    />
                  </div>
                  
                  <SimpleCaptcha onChange={onCaptchaChange} />
                  
                  <button 
                    type="submit" 
                    className="btn btn-primary w-100"
                    disabled={loading || !captchaVerified}
                  >
                    {loading ? 'Logging in...' : 'Login'}
                  </button>
                </form>
                
                <div className="d-flex justify-content-between mt-3">
                  <p>
                    Don't have an account? <Link to="/register">Register</Link>
                  </p>
                  <p>
                    <a 
                      href="#" 
                      onClick={(e) => {
                        e.preventDefault();
                        setShowForgotPassword(true);
                        setError('');
                      }}
                    >
                      Forgot Password?
                    </a>
                  </p>
                </div>
              </>
            ) : (
              <>
                <h1 className="text-center mb-4">Reset Password</h1>
                
                {error && <div className="alert alert-danger">{error}</div>}
                {message && <div className="alert alert-success">{message}</div>}
                
                <form onSubmit={handleForgotPassword}>
                  <div className="mb-3">
                    <label htmlFor="forgotEmail" className="form-label">Email</label>
                    <input
                      type="email"
                      className="form-control"
                      id="forgotEmail"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      required
                    />
                  </div>
                  
                  <SimpleCaptcha onChange={onCaptchaChange} />
                  
                  <button 
                    type="submit" 
                    className="btn btn-primary w-100 mb-3"
                    disabled={loading || !captchaVerified}
                  >
                    {loading ? 'Sending...' : 'Send Reset Link'}
                  </button>
                  
                  <button 
                    type="button" 
                    className="btn btn-secondary w-100"
                    onClick={() => {
                      setShowForgotPassword(false);
                      setError('');
                      setMessage('');
                    }}
                  >
                    Back to Login
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
