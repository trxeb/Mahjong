// For displaying individual players in a room
//This component displays information about a single player within a room. App.js will render several of these based on the players map it receives from the backend.

// src/components/RoomPlayerCard.jsx
import React from 'react';

const cardStyles = {
    playerCard: {
        border: '1px solid #ccc',
        borderRadius: '8px',
        padding: '15px',
        margin: '10px',
        backgroundColor: '#f9f9f9',
        boxShadow: '2px 2px 5px rgba(0,0,0,0.1)',
        minWidth: '200px',
        maxWidth: '250px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
    },
    playerName: {
        fontSize: '1.2em',
        fontWeight: 'bold',
        marginBottom: '10px',
        color: '#333',
    },
    playerInfo: {
        fontSize: '0.9em',
        color: '#666',
        textAlign: 'center',
    },
    hostBadge: {
        backgroundColor: '#FFD700', // Gold color for host
        color: '#333',
        padding: '4px 8px',
        borderRadius: '12px',
        fontSize: '0.8em',
        fontWeight: 'bold',
        marginBottom: '5px',
    },
    handInfo: {
        marginTop: '10px',
        borderTop: '1px solid #eee',
        paddingTop: '10px',
        width: '100%',
        textAlign: 'left',
    },
    tileList: {
        listStyleType: 'none',
        padding: 0,
        margin: 0,
        display: 'flex',
        flexWrap: 'wrap',
        gap: '5px',
        fontSize: '0.85em',
        color: '#555',
    },
    tileItem: {
        backgroundColor: '#e0e0e0',
        padding: '3px 6px',
        borderRadius: '3px',
    }
};

const RoomPlayerCard = ({ player, isCurrentPlayer, currentHand, currentFlowers, currentKongs }) => {
    // Determine which hand to display:
    // If it's the current player, show their actual hand.
    // Otherwise, show a placeholder or summary (e.g., number of tiles).
    const displayHand = isCurrentPlayer ? currentHand : player.hand;
    const displayFlowers = isCurrentPlayer ? currentFlowers : player.flowers;
    const displayKongs = isCurrentPlayer ? currentKongs : player.kongs;

    return (
        <div style={cardStyles.playerCard}>
            {player.isHost && <div style={cardStyles.hostBadge}>HOST</div>}
            <div style={cardStyles.playerName}>
                {player.name} {isCurrentPlayer ? '(You)' : ''}
            </div>
            <div style={cardStyles.playerInfo}>
                Score: {player.score}
            </div>

            {/* Display hand only if it's the current player, or if game rules allow others to see (e.g., at end of round) */}
            {isCurrentPlayer && (
                <div style={cardStyles.handInfo}>
                    <h4>Your Hand ({displayHand.length} tiles)</h4>
                    <ul style={cardStyles.tileList}>
                        {displayHand.length > 0 ? (
                            displayHand.map((tile, index) => (
                                <li key={`hand-${player.id}-${index}`} style={cardStyles.tileItem}>{tile}</li>
                            ))
                        ) : (
                            <li>No tiles in hand</li>
                        )}
                    </ul>

                    {displayFlowers.length > 0 && (
                        <>
                            <h4>Flowers ({displayFlowers.length})</h4>
                            <ul style={cardStyles.tileList}>
                                {displayFlowers.map((tile, index) => (
                                    <li key={`flower-${player.id}-${index}`} style={cardStyles.tileItem}>{tile}</li>
                                ))}
                            </ul>
                        </>
                    )}

                    {displayKongs.length > 0 && (
                        <>
                            <h4>Kongs ({displayKongs.length})</h4>
                            <ul style={cardStyles.tileList}>
                                {displayKongs.map((tile, index) => (
                                    <li key={`kong-${player.id}-${index}`} style={cardStyles.tileItem}>{tile}</li>
                                ))}
                            </ul>
                        </>
                    )}
                </div>
            )}
            {/* If not the current player, you might show just the number of tiles, not the tiles themselves */}
            {!isCurrentPlayer && (
                 <div style={cardStyles.handInfo}>
                    <p>Tiles in Hand: {player.hand ? player.hand.length : 0}</p>
                    <p>Flowers: {player.flowers ? player.flowers.length : 0}</p>
                    <p>Kongs: {player.kongs ? player.kongs.length : 0}</p>
                 </div>
            )}
        </div>
    );
};

export default RoomPlayerCard;    