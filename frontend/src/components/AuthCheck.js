import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

// A component that can be used to verify authentication
// and handle token expiration across the app
const useAuthCheck = () => {
  const navigate = useNavigate();

  // Create an axios interceptor to handle token expiration globally
  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401 && error.response?.data?.tokenExpired) {
          console.log('Token expired, redirecting to login...');
          localStorage.removeItem('user');
          navigate('/login', { state: { message: 'Your session has expired. Please login again.' } });
        }
        return Promise.reject(error);
      }
    );

    // Clean up interceptor when component unmounts
    return () => {
      axios.interceptors.response.eject(interceptor);
    };
  }, [navigate]);

  // Function to check if user is authenticated
  const checkAuth = () => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user || !user.token) {
      return false;
    }
    return true;
  };

  // Function to get auth headers for API requests
  const getAuthHeaders = () => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) return {};
    
    return {
      Authorization: `Bearer ${user.token}`
    };
  };

  return { checkAuth, getAuthHeaders };
};

export default useAuthCheck;
