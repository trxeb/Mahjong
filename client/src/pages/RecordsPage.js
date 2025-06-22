import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { doc, onSnapshot, updateDoc, arrayUnion } from 'firebase/firestore';
import { db } from '../firebase-config';
import { useAuth } from '../hooks/useAuth';
import FlowerModal from '../components/FlowerModal';
import DeclareWinModal from '../components/DeclareWinModal';
import { Container, Row, Col, Button, Card, CardBody, Input } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUndo, faClipboard, faFan, faCoins, faChartBar, faTrophy, faPlus, faHandshake } from '@fortawesome/free-solid-svg-icons';

const seatValueMap = { 'East (東)': 1, 'South (南)': 2, 'West (西)': 3, 'North (北)': 4 };
const windRotationMap = {
    'East (東)': 'North (北)',
    'South (南)': 'East (東)',
    'West (西)': 'South (南)',
    'North (北)': 'West (西)',
};

const RecordsPage = () => {
    const { roomCode } = useParams();
    const navigate = useNavigate();
    const { user: currentUser } = useAuth();
    const [players, setPlayers] = useState([]);
    const [selectedFlowerPlayer, setSelectedFlowerPlayer] = useState('');
    const [selectedKongType, setSelectedKongType] = useState('Concealed Kong');
    const [selectedKongTarget, setSelectedKongTarget] = useState('');
    const [room, setRoom] = useState(null);
    const [roomExists, setRoomExists] = useState(true);
    const [highestScore, setHighestScore] = useState(-Infinity);
    const [mostWins, setMostWins] = useState(-1);
    const [modalOpen, setModalOpen] = useState(false);
    const [winModalOpen, setWinModalOpen] = useState(false);

    useEffect(() => {
        if (!roomCode) return;
        const roomRef = doc(db, 'rooms', roomCode);

        const unsubscribe = onSnapshot(roomRef, (docSnap) => {
            if (docSnap.exists()) {
                setRoomExists(true);
                const roomData = docSnap.data();
                setRoom(roomData);

                // If the round is over, navigate all players back to the lobby
                if (roomData.status === 'lobby') {
                    navigate(`/gamemaster/${roomCode}`);
                    return; // Stop processing to avoid errors on an unmounted component
                }

                const currentPlayers = roomData.players || [];
                setPlayers(currentPlayers);

                const otherPlayers = currentPlayers.filter(p => p.uid !== currentUser?.uid);
                if (currentPlayers.length > 0) {
                    if (!selectedFlowerPlayer && otherPlayers.length > 0) {
                        setSelectedFlowerPlayer(otherPlayers[0].uid);
                    }
                    if (!selectedKongTarget && otherPlayers.length > 0) {
                        setSelectedKongTarget(otherPlayers[0].uid);
                    }
                    
                    const scores = currentPlayers.map(p => p.score);
                    setHighestScore(Math.max(...scores));
                    
                    const wins = currentPlayers.map(p => p.gamesWon || 0);
                    const maxWins = Math.max(...wins);
                    setMostWins(maxWins > 0 ? maxWins : -1);
                }
            } else {
                setRoomExists(false);
            }
        });

        return () => unsubscribe();
    }, [roomCode, navigate, currentUser?.uid]);

    const calculateFlowerBonuses = (actingPlayer, tile, currentPlayers) => {
        let updatedPlayers = [...currentPlayers];
        let bonusTai = 0;
        let setBonus = false;

        const playerIndex = updatedPlayers.findIndex(p => p.uid === actingPlayer.uid);
        const player = updatedPlayers[playerIndex];
        const playerTiles = [...player.flowerTiles, tile]; // Temporarily add new tile for calculation

        // Rule 1: Own Seat Flower
        const seatValue = seatValueMap[player.wind];
        const hasOwnSeason = playerTiles.some(t => t.group === 'SEASONS' && t.value === seatValue);
        const hasOwnFlower = playerTiles.some(t => t.group === 'FLOWERS' && t.value === seatValue);
        if (hasOwnSeason && hasOwnFlower) {
            bonusTai += 1;
        }

        // Rule 2: Full Set
        const seasonTiles = playerTiles.filter(t => t.group === 'SEASONS');
        const flowerTiles = playerTiles.filter(t => t.group === 'FLOWERS');
        if (seasonTiles.length === 4 || flowerTiles.length === 4) {
            bonusTai += 2;
            setBonus = true; // A full set bonus
        }

        // Rule 3: Animal Pair
        const hasCat = playerTiles.some(t => t.id === 'a1');
        const hasRat = playerTiles.some(t => t.id === 'a2');
        const hasRooster = playerTiles.some(t => t.id === 'a3');
        const hasCentipede = playerTiles.some(t => t.id === 'a4');
        if ((hasCat && hasRat) || (hasRooster && hasCentipede)) {
            bonusTai += 1;
        }
        
        // This is a simplified bonus calculation. A real game might have more complex rules.
        // For now, we calculate total bonus and distribute
        const existingBonus = player.flowerBonus || 0;
        const newBonus = bonusTai - existingBonus;

        if (newBonus > 0) {
            const chips = setBonus ? 2 : 1; // 2 chips for a full set, 1 for others
            const taiPerPlayer = chips;
            
            updatedPlayers[playerIndex].score += (chips * 3);
            updatedPlayers[playerIndex].flowerBonus = bonusTai;

            updatedPlayers.forEach((p, index) => {
                if (index !== playerIndex) {
                    updatedPlayers[index].score -= taiPerPlayer;
                }
            });
        }
        
        return updatedPlayers;
    };

    const handleFlowerSelect = async (tile) => {
        setModalOpen(false);
        if (!currentUser || !room) return;

        const roomRef = doc(db, 'rooms', roomCode);
        let currentPlayers = [...room.players];
        const playerIndex = currentPlayers.findIndex(p => p.uid === currentUser.uid);

        if (playerIndex === -1) {
            console.error("Current user not found in the room's players list.");
            return;
        }
        
        const actingPlayer = { ...currentPlayers[playerIndex] };
        actingPlayer.flowerTiles = [...(actingPlayer.flowerTiles || []), tile];
        
        // Calculate bonuses and update all players' scores
        const updatedPlayersWithBonuses = calculateFlowerBonuses(actingPlayer, tile, currentPlayers);

        // Remove the selected tile from the available list
        const updatedAvailableTiles = room.availableFlowerTiles.filter(t => t.id !== tile.id);

        await updateDoc(roomRef, {
            players: updatedPlayersWithBonuses,
            availableFlowerTiles: updatedAvailableTiles,
            history: arrayUnion({
                type: 'flower_add',
                actor: currentUser.uid,
                tile: tile,
                timestamp: new Date(),
            })
        });
    };

    const handleRecordFlower = async () => {
        if (!currentUser || !selectedFlowerPlayer || currentUser.uid === selectedFlowerPlayer) {
            console.log("Invalid flower action: Cannot select yourself.");
            return;
        }

        const actorIndex = room.players.findIndex(p => p.uid === currentUser.uid);
        const targetIndex = room.players.findIndex(p => p.uid === selectedFlowerPlayer);

        if (actorIndex === -1 || targetIndex === -1) return;

        const updatedPlayers = [...room.players];
        updatedPlayers[actorIndex].score += 1;
        updatedPlayers[targetIndex].score -= 1;

        const roomRef = doc(db, 'rooms', roomCode);
        await updateDoc(roomRef, {
            players: updatedPlayers,
            history: arrayUnion({
                type: 'flower',
                actor: currentUser.uid,
                target: selectedFlowerPlayer,
                timestamp: new Date(),
            })
        });
    };

    const handleRecordKong = async () => {
        if (!currentUser) return;

        const actorIndex = room.players.findIndex(p => p.uid === currentUser.uid);
        if (actorIndex === -1) return;
        
        const updatedPlayers = [...room.players];
        let historyEntry = {
            type: 'kong',
            kongType: selectedKongType,
            actor: currentUser.uid,
            timestamp: new Date(),
        };

        if (selectedKongType === 'Concealed Kong') {
            // Per the rule "if you draw yourself = 2 chips", the declarer is paid by all 3 opponents.
            // The declarer gains 6 points (2 chips * 3 players), and each opponent loses 2 points.
            updatedPlayers[actorIndex].score += 6;
            updatedPlayers.forEach((p, index) => {
                if (index !== actorIndex) {
                    updatedPlayers[index].score -= 2;
                }
            });
        } else { // Melded Kong
            // Per the rule "if someone threw it = 1 chip", the declarer is paid by the discarder.
            // The declarer gains 1 point, and the target loses 1 point.
            const targetIndex = room.players.findIndex(p => p.uid === selectedKongTarget);
            if (targetIndex === -1) return;
            
            updatedPlayers[actorIndex].score += 1;
            updatedPlayers[targetIndex].score -= 1;
            historyEntry.target = selectedKongTarget;
        }

        const roomRef = doc(db, 'rooms', roomCode);
        await updateDoc(roomRef, {
            players: updatedPlayers,
            history: arrayUnion(historyEntry)
        });
    };

    const handleUndoLastAction = async () => {
        if (!room || !room.history || room.history.length === 0) {
            console.log("No actions to undo.");
            return;
        }

        const lastAction = room.history[room.history.length - 1];
        let updatedPlayers = JSON.parse(JSON.stringify(room.players)); // Deep copy

        // Revert the changes based on the last action type
        switch (lastAction.type) {
            case 'kong':
                const actorIndex = updatedPlayers.findIndex(p => p.uid === lastAction.actor);
                if (actorIndex === -1) break;

                if (lastAction.kongType === 'Concealed Kong') {
                    // Reverse the 2-chip rule
                    updatedPlayers[actorIndex].score -= 6;
                    updatedPlayers.forEach((p, index) => {
                        if (index !== actorIndex) p.score += 2;
                    });
                } else { // Melded Kong
                    // Reverse the 1-chip rule
                    const targetIndex = updatedPlayers.findIndex(p => p.uid === lastAction.target);
                    if (targetIndex === -1) break;
                    updatedPlayers[actorIndex].score -= 1;
                    updatedPlayers[targetIndex].score += 1;
                }
                break;
            
            case 'flower_add':
                // This is a complex operation. For now, we will find the player,
                // remove the tile, and add it back to the available pool.
                // A full score recalculation is the safest way to ensure correctness.
                
                const flowerActorIndex = updatedPlayers.findIndex(p => p.uid === lastAction.actor);
                if (flowerActorIndex === -1) break;

                // For simplicity, we assume the last added tile is what's being removed.
                // This could be improved with more detailed history logging.
                const lastTile = lastAction.tile;
                updatedPlayers[flowerActorIndex].flowerTiles = updatedPlayers[flowerActorIndex].flowerTiles.filter(t => t.id !== lastTile.id);
                
                // We'll revert to the scores stored *before* this action if we logged them.
                // Since we don't have that, a full recalculation would be needed.
                // The current implementation will just remove the tile but not revert score.
                // This will be fixed in a future update. For now, let's just make the tile available again.
                
                const updatedAvailableTiles = [...room.availableFlowerTiles, lastAction.tile];
                
                // NOTE: Score reversal for flowers is not yet implemented.
                // This is a placeholder for a more robust solution.
                // For now, the main effect is making the tile available again.

                const roomRefForFlower = doc(db, 'rooms', roomCode);
                await updateDoc(roomRefForFlower, {
                    players: updatedPlayers,
                    availableFlowerTiles: updatedAvailableTiles,
                    history: room.history.slice(0, -1) // Remove last action
                });
                return; // Exit early for flower undo

            default:
                console.log("Unknown action type, cannot undo:", lastAction.type);
                return;
        }

        // Update database for non-flower actions
        const roomRef = doc(db, 'rooms', roomCode);
        await updateDoc(roomRef, {
            players: updatedPlayers,
            history: room.history.slice(0, -1) // Remove last action
        });
    };

    const handleDeclareWin = async ({ isSelfDrawn, losingPlayerId, taiValue }) => {
        const roomRef = doc(db, 'rooms', roomCode);
        let updatedPlayers = JSON.parse(JSON.stringify(room.players)); // Deep copy
        
        const winnerIndex = updatedPlayers.findIndex(p => p.uid === currentUser.uid);
        if (winnerIndex === -1) return;

        updatedPlayers[winnerIndex].gamesWon = (updatedPlayers[winnerIndex].gamesWon || 0) + 1;

        if (isSelfDrawn) {
            // Self-Drawn win: Paid by all 3 opponents
            const pointsFromEach = Math.pow(2, taiValue - 1); // e.g., 3 tai -> 2^2=4 points from each
            const totalGain = pointsFromEach * (updatedPlayers.length - 1);
            
            updatedPlayers[winnerIndex].score += totalGain;
            updatedPlayers.forEach((p, index) => {
                if (index !== winnerIndex) {
                    p.score -= pointsFromEach;
                }
            });
        } else {
            // Win on discard
            const loserIndex = updatedPlayers.findIndex(p => p.uid === losingPlayerId);
            if (loserIndex === -1) return;

            const points = Math.pow(2, taiValue); // e.g., 3 tai -> 2^3=8 points
            updatedPlayers[winnerIndex].score += points;
            updatedPlayers[loserIndex].score -= points;
        }

        // --- Wind Rotation Logic ---
        const winner = updatedPlayers[winnerIndex];
        const eastPlayerWind = 'East (東)';
    
        // Rotate winds ONLY if the winner is NOT East
        if (winner.wind !== eastPlayerWind) {
            updatedPlayers = updatedPlayers.map(p => {
                const newWind = windRotationMap[p.wind];
                // Defensive check to prevent undefined wind values
                return { ...p, wind: newWind || p.wind };
            });
        }

        // Defensive check to ensure losingPlayerId is never undefined
        const finalLosingPlayerId = isSelfDrawn ? null : losingPlayerId || null;

        await updateDoc(roomRef, {
            players: updatedPlayers,
            status: 'lobby',
            history: arrayUnion({
                type: 'win',
                actor: currentUser.uid,
                isSelfDrawn,
                losingPlayer: finalLosingPlayerId,
                tai: taiValue,
                timestamp: new Date(),
            })
        });
    };

    const handleDeclareDraw = async () => {
        let updatedPlayers = JSON.parse(JSON.stringify(room.players));
        const history = room.history || [];

        // Find the index of the last round-ending event to isolate the current round's history.
        let lastRoundEndIndex = -1;
        for (let i = history.length - 1; i >= 0; i--) {
            if (history[i].type === 'win' || history[i].type === 'draw') {
                lastRoundEndIndex = i;
                break;
            }
        }
        const currentRoundHistory = history.slice(lastRoundEndIndex + 1);

        // Check if "money has changed hands" (i.e., any scoring action occurred during the round).
        const moneyChangedHands = currentRoundHistory.some(
            action => action.type === 'kong' || action.type === 'flower_add'
        );

        // On a draw, winds rotate ONLY if money changed hands.
        if (moneyChangedHands) {
            updatedPlayers = updatedPlayers.map(p => ({ ...p, wind: windRotationMap[p.wind] }));
        }
    
        const roomRef = doc(db, 'rooms', roomCode);
        await updateDoc(roomRef, {
            players: updatedPlayers,
            status: 'lobby',
            history: arrayUnion({
                type: 'draw',
                moneyChangedHands: moneyChangedHands,
                timestamp: new Date(),
            })
        });
    };

    const toggleModal = () => setModalOpen(!modalOpen);
    const toggleWinModal = () => setWinModalOpen(!winModalOpen);

    if (!roomExists) {
        return (
            <div className="records-background text-center py-5">
                <h2>Room Not Found</h2>
                <p>The room with code <strong>{roomCode}</strong> does not exist.</p>
            </div>
        );
    }

    const ActionCard = ({ title, children }) => (
        <Col md={4}>
            <div className="action-section">
                <h5 className="mb-3">{title}</h5>
                {children}
            </div>
        </Col>
    );

    return (
        <div className="records-background">
            <FlowerModal
                isOpen={modalOpen}
                toggle={toggleModal}
                onSelect={handleFlowerSelect}
                availableTiles={room?.availableFlowerTiles || []}
            />
            <DeclareWinModal
                isOpen={winModalOpen}
                toggle={toggleWinModal}
                players={players}
                currentUser={currentUser}
                room={room}
                onDeclare={handleDeclareWin}
            />
            <Container className="py-4">
                <div className="records-container p-4 rounded-4">
                    <h2 className="mb-4"><FontAwesomeIcon icon={faClipboard} /> Game Records</h2>
                    <Row className="mb-5">
                        <ActionCard title="胡 (Hu - Win)">
                            <Button className="btn-declare-win w-100" onClick={toggleWinModal}>🎉 Declare Win</Button>
                        </ActionCard>
                        <ActionCard title="花 (Hua - Flower)">
                            <Button className="btn-record-action w-100" onClick={toggleModal}>
                                <FontAwesomeIcon icon={faPlus} /> Add Flower Tile
                            </Button>
                        </ActionCard>
                        <ActionCard title="槓 (Gang - Kong)">
                             <Input type="select" className="mb-2" value={selectedKongType} onChange={e => setSelectedKongType(e.target.value)}>
                                <option>Concealed Kong</option>
                                <option>Melded Kong</option>
                            </Input>
                            {selectedKongType === 'Melded Kong' && (
                                <Input type="select" className="mb-2" value={selectedKongTarget} onChange={e => setSelectedKongTarget(e.target.value)}>
                                    {players.filter(p => p.uid !== currentUser?.uid).map(p => <option key={p.uid} value={p.uid}>{p.wind} - {p.name}</option>)}
                                 </Input>
                            )}
                            <Button className="btn-record-action w-100" onClick={handleRecordKong}>■ Record Kong</Button>
                        </ActionCard>
                    </Row>
                    
                    <hr className="my-4" />

                    <Row>
                        <Col>
                            <div className="action-section text-md-start">
                                <h5 className="mb-3">Other Actions</h5>
                                <Button className="btn-record-action me-2" onClick={handleUndoLastAction}><FontAwesomeIcon icon={faUndo} /> Undo Last Action</Button>
                                <Button className="btn-record-action" onClick={handleDeclareDraw}><FontAwesomeIcon icon={faHandshake} /> Declare Draw</Button>
                            </div>
                        </Col>
                    </Row>
                </div>

                <div className="mt-5">
                    <h2 className="text-center mb-4"><FontAwesomeIcon icon={faTrophy} /> Current Scores</h2>
                    <Row>
                        {players.map(player => (
                            <Col md={6} key={player.uid} className="mb-4">
                                <Card className={`player-score-card h-100 ${player.score === highestScore ? 'highlight' : ''}`}>
                                    <CardBody className="text-center d-flex flex-column justify-content-center">
                                        <div className="wind-indicator">{player.wind}</div>
                                        <div className="player-name mt-2">{player.name}</div>
                                        <div className="player-score my-1">{player.score > 0 ? '+' : ''}{player.score}</div>
                                        <small className="text-muted mt-auto">
                                            Wind: {player.wind.split(' ')[0]} | Games Won: {player.gamesWon || 0}
                                            {player.gamesWon === mostWins && mostWins !== -1 && <FontAwesomeIcon icon={faTrophy} className="ms-2 text-warning" />}
                                        </small>
                                    </CardBody>
                                </Card>
                            </Col>
                        ))}
                    </Row>
                </div>
            </Container>
        </div>
    );
};

export default RecordsPage;
