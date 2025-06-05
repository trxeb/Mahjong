// src/components/Views/RoomView.jsx
import React, { useState, useEffect } from 'react';
import appStyles from '../../styles/appStyles'; // Import the shared styles
import HuView from './HuView'; // Import HuView to render it as a modal

const RoomView = ({
    currentRoom,
    currentPlayer,
    socket,
    onLeaveRoom,
    simulateGameRound,
    currentHand,
    currentFlowers,
    currentKongs,
    currentScoreResult,
    onAddTileClick,
    onCalculateHandScore,
    onClearAll,
    onRemoveTile,
}) => {
    const [showDiscardModal, setShowDiscardModal] = useState(false);
    const [selectedTileToDiscard, setSelectedTileToDiscard] = useState(null);
    const [showDeclareModal, setShowDeclareModal] = useState(false); // For Pung/Kong/Chow (if needed as separate modal)
    const [showHuModal, setShowHuModal] = useState(false); // New state for Hu (Win) modal

    // --- Socket Listeners (as per previous discussion) ---
    useEffect(() => {
        if (!socket || !currentRoom || !currentPlayer) {
            console.log("Socket effect skipped: Socket, room, or player not ready.");
            return;
        }

        console.log("Setting up RoomView socket listeners for room:", currentRoom.code);

        socket.on('playerHandUpdated', ({ userId, newHand, newFlowers, newKongs }) => {
            console.log(`Player ${userId} hand updated.`);
        });

        socket.on('turnChanged', ({ nextTurnUserId, roomId }) => {
            if (roomId === currentRoom.id) {
                const nextPlayer = currentRoom.players_in_rooms.find(p => p.user_id === nextTurnUserId);
                console.log(`It's ${nextPlayer ? nextPlayer.username : 'Unknown Player'}'s turn.`);
                if (nextTurnUserId === currentPlayer.id) {
                    alert("It's your turn!");
                }
            }
        });

        socket.on('tileDiscarded', ({ userId, discardedTile, roomId, newDiscardPile }) => {
            if (roomId === currentRoom.id) {
                const discardingPlayer = currentRoom.players_in_rooms.find(p => p.user_id === userId);
                console.log(`${discardingPlayer ? discardingPlayer.username : 'Unknown Player'} discarded ${discardedTile}.`);
            }
        });

        socket.on('gameStarted', ({ roomId, initialRoomState }) => {
            if (roomId === currentRoom.id) {
                console.log("The game has started!");
            }
        });

        socket.on('playerDeclaredSet', ({ userId, type, tiles, roomId }) => {
            if (roomId === currentRoom.id) {
                const declaringPlayer = currentRoom.players_in_rooms.find(p => p.user_id === userId);
                console.log(`${declaringPlayer ? declaringPlayer.username : 'Unknown Player'} declared ${type} with ${tiles.join(', ')}!`);
            }
        });

        socket.on('gameError', ({ message }) => {
            console.error("Game Error from backend:", message);
            alert(`Game Error: ${message}`);
        });

        return () => {
            console.log("Cleaning up RoomView socket listeners for room:", currentRoom.code);
            socket.off('playerHandUpdated');
            socket.off('turnChanged');
            socket.off('tileDiscarded');
            socket.off('gameStarted');
            socket.off('playerDeclaredSet');
            socket.off('gameError');
        };
    }, [socket, currentRoom, currentPlayer]);


    const handleDiscardTile = () => {
        if (!selectedTileToDiscard) {
            alert("Please select a tile to discard.");
            return;
        }
        if (!currentRoom || !currentPlayer || !socket) {
            console.error("Missing room, player, or socket for discard.");
            return;
        }

        const newHandAfterDiscard = currentHand.filter(tile => tile !== selectedTileToDiscard);

        if (newHandAfterDiscard.length === currentHand.length) {
            alert("Selected tile is not in your hand.");
            return;
        }

        onRemoveTile(selectedTileToDiscard, 'regular');

        socket.emit('discardTile', {
            roomId: currentRoom.id,
            userId: currentPlayer.id,
            discardedTile: selectedTileToDiscard,
            updatedHand: newHandAfterDiscard,
            flowers: currentFlowers,
            kongs: currentKongs
        });

        console.log(`Emitted discardTile: ${selectedTileToDiscard} for ${currentPlayer.username}`);
        setShowDiscardModal(false);
        setSelectedTileToDiscard(null);
    };

    const handleSelectTileForDiscard = (tile) => {
        setSelectedTileToDiscard(tile);
    };

    const currentPlayerInRoom = currentRoom?.players_in_rooms.find(p => p.user_id === currentPlayer?.id);
    const isCurrentPlayerTurn = currentRoom?.current_turn_user_id === currentPlayer?.id;
    const otherPlayers = currentRoom?.players_in_rooms.filter(p => p.user_id !== currentPlayer?.id) || [];

    return (
        <div style={{ ...appStyles.screen, ...appStyles.screenActive }}>
            <div style={appStyles.centerContent}>
                <div style={appStyles.welcomeSection}>
                    <div style={appStyles.welcomeTitle}>Game Room</div>
                    <div style={appStyles.welcomeSubtitle}>Join or create a game to play Mahjong!</div>
                </div>

                <div style={appStyles.roomCodeDisplay}>
                    Room Code: {currentRoom.code}
                </div>

                <div style={{ ...appStyles.card, maxWidth: 'unset', width: '100%' }}>
                    <h3 style={{ color: appStyles.inputGroupLabel.color, marginBottom: '20px', textAlign: 'center' }}>Players</h3>
                    <div style={appStyles.playerList}>
                        {currentRoom.players_in_rooms.map(player => (
                            <div key={player.user_id} style={appStyles.playerItem}>
                                <span>{player.username} {player.is_host ? '(Host)' : ''} {player.user_id === currentPlayer.id ? '(You)' : ''}</span>
                                <span style={{ color: player.user_id === currentRoom.current_turn_user_id ? 'green' : 'gray' }}>
                                    {player.user_id === currentRoom.current_turn_user_id ? '● Turn' : '○'}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Current Player's Hand */}
                <div style={{ ...appStyles.card, maxWidth: 'unset', width: '100%' }}>
                    <h3 style={{ color: appStyles.inputGroupLabel.color, marginBottom: '20px', textAlign: 'center' }}>Your Hand</h3>
                    <div style={appStyles.handContainer}>
                        <h4 style={appStyles.handTitle}>Regular Tiles ({currentHand.length})</h4>
                        <div style={appStyles.tileSelector}>
                            {currentHand.map((tile, index) => (
                                <div key={`hand-${index}`} style={appStyles.tile} onClick={() => onRemoveTile(tile, 'regular')}>
                                    {tile}
                                </div>
                            ))}
                        </div>
                    </div>
                    <div style={appStyles.handContainer}>
                        <h4 style={appStyles.handTitle}>Flowers ({currentFlowers.length})</h4>
                        <div style={appStyles.tileSelector}>
                            {currentFlowers.map((tile, index) => (
                                <div key={`flower-${index}`} style={appStyles.tile} onClick={() => onRemoveTile(tile, 'flower')}>
                                    {tile}
                                </div>
                            ))}
                        </div>
                    </div>
                    <div style={appStyles.handContainer}>
                        <h4 style={appStyles.handTitle}>Kongs ({currentKongs.length})</h4>
                        <div style={appStyles.tileSelector}>
                            {currentKongs.map((tile, index) => (
                                <div key={`kong-${index}`} style={appStyles.tile} onClick={() => onRemoveTile(tile, 'kong')}>
                                    {tile}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Discard Pile */}
                <div style={{ ...appStyles.card, maxWidth: 'unset', width: '100%' }}>
                    <h3 style={{ color: appStyles.inputGroupLabel.color, marginBottom: '20px', textAlign: 'center' }}>Discard Pile</h3>
                    <div style={appStyles.tileSelector}>
                        {currentRoom.discard_pile && currentRoom.discard_pile.length > 0 ? (
                            currentRoom.discard_pile.map((tile, index) => (
                                <div key={`discard-${index}`} style={appStyles.tile}>
                                    {tile}
                                </div>
                            ))
                        ) : (
                            <p style={{ color: appStyles.inputGroupLabel.color, width: '100%', textAlign: 'center' }}>No tiles discarded yet.</p>
                        )}
                    </div>
                </div>

                {/* Control Buttons */}
                <div style={appStyles.controlButtons}>
                    {currentRoom.game_state === 'waiting' && currentRoom.players_in_rooms.length === 4 && (
                        <button style={appStyles.btn} onClick={simulateGameRound}>
                            Start Round
                        </button>
                    )}
                    <button style={appStyles.btn} onClick={onAddTileClick}>Add/Remove Tile</button>
                    <button style={appStyles.btn} onClick={() => setShowDiscardModal(true)}>Discard Tile</button>
                    <button style={appStyles.btn} onClick={onCalculateHandScore}>Calculate Score</button>
                    <button style={appStyles.btn} onClick={onClearAll}>Clear All Tiles</button>
                    {/* NEW: Win button to open Hu modal */}
                    <button style={appStyles.btn} onClick={() => setShowHuModal(true)}>Declare Win (Hu)</button>
                    <button style={{ ...appStyles.btn, ...appStyles.btnSecondary }} onClick={onLeaveRoom}>
                        Leave Room
                    </button>
                </div>

                {/* Score Result Display */}
                {currentScoreResult && (
                    <div style={{ ...appStyles.card, width: '100%', maxWidth: 'unset' }}>
                        <h4 style={{ color: appStyles.inputGroupLabel.color, marginBottom: '10px' }}>Last Score Calculation:</h4>
                        <p style={{ color: appStyles.inputGroupLabel.color }}>Score: {currentScoreResult.score}</p>
                        <p style={{ color: appStyles.inputGroupLabel.color }}>Combinations: {currentScoreResult.combinations.join(', ')}</p>
                    </div>
                )}

                {/* Discard Tile Modal */}
                {showDiscardModal && (
                    <div style={{ ...appStyles.modal, ...appStyles.modalActive }}>
                        <div style={appStyles.modalContent}>
                            <h2 style={appStyles.modalHeader}>Select Tile to Discard</h2>
                            <div style={appStyles.tileSelector}>
                                {currentHand.map((tile, index) => (
                                    <div
                                        key={`discard-select-${index}`}
                                        style={{ ...appStyles.tile, ...(selectedTileToDiscard === tile ? appStyles.tileSelected : {}) }}
                                        onClick={() => handleSelectTileForDiscard(tile)}
                                    >
                                        {tile}
                                    </div>
                                ))}
                            </div>
                            <button style={appStyles.btn} onClick={handleDiscardTile} disabled={!selectedTileToDiscard}>
                                Discard Selected
                            </button>
                            <button style={{ ...appStyles.btn, ...appStyles.btnSecondary }} onClick={() => {
                                setShowDiscardModal(false);
                                setSelectedTileToDiscard(null);
                            }}>Close</button>
                        </div>
                    </div>
                )}

                {/* NEW: Hu (Win) Declaration Modal */}
                {showHuModal && (
                    <div style={{ ...appStyles.modal, ...appStyles.modalActive }}>
                        <div style={appStyles.modalContent}>
                            {/* HuView props: onClose to close the modal */}
                            <HuView
                                onClose={() => setShowHuModal(false)}
                                onShowTileModal={onAddTileClick} // Re-using onAddTileClick to open tile modal if needed from HuView
                                // You might pass currentRoom, currentPlayer, socket etc. if HuView needs to send win data
                            />
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
};

export default RoomView;
