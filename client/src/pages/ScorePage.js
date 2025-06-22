import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase-config';
import { Container, Row, Col, Card, CardBody } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrophy } from '@fortawesome/free-solid-svg-icons';

const ScorePage = () => {
    const { roomCode } = useParams();
    const [players, setPlayers] = useState([]);
    const [roomExists, setRoomExists] = useState(true);
    const [highestScore, setHighestScore] = useState(-Infinity);
    const [mostWins, setMostWins] = useState(-1);

    useEffect(() => {
        if (!roomCode) return;
        const roomRef = doc(db, 'rooms', roomCode);

        const unsubscribe = onSnapshot(roomRef, (docSnap) => {
            if (docSnap.exists()) {
                setRoomExists(true);
                const roomData = docSnap.data();
                const currentPlayers = roomData.players || [];
                setPlayers(currentPlayers);

                if (currentPlayers.length > 0) {
                    const scores = currentPlayers.map(p => p.score);
                    const maxScore = Math.max(...scores);
                    setHighestScore(maxScore);
                    
                    const wins = currentPlayers.map(p => p.gamesWon || 0);
                    const maxWins = Math.max(...wins);
                    setMostWins(maxWins > 0 ? maxWins : -1);
                }

            } else {
                setRoomExists(false);
            }
        });

        return () => unsubscribe();
    }, [roomCode]);

    if (!roomExists) {
        return (
            <div className="score-background text-center py-5">
                <h2>Room Not Found</h2>
                <p>The room with code <strong>{roomCode}</strong> does not exist.</p>
            </div>
        );
    }
    
    return (
        <div className="score-background">
            <Container className="py-5">
                 <h2 className="text-center mb-2">Room Code: {roomCode}</h2>
                <h1 className="text-center mb-5"><FontAwesomeIcon icon={faTrophy} /> Current Scores</h1>
                <Row>
                    {players.map(player => (
                        <Col md={6} lg={3} key={player.uid} className="mb-4">
                            <Card className={`player-score-card ${player.score === highestScore ? 'highlight' : ''}`}>
                                <CardBody className="text-center">
                                    <div className="wind-indicator">{player.wind}</div>
                                    <div className="player-name">{player.name}</div>
                                    <div className="player-score">
                                        {player.score > 0 ? '+' : ''}{player.score}
                                    </div>
                                    <small className="text-muted">
                                        Wind: {player.wind.split(' ')[0]} | Games Won: {player.gamesWon || 0}
                                        {player.gamesWon === mostWins && mostWins !== -1 && <FontAwesomeIcon icon={faTrophy} className="ms-2 text-warning" />}
                                    </small>
                                </CardBody>
                            </Card>
                        </Col>
                    ))}
                </Row>
            </Container>
        </div>
    );
};

export default ScorePage;
