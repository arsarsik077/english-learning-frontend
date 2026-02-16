import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

const basename = process.env.PUBLIC_URL || '';
import { AuthProvider } from './context/AuthContext';
import { AccessibilityProvider } from './context/AccessibilityContext';
import { PointsProvider } from './context/PointsContext';
import PrivateRoute from './components/PrivateRoute';
import Navbar from './components/Navbar';
import AccessibilityPanel from './components/AccessibilityPanel';
import Notifications from './components/Notifications';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import Lessons from './pages/Lessons';
import LessonDetail from './pages/LessonDetail';
import Videos from './pages/Videos';
import Assignments from './pages/Assignments';
import Cards from './pages/Cards';
import Games from './pages/Games';
import AIChat from './pages/AIChat';
import AdminPanel from './pages/AdminPanel';
import './App.css';

function App() {
  return (
    <AccessibilityProvider>
      <PointsProvider>
        <AuthProvider>
          <Router basename={basename}>
            <div className="App">
              {/* Skip link for screen readers */}
              <a href="#main-content" className="skip-link">
                Перейти к основному содержимому
              </a>
              
              <Navbar />
              <AccessibilityPanel />
              <Notifications />
              
              <div id="main-content">
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/lessons" element={<Lessons />} />
                  <Route path="/lessons/:id" element={<LessonDetail />} />
                  <Route path="/videos" element={<Videos />} />
                  <Route path="/assignments" element={<Assignments />} />
                  <Route path="/cards" element={<Cards />} />
                  <Route path="/games" element={<Games />} />
                  <Route path="/ai-chat" element={<AIChat />} />
                  <Route
                    path="/profile"
                    element={
                      <PrivateRoute>
                        <Profile />
                      </PrivateRoute>
                    }
                  />
                  <Route
                    path="/admin"
                    element={
                      <PrivateRoute adminOnly>
                        <AdminPanel />
                      </PrivateRoute>
                    }
                  />
                </Routes>
              </div>
            </div>
          </Router>
        </AuthProvider>
      </PointsProvider>
    </AccessibilityProvider>
  );
}

export default App;
