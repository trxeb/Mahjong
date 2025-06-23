// client/src/App.js
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';

// Page Components
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import Home from './pages/Home';
import GameMasterPage from './pages/GameMasterPage';
import RecordsPage from './pages/RecordsPage';
import ScorePage from './pages/ScorePage';
import ProfilePage from './pages/ProfilePage';
import SettingsPage from './pages/SettingsPage';

// Shared Components
import SideBar from './components/SideBar';
import ProtectedRoute from './components/ProtectedRoute';
import PublicRoute from './components/PublicRoute';

const App = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>; // Or a proper spinner component
  }

  return (
    <div className="d-flex" style={{ minHeight: '100vh' }}>
      {user && <SideBar />}
      <div className="flex-grow-1" style={{ marginLeft: user ? '200px' : '0' }}>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
          <Route path="/signup" element={<PublicRoute><SignUp /></PublicRoute>} />
          
          {/* Protected Routes */}
          <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
          <Route path="/gamemaster/:roomCode" element={<ProtectedRoute><GameMasterPage /></ProtectedRoute>} />
          <Route path="/records/:roomCode" element={<ProtectedRoute><RecordsPage /></ProtectedRoute>} />
          <Route path="/score/:roomCode" element={<ProtectedRoute><ScorePage /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />

          {/* Fallback route */}
          <Route path="*" element={<ProtectedRoute><Home /></ProtectedRoute>} />
        </Routes>
      </div>
    </div>
  );
};

export default App;