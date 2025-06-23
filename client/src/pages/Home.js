// client/src/pages/Home.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db, auth } from '../firebase-config';
import { ALL_FLOWER_TILES } from '../constants/mahjong';
import {
  Container,
  Row,
  Col,
  Button,
  Input,
  Form,
  FormGroup,
  Alert,
} from 'reactstrap';

const Home = () => {
  const navigate = useNavigate();
  const [joinRoomCode, setJoinRoomCode] = useState('');
  const [error, setError] = useState('');

  const handleCreateRoom = async () => {
    const user = auth.currentUser;
    if (!user) {
      // Should not happen due to ProtectedRoute, but as a safeguard
      console.error("No user is logged in.");
      return;
    }

    // Get user's username from their user document
    const userDocRef = doc(db, "users", user.uid);
    const userDocSnap = await getDoc(userDocRef);
    const username = userDocSnap.exists() ? userDocSnap.data().username : user.email;

    // Generate a random 4-digit code
    const randomCode = Math.floor(1000 + Math.random() * 9000);
    const roomCode = `MJNG${randomCode}`;

    const roomRef = doc(db, 'rooms', roomCode);

    try {
      // Create a new room document in Firestore
      await setDoc(roomRef, {
        roomCode: roomCode,
        players: [{
            uid: user.uid,
            name: username,
            score: 0,
            wind: '', // Player will choose wind on the next screen
            flowerTiles: [],
        }],
        playerUIDs: [user.uid],
        createdAt: new Date(),
        gameMaster: user.uid,
        status: 'lobby',
        availableFlowerTiles: ALL_FLOWER_TILES,
        history: [],
      });
      // Navigate to the Game Master page with the new room code
      navigate(`/gamemaster/${roomCode}`);
    } catch (error) {
      console.error("Error creating room: ", error);
      setError("Failed to create a room. Please try again.");
    }
  };

  const handleJoinRoom = async (e) => {
    e.preventDefault();
    if (!joinRoomCode.trim()) {
        setError('Please enter a room code.');
        return;
    }
    const roomCode = joinRoomCode.trim();
    const roomRef = doc(db, 'rooms', roomCode);
    
    try {
        const roomSnap = await getDoc(roomRef);
        if (roomSnap.exists()) {
            navigate(`/gamemaster/${roomCode}`);
        } else {
            setError('Room not found. Please check the code and try again.');
        }
    } catch (err) {
        console.error("Error checking room:", err);
        setError("An error occurred while trying to join the room.");
    }
  };

  return (
    <div className="home-background">
      <Container>
        <div className="home-container p-5 rounded-4">
          <h2 className="mb-4">🏠 Home</h2>
          {error && <Alert color="danger">{error}</Alert>}
          <Row>
            <Col md={6} className="d-flex flex-column">
              <div className="create-room-section">
                <h3>Create New Room</h3>
                <p>Start a new mahjong game session</p>
                <Button className="create-room-btn mt-auto" onClick={handleCreateRoom}>
                  + Create Room
                </Button>
              </div>
            </Col>
            <Col md={6}>
              <div className="join-room-section">
                <h3>Join Existing Room</h3>
                <Form onSubmit={handleJoinRoom}>
                  <FormGroup>
                    <label htmlFor="roomCode">Room Code</label>
                    <Input
                      type="text"
                      name="roomCode"
                      id="roomCode"
                      placeholder="Enter room code"
                      value={joinRoomCode}
                      onChange={(e) => setJoinRoomCode(e.target.value)}
                    />
                  </FormGroup>
                  <Button type="submit" className="join-room-btn">🚪 Join Room</Button>
                </Form>
              </div>
            </Col>
          </Row>
        </div>
      </Container>
    </div>
  );
};

export default Home;
