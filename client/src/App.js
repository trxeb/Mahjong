// client/src/App.js
import React, { useState, useEffect } from 'react';
import { auth } from './firebase-config'; // Import auth
import { onAuthStateChanged } from 'firebase/auth'; // Import onAuthStateChanged

// Import your page components from the 'pages' folder
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import Home from './pages/Home';

export default function App() {
    // State to manage which page is currently displayed: 'login', 'signup', or 'home'
    const [currentPage, setCurrentPage] = useState('login'); 
    // State to hold the Firebase authenticated user object (null if logged out)
    const [user, setUser] = useState(null); 

    useEffect(() => {
        // Set up an authentication state listener provided by Firebase
        // This listener fires whenever the user's sign-in state changes (login, logout)
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            if (currentUser) {
                // If a user is logged in (currentUser is not null)
                setUser(currentUser); // Store the user object in state
                setCurrentPage('home'); // Automatically navigate to the home page
            } else {
                // If no user is logged in (currentUser is null)
                setUser(null); // Clear the user object from state
                // Only navigate to the login page if we are not already on the signup page.
                // This prevents immediate redirection from signup back to login if they aren't logged in yet.
                if (currentPage !== 'signup') {
                    setCurrentPage('login'); // Navigate to the login page
                }
            }
        });

        // Cleanup function: unsubscribe from the auth listener when the component unmounts
        // This prevents memory leaks and ensures the listener doesn't keep running unnecessarily.
        return () => unsubscribe();
    }, [currentPage]); // Dependency array: Effect re-runs if 'currentPage' changes.
                      // This is important for handling the initial transition from signup to login after account creation.

    // Function passed to child components (Login, SignUp, Home) to allow navigation
    const handleNavigate = (page) => {
        setCurrentPage(page); // Update the current page state, which triggers a re-render
    };

    // Determine which component to render based on the 'currentPage' state
    let content;
    switch (currentPage) {
        case 'login':
            // Render the Login component, passing the handleNavigate function
            content = <Login onNavigate={handleNavigate} />;
            break;
        case 'signup':
            // Render the SignUp component, passing the handleNavigate function
            content = <SignUp onNavigate={handleNavigate} />;
            break;
        case 'home':
            // Render the Home component, passing the handleNavigate function
            content = <Home onNavigate={handleNavigate} />;
            break;
        default:
            // Fallback: if currentPage is an unrecognized value, default to Login page
            content = <Login onNavigate={handleNavigate} />; 
    }

    // The main App component's render method
    return (
        <div className="App">
            {content} {/* This will render the currently selected page component */}
        </div>
    );
}