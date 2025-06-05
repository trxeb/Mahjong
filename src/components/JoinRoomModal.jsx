// src/components/JoinRoomModal.jsx
import React, { useState } from 'react';
import appStyles from '../styles/appStyles'; // Import the shared styles

const JoinRoomModal = ({ show, onClose, onJoinRoom }) => {
    const [roomCode, setRoomCode] = useState('');
    const [playerName, setPlayerName] = useState(''); // Assuming player name is needed for joining

    if (!show) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        onJoinRoom(playerName, roomCode);
        setRoomCode('');
        setPlayerName('');
    };

    return (
        <div style={{ ...appStyles.modal, ...appStyles.modalActive }}>
            <div style={appStyles.modalContent}>
                <h2 style={appStyles.modalHeader}>Join Existing Room</h2>
                <form onSubmit={handleSubmit} style={appStyles.centerContent}>
                    <div style={appStyles.inputGroup}>
                        <label htmlFor="joinPlayerName" style={appStyles.inputGroupLabel}>Your Name</label>
                        <input
                            type="text"
                            id="joinPlayerName"
                            placeholder="Enter your name"
                            value={playerName}
                            onChange={(e) => setPlayerName(e.target.value)}
                            required
                            style={appStyles.inputGroupInput}
                        />
                    </div>
                    <div style={appStyles.inputGroup}>
                        <label htmlFor="joinRoomCode" style={appStyles.inputGroupLabel}>Room Code</label>
                        <input
                            type="text"
                            id="joinRoomCode"
                            placeholder="Enter 6-digit room code"
                            value={roomCode}
                            onChange={(e) => setRoomCode(e.target.value)}
                            required
                            style={appStyles.inputGroupInput}
                        />
                    </div>
                    <button type="submit" style={appStyles.btn}>Join Room</button>
                    <button type="button" style={{ ...appStyles.btn, ...appStyles.btnSecondary }} onClick={onClose}>Cancel</button>
                </form>
            </div>
        </div>
    );
};

export default JoinRoomModal;
