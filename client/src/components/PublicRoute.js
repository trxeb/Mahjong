import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth'; // We'll create this hook

const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>; // Or a spinner
  }

  if (user) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default PublicRoute; 