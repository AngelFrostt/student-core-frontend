import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import ProfilePage from './pages/ProfilePage/ProfilePage';
import Dashboard from './pages/Dashboard/components/Dashboard/Dashboard';
import SubjectsPage from './pages/SubjectsPage/SubjectsPage';
import TasksPage from './pages/TasksPage/TasksPage';
import LandingPage from './pages/LandingPage/LandingPage';

import { AuthProvider } from './auth/AuthContext';
import ProtectedRoute from './auth/ProtectedRoute';

function App() {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    return savedTheme === 'dark';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', isDarkMode ? 'dark' : 'light');
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  const themeProps = { isDarkMode, setIsDarkMode };

  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage {...themeProps} />} />
          <Route path="/login" element={<Navigate to="/" replace />} />
          <Route path="/register" element={<Navigate to="/" replace />} />

          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfilePage {...themeProps} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard {...themeProps} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/subjects"
            element={
              <ProtectedRoute>
                <SubjectsPage {...themeProps} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/tasks"
            element={
              <ProtectedRoute>
                <TasksPage {...themeProps} />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
