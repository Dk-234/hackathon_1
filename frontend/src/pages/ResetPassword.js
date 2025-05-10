import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

const ResetPassword = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [tokenValid, setTokenValid] = useState(true);

  const { resetToken } = useParams();
  const navigate = useNavigate();

  // Verify token validity on page load
  useEffect(() => {
    const verifyToken = async () => {
      try {
        // You could implement a verification endpoint or
        // just proceed and let the reset attempt validate the token
        setTokenValid(true);
      } catch (error) {
        setTokenValid(false);
        setError('Invalid or expired password reset token');
      }
    };

    if (resetToken) {
      verifyToken();
    }
  }, [resetToken]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      return setError('Passwords do not match');
    }

    if (password.length < 6) {
      return setError('Password must be at least 6 characters');
    }

    setLoading(true);

    try {
      const response = await axios.put(`/api/users/reset-password/${resetToken}`, {
        password,
      });

      setSuccess(true);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      setError(
        error.response?.data?.message || 'An error occurred during password reset'
      );
    }
  };

  if (!tokenValid) {
    return (
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="card p-4">
            <div className="card-body text-center">
              <h1 className="mb-4">Invalid Reset Token</h1>
              <p>The password reset link is invalid or has expired.</p>
              <Link to="/login" className="btn btn-primary">
                Back to Login
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="card p-4">
            <div className="card-body text-center">
              <h1 className="mb-4">Password Reset Successful</h1>
              <p>Your password has been changed successfully.</p>
              <Link to="/login" className="btn btn-primary">
                Login with New Password
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="row justify-content-center">
      <div className="col-md-6">
        <div className="card p-4">
          <div className="card-body">
            <h1 className="text-center mb-4">Reset Your Password</h1>
            
            {error && <div className="alert alert-danger">{error}</div>}
            
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label htmlFor="password" className="form-label">New Password</label>
                <input
                  type="password"
                  className="form-control"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength="6"
                />
              </div>
              
              <div className="mb-3">
                <label htmlFor="confirmPassword" className="form-label">Confirm New Password</label>
                <input
                  type="password"
                  className="form-control"
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength="6"
                />
              </div>
              
              <button 
                type="submit" 
                className="btn btn-primary w-100"
                disabled={loading}
              >
                {loading ? 'Resetting...' : 'Reset Password'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
