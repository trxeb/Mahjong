// client/src/App.js
import React from 'react';
// Import the Login component from its new location within the 'pages' folder
import Login from './pages/Login'; 

// App.js acts as the root component that renders your Login page.
// It is important that this file is named App.js and located in client/src/
export default function App() {
  return (
    // Render the Login component
    <Login />
  );
}