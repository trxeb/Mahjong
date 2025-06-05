// src/components/ProfileView.jsx
import React from 'react';
import appStyles from '../styles/appStyles'; // Import the shared styles

const ProfileView = ({ currentPlayer }) => {
    if (!currentPlayer) {
        return (
            <div style={{ ...appStyles.screen, ...appStyles.screenActive }}>
                <div style={appStyles.centerContent}>
                    <p style={appStyles.welcomeTitle}>No user profile loaded. Please log in.</p>
                </div>
            </div>
        );
    }

    return (
        <div style={{ ...appStyles.screen, ...appStyles.screenActive }}>
            <div style={appStyles.centerContent}>
                <div style={appStyles.welcomeSection}>
                    <div style={appStyles.welcomeTitle}>My Profile</div>
                    <div style={appStyles.welcomeSubtitle}>Your personal Mahjong statistics</div>
                </div>

                <div style={{ ...appStyles.card, maxWidth: 'unset', width: '100%' }}>
                    <div style={appStyles.playerItem}>
                        <span style={appStyles.inputGroupLabel}>Username:</span>
                        <span>{currentPlayer.username}</span>
                    </div>
                    <div style={appStyles.playerItem}>
                        <span style={appStyles.inputGroupLabel}>User ID:</span>
                        <span>{currentPlayer.id}</span>
                    </div>
                    <div style={appStyles.playerItem}>
                        <span style={appStyles.inputGroupLabel}>Wins:</span>
                        <span>{currentPlayer.wins}</span>
                    </div>
                    <div style={appStyles.playerItem}>
                        <span style={appStyles.inputGroupLabel}>Losses:</span>
                        <span>{currentPlayer.losses}</span>
                    </div>
                    <div style={appStyles.playerItem}>
                        <span style={appStyles.inputGroupLabel}>Total Tai:</span>
                        <span>{currentPlayer.totalTai}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfileView;
