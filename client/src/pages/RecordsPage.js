import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, onSnapshot, updateDoc, arrayUnion, setDoc } from 'firebase/firestore';
import { db } from '../firebase-config';
import { useAuth } from '../hooks/useAuth';
import FlowerModal from '../components/FlowerModal';
import DeclareWinModal from '../components/DeclareWinModal';
import { Container, Row, Col, Button, Card, CardBody, Input, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUndo, faClipboard, faTrophy, faPlus, faHandshake } from '@fortawesome/free-solid-svg-icons';

const seatValueMap = { 'East (東)': 1, 'South (南)': 2, 'West (西)': 3, 'North (北)': 4 };
const windRotationMap = {
    'East (東)': 'North (北)',
    'South (南)': 'East (東)',
    'West (西)': 'South (南)',
    'North (北)': 'West (西)',
};

const defaultTaiSettings = {
    baseWin: 1,
    selfDraw: 1,
    allPungs: 2,
    pureSuit: 8,
    allHonors: 8,
};

const roundWinds = ['East (東風)', 'South (南風)', 'West (西風)', 'North (北風)'];

const RecordsPage = () => {
    const { roomCode } = useParams();
    const navigate = useNavigate();
    const { user: currentUser } = useAuth();
    const [players, setPlayers] = useState([]);
    const [selectedKongType, setSelectedKongType] = useState('Concealed Kong');
    const [selectedKongTarget, setSelectedKongTarget] = useState('');
    const [room, setRoom] = useState(null);
    const [roomExists, setRoomExists] = useState(true);
    const [highestScore, setHighestScore] = useState(-Infinity);
    const [mostWins, setMostWins] = useState(-1);
    const [modalOpen, setModalOpen] = useState(false);
    const [winModalOpen, setWinModalOpen] = useState(false);
    const [winnerModalOpen, setWinnerModalOpen] = useState(false);
    const [gameWinner, setGameWinner] = useState(null);
    const [taiSettings, setTaiSettings] = useState(defaultTaiSettings);
    const [taiForm, setTaiForm] = useState(defaultTaiSettings);
    const [taiLoading, setTaiLoading] = useState(true);
    const [isMingGangSelfDrawn, setIsMingGangSelfDrawn] = useState(false);

    useEffect(() => {
        if (!roomCode) return;
        const roomRef = doc(db, 'rooms', roomCode);

        const unsubscribe = onSnapshot(roomRef, (docSnap) => {
            if (docSnap.exists()) {
                setRoomExists(true);
                const roomData = docSnap.data();
                setRoom(roomData);
                const newTai = roomData.taiSettings || defaultTaiSettings;
                setTaiSettings(newTai);
                setTaiForm(newTai);
                setTaiLoading(false);

                if (roomData.status === 'finished') {
                    if (roomData.winner) {
                        const winnerData = players.find(p => p.uid === roomData.winner.uid);
                        setGameWinner(winnerData || roomData.winner);
                    }
                    setWinnerModalOpen(true);
                    return;
                }

                if (roomData.status === 'lobby') {
                    navigate(`/gamemaster/${roomCode}`);
                    return;
                }

                const currentPlayers = roomData.players || [];
                setPlayers(currentPlayers);

                const otherPlayers = currentPlayers.filter(p => p.uid !== currentUser?.uid);
                if (currentPlayers.length > 0) {
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
    }, [roomCode, navigate, currentUser?.uid, selectedKongTarget]);

    const calculateBonusChips = (tiles, playerWind) => {
        if (!tiles || tiles.length === 0) {
            return 0;
        }

        let chips = 0;
        const seatValue = seatValueMap[playerWind];

        // Rule 1: Own Seat Flower (1 chip)
        const hasOwnSeason = tiles.some(t => t.group === 'SEASONS' && t.value === seatValue);
        const hasOwnFlower = tiles.some(t => t.group === 'FLOWERS' && t.value === seatValue);
        if (hasOwnSeason && hasOwnFlower) {
            chips += 1;
        }

        // Rule 2: Full Set (2 chips)
        const seasonTiles = tiles.filter(t => t.group === 'SEASONS');
        const flowerTiles = tiles.filter(t => t.group === 'FLOWERS');
        if (seasonTiles.length === 4) {
            chips += 2;
        }
        if (flowerTiles.length === 4) {
            chips += 2;
        }

        // Rule 3: Animal Pairs (1 chip per pair)
        const hasCat = tiles.some(t => t.id === 'a1');
        const hasRat = tiles.some(t => t.id === 'a2');
        const hasRooster = tiles.some(t => t.id === 'a3');
        const hasCentipede = tiles.some(t => t.id === 'a4');
        if (hasCat && hasRat) {
            chips += 1;
        }
        if (hasRooster && hasCentipede) {
            chips += 1;
        }

        return chips;
    };

    const handleFlowerSelect = async (tile) => {
        setModalOpen(false);
        if (!currentUser || !room) return;
    
        const roomRef = doc(db, 'rooms', roomCode);
        let updatedPlayers = JSON.parse(JSON.stringify(room.players));
        const playerIndex = updatedPlayers.findIndex(p => p.uid === currentUser.uid);
    
        if (playerIndex === -1) {
            console.error("Current user not found in the room's players list.");
            return;
        }
    
        const actingPlayer = updatedPlayers[playerIndex];
        
        // Calculate chips before adding the new tile
        const chipsBefore = calculateBonusChips(actingPlayer.flowerTiles, actingPlayer.wind);
        
        // Add the new tile
        actingPlayer.flowerTiles = [...(actingPlayer.flowerTiles || []), tile];
        
        // Calculate chips after adding the new tile
        const chipsAfter = calculateBonusChips(actingPlayer.flowerTiles, actingPlayer.wind);
        
        const chipsToAward = chipsAfter - chipsBefore;
    
        if (chipsToAward > 0) {
            const pointsPerChip = updatedPlayers.length - 1;
            const totalGain = chipsToAward * pointsPerChip;
    
            // Award points to the acting player
            actingPlayer.score += totalGain;
    
            // Deduct points from other players
            updatedPlayers = updatedPlayers.map((p, index) => {
                if (index !== playerIndex) {
                    p.score -= chipsToAward;
                }
                return p;
            });
        }
        
        // Update the player in the array
        updatedPlayers[playerIndex] = actingPlayer;
    
        // Remove the selected tile from the available list
        const updatedAvailableTiles = room.availableFlowerTiles.filter(t => t.id !== tile.id);
    
        await updateDoc(roomRef, {
            players: updatedPlayers,
            availableFlowerTiles: updatedAvailableTiles,
            history: arrayUnion({
                type: 'flower_add',
                actor: currentUser.uid,
                tile: tile,
                chips_awarded: chipsToAward,
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
            // Just record the An Gang for end-of-game tai calculation
            updatedPlayers[actorIndex].anGangCount = (updatedPlayers[actorIndex].anGangCount || 0) + 1;
            // No immediate points
        } else if (selectedKongType === 'Exposed Kong') {
            if (isMingGangSelfDrawn) {
                // All other players lose 1 tai, actor gains 3
                updatedPlayers[actorIndex].score += 3;
                updatedPlayers.forEach((p, index) => {
                    if (index !== actorIndex) {
                        updatedPlayers[index].score -= 1;
                    }
                });
                historyEntry.isSelfDrawn = true;
            } else {
                // Only discarder loses 1 tai, actor gains 1
                const targetIndex = room.players.findIndex(p => p.uid === selectedKongTarget);
                if (targetIndex === -1) return;
                updatedPlayers[actorIndex].score += 1;
                updatedPlayers[targetIndex].score -= 1;
                historyEntry.target = selectedKongTarget;
                historyEntry.isSelfDrawn = false;
            }
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

    // Helper to count animal tiles
    function countAnimalTai(tiles) {
        // Assuming animal tile IDs are a1, a2, a3, a4
        const animalIds = ['a1', 'a2', 'a3', 'a4'];
        return tiles ? tiles.filter(t => animalIds.includes(t.id)).length : 0;
    }

    // Helper to check for matching flower
    function hasMatchingFlower(tiles, playerWind) {
        // Assuming flower group is 'FLOWERS' and value matches seatValueMap
        const seatValue = seatValueMap[playerWind];
        return tiles ? tiles.some(t => t.group === 'FLOWERS' && t.value === seatValue) : false;
    }

    const handleDeclareWin = async ({ isSelfDrawn, losingPlayerId, taiValue }) => {
        const roomRef = doc(db, 'rooms', roomCode);
        let updatedPlayers = JSON.parse(JSON.stringify(room.players)); // Deep copy
        const winnerIndex = updatedPlayers.findIndex(p => p.uid === currentUser.uid);
        if (winnerIndex === -1) return;
        // --- Add extra tai for animals and matching flower ---
        const winner = updatedPlayers[winnerIndex];
        const flowerTai = hasMatchingFlower(winner.flowerTiles, winner.wind) ? 1 : 0;
        const animalTai = countAnimalTai(winner.flowerTiles);
        const extraTai = flowerTai + animalTai;
        const totalTai = taiValue + extraTai;
        // --- Existing win logic, but use totalTai ---
        winner.gamesWon = (winner.gamesWon || 0) + 1;
        // --- Dealer and round wind logic ---
        let dealerIndex = room.dealerIndex ?? 0;
        let dealerRotationCount = room.dealerRotationCount ?? 0;
        let currentWind = room.currentWind ?? 'East (東風)';
        const eastPlayerWind = 'East (東)';
        let nextDealerIndex = dealerIndex;
        let nextDealerRotationCount = dealerRotationCount;
        let nextCurrentWind = currentWind;
        // Find current dealer (East)
        const eastIndex = updatedPlayers.findIndex(p => p.wind === eastPlayerWind);
        // Determine if dealer keeps position (East wins)
        let dealerKeeps = (winnerIndex === eastIndex);
        if (!dealerKeeps) {
            // Dealer rotates to next player (clockwise)
            nextDealerIndex = (dealerIndex + 1) % updatedPlayers.length;
            nextDealerRotationCount = dealerRotationCount + 1;
            // Rotate player winds clockwise
            const clockwiseWinds = ['East (東)', 'South (南)', 'West (西)', 'North (北)'];
            updatedPlayers = updatedPlayers.map(p => {
                const idx = clockwiseWinds.indexOf(p.wind);
                return { ...p, wind: clockwiseWinds[(idx + 1) % 4] };
            });
            // If all 4 have been dealer, advance round wind
            if (nextDealerRotationCount >= 4) {
                const windIdx = roundWinds.indexOf(currentWind);
                nextCurrentWind = roundWinds[(windIdx + 1) % roundWinds.length]; // endless play
                nextDealerRotationCount = 0;
            }
        }
        // --- Scoring logic ---
        if (isSelfDrawn) {
            const pointsFromEach = Math.pow(2, totalTai - 1);
            const totalGain = pointsFromEach * (updatedPlayers.length - 1);
            winner.score += totalGain;
            updatedPlayers.forEach((p, index) => {
                if (index !== winnerIndex) {
                    p.score -= pointsFromEach;
                }
            });
        } else {
            const loserIndex = updatedPlayers.findIndex(p => p.uid === losingPlayerId);
            if (loserIndex === -1) return;
            const points = Math.pow(2, totalTai);
            winner.score += points;
            updatedPlayers[loserIndex].score -= points;
        }
        // Defensive check to ensure losingPlayerId is never undefined
        const finalLosingPlayerId = isSelfDrawn ? null : losingPlayerId || null;
        await updateDoc(roomRef, {
            players: updatedPlayers,
            status: 'lobby',
            dealerIndex: nextDealerIndex,
            dealerRotationCount: nextDealerRotationCount,
            currentWind: nextCurrentWind,
            history: arrayUnion({
                type: 'win',
                actor: currentUser.uid,
                isSelfDrawn,
                losingPlayer: finalLosingPlayerId,
                tai: taiValue,
                extraTai,
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

    const handleCloseWinnerModalAndRedirect = () => {
        setWinnerModalOpen(false);
        navigate('/');
    };

    const toggleModal = () => setModalOpen(!modalOpen);
    const toggleWinModal = () => setWinModalOpen(!winModalOpen);

    const handleTaiInputChange = (e) => {
        const { name, value } = e.target;
        setTaiForm(prev => ({ ...prev, [name]: Number(value) }));
    };

    const handleTaiSave = async (e) => {
        e.preventDefault();
        if (!roomCode) return;
        const roomRef = doc(db, 'rooms', roomCode);
        await updateDoc(roomRef, { taiSettings: taiForm });
    };

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
            <div className="action-section mb-3 mb-md-0" style={{ background: '#f8f9fa', borderRadius: '12px', padding: '1.5rem' }}>
                <h6 className="mb-3 text-center" style={{ fontSize: '1.3rem' }}>{title}</h6>
                {children}
            </div>
        </Col>
    );

    return (
        <div className="records-background" style={{ height: '100vh', overflow: 'hidden', background: '#f5f0e6' }}>
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
            <Modal isOpen={winnerModalOpen} toggle={handleCloseWinnerModalAndRedirect} centered>
                <ModalHeader>Game Over!</ModalHeader>
                <ModalBody className="text-center">
                    {gameWinner ? (
                        <>
                            <h4>🎉 The Winner is {gameWinner.name}! 🎉</h4>
                            <p className="lead">Final Score: {gameWinner.score}</p>
                        </>
                    ) : (
                        <p>The game has ended.</p>
                    )}
                </ModalBody>
                <ModalFooter>
                    <Button color="primary" onClick={handleCloseWinnerModalAndRedirect}>Back to Home</Button>
                </ModalFooter>
            </Modal>
            <Container className="py-3" style={{ maxHeight: '90vh', overflowY: 'auto' }}>
                <div className="records-container p-3 rounded-4">
                    <h4 className="mb-4"><FontAwesomeIcon icon={faClipboard} /> Game Records</h4>
                    <div className="mb-4 p-3" style={{ background: '#f8f9fa', borderRadius: '8px', border: '1px solid #eee' }}>
                        <h5 className="mb-3">Tai Value Configuration (Shared for this Game)</h5>
                        {taiLoading ? <span>Loading...</span> : (
                        <form onSubmit={handleTaiSave} className="row g-3 align-items-end">
                            <div className="col-md-2">
                                <label htmlFor="baseWin" className="form-label">平胡 (Basic Win)</label>
                                <input type="number" className="form-control" name="baseWin" id="baseWin" value={taiForm.baseWin} onChange={handleTaiInputChange} />
                            </div>
                            <div className="col-md-2">
                                <label htmlFor="selfDraw" className="form-label">自摸 (Self Draw)</label>
                                <input type="number" className="form-control" name="selfDraw" id="selfDraw" value={taiForm.selfDraw} onChange={handleTaiInputChange} />
                            </div>
                            <div className="col-md-2">
                                <label htmlFor="allPungs" className="form-label">對對胡 (All Pungs)</label>
                                <input type="number" className="form-control" name="allPungs" id="allPungs" value={taiForm.allPungs} onChange={handleTaiInputChange} />
                            </div>
                            <div className="col-md-2">
                                <label htmlFor="pureSuit" className="form-label">清一色 (Pure Suit)</label>
                                <input type="number" className="form-control" name="pureSuit" id="pureSuit" value={taiForm.pureSuit} onChange={handleTaiInputChange} />
                            </div>
                            <div className="col-md-2">
                                <label htmlFor="allHonors" className="form-label">字一色 (All Honors)</label>
                                <input type="number" className="form-control" name="allHonors" id="allHonors" value={taiForm.allHonors} onChange={handleTaiInputChange} />
                            </div>
                            <div className="col-md-2 d-grid">
                                <button type="submit" className="btn btn-secondary">Save</button>
                            </div>
                        </form>
                        )}
                    </div>
                    <Row>
                        <ActionCard title="Declare Win">
                            <Button className="btn-declare-win" onClick={toggleWinModal} block>
                                <FontAwesomeIcon icon={faTrophy} className="me-2" /> Declare Hu
                            </Button>
                        </ActionCard>
                        <ActionCard title="Add Flower">
                            <Button className="btn-declare-win" onClick={toggleModal} block>
                                <FontAwesomeIcon icon={faPlus} className="me-2" /> Add Flower
                            </Button>
                        </ActionCard>
                        <ActionCard title="Record Kong">
                            <Input 
                                type="select" 
                                value={selectedKongType} 
                                onChange={e => {
                                    setSelectedKongType(e.target.value);
                                    if (e.target.value !== 'Exposed Kong') setIsMingGangSelfDrawn(false);
                                }}
                                className="mb-2"
                            >
                                <option value="Concealed Kong">暗槓 (An Gang)</option>
                                <option value="Exposed Kong">明槓 (Ming Gang)</option>
                            </Input>
                            {selectedKongType === 'Exposed Kong' && (
                                <div className="mb-2">
                                    <Input
                                        type="checkbox"
                                        id="mingGangSelfDrawn"
                                        checked={isMingGangSelfDrawn}
                                        onChange={e => setIsMingGangSelfDrawn(e.target.checked)}
                                        style={{ marginRight: '0.5rem' }}
                                    />
                                    <label htmlFor="mingGangSelfDrawn">Self-drawn (加槓 Gong)</label>
                                </div>
                            )}
                            {selectedKongType === 'Exposed Kong' && !isMingGangSelfDrawn && (
                                <Input 
                                    type="select" 
                                    value={selectedKongTarget} 
                                    onChange={e => setSelectedKongTarget(e.target.value)}
                                    className="mb-2"
                                >
                                    {players.filter(p => p.uid !== currentUser?.uid).map(p => (
                                        <option key={p.uid} value={p.uid}>{p.name}</option>
                                    ))}
                                </Input>
                            )}
                            <Button className="btn-declare-win" onClick={handleRecordKong} block>
                                <FontAwesomeIcon icon={faClipboard} className="me-2" /> Record Kong
                            </Button>
                        </ActionCard>
                    </Row>
                    
                    <div className="mt-4">
                        <h6 className="mb-3">Other Actions</h6>
                        <Button className="btn-declare-win me-2" onClick={handleUndoLastAction}><FontAwesomeIcon icon={faUndo} /> Undo Last Action</Button>
                        <Button className="btn-declare-win" onClick={handleDeclareDraw}><FontAwesomeIcon icon={faHandshake} /> Declare Draw</Button>
                    </div>
                </div>

                <div className="mt-4">
                    <h4 className="text-center mb-4"><FontAwesomeIcon icon={faTrophy} /> Current Scores</h4>
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
