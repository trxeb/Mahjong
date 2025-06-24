import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../firebase-config';
import { useAuth } from '../hooks/useAuth';
import { Container, Row, Col, Card, CardHeader, CardBody, CardTitle, CardText, Spinner, Button } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrophy, faChartLine, faPercentage, faPlusMinus, faEnvelope } from '@fortawesome/free-solid-svg-icons';
import { doc, getDoc } from 'firebase/firestore';
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
    const [username, setUsername] = useState('');

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

    useEffect(() => {
        const fetchUsername = async () => {
            if (user?.uid) {
                const userDoc = await getDoc(doc(db, "users", user.uid));
                if (userDoc.exists()) {
                    setUsername(userDoc.data().username);
                }
            }
        };
        fetchUsername();
    }, [user]);

    if (loading) {
        return <Container className="text-center py-5"><Spinner>Loading...</Spinner></Container>;
    }

    const StatCard = ({ icon, title, value }) => (
        <Col xs={12} sm={6} md={3} className="mb-4">
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
            <Container fluid className="py-5">
                <div className="profile-info text-center mb-4">
                    <h2 className="profile-username">{username || 'Player'}</h2>
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
                    gameHistory.map(game => (
                        <Card key={game.id} className="mb-3">
                            <CardHeader>
                                Game on {game.finishedAt ? new Date(game.finishedAt.seconds * 1000).toLocaleDateString() : 'Date not available'}
                                <strong className="ms-3">Winner: {game.winner?.name || 'N/A'}</strong>
                            </CardHeader>
                            <CardBody>
                                <Row>
                                    {game.players.map(p => (
                                        <Col key={p.uid} md={3}>
                                            <strong>{p.name}:</strong> {p.score > 0 ? '+' : ''}{p.score}
                                        </Col>
                                    ))}
                                </Row>
                            </CardBody>
                        </Card>
                    ))
                ) : (
                    <p>No completed games found.</p>
                )}
            </Container>
        </div>
    );
};

export default ProfilePage;