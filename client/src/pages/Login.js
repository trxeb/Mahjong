import 'bootstrap/dist/css/bootstrap.min.css';
import '@fortawesome/fontawesome-free/css/all.min.css'; // For icons

// client/src/App.js
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Container, Card, Form, Button, Alert } from 'reactstrap'; // Import Reactstrap components
import { auth } from '../firebase-config'; // Import your Firebase auth instance
import { signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';

// This line is crucial for exporting the component as default
export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState(''); // 'success' or 'danger' for Bootstrap Alert
    const navigate = useNavigate();

    // Function to display messages to the user (instead of alert())
    const showMessage = (msg, type) => {
        setMessage(msg);
        setMessageType(type);
        // Automatically clear message after 5 seconds for user experience
        setTimeout(() => {
            setMessage('');
            setMessageType('');
        }, 5000);
    };

    // Handler for the login form submission
    const handleLogin = async (e) => {
        e.preventDefault(); // Prevent default browser form submission
        setMessage(''); // Clear any previous messages
        setMessageType('');

        // Basic client-side validation
        if (!email || !password) {
            showMessage('Please enter both email and password.', 'danger');
            return;
        }

        try {
            await signInWithEmailAndPassword(auth, email, password);
            // No need to show message, we are navigating away
            navigate('/'); // Redirect to home on success
        } catch (error) {
            console.error('Firebase Login Error:', error);
            let errorMessage = 'An unexpected error occurred during login.';
            switch (error.code) {
                case 'auth/invalid-email':
                case 'auth/user-not-found':
                case 'auth/wrong-password':
                    errorMessage = 'Invalid username or password.'; // General message for security
                    break;
                case 'auth/user-disabled':
                    errorMessage = 'Your account has been disabled.';
                    break;
                case 'auth/too-many-requests':
                    errorMessage = 'Too many login attempts. Please try again later.';
                    break;
                default:
                    errorMessage = `Login failed: ${error.message}`;
            }
            showMessage(errorMessage, 'danger');
        }
    };

    // Handler for the "Forgot Password" link
    const handleForgotPassword = async (e) => {
        e.preventDefault(); // Prevent default link behavior
        setMessage(''); // Clear any previous messages
        setMessageType('');

        if (!email) {
            showMessage('Please enter your username (email) to reset your password.', 'danger');
            return;
        }

        try {
            await sendPasswordResetEmail(auth, email);
            showMessage('Password reset email sent! Check your inbox.', 'success');
        } catch (error) {
            console.error('Firebase Forgot Password Error:', error);
            let errorMessage = 'Failed to send password reset email.';
            switch (error.code) {
                case 'auth/invalid-email':
                    errorMessage = 'Invalid email address. Please check your username.';
                    break;
                case 'auth/user-not-found':
                    errorMessage = 'No user found with that email address.';
                    break;
                default:
                    errorMessage = `Error: ${error.message}`;
            }
            showMessage(errorMessage, 'danger');
        }
    };

    return (
        <Container fluid className="d-flex justify-content-center align-items-center min-vh-100 p-3">
            <Card className="p-4 p-md-5 w-100" style={{ maxWidth: '400px' }}>
                <div className="text-center mb-4">
                    {/* Your combined logo image */}
                    <img
                        src="/logo_white.png" // Assuming logo.jpg is in client/public folder
                        alt="Tai-ny Calculator Logo"
                        className="img-fluid mb-3"
                        style={{ maxWidth: '250px', height: 'auto', borderRadius: '15px'}} // boxShadow: '0 4px 8px rgba(0,0,0,0.1)' 
                        onError={(e) => { e.target.onerror = null; e.target.src = '[https://placehold.co/200x200/f5ebd8/1b1b1b?text=Tai-ny+Logo](https://placehold.co/200x200/f5ebd8/1b1b1b?text=Tai-ny+Logo)'; }} // Fallback if image not found
                    />
                    {/* The text "Tai-ny Calculator" is now part of the logo image */}
                </div>

                <Form onSubmit={handleLogin}>
                    <div className="position-relative mb-3" style={{ position: 'relative' }}>
                        <i className="fas fa-user input-icon-left"></i>
                        <input
                            type="email"
                            className="form-control"
                            placeholder="Username (Email)"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div className="position-relative mb-3">
                        <i className="fas fa-lock input-icon-left"></i>
                        <input
                            type="password"
                            className="form-control"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    {/* Message Display Area */}
                    {message && (
                        <Alert color={messageType} className="text-center rounded-pill-sm py-2">
                            {message}
                        </Alert>
                    )}

                    <Button type="submit" className="btn-custom-green w-100 mb-3">
                        Log in
                    </Button>
                </Form>

                <div className="text-center">
                    <button
                        type="button"
                        onClick={handleForgotPassword}
                        className="btn btn-link text-muted text-decoration-none fw-normal p-0"
                        style={{ fontSize: '0.875rem' }} // text-sm equivalent
                        >
                        Forgot Password
                        </button>
                </div>

                <div className="text-center mt-3">
                    <Link to="/signup" className="btn btn-link text-custom-dark text-decoration-none fw-normal p-0" style={{ fontSize: '0.875rem' }}>
                        Don't have an account? Sign Up
                    </Link>
                </div>
            </Card>
        </Container>
    );
}