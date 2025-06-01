import React, { useState, useEffect } from 'react';
// Import the new icons from lucide-react (make sure you've installed it)
import { Plus, X, RotateCcw, Calculator, Trophy, Flower } from 'lucide-react';

// Mahjong tiles data (from your new calculator app)
const tiles = {
  dots: ['1m', '2m', '3m', '4m', '5m', '6m', '7m', '8m', '9m'],
  bamboo: ['1s', '2s', '3s', '4s', '5s', '6s', '7s', '8s', '9s'],
  characters: ['1p', '2p', '3p', '4p', '5p', '6p', '7p', '8p', '9p'],
  honors: ['1z', '2z', '3z', '4z', '5z', '6z', '7z'], // East, South, West, North, Red, Green, White
  flowers: ['1f', '2f', '3f', '4f', '5f', '6f', '7f', '8f'] // Spring, Summer, Autumn, Winter, Plum, Orchid, Chrysanthemum, Bamboo
};

const tileNames = {
  // Dots (Circles)
  '1m': '🀙', '2m': '🀚', '3m': '🀛', '4m': '🀜', '5m': '🀝', '6m': '🀞', '7m': '🀟', '8m': '🀠', '9m': '🀡',
  // Bamboo (Sticks)
  '1s': '🀐', '2s': '🀑', '3s': '🀒', '4s': '🀓', '5s': '🀔', '6s': '🀕', '7s': '🀖', '8s': '🀗', '9s': '🀘',
  // Characters (Numbers)
  '1p': '🀇', '2p': '🀈', '3p': '🀉', '4p': '🀊', '5p': '🀋', '6p': '🀌', '7p': '🀍', '8p': '🀎', '9p': '🀏',
  // Honors
  '1z': '🀀', '2z': '🀁', '3z': '🀂', '4z': '🀃', '5z': '🀄', '6z': '🀅', '7z': '🀆',
  // Flowers
  '1f': '🀢', '2f': '🀣', '3f': '🀤', '4f': '🀥', '5f': '🀦', '6f': '🀧', '7f': '🀨', '8f': '🀩'
};

const tileLabels = {
  '1m': '1 Dot', '2m': '2 Dots', '3m': '3 Dots', '4m': '4 Dots', '5m': '5 Dots', '6m': '6 Dots', '7m': '7 Dots', '8m': '8 Dots', '9m': '9 Dots',
  '1s': '1 Bamboo', '2s': '2 Bamboo', '3s': '3 Bamboo', '4s': '4 Bamboo', '5s': '5 Bamboo', '6s': '6 Bamboo', '7s': '7 Bamboo', '8s': '8 Bamboo', '9s': '9 Bamboo',
  '1p': '1 Char', '2p': '2 Char', '3p': '3 Char', '4p': '4 Char', '5p': '5 Char', '6p': '6 Char', '7p': '7 Char', '8p': '8 Char', '9p': '9 Char',
  '1z': 'East', '2z': 'South', '3z': 'West', '4z': 'North', '5z': 'Red', '6z': 'Green', '7z': 'White',
  '1f': 'Spring', '2f': 'Summer', '3f': 'Autumn', '4f': 'Winter', '5f': 'Plum', '6f': 'Orchid', '7f': 'Chrysanthemum', '8f': 'Bamboo'
};

// Mahjong scoring logic (from your new calculator app)
const calculateScore = (hand, flowers, kongs) => {
  let score = 0;
  let tai = [];

  // Basic winning hand
  if (hand.length === 14 || (hand.length + kongs.length * 4 === 14)) { // Adjust this based on actual hand formation rules (e.g., 4 sets + 1 pair)
    score += 1;
    tai.push('Basic Hand (1 tai)');
  }

  // Flower tiles
  if (flowers.length > 0) {
    score += flowers.length;
    tai.push(`Flowers: ${flowers.length} tai`);
  }

  // Kong bonuses
  kongs.forEach(kong => {
    if (tiles.honors.includes(kong)) {
      score += 2;
      tai.push(`Honor Kong (2 tai): ${tileLabels[kong]}`);
    } else {
      score += 1;
      tai.push(`Regular Kong (1 tai): ${tileLabels[kong]}`);
    }
  });

  // Check for special combinations
  // IMPORTANT: For a real Mahjong app, this logic needs to be much more sophisticated
  // to correctly identify sets (chows, pongs, kongs) and the winning hand structure.
  // This is a simplified example.

  const allTiles = [...hand, ...kongs];

  // All honors
  const honorTiles = allTiles.filter(tile => tiles.honors.includes(tile));
  if (honorTiles.length >= 10 && honorTiles.length === allTiles.length) { // Ensure ONLY honors
    score += 10;
    tai.push('All Honors (10 tai)');
  }

  // All one suit (Pure One Suit)
  const suits = ['m', 's', 'p'];
  for (let suit of suits) {
    const suitTiles = allTiles.filter(tile => tile.includes(suit));
    if (suitTiles.length === allTiles.length && suitTiles.length > 0) { // Ensure ONLY one suit
      score += 7;
      tai.push(`Pure One Suit (${suit === 'm' ? 'Dots' : suit === 's' ? 'Bamboo' : 'Characters'}) (7 tai)`);
      break;
    }
  }

  // Mixed one suit (one suit + honors)
  for (let suit of suits) {
    const suitTiles = allTiles.filter(tile => tile.includes(suit));
    const honors = allTiles.filter(tile => tiles.honors.includes(tile));
    if (suitTiles.length + honors.length === allTiles.length && suitTiles.length > 0 && honors.length > 0) {
      score += 3;
      tai.push(`Mixed One Suit (${suit === 'm' ? 'Dots' : suit === 's' ? 'Bamboo' : 'Characters'} + Honors) (3 tai)`);
      break;
    }
  }

  // All terminals and honors
  const terminalAndHonors = allTiles.filter(tile =>
    ['1m', '9m', '1s', '9s', '1p', '9p', ...tiles.honors].includes(tile)
  );
  if (terminalAndHonors.length === allTiles.length && allTiles.length > 0) {
    score += 10;
    tai.push('All Terminals & Honors (10 tai)');
  }

  // Simplified check for sequences and triplets (not comprehensive for winning hand)
  const handCopy = [...hand];
  let sequencesCount = 0;
  let tripletsCount = 0;

  // Function to count occurrences of a tile
  const countTile = (arr, tile) => arr.filter(t => t === tile).length;

  // Check for triplets (three identical tiles)
  const uniqueHandTiles = [...new Set(handCopy)];
  uniqueHandTiles.forEach(tile => {
    if (countTile(handCopy, tile) >= 3) {
      tripletsCount++;
      // Remove these tiles from handCopy to avoid double counting for sequences
      for(let i=0; i<3; i++) {
          const idx = handCopy.indexOf(tile);
          if (idx > -1) handCopy.splice(idx, 1);
      }
    }
  });

  // Check for sequences (three consecutive numbers in the same suit)
  // This is a very basic check and doesn't handle all permutations or multiple sequences
  ['m', 's', 'p'].forEach(suit => {
    for (let i = 1; i <= 7; i++) {
      const seq = [`${i}${suit}`, `${i + 1}${suit}`, `${i + 2}${suit}`];
      if (seq.every(tile => handCopy.includes(tile))) {
        sequencesCount++;
        // Remove these tiles from handCopy
        seq.forEach(tile => {
          const index = handCopy.indexOf(tile);
          if (index > -1) handCopy.splice(index, 1);
        });
      }
    }
  });


  if (sequencesCount > 0) {
    tai.push(`Sequences: ${sequencesCount} found`);
  }
  if (tripletsCount > 0) {
    tai.push(`Triplets: ${tripletsCount} found`);
  }


  return { score, tai };
};


const MahjongApp = () => {
  const [currentView, setCurrentView] = useState('home');
  const [gameRooms, setGameRooms] = useState({});
  const [currentPlayer, setCurrentPlayer] = useState(null);
  const [currentRoom, setCurrentRoom] = useState(null);
  const [players, setPlayers] = useState({});
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [joinCode, setJoinCode] = useState('');
  const [playerName, setPlayerName] = useState('');

  // New state from the calculator app, now tied to the current player's hand
  // For a multi-player app, these should ideally be part of a `player` object
  // or a `game state` object that tracks each player's hand, flowers, and kongs.
  // For simplicity in this direct combination, we'll assume the current player is managing their own hand.
  const [currentHand, setCurrentHand] = useState([]);
  const [currentFlowers, setCurrentFlowers] = useState([]);
  const [currentKongs, setCurrentKongs] = useState([]);
  const [currentScoreResult, setCurrentScoreResult] = useState(null); // Renamed to avoid conflict with `calculateScore` func
  const [showTileModal, setShowTileModal] = useState(false);
  const [selectedTileType, setSelectedTileType] = useState('regular');


  // Initialize sample data
  useEffect(() => {
    const samplePlayers = {
      'player1': { id: 'player1', name: 'Alice Chen', wins: 15, losses: 8, totalTai: 245, hand: [], flowers: [], kongs: [] },
      'player2': { id: 'player2', name: 'Bob Liu', wins: 12, losses: 11, totalTai: 198, hand: [], flowers: [], kongs: [] },
      'player3': { id: 'player3', name: 'Carol Wang', wins: 18, losses: 5, totalTai: 312, hand: [], flowers: [], kongs: [] },
      'player4': { id: 'player4', name: 'David Zhang', wins: 9, losses: 14, totalTai: 156, hand: [], flowers: [], kongs: [] }
    };
    setPlayers(samplePlayers);
  }, []);

  // Update current player's hand data when `currentPlayer` changes
  useEffect(() => {
    if (currentPlayer && players[currentPlayer.id]) {
      setCurrentHand(players[currentPlayer.id].hand || []);
      setCurrentFlowers(players[currentPlayer.id].flowers || []);
      setCurrentKongs(players[currentPlayer.id].kongs || []);
      setCurrentScoreResult(null); // Reset score when player or room changes
    }
  }, [currentPlayer, players]);


  const generateRoomCode = () => {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  };

  const createRoom = () => {
    if (!playerName.trim()) return;

    const roomCode = generateRoomCode();
    const playerId = `player_${Date.now()}`;
    const newPlayer = {
      id: playerId,
      name: playerName,
      wins: 0,
      losses: 0,
      totalTai: 0,
      hand: [],        // Initialize empty hand for new player
      flowers: [],     // Initialize empty flowers for new player
      kongs: []        // Initialize empty kongs for new player
    };

    setPlayers(prev => ({ ...prev, [playerId]: newPlayer }));
    setCurrentPlayer(newPlayer);

    const newRoom = {
      code: roomCode,
      players: [playerId],
      host: playerId,
      gameState: 'waiting',
      rounds: []
    };

    setGameRooms(prev => ({ ...prev, [roomCode]: newRoom }));
    setCurrentRoom(newRoom);
    setShowCreateModal(false);
    setCurrentView('room');
  };

  const joinRoom = () => {
    if (!playerName.trim() || !joinCode.trim()) return;

    const room = gameRooms[joinCode.toUpperCase()];
    if (!room) {
      alert('Room not found!');
      return;
    }

    if (room.players.length >= 4) {
      alert('Room is full!');
      return;
    }

    const playerId = `player_${Date.now()}`;
    const newPlayer = {
      id: playerId,
      name: playerName,
      wins: 0,
      losses: 0,
      totalTai: 0,
      hand: [],        // Initialize empty hand for new player
      flowers: [],     // Initialize empty flowers for new player
      kongs: []        // Initialize empty kongs for new player
    };

    setPlayers(prev => ({ ...prev, [playerId]: newPlayer }));
    setCurrentPlayer(newPlayer);

    const updatedRoom = {
      ...room,
      players: [...room.players, playerId]
    };

    setGameRooms(prev => ({ ...prev, [joinCode.toUpperCase()]: updatedRoom }));
    setCurrentRoom(updatedRoom);
    setShowJoinModal(false);
    setCurrentView('room');
  };

  // Modify `addTile` to update the current player's hand
  const addTile = (tile) => {
    if (!currentPlayer) return;

    let newHand = [...currentHand];
    let newFlowers = [...currentFlowers];
    let newKongs = [...currentKongs];

    if (selectedTileType === 'flower') {
      newFlowers.push(tile);
      setCurrentFlowers(newFlowers);
    } else if (selectedTileType === 'kong') {
      newKongs.push(tile);
      setCurrentKongs(newKongs);
    } else {
      newHand.push(tile);
      setCurrentHand(newHand);
    }

    // Update the player object with the new hand/flowers/kongs
    setPlayers(prevPlayers => ({
      ...prevPlayers,
      [currentPlayer.id]: {
        ...prevPlayers[currentPlayer.id],
        hand: newHand,
        flowers: newFlowers,
        kongs: newKongs
      }
    }));
    setShowTileModal(false);
    setCurrentScoreResult(null); // Clear score after adding a tile
  };


  // Modify `removeTile` to update the current player's hand
  const removeTile = (index, type) => {
    if (!currentPlayer) return;

    let updatedHand = [...currentHand];
    let updatedFlowers = [...currentFlowers];
    let updatedKongs = [...currentKongs];

    if (type === 'hand') {
      updatedHand.splice(index, 1);
      setCurrentHand(updatedHand);
    } else if (type === 'flower') {
      updatedFlowers.splice(index, 1);
      setCurrentFlowers(updatedFlowers);
    } else if (type === 'kong') {
      updatedKongs.splice(index, 1);
      setCurrentKongs(updatedKongs);
    }

    // Update the player object with the new hand/flowers/kongs
    setPlayers(prevPlayers => ({
      ...prevPlayers,
      [currentPlayer.id]: {
        ...prevPlayers[currentPlayer.id],
        hand: updatedHand,
        flowers: updatedFlowers,
        kongs: updatedKongs
      }
    }));
    setCurrentScoreResult(null); // Clear score after removing a tile
  };

  const clearAll = () => {
    if (!currentPlayer) return;

    setCurrentHand([]);
    setCurrentFlowers([]);
    setCurrentKongs([]);
    setCurrentScoreResult(null);

    setPlayers(prevPlayers => ({
      ...prevPlayers,
      [currentPlayer.id]: {
        ...prevPlayers[currentPlayer.id],
        hand: [],
        flowers: [],
        kongs: []
      }
    }));
  };

  const calculateCurrentHandScore = () => {
    const result = calculateScore(currentHand, currentFlowers, currentKongs);
    setCurrentScoreResult(result);
  };

  const TileButton = ({ tile, onClick, canRemove = false, onRemove, index, type }) => (
    <div className="relative inline-block m-1">
      <button
        className="tile-button p-3 border-2 border-gray-300 rounded-lg shadow-lg bg-gradient-to-br from-white to-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-200 min-w-16 min-h-20 flex flex-col items-center justify-center"
        onClick={onClick}
      >
        <div className="text-3xl">{tileNames[tile]}</div>
        <div className="text-xs mt-1 text-gray-600">{tileLabels[tile]}</div>
      </button>
      {canRemove && (
        <button
          className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm transition-colors"
          onClick={(e) => {
            e.stopPropagation();
            onRemove(index, type);
          }}
        >
          <X size={12} />
        </button>
      )}
    </div>
  );

  const simulateGameRound = () => {
    if (!currentRoom || currentRoom.players.length < 4) return;

    // Simulate a game round
    const roundResults = currentRoom.players.map(playerId => {
      // For demonstration, let's say the current player "wins" their hand
      // and others get a random minimal score, or you can assign random hands.
      const playerObj = players[playerId];
      let tai = 0;
      let combinations = [];
      let isWinner = false;

      if (playerId === currentPlayer?.id) {
        // Use the current player's actual hand for scoring
        const scoreResult = calculateScore(playerObj.hand, playerObj.flowers, playerObj.kongs);
        tai = scoreResult.score;
        combinations = scoreResult.tai;
        // Assume current player wins if they have a positive score
        isWinner = tai > 0;
      } else {
        // For other players, simulate a simple win or loss
        isWinner = Math.random() < 0.25; // 25% chance to win
        if (isWinner) {
          tai = Math.floor(Math.random() * 5) + 1; // 1-5 tai
          combinations.push('Simulated Win');
        } else {
          tai = 0;
          combinations.push('No Win');
        }
      }

      return {
        playerId,
        isWinner,
        tai,
        combinations
      };
    });

    // Update player stats
    setPlayers(prev => {
      const updated = { ...prev };
      roundResults.forEach(result => {
        if (updated[result.playerId]) {
          if (result.isWinner) {
            updated[result.playerId].wins += 1;
          } else {
            updated[result.playerId].losses += 1;
          }
          updated[result.playerId].totalTai += result.tai;
        }
      });
      return updated;
    });

    // Update room with round results
    setCurrentRoom(prev => ({
      ...prev,
      rounds: [...prev.rounds, { roundNumber: prev.rounds.length + 1, results: roundResults }]
    }));
  };


  const styles = {
    container: {
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      fontFamily: 'Arial, sans-serif'
    },
    navbar: {
      background: 'rgba(0, 0, 0, 0.9)',
      padding: '1rem 2rem',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)'
    },
    navBrand: {
      color: 'white',
      fontSize: '1.5rem',
      fontWeight: 'bold',
      textDecoration: 'none'
    },
    navLinks: {
      display: 'flex',
      gap: '2rem',
      listStyle: 'none',
      margin: 0,
      padding: 0
    },
    navLink: {
      color: 'white',
      textDecoration: 'none',
      padding: '0.5rem 1rem',
      borderRadius: '8px',
      transition: 'all 0.3s ease',
      cursor: 'pointer'
    },
    navLinkActive: {
      background: 'rgba(255, 255, 255, 0.2)',
      backdropFilter: 'blur(10px)'
    },
    card: {
      background: 'rgba(255, 255, 255, 0.95)',
      borderRadius: '20px',
      padding: '2rem',
      margin: '2rem',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
      backdropFilter: 'blur(10px)',
      border: '1px solid rgba(255, 255, 255, 0.2)'
    },
    button: {
      background: 'linear-gradient(45deg, #667eea, #764ba2)',
      color: 'white',
      border: 'none',
      padding: '1rem 2rem',
      borderRadius: '12px',
      fontSize: '1rem',
      fontWeight: 'bold',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      margin: '0.5rem'
    },
    buttonSecondary: {
      background: 'rgba(255, 255, 255, 0.2)',
      color: '#333',
      border: '2px solid #667eea'
    },
    modal: {
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      background: 'rgba(0, 0, 0, 0.8)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000
    },
    modalContent: {
      background: 'white',
      borderRadius: '20px',
      padding: '2rem',
      minWidth: '400px',
      maxWidth: '90%'
    },
    input: {
      width: '100%',
      padding: '1rem',
      borderRadius: '8px',
      border: '2px solid #ddd',
      fontSize: '1rem',
      marginBottom: '1rem'
    },
    badge: {
      background: '#28a745',
      color: 'white',
      padding: '0.25rem 0.5rem',
      borderRadius: '12px',
      fontSize: '0.8rem',
      fontWeight: 'bold'
    },
    badgeDanger: {
      background: '#dc3545'
    },
    badgeWarning: {
      background: '#ffc107',
      color: '#333'
    },
    badgeInfo: {
      background: '#17a2b8'
    },
    playerCard: {
      background: 'rgba(255, 255, 255, 0.9)',
      borderRadius: '12px',
      padding: '1rem',
      margin: '0.5rem',
      textAlign: 'center',
      border: '2px solid #667eea',
      minHeight: '120px',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center'
    },
    winnerCard: {
      background: 'linear-gradient(45deg, #28a745, #20c997)',
      color: 'white'
    },
    table: {
      width: '100%',
      borderCollapse: 'collapse',
      background: 'white',
      borderRadius: '12px',
      overflow: 'hidden',
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)'
    },
    tableHeader: {
      background: '#343a40',
      color: 'white',
      padding: '1rem',
      textAlign: 'left'
    },
    tableCell: {
      padding: '1rem',
      borderBottom: '1px solid #dee2e6'
    },
    alert: {
      background: '#d1ecf1',
      color: '#0c5460',
      padding: '1rem',
      borderRadius: '8px',
      border: '1px solid #bee5eb',
      margin: '1rem 0'
    },
    tileModalContent: {
      background: 'white',
      borderRadius: '20px',
      maxWidth: '90%',
      maxHeight: '90vh',
      overflowY: 'auto',
      display: 'flex',
      flexDirection: 'column'
    },
    tileModalHeader: {
      background: 'linear-gradient(to right, #f87171, #fb923c)',
      color: 'white',
      padding: '1.5rem',
      borderTopLeftRadius: '20px',
      borderTopRightRadius: '20px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      fontSize: '1.5rem',
      fontWeight: 'bold'
    },
    tileModalBody: {
      padding: '1.5rem',
      flexGrow: 1
    },
    tileCategory: {
      color: '#4f46e5', // Example: a shade of blue for Dots
      fontWeight: '600',
      marginBottom: '1rem',
      fontSize: '1.125rem'
    }
  };


  const renderHome = () => (
    <div style={{ padding: '4rem 2rem', textAlign: 'center' }}>
      <div style={styles.card}>
        <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🀄</div>
        <h1 style={{ color: '#333', marginBottom: '1rem' }}>Mahjong Master</h1>
        <p style={{ color: '#666', fontSize: '1.2rem', marginBottom: '2rem' }}>
          Welcome to the ultimate Mahjong experience!
        </p>
        <div>
          <button
            style={styles.button}
            onClick={() => setShowCreateModal(true)}
            onMouseOver={(e) => e.target.style.transform = 'translateY(-2px)'}
            onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}
          >
            🎮 Create Game Room
          </button>
          <button
            style={{...styles.button, ...styles.buttonSecondary}}
            onClick={() => setShowJoinModal(true)}
            onMouseOver={(e) => e.target.style.transform = 'translateY(-2px)'}
            onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}
          >
            🚪 Join Game Room
          </button>
        </div>
      </div>
    </div>
  );

  const renderRoom = () => (
    <div style={{ padding: '2rem' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
        <div style={styles.card}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <h2>🎮 Game Room: {currentRoom?.code}</h2>
            <span style={{...styles.badge, ...styles.badgeInfo}}>
              {currentRoom?.players.length}/4 Players
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
            {currentRoom?.players.map((playerId, index) => (
              <div key={playerId} style={styles.playerCard}>
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>
                  {['🀄', '🎯', '🎲', '🎪'][index]}
                </div>
                <h4 style={{ margin: '0.5rem 0' }}>{players[playerId]?.name}</h4>
                <div style={{ fontSize: '0.9rem', color: '#666' }}>
                  W: {players[playerId]?.wins} | L: {players[playerId]?.losses}
                </div>
              </div>
            ))}
          </div>

          {currentRoom?.players.length === 4 ? (
            <div style={{ textAlign: 'center' }}>
              <button
                style={{...styles.button, fontSize: '1.2rem', padding: '1.5rem 3rem'}}
                onClick={simulateGameRound}
              >
                🎲 Start New Round
              </button>
            </div>
          ) : (
            <div style={styles.alert}>
              Waiting for {4 - currentRoom?.players.length} more player(s) to join...
            </div>
          )}

          {/* New section for Current Player's Hand */}
          {currentPlayer && (
            <div style={{...styles.card, marginTop: '2rem', padding: '1.5rem'}}>
              <h3 style={{ marginBottom: '1.5rem' }}>Your Hand ({currentPlayer.name})</h3>
              <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
                <button
                  className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-full shadow-lg mr-2 transition-colors inline-flex items-center text-sm"
                  onClick={() => setShowTileModal(true)}
                >
                  <Plus className="mr-1" size={16} /> Add Tile
                </button>
                <button
                  className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-full shadow-lg mr-2 transition-colors inline-flex items-center text-sm"
                  onClick={calculateCurrentHandScore}
                >
                  <Calculator className="mr-1" size={16} /> Calculate Hand Tai
                </button>
                <button
                  className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-full shadow-lg transition-colors inline-flex items-center text-sm"
                  onClick={clearAll}
                >
                  <RotateCcw className="mr-1" size={16} /> Clear Hand
                </button>
              </div>

              {/* Hand Display */}
              <div className="mb-4">
                <div className="bg-white rounded-xl shadow-inner overflow-hidden">
                  <div className="bg-gray-100 px-4 py-3 border-b">
                    <h4 className="text-md font-semibold flex items-center">
                      🀄 Main Hand ({currentHand.length}/14)
                    </h4>
                  </div>
                  <div className="p-4 flex flex-wrap justify-center" style={{ minHeight: '100px' }}>
                    {currentHand.length === 0 ? (
                      <div className="text-center text-gray-400 py-4 text-sm">
                        No tiles in hand.
                      </div>
                    ) : (
                      currentHand.map((tile, index) => (
                        <TileButton
                          key={`hand-${index}`}
                          tile={tile}
                          canRemove={true}
                          onRemove={removeTile}
                          index={index}
                          type="hand"
                        />
                      ))
                    )}
                  </div>
                </div>
              </div>

              {/* Flowers and Kongs Display */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white rounded-xl shadow-inner overflow-hidden">
                  <div className="bg-green-100 px-4 py-3 border-b">
                    <h4 className="text-md font-semibold flex items-center">
                      <Flower className="mr-1" size={16} /> Flower Tiles ({currentFlowers.length})
                    </h4>
                  </div>
                  <div className="p-4 flex flex-wrap justify-center" style={{ minHeight: '80px' }}>
                    {currentFlowers.length === 0 ? (
                      <div className="text-center text-gray-400 py-2 text-sm">
                        No flower tiles.
                      </div>
                    ) : (
                      currentFlowers.map((tile, index) => (
                        <TileButton
                          key={`flower-${index}`}
                          tile={tile}
                          canRemove={true}
                          onRemove={removeTile}
                          index={index}
                          type="flower"
                        />
                      ))
                    )}
                  </div>
                </div>
                <div className="bg-white rounded-xl shadow-inner overflow-hidden">
                  <div className="bg-yellow-100 px-4 py-3 border-b">
                    <h4 className="text-md font-semibold flex items-center">
                      🀆 Kong Tiles ({currentKongs.length})
                    </h4>
                  </div>
                  <div className="p-4 flex flex-wrap justify-center" style={{ minHeight: '80px' }}>
                    {currentKongs.length === 0 ? (
                      <div className="text-center text-gray-400 py-2 text-sm">
                        No kong tiles.
                      </div>
                    ) : (
                      currentKongs.map((tile, index) => (
                        <TileButton
                          key={`kong-${index}`}
                          tile={tile}
                          canRemove={true}
                          onRemove={removeTile}
                          index={index}
                          type="kong"
                        />
                      ))
                    )}
                  </div>
                </div>
              </div>

              {/* Current Hand Score Display */}
              {currentScoreResult && (
                <div className="bg-green-50 border border-green-200 rounded-xl p-4 mt-4">
                  <h4 className="text-lg font-bold text-green-800 flex items-center mb-2">
                    <Trophy className="mr-2" /> Your Hand Total: <span className="bg-green-500 text-white px-3 py-1 rounded-full ml-2">{currentScoreResult.score} Tai</span>
                  </h4>
                  <ul className="list-disc list-inside text-green-700 text-sm">
                    {currentScoreResult.tai.map((item, index) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>

        <div style={styles.card}>
          <h3 style={{ marginBottom: '1.5rem' }}>🏆 Room Leaderboard</h3>
          {currentRoom?.players
            .sort((a, b) => (players[b]?.wins || 0) - (players[a]?.wins || 0))
            .map((playerId, index) => (
              <div key={playerId} style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '1rem',
                margin: '0.5rem 0',
                background: 'rgba(255, 255, 255, 0.5)',
                borderRadius: '8px',
                border: '1px solid #ddd'
              }}>
                <div>
                  <span style={index < 3 ? {...styles.badge, ...styles.badgeWarning} : styles.badge}>
                    #{index + 1}
                  </span>
                  <span style={{ marginLeft: '1rem', fontWeight: 'bold' }}>
                    {players[playerId]?.name}
                  </span>
                </div>
                <span style={styles.badge}>{players[playerId]?.wins}W</span>
              </div>
            ))
          }
        </div>
      </div>

      {currentRoom?.rounds.length > 0 && (
        <div style={{...styles.card, marginTop: '2rem'}}>
          <h3 style={{ marginBottom: '1.5rem' }}>📊 Recent Rounds</h3>
          {currentRoom.rounds.slice(-3).reverse().map((round) => (
            <div key={round.roundNumber} style={{
              background: 'rgba(255, 255, 255, 0.7)',
              borderRadius: '12px',
              padding: '1.5rem',
              margin: '1rem 0',
              border: '1px solid #ddd'
            }}>
              <h4 style={{ marginBottom: '1rem' }}>Round {round.roundNumber}</h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
                {round.results.map(result => (
                  <div
                    key={result.playerId}
                    style={result.isWinner ?
                      {...styles.playerCard, ...styles.winnerCard} :
                      styles.playerCard
                    }
                  >
                    <div style={{ fontWeight: 'bold' }}>{players[result.playerId]?.name}</div>
                    <div>Tai: {result.tai}</div>
                    {result.isWinner && <div>🏆 Winner!</div>}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderLeaderboard = () => (
    <div style={{ padding: '2rem' }}>
      <div style={styles.card}>
        <h2 style={{ marginBottom: '2rem', textAlign: 'center' }}>🏆 Global Leaderboard</h2>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.tableHeader}>Rank</th>
              <th style={styles.tableHeader}>Player</th>
              <th style={styles.tableHeader}>Wins</th>
              <th style={styles.tableHeader}>Losses</th>
              <th style={styles.tableHeader}>Win Rate</th>
              <th style={styles.tableHeader}>Total Tai</th>
            </tr>
          </thead>
          <tbody>
            {Object.values(players)
              .sort((a, b) => b.wins - a.wins)
              .map((player, index) => (
                <tr key={player.id}>
                  <td style={styles.tableCell}>
                    <span style={index < 3 ? {...styles.badge, ...styles.badgeWarning} : styles.badge}>
                      #{index + 1}
                    </span>
                  </td>
                  <td style={{...styles.tableCell, fontWeight: 'bold'}}>{player.name}</td>
                  <td style={styles.tableCell}>
                    <span style={styles.badge}>{player.wins}</span>
                  </td>
                  <td style={styles.tableCell}>
                    <span style={{...styles.badge, ...styles.badgeDanger}}>{player.losses}</span>
                  </td>
                  <td style={styles.tableCell}>
                    {player.wins + player.losses > 0
                      ? `${Math.round((player.wins / (player.wins + player.losses)) * 100)}%`
                      : '0%'
                    }
                  </td>
                  <td style={styles.tableCell}>
                    <span style={{...styles.badge, ...styles.badgeInfo}}>{player.totalTai}</span>
                  </td>
                </tr>
              ))
            }
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderProfile = () => (
    <div style={{ padding: '2rem' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
        <div style={styles.card}>
          <h2 style={{ marginBottom: '2rem' }}>👤 Player Profile</h2>
          {currentPlayer ? (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
              <div style={{ textAlign: 'center', padding: '2rem', background: 'rgba(102, 126, 234, 0.1)', borderRadius: '16px' }}>
                <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🀄</div>
                <h3>{currentPlayer.name}</h3>
                <p style={{ color: '#666' }}>Mahjong Player</p>
              </div>
              <div>
                <h4 style={{ marginBottom: '1.5rem' }}>Statistics</h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
                  <div style={{ textAlign: 'center', padding: '1rem', background: '#28a745', color: 'white', borderRadius: '12px' }}>
                    <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>{currentPlayer.wins}</div>
                    <div style={{ fontSize: '0.9rem' }}>Wins</div>
                  </div>
                  <div style={{ textAlign: 'center', padding: '1rem', background: '#dc3545', color: 'white', borderRadius: '12px' }}>
                    <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>{currentPlayer.losses}</div>
                    <div style={{ fontSize: '0.9rem' }}>Losses</div>
                  </div>
                  <div style={{ textAlign: 'center', padding: '1rem', background: '#ffc107', color: '#333', borderRadius: '12px' }}>
                    <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>{currentPlayer.totalTai}</div>
                    <div style={{ fontSize: '0.9rem' }}>Total Tai</div>
                  </div>
                </div>
                <div style={{ fontSize: '1.1rem' }}>
                  <strong>Win Rate: </strong>
                  {currentPlayer.wins + currentPlayer.losses > 0
                    ? `${Math.round((currentPlayer.wins / (currentPlayer.wins + currentPlayer.losses)) * 100)}%`
                    : '0%'
                  }
                </div>
              </div>
            </div>
          ) : (
            <div style={styles.alert}>
              Please join or create a game room to view your profile.
            </div>
          )}
        </div>

        <div style={styles.card}>
          <h3 style={{ marginBottom: '1.5rem' }}>🎯 Achievements</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {currentPlayer && (
              <>
                {currentPlayer.wins >= 10 && (
                  <span style={{...styles.badge, ...styles.badgeWarning, display: 'inline-block'}}>
                    🏆 Veteran Player
                  </span>
                )}
                {currentPlayer.totalTai >= 200 && (
                  <span style={{...styles.badge, background: '#6f42c1', display: 'inline-block'}}>
                    💎 High Scorer
                  </span>
                )}
                {currentPlayer.wins >= 5 && (
                  <span style={{...styles.badge, display: 'inline-block'}}>
                    🌟 Winner
                  </span>
                )}
                {currentPlayer.wins === 0 && currentPlayer.losses === 0 && (
                  <span style={{...styles.badge, ...styles.badgeInfo, display: 'inline-block'}}>
                    🆕 Newcomer
                  </span>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div style={styles.container}>
      <nav style={styles.navbar}>
        <div style={styles.navBrand}>🀄 Mahjong Master</div>
        <ul style={styles.navLinks}>
          <li>
            <div
              style={{
                ...styles.navLink,
                ...(currentView === 'home' ? styles.navLinkActive : {})
              }}
              onClick={() => setCurrentView('home')}
            >
              Home
            </div>
          </li>
          {currentRoom && (
            <li>
              <div
                style={{
                  ...styles.navLink,
                  ...(currentView === 'room' ? styles.navLinkActive : {})
                }}
                onClick={() => setCurrentView('room')}
              >
                Game Room
              </div>
            </li>
          )}
          <li>
            <div
              style={{
                ...styles.navLink,
                ...(currentView === 'leaderboard' ? styles.navLinkActive : {})
              }}
              onClick={() => setCurrentView('leaderboard')}
            >
              Leaderboard
            </div>
          </li>
          <li>
            <div
              style={{
                ...styles.navLink,
                ...(currentView === 'profile' ? styles.navLinkActive : {})
              }}
              onClick={() => setCurrentView('profile')}
            >
              Profile
            </div>
          </li>
        </ul>
      </nav>

      {currentView === 'home' && renderHome()}
      {currentView === 'room' && renderRoom()}
      {currentView === 'leaderboard' && renderLeaderboard()}
      {currentView === 'profile' && renderProfile()}

      {/* Create Room Modal */}
      {showCreateModal && (
        <div style={styles.modal}>
          <div style={styles.modalContent}>
            <h3 style={{ marginBottom: '1.5rem' }}>Create Game Room</h3>
            <input
              style={styles.input}
              type="text"
              placeholder="Enter your name"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
            />
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <button
                style={{...styles.button, ...styles.buttonSecondary}}
                onClick={() => setShowCreateModal(false)}
              >
                Cancel
              </button>
              <button style={styles.button} onClick={createRoom}>
                Create Room
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Join Room Modal */}
      {showJoinModal && (
        <div style={styles.modal}>
          <div style={styles.modalContent}>
            <h3 style={{ marginBottom: '1.5rem' }}>Join Game Room</h3>
            <input
              style={styles.input}
              type="text"
              placeholder="Enter your name"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
            />
            <input
              style={styles.input}
              type="text"
              placeholder="Enter room code"
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value)}
            />
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <button
                style={{...styles.button, ...styles.buttonSecondary}}
                onClick={() => setShowJoinModal(false)}
              >
                Cancel
              </button>
              <button style={styles.button} onClick={joinRoom}>
                Join Room
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tile Selection Modal - Integrated from your calculator app */}
      {showTileModal && (
        <div style={styles.modal}>
          <div style={styles.tileModalContent}>
            <div style={styles.tileModalHeader}>
              <h2>Select Tile</h2>
              <button
                className="text-white hover:text-gray-200 transition-colors"
                onClick={() => setShowTileModal(false)}
              >
                <X size={24} />
              </button>
            </div>

            <div style={styles.tileModalBody}>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tile Type:
                </label>
                <select
                  value={selectedTileType}
                  onChange={(e) => setSelectedTileType(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="regular">Regular Tile (Hand)</option>
                  <option value="flower">Flower Tile</option>
                  <option value="kong">Kong Tile</option>
                </select>
              </div>

              {/* Dots */}
              <div className="mb-6">
                <h3 style={{...styles.tileCategory, color: '#2563eb'}}>🀙 Dots (Circles)</h3>
                <div className="flex flex-wrap">
                  {tiles.dots.map(tile => (
                    <TileButton key={tile} tile={tile} onClick={() => addTile(tile)} />
                  ))}
                </div>
              </div>

              {/* Bamboo */}
              <div className="mb-6">
                <h3 style={{...styles.tileCategory, color: '#16a34a'}}>🀐 Bamboo (Sticks)</h3>
                <div className="flex flex-wrap">
                  {tiles.bamboo.map(tile => (
                    <TileButton key={tile} tile={tile} onClick={() => addTile(tile)} />
                  ))}
                </div>
              </div>

              {/* Characters */}
              <div className="mb-6">
                <h3 style={{...styles.tileCategory, color: '#dc2626'}}>🀇 Characters (Numbers)</h3>
                <div className="flex flex-wrap">
                  {tiles.characters.map(tile => (
                    <TileButton key={tile} tile={tile} onClick={() => addTile(tile)} />
                  ))}
                </div>
              </div>

              {/* Honors */}
              <div className="mb-6">
                <h3 style={{...styles.tileCategory, color: '#d97706'}}>🀀 Honor Tiles</h3>
                <div className="flex flex-wrap">
                  {tiles.honors.map(tile => (
                    <TileButton key={tile} tile={tile} onClick={() => addTile(tile)} />
                  ))}
                </div>
              </div>

              {/* Flowers */}
              {selectedTileType === 'flower' && (
                <div className="mb-6">
                  <h3 style={{...styles.tileCategory, color: '#9333ea'}}>🀢 Flower Tiles</h3>
                  <div className="flex flex-wrap">
                    {tiles.flowers.map(tile => (
                      <TileButton key={tile} tile={tile} onClick={() => addTile(tile)} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MahjongApp;