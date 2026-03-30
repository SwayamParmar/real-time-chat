import './App.css';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from '../src/pages/Login';
import Signup from '../src/pages/Signup';
import Home from './pages/Home';
import Conversation from './conversations/Conversation';
import { useAuthStore } from "./store/authStore";
import { Navigate } from "react-router-dom";

const App = () => {
  const { token } = useAuthStore();

  return (
    <>
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