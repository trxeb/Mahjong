// src/components/Views/HomeView.jsx
import React from 'react';
import appStyles from '../../styles/appStyles'; // Import the shared styles

const HomeView = ({ onShowCreateModal, onShowJoinModal, currentPlayer, isPlayerLoaded }) => {
    return (
        <div style={appStyles.centerContent}>
            <div style={appStyles.welcomeSection}>
                <div style={appStyles.mahjongDecoration}>
                    <div style={appStyles.decorationTile}>東</div>
                    <div style={appStyles.decorationTile}>發</div>
                    <div style={appStyles.decorationTile}>中</div>
                </div>
                <div style={appStyles.welcomeTitle}>Welcome to Tai-ny Mahjong</div>
                <div style={appStyles.welcomeSubtitle}>Professional Mahjong Score Calculator</div>
            </div>

            <div style={appStyles.roomSection}>
                <div style={appStyles.card}>
                    <h3 style={{ color: appStyles.inputGroupLabel.color, marginBottom: '20px', textAlign: 'center' }}>Create New Room</h3>
                    <button
                        style={{ ...appStyles.btn, ...appStyles.btnLarge }}
                        onClick={onShowCreateModal}
                        disabled={!isPlayerLoaded}
                    >
                        Create Room
                    </button>
                    <p style={{ textAlign: 'center', marginTop: '15px', color: appStyles.inputGroupLabel.color }}>Start a new game and invite friends</p>
                </div>

                <div style={appStyles.card}>
                    <h3 style={{ color: appStyles.inputGroupLabel.color, marginBottom: '20px', textAlign: 'center' }}>Join Existing Room</h3>
                    <div style={appStyles.inputGroup}>
                        <label htmlFor="roomCode" style={appStyles.inputGroupLabel}>Room Code</label>
                        <input type="text" id="roomCode" placeholder="Enter 6-digit room code" style={appStyles.inputGroupInput} />
                    </div>
                    <button
                        style={{ ...appStyles.btn, ...appStyles.btnLarge }}
                        onClick={onShowJoinModal}
                        disabled={!isPlayerLoaded}
                    >
                        Join Room
                    </button>
                </div>
            </div>
        </div>
    );
};

export default HomeView;
