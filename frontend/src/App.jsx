import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

import Navbar from './components/Navbar';

// Pages
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import DaoVerifyPage from './pages/DaoVerifyPage';
import LogsPage from './pages/LogsPage';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<LoginPage />} />

          <Route path="/dashboard" element={
            <ProtectedRoute>
              <div style={{ display: 'flex', width: '100%', minHeight: '100vh' }}>
                <Navbar />
                <DashboardPage />
              </div>
            </ProtectedRoute>
          } />

          <Route path="/dao" element={
            <ProtectedRoute>
              <div style={{ display: 'flex', width: '100%', minHeight: '100vh' }}>
                <Navbar />
                <DaoVerifyPage />
              </div>
            </ProtectedRoute>
          } />

          <Route path="/logs" element={
            <ProtectedRoute>
              <div style={{ display: 'flex', width: '100%', minHeight: '100vh' }}>
                <Navbar />
                <LogsPage />
              </div>
            </ProtectedRoute>
          } />

          {/* Default Route */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
