// client/src/pages/SignUp.js
import React, { useState } from 'react';
import { Container, Card, Form, Button, Alert, Input } from 'reactstrap';
import { auth, db } from '../firebase-config'; // Import auth and db
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore'; // Import Firestore functions

export default function SignUp({ onNavigate }) { // onNavigate prop to switch pages
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [userId, setUserId] = useState(''); // State for the custom user ID
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState(''); // 'success' or 'danger'

    const showMessage = (msg, type) => {
        setMessage(msg);
        setMessageType(type);
        setTimeout(() => {
            setMessage('');
            setMessageType('');
        }, 5000);
    };

    const handleSignUp = async (e) => {
        e.preventDefault();
        setMessage('');
        setMessageType('');

        if (!email || !password || !userId) {
            showMessage('Please fill in all fields: Email, Password, and User ID.', 'danger');
            return;
        }

        try {
            // 1. Create user with Firebase Authentication
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // 2. Store custom user ID and other details in Firestore
            // Use the Firebase Auth UID as the document ID for the user's data
            await setDoc(doc(db, "users", user.uid), {
                customUserId: userId, // Store the custom user ID
                email: email,
                createdAt: new Date()
            });

            showMessage('Account created successfully! You can now log in.', 'success');
            setEmail('');
            setPassword('');
            setUserId('');
            onNavigate('login'); // Navigate back to login page after successful sign up

        } catch (error) {
            console.error('Firebase Sign Up Error:', error);
            let errorMessage = 'An unexpected error occurred during sign up.';
            switch (error.code) {
                case 'auth/email-already-in-use':
                    errorMessage = 'This email address is already in use.';
                    break;
                case 'auth/invalid-email':
                    errorMessage = 'The email address is not valid.';
                    break;
                case 'auth/weak-password':
                    errorMessage = 'Password is too weak. Please choose a stronger one.';
                    break;
                default:
                    errorMessage = `Sign up failed: ${error.message}`;
            }
            showMessage(errorMessage, 'danger');
        }
    };

    return (
        <Container fluid className="d-flex justify-content-center align-items-center min-vh-100 p-3">
            <Card className="p-4 p-md-5 w-100" style={{ maxWidth: '400px' }}>
                <div className="text-center mb-4">
                    <img
                        src="/logo_white.jpg"
                        alt="Tai-ny Calculator Logo"
                        className="img-fluid mb-3"
                        style={{ maxWidth: '250px', height: 'auto', borderRadius: '15px'}} //boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
                        onError={(e) => { e.target.onerror = null; e.target.src = '[https://placehold.co/200x200/f5ebd8/1b1b1b?text=Tai-ny+Logo](https://placehold.co/200x200/f5ebd8/1b1b1b?text=Tai-ny+Logo)'; }}
                    />
                </div>

                <h3 className="text-center text-custom-dark mb-4">Create Your Account</h3>

                <Form onSubmit={handleSignUp}>
                    <div className="position-relative mb-3">
                        <i className="fas fa-user input-icon-left"></i>
                        <Input
                            type="email"
                            className="form-control"
                            placeholder="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div className="position-relative mb-3">
                        <i className="fas fa-id-badge input-icon-left"></i> {/* Using id-badge for User ID */}
                        <Input
                            type="text"
                            className="form-control"
                            placeholder="User ID (e.g., nickname)"
                            value={userId}
                            onChange={(e) => setUserId(e.target.value)}
                            required
                        />
                    </div>

                    <div className="position-relative mb-3">
                        <i className="fas fa-lock input-icon-left"></i>
                        <Input
                            type="password"
                            className="form-control"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    {message && (
                        <Alert color={messageType} className="text-center rounded-pill-sm py-2">
                            {message}
                        </Alert>
                    )}

                    <Button type="submit" className="btn-custom-green w-100 mb-3">
                        Sign Up
                    </Button>
                </Form>

                <div className="text-center">
                    <Button
                        type="button"
                        onClick={() => onNavigate('login')} // Call onNavigate with 'login'
                        className="btn btn-link text-muted text-decoration-none fw-normal p-0"
                        style={{ fontSize: '0.875rem' }}
                    >
                        Already have an account? Log In
                    </Button>
                </div>
            </Card>
        </Container>
    );
}
