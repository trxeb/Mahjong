// client/src/pages/Home.js
import React, { useState, useEffect } from 'react';
import { Container, Button, Input, Form, FormGroup, Label, Row, Col, Alert } from 'reactstrap';
import { auth, db } from '../firebase-config';
import { signOut, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, collection, addDoc, query, where, getDocs, setDoc } from 'firebase/firestore';

export default function Home({ onNavigate }) {
    const [userEmail, setUserEmail] = useState('Guest');
    const [customUserId, setCustomUserId] = useState('');
    const [joinRoomId, setJoinRoomId] = useState(''); // State for joining room
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState('');

    const showMessage = (msg, type) => {
        setMessage(msg);
        setMessageType(type);
        setTimeout(() => {
            setMessage('');
            setMessageType('');
        }, 5000);
    };

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                const userDocRef = doc(db, "users", user.uid);
                const userDocSnap = await getDoc(userDocRef);

                if (userDocSnap.exists()) {
                    const userData = userDocSnap.data();
                    setUserEmail(user.email || 'User');
                    setCustomUserId(userData.customUserId || '');
                } else {
                    setUserEmail(user.email || 'User');
                    setCustomUserId('');
                    showMessage("Your custom User ID is not set. Please set it on your profile page.", "info");
                }
            } else {
                setUserEmail('Guest');
                setCustomUserId('');
                onNavigate('login');
            }
        });
        return () => unsubscribe();
    }, [onNavigate]);

    const handleLogout = async () => {
        try {
            await signOut(auth);
            console.log('User logged out successfully');
        } catch (error) {
            console.error('Error logging out:', error);
        }
    };

    const handleCreateRoom = async () => {
        if (!auth.currentUser) {
            showMessage("You must be logged in to create a room.", "danger");
            return;
        }
        if (!customUserId) {
            showMessage("Your custom User ID is not set. Please set it on your profile page first.", "danger");
            onNavigate('profile');
            return;
        }

        try {
            const newRoomRef = await addDoc(collection(db, "gameRooms"), {
                gameMasterUid: auth.currentUser.uid,
                gameMasterCustomId: customUserId,
                status: "waiting", // e.g., "waiting", "in-game", "finished"
                players: [{ uid: auth.currentUser.uid, customId: customUserId, email: auth.currentUser.email }], // GM is automatically a player
                createdAt: new Date(),
                settings: { // Default settings
                    maxPlayers: 4, // GM + 3 players
                    gameType: "standard",
                }
            });
            showMessage(`Room created with ID: ${newRoomRef.id}`, "success");
            onNavigate('gmPage', newRoomRef.id); // Navigate to GM page with room ID
        } catch (error) {
            console.error("Error creating room:", error);
            showMessage(`Failed to create room: ${error.message}`, "danger");
        }
    };

    const handleJoinRoom = async (e) => {
        e.preventDefault();
        setMessage('');
        setMessageType('');

        if (!auth.currentUser) {
            showMessage("You must be logged in to join a room.", "danger");
            return;
        }
        const trimmedRoomId = joinRoomId.trim();
        if (!trimmedRoomId) {
            showMessage("Please enter a Room ID to join.", "danger");
            return;
        }
        if (!customUserId) {
            showMessage("Your custom User ID is not set. Please set it on your profile page first.", "danger");
            onNavigate('profile');
            return;
        }

        try {
            const roomDocRef = doc(db, "gameRooms", trimmedRoomId);
            const roomDocSnap = await getDoc(roomDocRef);

            if (!roomDocSnap.exists()) {
                showMessage(`Room with ID '${trimmedRoomId}' not found.`, "danger");
                return;
            }

            const roomData = roomDocSnap.data();
            const roomId = roomDocSnap.id;

            // Check if the room is already full (GM + 3 players = 4 total)
            if (roomData.players.length >= roomData.settings.maxPlayers) {
                showMessage(`Room '${roomId}' is full. Maximum ${roomData.settings.maxPlayers - 1} players allowed (excluding GM).`, "danger");
                return;
            }

            // Check if user is already in the room
            const isAlreadyInRoom = roomData.players.some(player => player.uid === auth.currentUser.uid);
            if (isAlreadyInRoom) {
                showMessage(`You are already in room '${roomId}'.`, "warning");
                // If GM, redirect to GM page, otherwise stay for now (or navigate to a player lobby)
                if (roomData.gameMasterUid === auth.currentUser.uid) {
                    onNavigate('gmPage', roomId);
                } else {
                    // For players already in, you might have a generic player game page
                    showMessage(`Navigating you to room '${roomId}'.`, "success");
                    // onNavigate('playerGamePage', roomId); // Placeholder for future page
                }
                return;
            }
            
            // Add user to the room's players array
            const updatedPlayers = [...roomData.players, { uid: auth.currentUser.uid, customId: customUserId, email: auth.currentUser.email }];
            await setDoc(doc(db, "gameRooms", roomId), { players: updatedPlayers }, { merge: true });

            showMessage(`Successfully joined room '${roomId}'!`, "success");
            // Navigate based on whether user is GM or a regular player
            if (roomData.gameMasterUid === auth.currentUser.uid) {
                onNavigate('gmPage', roomId);
            } else {
                // For non-GMs joining, you might need a different page for players
                showMessage(`Joined room ${roomId}. Waiting for Game Master to start.`, "success");
                // onNavigate('playerGamePage', roomId); // Placeholder for future page
            }

        } catch (error) {
            console.error("Error joining room:", error);
            showMessage(`Failed to join room: ${error.message}`, "danger");
        }
    };

    const greetingName = customUserId || userEmail || 'there';

    return (
        <Container fluid className="d-flex justify-content-center align-items-center min-vh-100 p-3">
            <div className="text-center p-4 p-md-5 bg-white rounded-4 shadow-lg-custom" style={{ maxWidth: '600px', width: '100%' }}>
                <h1 className="display-4 fw-bolder text-custom-dark mb-3">Welcome!</h1>
                <p className="lead text-muted">Hello, {greetingName}!</p>
                {customUserId && <p className="lead text-muted">Your custom ID: **{customUserId}**</p>}
                
                <p className="mt-4">This is your home page.</p>
                
                {message && (
                    <Alert color={messageType} className="text-center rounded-pill-sm py-2 mt-3">
                        {message}
                    </Alert>
                )}

                <h4 className="text-custom-dark mt-5 mb-3">Game Room Actions</h4>
                <Row className="g-3">
                    <Col xs="12">
                        <Button color="success" onClick={handleCreateRoom} className="w-100 rounded-pill py-3">
                            <i className="fas fa-plus-circle me-2"></i> Create New Room (GM)
                        </Button>
                    </Col>
                    <Col xs="12">
                        <Form onSubmit={handleJoinRoom} className="d-flex flex-column flex-md-row gap-2">
                            <FormGroup className="flex-grow-1 mb-0">
                                <Input
                                    type="text"
                                    placeholder="Enter Room ID"
                                    value={joinRoomId}
                                    onChange={(e) => setJoinRoomId(e.target.value)}
                                    className="rounded-pill"
                                />
                            </FormGroup>
                            <Button type="submit" color="primary" className="rounded-pill px-4">
                                <i className="fas fa-door-open me-2"></i> Join Room
                            </Button>
                        </Form>
                    </Col>
                </Row>
            </div>
        </Container>
    );
}