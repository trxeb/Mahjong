// src/App.js
import React, { useState, useEffect, useCallback } from 'react';
import io from 'socket.io-client';

// Firebase JS SDK Imports
import { initializeApp } from 'firebase/app';
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import { getFirestore, doc, getDoc } from 'firebase/firestore';

// Import utility functions (ensure these exist)
import { calculateScore } from './utils/mahjongScoring'; // Example: needs to be implemented

// Import components
import CreateRoomModal from './components/CreateRoomModal';
import JoinRoomModal from './components/JoinRoomModal';
import TileSelectionModal from './components/TileSelectionModal';
import HomeView from './components/Views/HomeView';
import RoomView from './components/Views/RoomView';
import LeaderboardView from './components/LeaderboardView';
import ProfileView from './components/ProfileView';
import AuthForm from './components/AuthForm';
import HuView from './components/Views/HuView'; // New HuView component

// Import the new appStyles
import appStyles from './styles/appStyles';

// Firebase App Initialization (Frontend)
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID,
};

// Initialize Firebase only once
const app = initializeApp(firebaseConfig);
const auth = getAuth(app); // Get Firebase Auth instance
const firestore = getFirestore(app); // Get Firestore instance

const MahjongApp = () => {
  // --- STATE MANAGEMENT ---
  const [session, setSession] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [currentPlayer, setCurrentPlayer] = useState(null);

  const [currentView, setCurrentView] = useState('home'); // 'home', 'room', 'leaderboard', 'profile', 'auth', 'hu'
  const [gameRooms, setGameRooms] = useState({});
  const [currentRoom, setCurrentRoom] = useState(null);

  const [showJoinModal, setShowJoinModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [joinCode, setJoinCode] = useState('');

  const [currentHand, setCurrentHand] = useState([]);
  const [currentFlowers, setCurrentFlowers] = useState([]);
  const [currentKongs, setCurrentKongs] = useState([]);
  const [currentScoreResult, setCurrentScoreResult] = useState(null);
  const [showTileModal, setShowTileModal] = useState(false);
  const [selectedTileType, setSelectedTileType] = useState('regular');

  const [socket, setSocket] = useState(null);


  // --- EFFECT HOOKS ---

  // 1. Firebase Authentication State Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setSession(user);
      setLoadingUser(false);
      console.log('App: Auth state changed. User session:', user);
    });

    return () => unsubscribe();
  }, []);

  // 2. Fetch User Profile from Firestore (after auth state changes)
  const fetchUserProfile = useCallback(async (userId) => {
    if (!userId) {
      setCurrentPlayer(null);
      return;
    }

    try {
      const profileDocRef = doc(firestore, 'profiles', userId);
      const profileDoc = await getDoc(profileDocRef);

      if (!profileDoc.exists()) {
        console.warn("Profile not found in Firestore for user:", userId);
        setCurrentPlayer(null);
        return;
      }

      const profileData = profileDoc.data();
      console.log('Fetched user profile from Firestore:', profileData);

      setCurrentPlayer({
        id: userId,
        username: profileData.username,
        wins: profileData.wins || 0,
        losses: profileData.losses || 0,
        totalTai: profileData.total_tai || 0,
        hand: [], flowers: [], kongs: []
      });

    } catch (error) {
      console.error('Error fetching user profile from Firestore:', error);
      setCurrentPlayer(null);
    }
  }, []);

  useEffect(() => {
    if (session?.uid) {
      fetchUserProfile(session.uid);
    } else {
      setCurrentPlayer(null);
    }
  }, [session, fetchUserProfile]);


  // 3. Socket.IO Connection and Global Listeners Effect
  useEffect(() => {
    const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5002';

    if (!socket && session?.uid) {
      const newSocket = io(backendUrl);

      newSocket.on('connect', () => {
        console.log('App: Connected to Socket.IO server', newSocket.id);
      });

      newSocket.on('disconnect', () => {
        console.log('App: Disconnected from Socket.IO server');
        setCurrentRoom(null);
      });

      newSocket.on('roomStateUpdate', (updatedRoomData) => {
          console.log('App: Received roomStateUpdate:', updatedRoomData);
          if (updatedRoomData) {
              setGameRooms(prev => ({
                  ...prev,
                  [updatedRoomData.code]: updatedRoomData
              }));

              if (currentPlayer && updatedRoomData.players_in_rooms.some(p => p.user_id === currentPlayer.id)) {
                  setCurrentRoom(updatedRoomData);
                  const playerInUpdatedRoom = updatedRoomData.players_in_rooms.find(
                      p => p.user_id === currentPlayer.id
                  );
                  if (playerInUpdatedRoom) {
                      setCurrentHand(playerInUpdatedRoom.hand || []);
                      setCurrentFlowers(playerInUpdatedRoom.flowers || []);
                      setCurrentKongs(playerInUpdatedRoom.kongs || []);
                  }
              }
          } else {
              setCurrentRoom(null);
              alert("The room you were in has been closed or no longer exists.");
              setCurrentView('home');
          }
      });

      newSocket.on('error', (message) => {
          console.error('App: Backend Error:', message);
          alert(`App Error: ${message}`);
      });

      setSocket(newSocket);

      return () => {
        console.log('App: Disconnecting socket...');
        newSocket.off('roomStateUpdate');
        newSocket.off('error');
        newSocket.disconnect();
      };
    } else if (socket && !session?.uid) {
        console.log('App: User logged out, disconnecting socket.');
        socket.disconnect();
        setSocket(null);
    }
  }, [session, socket, currentPlayer]);


  // --- AUTHENTICATION FUNCTIONS (Firebase Auth) ---

  const handleLogin = async (email, password) => {
    setLoadingUser(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      alert('Logged in successfully!');
      setCurrentView('home');
    } catch (error) {
      alert(`Login failed: ${error.message}`);
      console.error('Login error:', error);
    } finally {
      setLoadingUser(false);
    }
  };

  const handleSignup = async (email, password, username) => {
    setLoadingUser(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await firestore.collection('profiles').doc(user.uid).set({
        user_id: user.uid,
        username: username,
        email: email,
        wins: 0,
        losses: 0,
        total_tai: 0,
        created_at: new Date()
      });

      alert('Signed up successfully! Welcome!');
      setCurrentView('home');
    } catch (error) {
      alert(`Signup failed: ${error.message}`);
      console.error('Signup error:', error);
    } finally {
      setLoadingUser(false);
    }
  };

  const handleLogout = async () => {
    setLoadingUser(true);
    try {
      await signOut(auth);
      alert('Logged out successfully!');
      setCurrentPlayer(null);
      setCurrentRoom(null);
      setCurrentView('auth');
    } catch (error) {
      alert(`Logout failed: ${error.message}`);
      console.error('Logout error:', error);
    } finally {
      setLoadingUser(false);
    }
  };


  // --- GAME ROOM FUNCTIONS ---

  const generateRoomCode = () => {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  };

  const createRoom = async (roomName) => {
    if (!roomName.trim() || !currentPlayer) return alert("Room name and logged-in user required.");

    const roomCode = generateRoomCode();
    if (socket) {
        socket.emit('createRoom', {
            roomCode,
            roomName,
            userId: currentPlayer.id,
            username: currentPlayer.username,
        });
        console.log(`App: Emitted createRoom: ${roomCode} by ${currentPlayer.username}`);
    } else {
        console.warn('App: Socket not connected, cannot emit createRoom.');
        alert('Could not connect to game server. Please try again later.');
    }
    setShowCreateModal(false);
    setCurrentView('room');
  };

  const joinRoom = async (roomName, code) => {
    if (!roomName.trim() || !code.trim() || !currentPlayer) return alert("Room name, code, and logged-in user required.");

    if (socket) {
        socket.emit('joinRoomSocket', {
            roomId: code.toUpperCase(),
            userId: currentPlayer.id,
            username: currentPlayer.username,
        });
        console.log(`App: Emitted joinRoomSocket to ${code.toUpperCase()} for ${currentPlayer.username}`);
    } else {
        console.warn('App: Socket not connected, cannot emit joinRoomSocket.');
        alert('Could not connect to game server. Please try again later.');
    }
    setShowJoinModal(false);
    setCurrentView('room');
  };

  const handleLeaveRoom = () => {
    if (currentRoom && currentPlayer && socket) {
      socket.emit('leaveRoom', { roomId: currentRoom.id, userId: currentPlayer.id });
      console.log(`App: Emitted leaveRoom for ${currentPlayer.username} from ${currentRoom.id}`);
    } else {
      console.warn('App: Socket not connected or room/player missing, cannot emit leaveRoom.');
    }
    setCurrentRoom(null);
    setCurrentView('home');
  };

  // --- GAMEPLAY FUNCTIONS (Client-side, triggering backend emits) ---

  const simulateGameRound = () => {
    if (currentRoom && socket && currentRoom.game_state === 'waiting' && currentRoom.players_in_rooms.length === 4) {
        socket.emit('startGameRound', { roomId: currentRoom.id });
        console.log(`App: Emitted startGameRound for room ${currentRoom.id}`);
    } else {
        alert("Cannot start game: Not enough players (needs 4) or game not in waiting state.");
        console.warn('App: Cannot emit startGameRound. Conditions not met.');
    }
  };

  const addTile = (tile, type = 'regular') => {
    let newHand = [...currentHand];
    let newFlowers = [...currentFlowers];
    let newKongs = [...currentKongs];

    if (type === 'flower') {
      newFlowers.push(tile);
    } else if (type === 'kong') {
      newKongs.push(tile);
    } else {
      newHand.push(tile);
    }

    setCurrentHand(newHand);
    setCurrentFlowers(newFlowers);
    setCurrentKongs(newKongs);

    if (socket && currentRoom && currentPlayer) {
      socket.emit('updateHand', {
        roomId: currentRoom.id,
        userId: currentPlayer.id,
        hand: newHand,
        flowers: newFlowers,
        kongs: newKongs
      });
      console.log(`App: Emitted updateHand for addTile. New hand length: ${newHand.length}`);
    }
  };

  const removeTile = (tileToRemove, type = 'regular') => {
    let newHand = [...currentHand];
    let newFlowers = [...currentFlowers];
    let newKongs = [...currentKongs];
    let removed = false;

    if (type === 'flower') {
      const index = newFlowers.indexOf(tileToRemove);
      if (index > -1) {
        newFlowers.splice(index, 1);
        removed = true;
      }
    } else if (type === 'kong') {
      const index = newKongs.indexOf(tileToRemove);
      if (index > -1) {
        newKongs.splice(index, 1);
        removed = true;
      }
    } else {
      const index = newHand.indexOf(tileToRemove);
      if (index > -1) {
        newHand.splice(index, 1);
        removed = true;
      }
    }

    if (!removed) {
        console.warn(`Tile ${tileToRemove} not found in ${type} collection.`);
        return;
    }

    setCurrentHand(newHand);
    setCurrentFlowers(newFlowers);
    setCurrentKongs(newKongs);

    if (socket && currentRoom && currentPlayer) {
      socket.emit('updateHand', {
        roomId: currentRoom.id,
        userId: currentPlayer.id,
        hand: newHand,
        flowers: newFlowers,
        kongs: newKongs
      });
      console.log(`App: Emitted updateHand for removeTile. New hand length: ${newHand.length}`);
    }
  };

  const calculateCurrentHandScore = () => {
    if (currentHand.length === 0 && currentFlowers.length === 0 && currentKongs.length === 0) {
      setCurrentScoreResult({ score: 0, combinations: ['No tiles to score.'] });
      return;
    }
    const score = calculateScore(currentHand, currentFlowers, currentKongs);
    setCurrentScoreResult(score);
    alert(`Calculated Score: ${score.score}\nCombinations: ${score.combinations.join(', ')}`);
  };

  const clearAllTiles = () => {
    setCurrentHand([]);
    setCurrentFlowers([]);
    setCurrentKongs([]);
    setCurrentScoreResult(null);

    if (socket && currentRoom && currentPlayer) {
      socket.emit('updateHand', {
        roomId: currentRoom.id,
        userId: currentPlayer.id,
        hand: [],
        flowers: [],
        kongs: []
      });
      console.log('App: Emitted updateHand for clearAllTiles.');
    }
  };


  // --- CONDITIONAL RENDERING ---

  if (loadingUser) {
    return (
      <div style={appStyles.container}> {/* Use appStyles.container */}
        <div style={appStyles.centerContent}>
            <h1>Loading User...</h1>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div style={appStyles.container}> {/* Use appStyles.container */}
        <div style={appStyles.centerContent}>
            <AuthForm onLogin={handleLogin} onSignup={handleSignup} />
            <button style={appStyles.btn} onClick={() => setCurrentView('leaderboard')}> {/* Use appStyles.btn */}
              View Leaderboard
            </button>
        </div>
      </div>
    );
  }

  return (
    <div style={appStyles.container}> {/* Main container */}
      <div style={appStyles.header}> {/* Header */}
          <div style={appStyles.logo}>
              <div style={appStyles.logoTiles}>
                  <div style={appStyles.miniTile}>東</div>
                  <div style={appStyles.miniTile}>發</div>
                  <div style={appStyles.miniTile}>中</div>
              </div>
              <div style={appStyles.logoText}>Tai-ny Mahjong</div>
          </div>
          {/* No right-side content in header from provided HTML, so removed */}
      </div>

      <div style={appStyles.taskbar}> {/* Navigation Taskbar */}
          <a
              href="#"
              style={{ ...appStyles.taskbarItem, ...(currentView === 'home' ? appStyles.taskbarItemActive : {}) }}
              onClick={() => setCurrentView('home')}
          >
              Home
          </a>
          <a
              href="#"
              style={{ ...appStyles.taskbarItem, ...(currentView === 'hu' ? appStyles.taskbarItemActive : {}) }}
              onClick={() => setCurrentView('hu')}
          >
              Hu (Win)
          </a>
          <a
              href="#"
              style={{ ...appStyles.taskbarItem, ...(currentView === 'leaderboard' ? appStyles.taskbarItemActive : {}) }}
              onClick={() => setCurrentView('leaderboard')}
          >
              Leaderboard
          </a>
          <a
              href="#"
              style={{ ...appStyles.taskbarItem, ...(currentView === 'profile' ? appStyles.taskbarItemActive : {}) }}
              onClick={() => setCurrentView('profile')}
          >
              Profile
          </a>
          {currentRoom && (
              <a
                  href="#"
                  style={{ ...appStyles.taskbarItem, ...(currentView === 'room' ? appStyles.taskbarItemActive : {}) }}
                  onClick={() => setCurrentView('room')}
              >
                  Game Room
              </a>
          )}
          <a
              href="#"
              style={appStyles.taskbarItem}
              onClick={handleLogout}
          >
              Logout ({currentPlayer?.username || session?.email || 'User'})
          </a>
      </div>

      {/* Screen rendering based on currentView */}
      {currentView === 'home' && (
        <div style={{ ...appStyles.screen, ...(currentView === 'home' ? appStyles.screenActive : {}) }}>
            <HomeView
              onShowCreateModal={() => setShowCreateModal(true)}
              onShowJoinModal={() => setShowJoinModal(true)}
              currentPlayer={currentPlayer}
              isPlayerLoaded={!!currentPlayer}
            />
        </div>
      )}

      {currentView === 'hu' && (
          <div style={{ ...appStyles.screen, ...(currentView === 'hu' ? appStyles.screenActive : {}) }}>
              <HuView onShowTileModal={() => setShowTileModal(true)} /> {/* Pass onShowTileModal */}
          </div>
      )}

      {currentView === 'room' && currentRoom && (
        <div style={{ ...appStyles.screen, ...(currentView === 'room' ? appStyles.screenActive : {}) }}>
            <RoomView
              currentRoom={currentRoom}
              players={currentRoom.players_in_rooms}
              currentPlayer={currentPlayer}
              socket={socket}
              onLeaveRoom={handleLeaveRoom}
              simulateGameRound={simulateGameRound}
              currentHand={currentHand}
              currentFlowers={currentFlowers}
              currentKongs={currentKongs}
              currentScoreResult={currentScoreResult}
              onAddTileClick={() => setShowTileModal(true)}
              onCalculateHandScore={calculateCurrentHandScore}
              onClearAll={clearAllTiles}
              onRemoveTile={removeTile}
            />
        </div>
      )}

      {currentView === 'leaderboard' && (
          <div style={{ ...appStyles.screen, ...(currentView === 'leaderboard' ? appStyles.screenActive : {}) }}>
              <LeaderboardView firestore={firestore} backendUrl={process.env.REACT_APP_BACKEND_URL} />
          </div>
      )}
      {currentView === 'profile' && (
          <div style={{ ...appStyles.screen, ...(currentView === 'profile' ? appStyles.screenActive : {}) }}>
              <ProfileView currentPlayer={currentPlayer} />
          </div>
      )}

      {/* Modals */}
      <CreateRoomModal
        show={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreateRoom={createRoom}
      />
      <JoinRoomModal
        show={showJoinModal}
        onClose={() => setShowJoinModal(false)}
        onJoinRoom={joinRoom}
      />

      {showTileModal && (
        <TileSelectionModal
          show={showTileModal}
          onClose={() => setShowTileModal(false)}
          onSelectTile={(tile) => {
            addTile(tile, selectedTileType); // Assuming modal is for adding
            setShowTileModal(false);
          }}
          tiles={
              selectedTileType === 'regular' ? currentHand :
              selectedTileType === 'flower' ? currentFlowers :
              currentKongs
          }
          title={"Select Tile to Add"}
          onSetTileType={setSelectedTileType}
          tileType={selectedTileType}
        />
      )}
    </div>
  );
};

export default MahjongApp;
