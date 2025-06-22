// client/src/pages/SettingsPage.js
import React, { useState, useEffect } from 'react';
import { Container, Button, Card, CardHeader, CardBody, Input, Form, FormGroup, Label, Alert, Spinner, Table } from 'reactstrap'; // Added Table
import { auth, db } from '../firebase-config';
import { doc, getDoc, updateDoc, onSnapshot } from 'firebase/firestore';

// Default Mahjong tile combinations and their Tai values
// This serves as the initial template if no custom settings are found in Firestore.
const defaultTaiCombinations = [
    { name: "Ping Hu (All Sequences)", tai: 1, description: "All pungs (triplets) and/or kongs (quads)." },
    { name: "Peng Peng Hu (All Pungs)", tai: 2, description: "All pungs (triplets) and/or kongs (quads)." },
    { name: "Yi Se San Tong (Three Same Sequences)", tai: 4, description: "Three sequences of the same number in three different suits." },
    { name: "Da San Yuan (Big Three Dragons)", tai: 8, description: "Three pungs (triplets) of dragons (Red, Green, White)." },
    { name: "Shi San Yao (Thirteen Wonders)", tai: 13, description: "A hand consisting of one of each of the 13 terminal and honor tiles." },
    { name: "Da Si Xi (Big Four Winds)", tai: 16, description: "Four pungs (triplets) of winds (East, South, West, North)." },
    { name: "Xiao Si Xi (Small Four Winds)", tai: 8, description: "Three pungs (triplets) of winds and one pair of the fourth wind." },
    { name: "Zi Yi Se (All Honors)", tai: 13, description: "All tiles are honor tiles (winds and dragons)." },
    { name: "Qing Yi Se (All of One Suit)", tai: 7, description: "All tiles are from the same suit (bamboo, characters, or dots)." },
    { name: "Hun Yi Se (Half Flush)", tai: 3, description: "A hand consisting of one suit and honor tiles." },
    { name: "Xiao San Yuan (Small Three Dragons)", tai: 4, description: "Two pungs of dragons and one pair of the third dragon." },
    { name: "Gang Shang Kai Hua (Drawing on Kong)", tai: 1, description: "Winning tile is drawn after a kong." },
    { name: "Qi Dui (Seven Pairs)", tai: 2, description: "A hand composed of seven pairs." },
    { name: "Qing Dui (All Green)", tai: 8, description: "A hand composed entirely of green tiles." },
    { name: "Hai Di Lao Yue (Last Tile from Wall)", tai: 1, description: "Winning on the last available tile from the wall." },
    { name: "Jin Gou Diao (Single Hook)", tai: 1, description: "A single tile wait on a pair." },
    { name: "Da Si Xi (Big Four Joys)", tai: 16, description: "Pung of all four winds" },
    { name: "Shi Ba Luohan (Eighteen Arhats)", tai: 8, description: "Four kongs (quads) in the hand." },
    { name: "Jiu Lian Bao Deng (Nine Gates)", tai: 13, description: "A hand formed by 1112345678999 of one suit, with any tile from that suit drawn to win." },
    { name: "Tian Hu (Heavenly Hand)", tai: 20, description: "Dealer wins on their initial dealt hand." },
    { name: "Di Hu (Earthly Hand)", tai: 16, description: "Non-dealer wins on their first draw." },
    { name: "Ren Hu (Humanly Hand)", tai: 10, description: "Non-dealer wins on their first discard." },
];


export default function SettingsPage({ onNavigate, roomId }) {
    const [roomSettings, setRoomSettings] = useState(null);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState('');
    const [isGM, setIsGM] = useState(false);

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
            showMessage("Invalid room ID or not logged in.", "danger");
            setLoading(false);
            return;
        }

        const roomDocRef = doc(db, "gameRooms", roomId);

        const unsubscribe = onSnapshot(roomDocRef, (docSnap) => {
            if (docSnap.exists()) {
                const data = docSnap.data();
                if (data.gameMasterUid === auth.currentUser.uid) {
                    setIsGM(true);
                    // Load existing taiCombinations or use defaults if not present
                    const existingTai = data.settings?.taiCombinations;
                    
                    // If existingTai is present, merge it with defaultTaiCombinations
                    // This ensures new combinations are added if schema updates, and old ones retain custom values
                    const mergedTaiCombinations = defaultTaiCombinations.map(defaultCombo => {
                        const existing = existingTai ? existingTai.find(ec => ec.name === defaultCombo.name) : null;
                        return existing ? { ...defaultCombo, tai: existing.tai } : defaultCombo;
                    });
                    
                    setRoomSettings({
                        ...data.settings, // Keep other settings like maxPlayers, gameType
                        taiCombinations: mergedTaiCombinations
                    });
                    setLoading(false);
                } else {
                    showMessage("You are not the Game Master for this room. Redirecting...", "danger");
                    setTimeout(() => onNavigate('home'), 2000);
                }
            } else {
                showMessage("Room not found or deleted. Redirecting...", "danger");
                setLoading(false);
                setTimeout(() => onNavigate('home'), 2000);
            }
        }, (err) => {
            console.error("Error loading room settings:", err);
            showMessage(`Failed to load settings: ${err.message}`, "danger");
            setLoading(false);
        });

        return () => unsubscribe();
    }, [roomId, onNavigate]);

    const handleTaiChange = (index, value) => {
        const newTaiCombinations = [...roomSettings.taiCombinations];
        // Ensure value is a non-negative number
        newTaiCombinations[index].tai = Math.max(0, parseInt(value) || 0); 
        setRoomSettings(prevSettings => ({
            ...prevSettings,
            taiCombinations: newTaiCombinations
        }));
    };

    const handleSaveSettings = async (e) => {
        e.preventDefault();
        if (!isGM || !roomId || !auth.currentUser || !roomSettings) {
            showMessage("You do not have permission to save settings or settings are not loaded.", "danger");
            return;
        }

        try {
            const roomDocRef = doc(db, "gameRooms", roomId);
            await updateDoc(roomDocRef, {
                settings: roomSettings
            });
            showMessage("Settings saved successfully!", "success");
        } catch (error) {
            console.error("Error saving settings:", error);
            showMessage(`Failed to save settings: ${error.message}`, "danger");
        }
    };

    if (loading) {
        return (
            <Container fluid className="d-flex justify-content-center align-items-center min-vh-100">
                <Spinner color="success" children="" />
                <span className="ms-2">Loading settings...</span>
            </Container>
        );
    }

    if (!isGM || !roomSettings) {
        return null;
    }

    return (
        <Container fluid className="d-flex justify-content-center align-items-center min-vh-100 p-3">
            <Card className="p-4 p-md-5 w-100" style={{ maxWidth: '800px' }}> {/* Increased max-width */}
                <CardHeader className="text-center bg-warning text-dark rounded-top-3">
                    <h2 className="mb-0">Game Settings ({roomId})</h2>
                </CardHeader>
                <CardBody>
                    {message && (
                        <Alert color={messageType} className="text-center rounded-pill-sm py-2 mb-3">
                            {message}
                        </Alert>
                    )}

                    <Form onSubmit={handleSaveSettings}>
                        {/* Max Players and Game Type (Optional - if you still need them) */}
                        {/* If you want to remove them, delete this FormGroup section */}
                        {roomSettings.maxPlayers !== undefined && (
                            <FormGroup className="mb-3">
                                <Label for="maxPlayers">Max Players (Excluding GM):</Label>
                                <Input
                                    type="number"
                                    id="maxPlayers"
                                    name="maxPlayers"
                                    value={roomSettings.maxPlayers - 1} 
                                    onChange={(e) => {
                                        const value = Math.max(1, Math.min(3, parseInt(e.target.value) || 0));
                                        setRoomSettings(prev => ({ ...prev, maxPlayers: value + 1 }));
                                    }}
                                    min="1"
                                    max="3"
                                    className="rounded-pill"
                                />
                                <small className="form-text text-muted">Total players in room (including GM) will be: {roomSettings.maxPlayers}</small>
                            </FormGroup>
                        )}
                        
                        {roomSettings.gameType !== undefined && (
                            <FormGroup className="mb-3">
                                <Label for="gameType">Game Type:</Label>
                                <Input
                                    type="select"
                                    id="gameType"
                                    name="gameType"
                                    value={roomSettings.gameType}
                                    onChange={(e) => handleTaiChange(null, e.target.value)} // Use null for index as it's not a tai combo
                                    className="rounded-pill"
                                >
                                    <option value="standard">Standard Mahjong</option>
                                    <option value="custom">Custom Rules</option>
                                </Input>
                            </FormGroup>
                        )}
                        {/* End Optional Section */}

                        <h4 className="text-custom-dark mt-4 mb-3">Tai Combinations & Values</h4>
                        <div style={{ maxHeight: '400px', overflowY: 'auto', border: '1px solid #dee2e6', borderRadius: '.25rem' }}>
                        <Table striped bordered hover responsive size="sm" className="mb-0">
                            <thead>
                                <tr>
                                    <th>Combination</th>
                                    <th>Description</th>
                                    <th>Tai Value</th>
                                </tr>
                            </thead>
                            <tbody>
                                {roomSettings.taiCombinations.map((combo, index) => (
                                    <tr key={combo.name}> {/* Using name as key for stability */}
                                        <td className="align-middle fw-bold">{combo.name}</td>
                                        <td className="align-middle text-muted" style={{ fontSize: '0.85rem' }}>{combo.description}</td>
                                        <td className="align-middle" style={{ width: '100px' }}>
                                            <Input
                                                type="number"
                                                value={combo.tai}
                                                onChange={(e) => handleTaiChange(index, e.target.value)}
                                                min="0"
                                                className="form-control-sm text-center" // Smaller input for tai value
                                            />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                        </div>

                        <div className="d-flex justify-content-between mt-4">
                            <Button color="secondary" onClick={() => onNavigate('gmPage', roomId)} className="rounded-pill">
                                <i className="fas fa-arrow-left me-2"></i> Back to GM Page
                            </Button>
                            <Button type="submit" color="success" className="rounded-pill">
                                <i className="fas fa-save me-2"></i> Save Settings
                            </Button>
                        </div>
                    </Form>
                </CardBody>
            </Card>
        </Container>
    );
}