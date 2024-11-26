import { Navigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode'; // Correct import

const isAuthenticated = () => {
  const token = localStorage.getItem('token');
  if (!token) return false;

  try {
    const decoded = jwtDecode(token);
    const isExpired = decoded.exp * 1000 < Date.now(); // Check expiration

    if (isExpired) {
      localStorage.removeItem('token'); // Clear expired token
      localStorage.removeItem('user');  // Optional: Clear user data too
      return false;
    }

    return true;
  } catch (error) {
    console.error('Invalid token:', error);
    localStorage.removeItem('token'); // Handle invalid token
    localStorage.removeItem('user');  // Optional: Clear user data
    return false;
  }
};

const PrivateRoute = ({ children }) => {
  return isAuthenticated() ? children : <Navigate to="/login" replace />;
};

export default PrivateRoute;
