// client/src/pages/Home.js
import React, { useState, useEffect } from 'react';
import { Container, Button } from 'reactstrap';
import { auth, db } from '../firebase-config'; // Import auth and db
import { signOut, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore'; // Import Firestore functions

export default function Home({ onNavigate }) {
    const [userDisplayName, setUserDisplayName] = useState('Guest'); // Default display name
    const [customUserId, setCustomUserId] = useState(''); // State for custom user ID

    // Listen for auth state changes and fetch user data from Firestore
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                // If user is logged in, try to fetch their data from Firestore
                const userDocRef = doc(db, "users", user.uid);
                const userDocSnap = await getDoc(userDocRef);

                if (userDocSnap.exists()) {
                    const userData = userDocSnap.data();
                    setUserDisplayName(user.email || 'User'); // Fallback to email
                    setCustomUserId(userData.customUserId || '');
                } else {
                    // User exists in Auth but not in Firestore 'users' collection (e.g., old user or created without custom ID)
                    setUserDisplayName(user.email || 'User');
                    setCustomUserId('');
                }
            } else {
                // User logged out
                setUserDisplayName('Guest');
                setCustomUserId('');
                onNavigate('login'); // Redirect to login if logged out
            }
        });

        // Clean up subscription on component unmount
        return () => unsubscribe();
    }, [onNavigate]); // Re-run effect if onNavigate dependency changes

    const handleLogout = async () => {
        try {
            await signOut(auth);
            // onAuthStateChanged listener will handle navigation to login
            console.log('User logged out successfully');
        } catch (error) {
            console.error('Error logging out:', error);
        }
    };

    return (
        <Container fluid className="d-flex justify-content-center align-items-center min-vh-100 p-3">
            <div className="text-center p-4 p-md-5 bg-white rounded-4 shadow-lg-custom" style={{ maxWidth: '600px', width: '100%' }}>
                <h1 className="display-4 fw-bolder text-custom-dark mb-3">Welcome!</h1>
                {userDisplayName && <p className="lead text-muted">Hello, {userDisplayName}!</p>}
                {customUserId && <p className="lead text-muted">Your custom ID: **{customUserId}**</p>}
                
                <p className="mt-4">This is your home page. You are successfully logged in.</p>
                
                <Button color="danger" onClick={handleLogout} className="mt-4 rounded-pill">
                    Logout
                </Button>
            </div>
        </Container>
    );
}