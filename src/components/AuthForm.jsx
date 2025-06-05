// src/components/AuthForm.jsx
import React, { useState } from 'react';
import appStyles from '../styles/appStyles'; // Import the shared styles

const AuthForm = ({ onLogin, onSignup }) => {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [username, setUsername] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (isLogin) {
            onLogin(email, password);
        } else {
            onSignup(email, password, username);
        }
    };

    return (
        <div style={{ ...appStyles.card, ...appStyles.centerContent, maxWidth: '400px' }}>
            <h2 style={{ color: appStyles.inputGroupLabel.color, marginBottom: '20px' }}>{isLogin ? 'Login' : 'Sign Up'}</h2>
            <form onSubmit={handleSubmit} style={{ width: '100%' }}>
                {!isLogin && (
                    <div style={appStyles.inputGroup}>
                        <label htmlFor="auth-username" style={appStyles.inputGroupLabel}>Username</label>
                        <input
                            type="text"
                            id="auth-username"
                            placeholder="Your Username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required={!isLogin}
                            style={appStyles.inputGroupInput}
                        />
                    </div>
                )}
                <div style={appStyles.inputGroup}>
                    <label htmlFor="auth-email" style={appStyles.inputGroupLabel}>Email</label>
                    <input
                        type="email"
                        id="auth-email"
                        placeholder="Your Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        style={appStyles.inputGroupInput}
                    />
                </div>
                <div style={appStyles.inputGroup}>
                    <label htmlFor="auth-password" style={appStyles.inputGroupLabel}>Password</label>
                    <input
                        type="password"
                        id="auth-password"
                        placeholder="Your Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        style={appStyles.inputGroupInput}
                    />
                </div>
                <button type="submit" style={appStyles.btn}>
                    {isLogin ? 'Login' : 'Sign Up'}
                </button>
            </form>
            <button
                onClick={() => setIsLogin(!isLogin)}
                style={{ ...appStyles.btn, ...appStyles.btnSecondary, marginTop: '15px' }}
            >
                {isLogin ? 'Need an account? Sign Up' : 'Already have an account? Login'}
            </button>
        </div>
    );
};

export default AuthForm;
