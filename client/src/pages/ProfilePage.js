import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, orderBy, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../firebase-config';
import { useAuth } from '../hooks/useAuth';
import { Container, Row, Col, Card, CardHeader, CardBody, CardTitle, CardText, Spinner, Button } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrophy, faChartLine, faPercentage, faPlusMinus, faEnvelope, faTrash } from '@fortawesome/free-solid-svg-icons';
import './ProfilePage.css';

const ProfilePage = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState({
        gamesPlayed: 0,
        gamesWon: 0,
        winRate: 0,
        totalScore: 0,
    });
    const [gameHistory, setGameHistory] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchGameData = async () => {
            if (!user) return;
            setLoading(true);
            
            const roomsRef = collection(db, 'rooms');
            const q = query(
                roomsRef, 
                where('playerUIDs', 'array-contains', user.uid),
                where('status', '==', 'finished'),
                orderBy('finishedAt', 'desc')
            );

            const querySnapshot = await getDocs(q);
            const history = [];
            let gamesPlayed = 0;
            let gamesWon = 0;
            let totalScore = 0;

            querySnapshot.forEach(doc => {
                const data = doc.data();
                gamesPlayed++;
                if (data.winner?.uid === user.uid) {
                    gamesWon++;
                }
                const userPlayer = data.players.find(p => p.uid === user.uid);
                if (userPlayer) {
                    totalScore += userPlayer.score;
                }
                history.push({ id: doc.id, ...data });
            });

            setGameHistory(history);
            setStats({
                gamesPlayed,
                gamesWon,
                winRate: gamesPlayed > 0 ? ((gamesWon / gamesPlayed) * 100).toFixed(1) : 0,
                totalScore,
            });
            setLoading(false);
        };

        fetchGameData();
    }, [user]);

    const handleDeleteGame = async (gameId) => {
        if (window.confirm('Are you sure you want to delete this game?')) {
            await deleteDoc(doc(db, 'rooms', gameId));
            setGameHistory(prev => prev.filter(game => game.id !== gameId));
        }
    };

    if (loading) {
        return <Container className="text-center py-5"><Spinner>Loading...</Spinner></Container>;
    }

    const StatCard = ({ icon, title, value }) => (
        <Col md={3} className="mb-4">
            <Card className="text-center h-100 stat-card">
                <CardBody>
                    <div className="stat-value">{value}</div>
                    <CardText className="stat-title">{title}</CardText>
                </CardBody>
            </Card>
        </Col>
    );

    return (
        <div className="home-background">
        <Container className="py-5">
            <div className="profile-info text-center mb-4">
                <h2 className="profile-username">{user?.displayName || 'Player'}</h2>
                <p className="user-email">
                    <FontAwesomeIcon icon={faEnvelope} className="me-2" />
                    {user?.email}
                </p>
            </div>

            <h3 className="profile-header">Game Statistics</h3>
            
            <Row className="mb-5">
                <StatCard title="Games Played" value={stats.gamesPlayed} />
                <StatCard title="Games Won" value={stats.gamesWon} />
                <StatCard title="Win Rate" value={`${stats.winRate}%`} />
                <StatCard title="Overall Score" value={stats.totalScore} />
            </Row>

            <h3 className="profile-header">Game History</h3>
            {gameHistory.length > 0 ? (
                <ul style={{ listStyle: 'none', padding: 0 }}>
                    {gameHistory.map(game => (
                        <li key={game.id} className="d-flex align-items-center mb-3 p-3" style={{ border: '1px solid #eee', borderRadius: '8px' }}>
                            <div style={{ flex: 1 }}>
                                <div>
                                    <strong>Room:</strong> {game.roomCode || game.id}
                                </div>
                                <div>
                                    <strong>Date:</strong> {game.finishedAt ? new Date(game.finishedAt.seconds * 1000).toLocaleDateString() : 'Date not available'}
                                    <span className="ms-3"><strong>Winner:</strong> {game.winner?.name || 'N/A'}</span>
                                </div>
                                <div className="mt-2" style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
                                    {game.players.map(p => (
                                        <span key={p.uid} style={{ minWidth: '120px', display: 'inline-block' }}>
                                            <strong>{p.name}:</strong> {p.score > 0 ? '+' : ''}{p.score}
                                        </span>
                                    ))}
                                </div>
                            </div>
                            <Button color="link" className="p-0 ms-2" style={{ color: '#888' }} onClick={() => handleDeleteGame(game.id)}>
                                <FontAwesomeIcon icon={faTrash} size="lg" />
                            </Button>
                        </li>
                    ))}
                </ul>
            ) : (
                <p>No completed games found.</p>
            )}
        </Container>
        </div>
    );
};

export default ProfilePage; 