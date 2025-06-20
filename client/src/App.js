// client/src/App.js
import React, { useState, useEffect } from 'react';
import { auth } from './firebase-config'; // Import auth
import { onAuthStateChanged } from 'firebase/auth'; // Import onAuthStateChanged

// Import all your page components from the 'pages' folder
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import Home from './pages/Home';
import GameMasterPage from './pages/GameMasterPage';
import ProfilePage from './pages/ProfilePage';     
import RecordsPage from './pages/RecordsPage';     
import ScorePage from './pages/ScorePage';         

// Import the BottomNavBar component (using the updated casing)
import BottomNavBar from './components/BottomNavBar'; 

export default function App() {
    // State to manage which page is currently displayed: 'login', 'signup', or 'home', etc.
    const [currentPage, setCurrentPage] = useState('login'); 
    // State to hold the Firebase authenticated user object (null if logged out)
    const [user, setUser] = useState(null); 
    // State to pass room ID to GM page if applicable
    const [currentRoomId, setCurrentRoomId] = useState(null); 

    useEffect(() => {
        // Set up an authentication state listener provided by Firebase
        // This listener fires whenever the user's sign-in state changes (login, logout)
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            if (currentUser) {
                // If a user is logged in (currentUser is not null)
                setUser(currentUser); // Store the user object in state
                // Only navigate to home if we're not already on a specific page that requires login (like GM page)
                if (currentPage === 'login' || currentPage === 'signup') { 
                    setCurrentPage('home'); 
                }
            } else {
                // If no user is logged in (currentUser is null)
                setUser(null); // Clear the user object from state
                // If user logs out or is not logged in, go to login unless they are trying to sign up
                if (currentPage !== 'signup') {
                    setCurrentPage('login'); 
                }
            }
        });

        // Cleanup function: unsubscribe from the auth listener when the component unmounts
        return () => unsubscribe();
    }, [currentPage]); // Dependency array: Effect re-runs if 'currentPage' changes.
                      // This helps in scenarios like immediate redirection after signup/login/logout.

    // Function passed to child components (Login, SignUp, Home, etc.) to allow navigation
    const handleNavigate = (page, id = null) => {
        setCurrentPage(page);
        setCurrentRoomId(id); // Store the room ID if navigating to GM page (or other ID-specific pages)
    };

    // Determine which component to render based on the 'currentPage' state
    let content;
    const showNavbar = user; // Show navbar only if a user is logged in

    switch (currentPage) {
        case 'login':
            content = <Login onNavigate={handleNavigate} />;
            break;
        case 'signup':
            content = <SignUp onNavigate={handleNavigate} />;
            break;
        case 'home':
            content = <Home onNavigate={handleNavigate} />;
            break;
        case 'gmPage': 
            content = <GameMasterPage onNavigate={handleNavigate} roomId={currentRoomId} />;
            break;
        case 'profile': 
            content = <ProfilePage onNavigate={handleNavigate} />;
            break;
        case 'records': 
            content = <RecordsPage onNavigate={handleNavigate} />;
            break;
        case 'score': 
            content = <ScorePage onNavigate={handleNavigate} />;
            break;
        default:
            content = <Login onNavigate={handleNavigate} />; // Default to login if page is unrecognized
    }

    return (
        <div className="App d-flex flex-column min-vh-100">
            {/* Main content area. Flex-grow-1 ensures it takes all available space, pushing navbar to bottom */}
            <div className="flex-grow-1"> 
                {content} {/* This will render the currently selected page component */}
            </div>
            {/* Bottom Navigation Bar, shown only when a user is logged in */}
            {showNavbar && (
                <BottomNavBar onNavigate={handleNavigate} currentPage={currentPage} /> 
            )}
        </div>
    );
}