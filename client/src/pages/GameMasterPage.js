// client/src/pages/GameMasterPage.js
import React, { useState, useEffect } from 'react';
import { Container, Button, Card, CardHeader, CardBody, ListGroup, ListGroupItem, Spinner, Alert, Row, Col } from 'reactstrap';
import { auth, db } from '../firebase-config';
import { doc, onSnapshot, updateDoc } from 'firebase/firestore'; // Import updateDoc

export default function GameMasterPage({ onNavigate, roomId }) {
    const [roomData, setRoomData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
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
        if (!roomId || !auth.currentUser) {
            setError("Invalid room ID or not logged in.");
            setLoading(false);
            return;
        }

        const roomDocRef = doc(db, "gameRooms", roomId);

        // Set up real-time listener for room data
        const unsubscribe = onSnapshot(roomDocRef, (docSnap) => {
            if (docSnap.exists()) {
                const data = docSnap.data();
                // Ensure current user is the GM for this specific room
                if (data.gameMasterUid === auth.currentUser.uid) {
                    setRoomData({ id: docSnap.id, ...data });
                    setLoading(false);
                    setError('');
                } else {
                    // If not the GM, redirect them or show appropriate message
                    setError("You are not the Game Master for this room. Redirecting...");
                    setLoading(false);
                    setTimeout(() => onNavigate('home'), 2000); // Redirect to home after 2 seconds
                }
            } else {
                setError("Room not found or deleted.");
                setLoading(false);
                setRoomData(null);
                setTimeout(() => onNavigate('home'), 2000); // Redirect to home after 2 seconds
            }
        }, (err) => {
            console.error("Error listening to room data:", err);
            setError(`Failed to load room data: ${err.message}`);
            setLoading(false);
        });

        // Cleanup the listener when the component unmounts
        return () => unsubscribe();
    }, [roomId, onNavigate]); // Depend on roomId and onNavigate

    const handleStartGame = async () => {
        if (!auth.currentUser || !roomData) return;

        // Check if there are exactly 3 players (excluding GM, so 4 total in array)
        if (roomData.players.length !== roomData.settings.maxPlayers) {
            showMessage(`Cannot start game. Need exactly ${roomData.settings.maxPlayers -1} players (excluding GM). Current players: ${roomData.players.length - 1}.`, "danger");
            return;
        }

        try {
            const roomDocRef = doc(db, "gameRooms", roomData.id);
            await updateDoc(roomDocRef, {
                status: "in-game", // Update status to "in-game"
                gameStartedAt: new Date(),
                // Initialize game-specific data here (e.g., current round, scores)
            });
            showMessage("Game started!", "success");
            onNavigate('records'); // Redirect to Records page upon starting the game
        } catch (error) {
            console.error("Error starting game:", error);
            showMessage(`Failed to start game: ${error.message}`, "danger");
        }
    };

    const handleBackToHome = () => {
        onNavigate('home');
    };

    const handleGoToSettings = () => {
        onNavigate('settings', roomId); // Navigate to settings page, pass room ID
    };

    if (loading) {
        return (
            <Container fluid className="d-flex justify-content-center align-items-center min-vh-100">
                <Spinner color="success" children="" />
                <span className="ms-2">Loading game room...</span>
            </Container>
        );
    }

    if (error) {
        return (
            <Container fluid className="d-flex flex-column justify-content-center align-items-center min-vh-100 text-center">
                <Alert color="danger">
                    <h5>Error:</h5>
                    <p>{error}</p>
                </Alert>
                <Button color="secondary" onClick={handleBackToHome} className="mt-3 rounded-pill">
                    <i className="fas fa-arrow-left me-2"></i> Back to Home
                </Button>
            </Container>
        );
    }

    // Determine if Start Game button should be disabled
    // Max players is 4 (1 GM + 3 players). So, players.length must be 4.
    const isStartGameDisabled = !roomData || roomData.players.length !== roomData.settings.maxPlayers || roomData.status !== "waiting";
    
    // Filter players to show only non-GM players for the count
    const nonGmPlayers = roomData.players.filter(player => player.uid !== roomData.gameMasterUid);

    return (
        <Container fluid className="d-flex justify-content-center align-items-center min-vh-100 p-3">
            <Card className="p-4 p-md-5 w-100" style={{ maxWidth: '600px' }}>
                <CardHeader className="bg-success text-white rounded-top-3 p-3">
                    <Row className="align-items-center">
                        <Col xs="auto" className="flex-grow-1">
                            <h2 className="mb-0 text-white">Game Master Room</h2>
                        </Col>
                        <Col xs="auto">
                            <Button color="light" size="sm" className="rounded-pill" onClick={handleGoToSettings}>
                                <i className="fas fa-cog me-2"></i> Settings
                            </Button>
                        </Col>
                    </Row>
                    <p className="lead text-center mb-0 mt-2">
                        Room ID: <strong className="text-warning">{roomData.id}</strong>
                    </p>
                </CardHeader>
                <CardBody>
                    {message && (
                        <Alert color={messageType} className="text-center rounded-pill-sm py-2 mb-3">
                            {message}
                        </Alert>
                    )}

                    <h4 className="text-custom-dark mb-3">Players in Room ({nonGmPlayers.length}/{roomData.settings.maxPlayers - 1}):</h4>
                    {roomData.players && roomData.players.length > 0 ? (
                        <ListGroup flush className="mb-4">
                            {roomData.players.map((player, index) => (
                                <ListGroupItem key={index} className="d-flex justify-content-between align-items-center">
                                    <span>
                                        <i className="fas fa-user-circle me-2 text-info"></i>
                                        {player.customId || player.email}
                                    </span>
                                    {player.uid === roomData.gameMasterUid && <span className="badge bg-success rounded-pill">You (GM)</span>}
                                    {player.uid !== roomData.gameMasterUid && <span className="badge bg-primary rounded-pill">Player</span>}
                                </ListGroupItem>
                            ))}
                        </ListGroup>
                    ) : (
                        <Alert color="info" className="text-center">No players in this room yet.</Alert>
                    )}

                    <div className="d-flex justify-content-between align-items-center mt-4">
                        <Button color="secondary" onClick={handleBackToHome} className="rounded-pill">
                            <i className="fas fa-arrow-left me-2"></i> Back to Home
                        </Button>
                        <Button 
                            color="primary" 
                            onClick={handleStartGame} 
                            className="rounded-pill"
                            disabled={isStartGameDisabled} // Disabled until 3 players + GM are present
                        >
                            <i className="fas fa-play-circle me-2"></i> Start Game
                        </Button>
                    </div>
                </CardBody>
            </Card>
        </Container>
    );
}