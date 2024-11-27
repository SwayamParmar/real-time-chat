import './App.css';
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import Header from "./components/Header";
import Login from '../src/pages/Login';
import Signup from '../src/pages/Signup';
import { ThemeProvider } from "styled-components";
import Home from './pages/Home';
import Footer from './components/Footer';
import Conversation from './pages/Conversation';
import PrivateRoute from './PrivateRoute';
import { ConversationProvider } from './conversationContext/ConversationContext';

const App = () => {
    const location = useLocation(); // Get current location

    const theme = {
      colors: {
        primary: "#4169E1",            // Use for main buttons, active states
        btnHover: "#527bf4",           // Button hover color
        secondaryBg: "#F4F5F9",        // Use for general background
        accent: "#20B2AA",             // Accent for icons, small interactive elements
        coralpink: "#FF6F61",          // For alerts or error indicators
        darkBg: "#1B1B1B",             // Dark mode background
        textColor: "#1F2937",          // Primary text color
        darkText: "#ECECEC",           // Light text for dark mode
        lightGray: "#E0E4E7",          // For dividers, borders, etc.
        mutedText: "#6B7280",          // Subtext, timestamps, etc.
        hoverActive: "#e8f0f8",        // Active
      },
      media: {
        mobile: "768px",
        tab: "998px",
      },
    };

    return (
      <ThemeProvider theme={theme}>
        {location.pathname !== '/conversations' && <Header />}
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Signup />} />
          <Route path="/conversations"
            element={
              <PrivateRoute>
                {/* Wrap the Conversation component with ConversationProvider */}
                <ConversationProvider>
                  <Conversation />
                </ConversationProvider>
              </PrivateRoute>
            } 
          />
        </Routes>
        {/* Conditionally render Footer */}
        {location.pathname !== '/conversations' && <Footer />}
      </ThemeProvider>
    );
  };
  
  // Wrap App with BrowserRouter
  const AppWrapper = () => (
    <BrowserRouter>
      <App />
    </BrowserRouter>
  );
  
  export default AppWrapper;