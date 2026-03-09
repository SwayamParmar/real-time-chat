import './App.css';
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import Header from "./components/Header";
import Login from '../src/pages/Login';
import Signup from '../src/pages/Signup';
import { ThemeProvider } from "styled-components";
import Home from './pages/Home';
import Footer from './components/Footer';
import Conversation from './conversations/Conversation';
import PrivateRoute from './PrivateRoute';
import { useAuthStore } from "./store/authStore";
import { Navigate } from "react-router-dom";

const App = () => {
  const location = useLocation(); // Get current location
  const { token } = useAuthStore();

  return (
    <>
      {/* Show Header only if NOT logged in */}
      {!token && location.pathname !== "/login" && location.pathname !== "/register" && <Header />}
      <Routes>
        <Route path="/" element={token ? <Conversation /> : <Home />} />
        <Route
          path="/login"
          element={
            token ? <Navigate to="/" replace /> : <Login />
          }
        />

        {/* Register */}
        <Route
          path="/register"
          element={
            token ? <Navigate to="/" replace /> : <Signup />
          }
        />
      </Routes>
      {/* Conditionally render Footer */}
      {!token && location.pathname !== "/login" && location.pathname !== "/register" && <Footer />}
    </>
  );
};

// Wrap App with BrowserRouter
const AppWrapper = () => (
  <BrowserRouter>
    <App />
  </BrowserRouter>
);

export default AppWrapper;