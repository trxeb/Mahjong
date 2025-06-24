// client/src/pages/SignUp.js
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Container, Card, Form, Button, Alert, Input } from 'reactstrap';
import { auth, db } from '../firebase-config'; // Import auth and db
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore'; // Import Firestore functions

const SignUp = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [username, setUsername] = useState(''); // Changed from userId
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState(''); // 'success' or 'danger'
    const navigate = useNavigate();

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

        if (!email || !password || !username) { // Changed from userId
            showMessage('Please fill in all fields: Email, Username, and Password.', 'danger');
            return;
        }

        try {
            // 1. Create user with Firebase Authentication
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // 2. Store custom user ID and other details in Firestore
            // Use the Firebase Auth UID as the document ID for the user's data
            await setDoc(doc(db, "users", user.uid), {
                username: username, // Changed from customUserId
                email: email,
                createdAt: new Date()
            });

            showMessage('Account created successfully! You can now log in.', 'success');
            setEmail('');
            setPassword('');
            setUsername('');
            navigate('/'); // Redirect to home page after successful sign up

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
                        src="/logo_white.png"
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
                        <i className="fas fa-id-badge input-icon-left"></i>
                        <Input
                            type="text"
                            className="form-control"
                            placeholder="Username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
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
                    <Link
                      to="/login"
                      className="btn btn-link text-decoration-none fw-normal p-0"
                      style={{ fontSize: '0.875rem' }}
                    >
                      Already have an account? Log In
                    </Link>
                </div>
            </Card>
        </Container>
    );
};

export default SignUp;