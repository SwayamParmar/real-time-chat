import { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from './pages/Home';
import Loading from './components/Loading';
import { useAuthStore } from "./store/authStore";
import { Navigate } from "react-router-dom";

/*
 * Route-level code splitting, so a visitor to the landing page does not also
 * download the chat client. Home stays eager as the public entry point; its
 * below-the-fold sections are split inside pages/Home.js.
 */
const Login = lazy(() => import('./pages/Login'));
const Signup = lazy(() => import('./pages/Signup'));
const Conversation = lazy(() => import('./conversations/Conversation'));

const RouteFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-surface-base">
    <Loading width={28} height={28} />
  </div>
);

const App = () => {
  const { token } = useAuthStore();

  return (
    <>
      <Suspense fallback={<RouteFallback />}>
        <Routes>
          <Route path="/" element={token ? <Conversation /> : <Home />} />
          <Route path="/login" element={
              token ? <Navigate to="/" replace /> : <Login />
            }
          />

          {/* Register */}
          <Route path="/register" element={
              token ? <Navigate to="/" replace /> : <Signup />
            }
          />
        </Routes>
      </Suspense>
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