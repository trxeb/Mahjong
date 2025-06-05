// src/components/CreateRoomModal.jsx
import React, { useState } from 'react';
import appStyles from '../styles/appStyles'; // Import the shared styles

const CreateRoomModal = ({ show, onClose, onCreateRoom }) => {
    const [roomName, setRoomName] = useState('');

    if (!show) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        onCreateRoom(roomName);
        setRoomName(''); // Clear input after submission
    };

    return (
        <div style={{ ...appStyles.modal, ...appStyles.modalActive }}>
            <div style={appStyles.modalContent}>
                <h2 style={appStyles.modalHeader}>Create New Room</h2>
                <form onSubmit={handleSubmit} style={appStyles.centerContent}>
                    <div style={appStyles.inputGroup}>
                        <label htmlFor="newRoomName" style={appStyles.inputGroupLabel}>Room Name</label>
                        <input
                            type="text"
                            id="newRoomName"
                            placeholder="Enter room name"
                            value={roomName}
                            onChange={(e) => setRoomName(e.target.value)}
                            required
                            style={appStyles.inputGroupInput}
                        />
                    </div>
                    <button type="submit" style={appStyles.btn}>Create Room</button>
                    <button type="button" style={{ ...appStyles.btn, ...appStyles.btnSecondary }} onClick={onClose}>Cancel</button>
                </form>
            </div>
        </div>
    );
};

export default CreateRoomModal;
