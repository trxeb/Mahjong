// client/src/App.js
import React, { useState, useEffect } from 'react';
import { auth } from './firebase-config';
import { onAuthStateChanged } from 'firebase/auth';

// Import all your page components from the 'pages' folder
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import Home from './pages/Home';
import GameMasterPage from './pages/GameMasterPage';
import ProfilePage from './pages/ProfilePage';     
import RecordsPage from './pages/RecordsPage';     
import ScorePage from './pages/ScorePage';         
import SettingsPage from './pages/SettingsPage';   // NEW: Import SettingsPage

// Import the SideBar component
import SideBar from './components/SideBar'; 

export default function App() {
    const [currentPage, setCurrentPage] = useState('login'); 
    const [user, setUser] = useState(null); 
    const [currentRoomId, setCurrentRoomId] = useState(null); 

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            if (currentUser) {
                setUser(currentUser);
                if (currentPage === 'login' || currentPage === 'signup') { 
                    setCurrentPage('home'); 
                }
            } else {
                setUser(null);
                if (currentPage !== 'signup') {
                    setCurrentPage('login'); 
                }
            }
        });
        return () => unsubscribe();
    }, [currentPage]); 

    const handleNavigate = (page, id = null) => {
        setCurrentPage(page);
        setCurrentRoomId(id); 
    };

    let content;
    const showSidebar = user; // Show sidebar only if a user is logged in

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
        case 'settings': // NEW: Route to SettingsPage
            content = <SettingsPage onNavigate={handleNavigate} roomId={currentRoomId} />;
            break;
        default:
            content = <Login onNavigate={handleNavigate} />; 
    }

    return (
        <div className="d-flex" style={{ minHeight: '100vh' }}>
            {showSidebar && (
                <SideBar onNavigate={handleNavigate} currentPage={currentPage} /> 
            )}
            <div className="flex-grow-1" style={{ marginLeft: showSidebar ? '200px' : '0' }}> 
                {content} 
            </div>
        </div>
    );
}
